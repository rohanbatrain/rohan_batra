import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import UserModel from '@/models/User';
import {
  FlashcardDeckInputSchema,
  LinkTargetSchema,
  sanitizeDeck,
} from '../route';
import { resolveAssetShortcodes } from '@/lib/assets/resolve-shortcodes';

const FlashcardDeckUpdateSchema = FlashcardDeckInputSchema.partial().extend({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  linkTargets: z.array(LinkTargetSchema).optional(),
});

function sanitizeCard(card: any) {
  const toStringArray = (value?: unknown[]) =>
    Array.isArray(value)
      ? value.map(item => item?.toString?.() ?? String(item))
      : undefined;

  return {
    id: card._id.toString(),
    deckId: card.deckId.toString(),
    type: card.type,
    prompt: {
      text: card.prompt?.text ?? null,
      richText: card.prompt?.richText ?? null,
      media: card.prompt?.media
        ? {
            lottieIds: toStringArray(card.prompt.media.lottieIds) ?? [],
            imageUrls: card.prompt.media.imageUrls ?? [],
            audioUrl: card.prompt.media.audioUrl ?? null,
          }
        : undefined,
    },
    response: {
      text: card.response?.text ?? null,
      richText: card.response?.richText ?? null,
      media: card.response?.media
        ? {
            lottieIds: toStringArray(card.response.media.lottieIds) ?? [],
            imageUrls: card.response.media.imageUrls ?? [],
            audioUrl: card.response.media.audioUrl ?? null,
          }
        : undefined,
    },
    hint: card.hint ?? null,
    explanation: card.explanation ?? null,
    tags: card.tags ?? [],
    order: card.order,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

async function getDeckByIdentifier(deckId: string) {
  const query = Types.ObjectId.isValid(deckId)
    ? { _id: new Types.ObjectId(deckId) }
    : { slug: deckId };
  const deck = await FlashcardDeckModel.findOne(query).lean();
  return deck;
}

export async function assertEditorOrAdmin(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId });
  const userRole = (currentUser?.role as string) || 'user';

  if (!['editor', 'admin'].includes(userRole)) {
    throw new Error('FORBIDDEN');
  }

  return { currentUser, userRole };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await assertEditorOrAdmin(userId);

    const deck = await getDeckByIdentifier(params.deckId);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const includeCards = searchParams.get('includeCards') === 'true';

    const payload: any = sanitizeDeck(deck);

    if (includeCards) {
      const cards = await FlashcardCardModel.find({ deckId: deck._id })
        .sort({ order: 1 })
        .lean();
      payload.cards = cards.map(sanitizeCard);
    }

    return NextResponse.json(payload);
  } catch (error) {
    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.error('Error fetching flashcard deck:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentUser, userRole } = await assertEditorOrAdmin(userId);

    const deckDoc = await FlashcardDeckModel.findOne(
      Types.ObjectId.isValid(params.deckId)
        ? { _id: params.deckId }
        : { slug: params.deckId }
    );
    if (!deckDoc) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (
      userRole === 'editor' &&
      currentUser?._id &&
      !deckDoc.createdBy.equals(currentUser._id)
    ) {
      return NextResponse.json(
        { error: 'Editors can only modify their own decks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = FlashcardDeckUpdateSchema.parse(body);

    if (parsed.slug && parsed.slug !== deckDoc.slug) {
      const exists = await FlashcardDeckModel.exists({ slug: parsed.slug });
      if (exists) {
        return NextResponse.json(
          { error: 'Slug already in use' },
          { status: 409 }
        );
      }
      deckDoc.slug = parsed.slug;
    }

    if (parsed.title) deckDoc.title = parsed.title;
    deckDoc.subtitle = parsed.subtitle?.trim?.() ? parsed.subtitle : undefined;
    deckDoc.description = parsed.description?.trim?.()
      ? parsed.description
      : undefined;

    if (parsed.coverImage !== undefined) {
      const coverImageRaw = await resolveAssetShortcodes(parsed.coverImage);
      deckDoc.coverImage = coverImageRaw?.trim()
        ? coverImageRaw.trim()
        : undefined;
    }

    if (parsed.tags) deckDoc.tags = parsed.tags;
    if (parsed.categories) deckDoc.categories = parsed.categories;

    if (parsed.status) {
      deckDoc.status = parsed.status;
      if (parsed.status === 'published' && !deckDoc.publishedAt) {
        deckDoc.publishedAt = new Date();
      }
      if (parsed.status !== 'published') {
        deckDoc.publishedAt = null;
      }
    }

    if (parsed.visibility) deckDoc.visibility = parsed.visibility;
    if (parsed.isFeatured !== undefined) deckDoc.isFeatured = parsed.isFeatured;
    if (parsed.estimatedReviewMinutes !== undefined) {
      deckDoc.estimatedReviewMinutes =
        parsed.estimatedReviewMinutes === null
          ? undefined
          : parsed.estimatedReviewMinutes;
    }

    if (parsed.linkTargets) {
      deckDoc.linkTargets = parsed.linkTargets.map(target => ({
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
    }

    await deckDoc.save();

    return NextResponse.json(sanitizeDeck(deckDoc));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.error('Error updating flashcard deck:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await assertEditorOrAdmin(userId);

    const deck = await FlashcardDeckModel.findOneAndDelete(
      Types.ObjectId.isValid(params.deckId)
        ? { _id: params.deckId }
        : { slug: params.deckId }
    );

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    await FlashcardCardModel.deleteMany({ deckId: deck._id });

    await Promise.all([
      CourseModel.updateMany(
        { flashcardDeckIds: deck._id },
        { $pull: { flashcardDeckIds: deck._id } }
      ),
      CourseModuleModel.updateMany(
        { flashcardDeckIds: deck._id },
        { $pull: { flashcardDeckIds: deck._id } }
      ),
      CourseLessonModel.updateMany(
        { flashcardDeckIds: deck._id },
        { $pull: { flashcardDeckIds: deck._id } }
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.error('Error deleting flashcard deck:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
