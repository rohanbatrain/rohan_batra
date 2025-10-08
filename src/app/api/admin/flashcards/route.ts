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
 *   - status: Filter by status (draft, published, archived)
 *   - visibility: Filter by visibility (public, unlisted, private)
 *   - search: Search in title, subtitle, description
 *   - tags: Filter by tags (comma-separated)
 *   - categories: Filter by categories (comma-separated)
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 24)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const treeMode = searchParams.get('tree') === 'true';
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const categories = searchParams.get('categories');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    // Build query
    const query: any = { createdBy: user._id };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by visibility
    if (visibility && visibility !== 'all') {
      query.visibility = visibility;
    }

    // Search in title, subtitle, description
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { subtitle: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by tags
    if (tags && tags.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }

    // Filter by categories
    if (categories && categories.trim()) {
      const categoryArray = categories.split(',').map(c => c.trim()).filter(Boolean);
      if (categoryArray.length > 0) {
        query.categories = { $in: categoryArray };
      }
    }

    // Get total count for pagination
    const total = await FlashcardDeckModel.countDocuments(query);

    // Get decks with pagination
    const skip = (page - 1) * limit;
    const decks = await FlashcardDeckModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Sanitize decks to ensure proper id field
    const sanitizedDecks = decks.map(deck => sanitizeDeck(deck));

    // Get stats for each status
    const stats: Record<string, number> = {};
    const statusCounts = await FlashcardDeckModel.aggregate([
      { $match: { createdBy: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    statusCounts.forEach(({ _id, count }) => {
      stats[_id] = count;
    });

    if (treeMode) {
      const tree = buildDeckTree(sanitizedDecks);
      return NextResponse.json({ 
        decks: tree, 
        treeMode: true,
        stats,
        total,
        page,
        pageSize: limit,
      });
    }

    return NextResponse.json({ 
      decks: sanitizedDecks,
      stats,
      total,
      page,
      pageSize: limit,
    });
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
    
    const parseResult = ExtendedSchema.safeParse(body);
    if (!parseResult.success) {
      console.error('Validation error:', {
        issues: parseResult.error.issues,
        body,
      });
      return NextResponse.json(
        { error: 'Validation error', details: parseResult.error.issues },
        { status: 400 }
      );
    }
    
    const parsed = parseResult.data;

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

    // Handle coverImage - only process if it's a non-empty string
    let coverImage: string | undefined = undefined;
    if (parsed.coverImage && parsed.coverImage.trim().length > 0) {
      try {
        const coverImageRaw = await resolveAssetShortcodes(parsed.coverImage);
        coverImage = coverImageRaw && coverImageRaw.trim().length > 0
          ? coverImageRaw.trim()
          : undefined;
      } catch (err) {
        console.error('Error resolving coverImage shortcodes:', err);
        // Continue without coverImage rather than failing
        coverImage = undefined;
      }
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
