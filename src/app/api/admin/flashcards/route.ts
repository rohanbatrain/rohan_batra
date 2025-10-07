import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import UserModel from '@/models/User';
import { uniqueSlug } from '@/lib/slug';
import { resolveAssetShortcodes } from '@/lib/assets/resolve-shortcodes';
import {
  LinkTargetSchema,
  FlashcardDeckInputSchema,
  sanitizeDeck,
} from './schemas';
import { buildDeckTree } from '@/lib/decks/tree';

/**
 * GET /api/admin/flashcards
 * Get all flashcard decks for the authenticated user
 * Query params:
 *   - tree=true: Return decks as hierarchical tree
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user in database
    const user = await UserModel.findOne({ clerkId: clerkUserId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all decks for user
    const decks = await FlashcardDeckModel.find({ ownerId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Check if tree mode requested
    const { searchParams } = new URL(request.url);
    const treeMode = searchParams.get('tree') === 'true';

    if (treeMode) {
      const tree = buildDeckTree(decks);
      return NextResponse.json({ decks: tree, treeMode: true });
    }

    return NextResponse.json({ decks });
  } catch (error: unknown) {
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

    // Extend schema to include parentDeckId
    const ExtendedSchema = FlashcardDeckInputSchema.extend({
      parentDeckId: z.string().optional(),
    });
    const parsed = ExtendedSchema.parse(body);

    // Validate parent deck if provided
    let parentDeck = null;
    if (parsed.parentDeckId) {
      if (!Types.ObjectId.isValid(parsed.parentDeckId)) {
        return NextResponse.json(
          { error: 'Invalid parent deck ID' },
          { status: 400 }
        );
      }

      parentDeck = await FlashcardDeckModel.findById(parsed.parentDeckId);

      if (!parentDeck) {
        return NextResponse.json(
          { error: 'Parent deck not found' },
          { status: 404 }
        );
      }

      // Check depth limit (max 6 levels, so parent can be at most level 5)
      if (parentDeck.level >= 6) {
        return NextResponse.json(
          { error: 'Maximum nesting depth (6 levels) exceeded' },
          { status: 400 }
        );
      }
    }

    const slug = await uniqueSlug(parsed.title, async candidate => {
      const existing = await FlashcardDeckModel.exists({ slug: candidate });
      return Boolean(existing);
    });

    // Only process linkTargets if they exist and are not empty
    const linkTargets = parsed.linkTargets && parsed.linkTargets.length > 0
      ? parsed.linkTargets.map(target => ({
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
        }))
      : undefined;

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
      parentDeckId: parentDeck?._id || null, // Pre-save hook will compute path & level
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
