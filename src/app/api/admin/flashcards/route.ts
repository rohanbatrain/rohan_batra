import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import UserModel from '@/models/User';
import { uniqueSlug } from '@/lib/slug';
import { resolveAssetShortcodes } from '@/lib/assets/resolve-shortcodes';

export const LinkTargetSchema = z
  .object({
    scope: z.enum(['standalone', 'course', 'module', 'lesson']),
    courseId: z.string().optional(),
    moduleId: z.string().optional(),
    lessonId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === 'course' && !value.courseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'courseId required when scope is course',
        path: ['courseId'],
      });
    }
    if (value.scope === 'module') {
      if (!value.courseId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'courseId required when scope is module',
          path: ['courseId'],
        });
      }
      if (!value.moduleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'moduleId required when scope is module',
          path: ['moduleId'],
        });
      }
    }
    if (value.scope === 'lesson') {
      if (!value.courseId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'courseId required when scope is lesson',
          path: ['courseId'],
        });
      }
      if (!value.moduleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'moduleId required when scope is lesson',
          path: ['moduleId'],
        });
      }
      if (!value.lessonId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'lessonId required when scope is lesson',
          path: ['lessonId'],
        });
      }
    }
  });

export const FlashcardDeckInputSchema = z.object({
  title: z.string().min(3).max(200),
  subtitle: z.string().max(200).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  coverImage: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
  isFeatured: z.boolean().optional().default(false),
  estimatedReviewMinutes: z.number().int().min(0).nullable().optional(),
  linkTargets: z.array(LinkTargetSchema).optional().default([]),
});

export const sanitizeDeck = (deck: any) => ({
  id: deck._id.toString(),
  title: deck.title,
  slug: deck.slug,
  subtitle: deck.subtitle ?? null,
  description: deck.description ?? null,
  coverImage: deck.coverImage ?? null,
  status: deck.status,
  visibility: deck.visibility,
  isFeatured: Boolean(deck.isFeatured),
  tags: deck.tags ?? [],
  categories: deck.categories ?? [],
  cardCount: deck.cardCount ?? 0,
  estimatedReviewMinutes: deck.estimatedReviewMinutes ?? null,
  analytics: deck.analytics ?? null,
  linkTargets:
    deck.linkTargets?.map((target: any) => ({
      scope: target.scope,
      courseId: target.courseId ? target.courseId.toString() : null,
      moduleId: target.moduleId ? target.moduleId.toString() : null,
      lessonId: target.lessonId ? target.lessonId.toString() : null,
    })) ?? [],
  createdAt: deck.createdAt,
  updatedAt: deck.updatedAt,
  publishedAt: deck.publishedAt ?? null,
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const currentUser = await UserModel.findOne({ clerkId: userId });
    const userRole = (currentUser?.role as string) || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const search = searchParams.get('search');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '100', 10),
      200
    );

    const filter: Record<string, unknown> = {};

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      filter.status = status;
    }

    if (visibility && ['public', 'unlisted', 'private'].includes(visibility)) {
      filter.visibility = visibility;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (userRole === 'editor' && currentUser?._id) {
      filter.createdBy = currentUser._id;
    }

    const decks = await FlashcardDeckModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    const statusStats = await FlashcardDeckModel.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      decks: decks.map(sanitizeDeck),
      stats: statusStats.reduce((acc: Record<string, number>, doc) => {
        acc[doc._id] = doc.count;
        return acc;
      }, {}),
      total: decks.length,
    });
  } catch (error) {
    console.error('Error fetching flashcard decks:', error);
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

    await connectToDatabase();
    const currentUser = await UserModel.findOne({ clerkId: userId });
    const userRole = (currentUser?.role as string) || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = FlashcardDeckInputSchema.parse(body);

    const slug = await uniqueSlug(parsed.title, async candidate => {
      const existing = await FlashcardDeckModel.exists({ slug: candidate });
      return Boolean(existing);
    });

    const linkTargets = parsed.linkTargets?.map(target => ({
      scope: target.scope,
      courseId: target.courseId
        ? new Types.ObjectId(target.courseId)
        : undefined,
      moduleId: target.moduleId
        ? new Types.ObjectId(target.moduleId)
        : undefined,
      lessonId: target.lessonId
        ? new Types.ObjectId(target.lessonId)
        : undefined,
    }));

    const coverImageRaw = parsed.coverImage
      ? await resolveAssetShortcodes(parsed.coverImage)
      : undefined;
    const coverImage =
      coverImageRaw && coverImageRaw.trim().length > 0
        ? coverImageRaw.trim()
        : undefined;

    const tags = parsed.tags || [];
    const categories = parsed.categories || [];

    const deck = new FlashcardDeckModel({
      slug,
      title: parsed.title,
      subtitle: parsed.subtitle || undefined,
      description: parsed.description || undefined,
      coverImage,
      tags,
      categories,
      status: parsed.status,
      visibility: parsed.visibility,
      isFeatured: parsed.isFeatured ?? false,
      estimatedReviewMinutes:
        parsed.estimatedReviewMinutes === null
          ? undefined
          : parsed.estimatedReviewMinutes,
      createdBy: currentUser?._id,
      linkTargets,
      cardCount: 0,
      analytics: {
        reviewCount: 0,
        uniqueLearners: 0,
        averageRating: null,
        lastReviewedAt: undefined,
      },
      publishedAt: parsed.status === 'published' ? new Date() : undefined,
    });

    const saved = await deck.save();

    return NextResponse.json(sanitizeDeck(saved), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating flashcard deck:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
