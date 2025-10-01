import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import UserModel from '@/models/User';
import { z } from 'zod';
import { Types, type FilterQuery } from 'mongoose';
import type { ICourse } from '@/models/Course';
import { uniqueSlug } from '@/lib/slug';
import { slugSchema } from '@/lib/validators/courses';
import { resolveAssetShortcodes } from '@/lib/assets/resolve-shortcodes';
import { syncDeckLinkTargets } from '@/lib/flashcards/sync-link-targets';

interface AdminCourseSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  difficulty: string;
  lessonCount: number;
  moduleCount: number;
  estimatedDurationMinutes?: number | null;
  isFeatured: boolean;
  publishedAt?: Date | null;
  updatedAt: Date;
  flashcardDecks: Array<{
    id: string;
    title: string;
    status: string;
    visibility: string;
  }>;
}

export const CourseInputSchema = z.object({
  title: z.string().min(3).max(150),
  slug: slugSchema.optional().or(z.literal('')).optional(),
  subtitle: z.string().max(200).optional().or(z.literal('')),
  summary: z.string().min(50).max(400),
  // Accept raw URLs or shortcodes; we'll resolve server-side
  heroImage: z.string().optional().or(z.literal('')),
  heroLottieId: z.string().optional().or(z.literal('')),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('beginner'),
  categories: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  estimatedDurationMinutes: z.number().int().min(0).nullable().optional(),
  prerequisiteCourseIds: z.array(z.string()).optional().default([]),
  prerequisiteBlogSlugs: z.array(z.string()).optional().default([]),
  recommendedBlogSlugs: z.array(z.string()).optional().default([]),
  recommendedBookIds: z.array(z.string()).optional().default([]),
  flashcardDeckIds: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  visibility: z.enum(['public', 'unlisted']).default('public'),
  isFeatured: z.boolean().optional().default(false),
  releaseSchedule: z
    .object({
      publishAt: z.union([z.string(), z.date()]),
      timezone: z.string().optional(),
    })
    .nullable()
    .optional(),
  seo: z
    .object({
      title: z.string().max(70).optional().or(z.literal('')),
      description: z.string().max(160).optional().or(z.literal('')),
  // Accept raw URLs or shortcodes; we'll resolve server-side
  image: z.string().optional().or(z.literal('')),
    })
    .optional()
    .nullable(),
});

export const sanitizeCourse = (
  course: ICourse & { _id: string } & Record<string, any>,
  moduleCount: number,
  deckLookup: Map<
    string,
    { id: string; title: string; status: string; visibility: string }
  >
): AdminCourseSummary => {
  const flashcardDecks = (course.flashcardDeckIds || [])
    .map((id: any) => {
      const key = typeof id === 'string' ? id : id?.toString?.();
      return key ? (deckLookup.get(key) ?? null) : null;
    })
    .filter((deck): deck is NonNullable<typeof deck> => Boolean(deck));

  return {
    id: course._id.toString(),
    title: course.title,
    slug: course.slug,
    status: course.status,
    visibility: course.visibility,
    difficulty: course.difficulty,
    lessonCount: course.lessonCount ?? 0,
    moduleCount,
    estimatedDurationMinutes: course.estimatedDurationMinutes ?? null,
    isFeatured: Boolean(course.isFeatured),
    publishedAt: course.publishedAt ?? null,
    updatedAt: course.updatedAt,
    flashcardDecks,
  };
};

export async function getAuthorizedUser(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId });
  const userRole = (currentUser?.role as string) || 'user';

  if (!['editor', 'admin'].includes(userRole)) {
    return { authorized: false as const, currentUser, userRole };
  }

  return { authorized: true as const, currentUser, userRole };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized, currentUser, userRole } =
      await getAuthorizedUser(userId);

    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '24', 10), 1),
      100
    );

    const filter: FilterQuery<ICourse> = {};

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      filter.status = status as ICourse['status'];
    }

    if (visibility && ['public', 'unlisted'].includes(visibility)) {
      filter.visibility = visibility as ICourse['visibility'];
    }

    if (
      difficulty &&
      ['beginner', 'intermediate', 'advanced'].includes(difficulty)
    ) {
      filter.difficulty = difficulty as ICourse['difficulty'];
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await CourseModel.countDocuments(filter);
    const skip = (page - 1) * limit;
    const courses = await CourseModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const courseIds = courses.map(course => course._id);

    const [moduleCounts, statusStats, deckDocs] = await Promise.all([
      courseIds.length
        ? CourseModuleModel.aggregate([
            { $match: { courseId: { $in: courseIds } } },
            { $group: { _id: '$courseId', count: { $sum: 1 } } },
          ])
        : [],
      CourseModel.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      (() => {
        const deckIds = new Set<string>();
        courses.forEach(course => {
          (course.flashcardDeckIds || []).forEach((id: any) => {
            const key = typeof id === 'string' ? id : id?.toString?.();
            if (key) {
              deckIds.add(key);
            }
          });
        });
        if (deckIds.size === 0) {
          return Promise.resolve([]);
        }
        return FlashcardDeckModel.find({ _id: { $in: Array.from(deckIds) } })
          .select(['title', 'status', 'visibility'])
          .lean();
      })(),
    ]);

    const moduleCountMap = new Map<string, number>();
    moduleCounts.forEach(doc => {
      moduleCountMap.set(doc._id.toString(), doc.count);
    });

    const deckLookup = new Map<
      string,
      { id: string; title: string; status: string; visibility: string }
    >();
    deckDocs.forEach(deck => {
      deckLookup.set(deck._id.toString(), {
        id: deck._id.toString(),
        title: deck.title,
        status: deck.status,
        visibility: deck.visibility,
      });
    });

    const result = courses.map(course =>
      sanitizeCourse(
        course as any,
        moduleCountMap.get(course._id.toString()) ?? 0,
        deckLookup
      )
    );

    return NextResponse.json({
      courses: result,
      stats: statusStats.reduce(
        (acc: Record<string, number>, doc: { _id: string; count: number }) => {
          acc[doc._id] = doc.count;
          return acc;
        },
        {}
      ),
      total: totalCount,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error('Error fetching admin courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized, currentUser } = await getAuthorizedUser(userId);

    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = CourseInputSchema.parse(body);

    let slug = (parsed.slug || '').trim();
    if (slug) {
      const exists = await CourseModel.exists({ slug });
      if (exists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        );
      }
    } else {
      slug = await uniqueSlug(parsed.title, async candidate => {
        const exists = await CourseModel.exists({ slug: candidate });
        return Boolean(exists);
      });
    }

    const heroImageRaw = parsed.heroImage
      ? await resolveAssetShortcodes(parsed.heroImage)
      : undefined;
    const heroImage = heroImageRaw?.trim() ? heroImageRaw.trim() : undefined;

    const seoImageRaw = parsed.seo?.image
      ? await resolveAssetShortcodes(parsed.seo.image)
      : undefined;
    const seoImage = seoImageRaw?.trim() ? seoImageRaw.trim() : undefined;

    const prereqCourseIds = (parsed.prerequisiteCourseIds ?? [])
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    const recommendedBookIds = (parsed.recommendedBookIds ?? [])
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    const flashcardDeckIds = (parsed.flashcardDeckIds ?? [])
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));

    if (parsed.status === 'published') {
      // Guardrail: prevent publishing empty courses (no lessons) at creation
      // Frontend also guides users, but we enforce here as a safety net.
      // New courses start with lessonCount=0, so block publish on create.
      return NextResponse.json(
        { error: 'Cannot publish a course with zero lessons. Create modules/lessons first.' },
        { status: 400 }
      );
    }

    const course = new CourseModel({
      slug,
      title: parsed.title,
      subtitle: parsed.subtitle?.trim() || undefined,
      summary: parsed.summary,
      heroImage,
      heroLottieId:
        parsed.heroLottieId && Types.ObjectId.isValid(parsed.heroLottieId)
          ? new Types.ObjectId(parsed.heroLottieId)
          : undefined,
      difficulty: parsed.difficulty,
      categories: parsed.categories ?? [],
      tags: parsed.tags ?? [],
      estimatedDurationMinutes:
        parsed.estimatedDurationMinutes === null
          ? undefined
          : parsed.estimatedDurationMinutes,
      lessonCount: 0,
      prerequisiteCourseIds: prereqCourseIds,
      prerequisiteBlogSlugs: parsed.prerequisiteBlogSlugs ?? [],
      recommendedBlogSlugs: parsed.recommendedBlogSlugs ?? [],
      recommendedBookIds,
      flashcardDeckIds,
      status: parsed.status,
      visibility: parsed.visibility,
      isFeatured: parsed.isFeatured ?? false,
      seo: parsed.seo
        ? {
            title: parsed.seo.title?.trim() || undefined,
            description: parsed.seo.description?.trim() || undefined,
            image: seoImage,
          }
        : undefined,
      releaseSchedule: parsed.releaseSchedule
        ? {
            publishAt: new Date(parsed.releaseSchedule.publishAt),
            timezone: parsed.releaseSchedule.timezone,
          }
        : undefined,
      structureVersion: 1,
      createdBy: currentUser?._id,
      publishedAt: undefined,
    });

    await course.save();

    if (flashcardDeckIds.length > 0) {
      await syncDeckLinkTargets([], flashcardDeckIds, {
        scope: 'course',
        courseId: course._id,
      });
    }

    const deckDocs = flashcardDeckIds.length
      ? await FlashcardDeckModel.find({ _id: { $in: flashcardDeckIds } })
      : [];

    const deckLookup = new Map<
      string,
      { id: string; title: string; status: string; visibility: string }
    >();
    deckDocs.forEach(deck => {
      deckLookup.set(deck._id.toString(), {
        id: deck._id.toString(),
        title: deck.title,
        status: deck.status,
        visibility: deck.visibility,
      });
    });

    const payload = sanitizeCourse(course.toObject() as any, 0, deckLookup);

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
