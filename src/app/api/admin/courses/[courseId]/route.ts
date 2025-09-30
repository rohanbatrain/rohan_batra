import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import { CourseInputSchema, getAuthorizedUser, sanitizeCourse } from '../route';
import { resolveAssetShortcodes } from '@/lib/assets/resolve-shortcodes';
import { syncDeckLinkTargets } from '@/lib/flashcards/sync-link-targets';

const CourseUpdateSchema = CourseInputSchema.partial().extend({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

const toStringId = (value: any) => value?.toString?.() ?? String(value);

export async function GET(
  _: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: paramCourseId } = await ctx.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const query = Types.ObjectId.isValid(paramCourseId)
      ? { _id: new Types.ObjectId(paramCourseId) }
      : { slug: paramCourseId };

    const courseDoc = await CourseModel.findOne(query).lean();
    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const modules = await CourseModuleModel.find({ courseId: courseDoc._id })
      .sort({ order: 1 })
      .lean();
    const lessons = await CourseLessonModel.find({
      courseId: courseDoc._id,
    }).lean();

    const lessonsById = new Map<string, any>();
    lessons.forEach(lesson => {
      lessonsById.set(lesson._id.toString(), lesson);
    });

    const modulePayload = modules.map(module => {
      const lessonIds = (module.lessonIds ?? []).map((id: any) =>
        id.toString()
      );
      const orderedLessons = lessonIds
        .map(id => lessonsById.get(id))
        .filter(Boolean) as any[];

      const fallbackLessons = lessons.filter(
        l => l.moduleId.toString() === module._id.toString()
      );
      const combinedLessons = orderedLessons.length
        ? orderedLessons
        : fallbackLessons;

      return {
        id: module._id.toString(),
        title: module.title,
        summary: module.summary ?? null,
        order: module.order,
        estimatedDurationMinutes: module.estimatedDurationMinutes ?? null,
        flashcardDeckIds: (module.flashcardDeckIds ?? []).map(toStringId),
        lessonIds,
        lessons: combinedLessons.map(lesson => ({
          id: lesson._id.toString(),
          title: lesson.title,
          slug: lesson.slug ?? null,
          contentType: lesson.contentType,
          blogSlug: lesson.blogSlug ?? null,
          standaloneContent: lesson.standaloneContent ?? null,
          standaloneFormat: lesson.standaloneFormat ?? 'mdx',
          externalResource: lesson.externalResource ?? null,
          quizId: lesson.quizId ? lesson.quizId.toString() : null,
          flashcardDeckIds: (lesson.flashcardDeckIds ?? []).map(toStringId),
          assets: lesson.assets ?? null,
          estimatedDurationMinutes: lesson.estimatedDurationMinutes,
          isPreviewable: lesson.isPreviewable,
          progressWeight: lesson.progressWeight,
          prerequisiteLessonIds: (lesson.prerequisiteLessonIds ?? []).map(
            toStringId
          ),
          releaseAt: lesson.releaseAt ?? null,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
        })),
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      };
    });

    const deckIds = new Set<string>();
    (courseDoc.flashcardDeckIds ?? []).forEach((id: any) =>
      deckIds.add(id.toString())
    );
    modulePayload.forEach(module => {
      module.flashcardDeckIds.forEach(id => deckIds.add(id));
      module.lessons.forEach(lesson => {
        const lessonDeckIds = lesson.flashcardDeckIds ?? [];
        lessonDeckIds.forEach((deckId: string) => deckIds.add(deckId));
      });
    });

    const deckDocs = deckIds.size
      ? await FlashcardDeckModel.find({
          _id: { $in: Array.from(deckIds).map(id => new Types.ObjectId(id)) },
        })
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

    const courseSummary = sanitizeCourse(
      courseDoc as any,
      modulePayload.length,
      deckLookup
    );

    const detailedCourse = {
      id: courseDoc._id.toString(),
      slug: courseDoc.slug,
      title: courseDoc.title,
      subtitle: courseDoc.subtitle ?? null,
      summary: courseDoc.summary,
      heroImage: courseDoc.heroImage ?? null,
      heroLottieId: courseDoc.heroLottieId
        ? courseDoc.heroLottieId.toString()
        : null,
      difficulty: courseDoc.difficulty,
      categories: courseDoc.categories ?? [],
      tags: courseDoc.tags ?? [],
      estimatedDurationMinutes: courseDoc.estimatedDurationMinutes ?? null,
      lessonCount: courseDoc.lessonCount ?? 0,
      prerequisiteCourseIds: (courseDoc.prerequisiteCourseIds ?? []).map(
        toStringId
      ),
      prerequisiteBlogSlugs: courseDoc.prerequisiteBlogSlugs ?? [],
      recommendedBlogSlugs: courseDoc.recommendedBlogSlugs ?? [],
      recommendedBookIds: (courseDoc.recommendedBookIds ?? []).map(toStringId),
      flashcardDeckIds: (courseDoc.flashcardDeckIds ?? []).map(toStringId),
      status: courseDoc.status,
      visibility: courseDoc.visibility,
      isFeatured: Boolean(courseDoc.isFeatured),
      seo: courseDoc.seo ?? null,
      releaseSchedule: courseDoc.releaseSchedule ?? null,
      structureVersion: courseDoc.structureVersion ?? 1,
      createdBy: courseDoc.createdBy ? courseDoc.createdBy.toString() : null,
      createdAt: courseDoc.createdAt,
      updatedAt: courseDoc.updatedAt,
      publishedAt: courseDoc.publishedAt ?? null,
    };

    return NextResponse.json({
      course: detailedCourse,
      summary: courseSummary,
      modules: modulePayload,
      decks: Array.from(deckLookup.values()),
    });
  } catch (error) {
    console.error('Error fetching course detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: paramCourseId } = await ctx.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const query = Types.ObjectId.isValid(paramCourseId)
      ? { _id: new Types.ObjectId(paramCourseId) }
      : { slug: paramCourseId };

    const courseDoc = await CourseModel.findOne(query);
    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const prevDeckIds = (courseDoc.flashcardDeckIds ?? []).map(
      id => new Types.ObjectId(id)
    );

    const body = await request.json();
    const parsed = CourseUpdateSchema.parse(body);

    if (parsed.slug && parsed.slug !== courseDoc.slug) {
      const exists = await CourseModel.exists({
        slug: parsed.slug,
        _id: { $ne: courseDoc._id },
      });
      if (exists) {
        return NextResponse.json(
          { error: 'Slug already in use' },
          { status: 409 }
        );
      }
      courseDoc.slug = parsed.slug;
    }

    if (parsed.title) courseDoc.title = parsed.title;
    if (parsed.subtitle !== undefined) {
      courseDoc.subtitle = parsed.subtitle?.trim() || undefined;
    }
    if (parsed.summary) courseDoc.summary = parsed.summary;

    if (parsed.heroImage !== undefined) {
      const heroImageRaw = await resolveAssetShortcodes(parsed.heroImage);
      courseDoc.heroImage = heroImageRaw?.trim()
        ? heroImageRaw.trim()
        : undefined;
    }

    if (parsed.heroLottieId !== undefined) {
      courseDoc.set(
        'heroLottieId',
        parsed.heroLottieId && Types.ObjectId.isValid(parsed.heroLottieId)
          ? new Types.ObjectId(parsed.heroLottieId)
          : undefined
      );
    }

    if (parsed.difficulty) courseDoc.difficulty = parsed.difficulty;
    if (parsed.categories) courseDoc.categories = parsed.categories;
    if (parsed.tags) courseDoc.tags = parsed.tags;

    if (parsed.estimatedDurationMinutes !== undefined) {
      courseDoc.estimatedDurationMinutes =
        parsed.estimatedDurationMinutes === null
          ? undefined
          : parsed.estimatedDurationMinutes;
    }

    if (parsed.prerequisiteCourseIds) {
      courseDoc.prerequisiteCourseIds = parsed.prerequisiteCourseIds
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));
    }

    if (parsed.prerequisiteBlogSlugs) {
      courseDoc.prerequisiteBlogSlugs = parsed.prerequisiteBlogSlugs;
    }

    if (parsed.recommendedBlogSlugs) {
      courseDoc.recommendedBlogSlugs = parsed.recommendedBlogSlugs;
    }

    if (parsed.recommendedBookIds) {
      courseDoc.recommendedBookIds = parsed.recommendedBookIds
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));
    }

    if (parsed.flashcardDeckIds) {
      const nextDeckIds = parsed.flashcardDeckIds
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));
      courseDoc.flashcardDeckIds = nextDeckIds;
      await syncDeckLinkTargets(prevDeckIds, nextDeckIds, {
        scope: 'course',
        courseId: courseDoc._id,
      });
    }

    if (parsed.status) {
      courseDoc.status = parsed.status;
      if (parsed.status === 'published' && !courseDoc.publishedAt) {
        courseDoc.publishedAt = new Date();
      }
      if (parsed.status !== 'published') {
        courseDoc.publishedAt = null;
      }
    }

    if (parsed.visibility) courseDoc.visibility = parsed.visibility;
    if (parsed.isFeatured !== undefined)
      courseDoc.isFeatured = parsed.isFeatured;

    if (parsed.seo !== undefined) {
      const seoImageRaw = parsed.seo?.image
        ? await resolveAssetShortcodes(parsed.seo.image)
        : undefined;
      const seoImage = seoImageRaw?.trim() ? seoImageRaw.trim() : undefined;
      courseDoc.seo = parsed.seo
        ? {
            title: parsed.seo.title?.trim() || undefined,
            description: parsed.seo.description?.trim() || undefined,
            image: seoImage,
          }
        : undefined;
    }

    if (parsed.releaseSchedule !== undefined) {
      courseDoc.releaseSchedule = parsed.releaseSchedule
        ? {
            publishAt: new Date(parsed.releaseSchedule.publishAt),
            timezone: parsed.releaseSchedule.timezone,
          }
        : undefined;
    }

    await courseDoc.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: paramCourseId } = await ctx.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const query = Types.ObjectId.isValid(paramCourseId)
      ? { _id: new Types.ObjectId(paramCourseId) }
      : { slug: paramCourseId };

    const courseDoc = await CourseModel.findOne(query);
    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

  const courseObjectId = courseDoc._id;

    await Promise.all([
      CourseLessonModel.deleteMany({ courseId: courseObjectId }),
      CourseModuleModel.deleteMany({ courseId: courseObjectId }),
    ]);

    await FlashcardDeckModel.updateMany(
      { 'linkTargets.courseId': courseObjectId },
      { $pull: { linkTargets: { courseId: courseObjectId } } }
    );

    await CourseModel.deleteOne({ _id: courseObjectId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
