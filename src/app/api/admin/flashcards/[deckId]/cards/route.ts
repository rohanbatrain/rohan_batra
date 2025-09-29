import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import { assertEditorOrAdmin } from '../route';
import {
  resolveAssetShortcodes,
  resolveAssetShortcodesInArray,
} from '@/lib/assets/resolve-shortcodes';

const FaceSchema = z.object({
  text: z.string().optional().or(z.literal('')),
  richText: z.string().optional().or(z.literal('')),
  media: z
    .object({
      lottieIds: z.array(z.string()).optional().default([]),
      imageUrls: z.array(z.string()).optional().default([]),
      audioUrl: z.string().optional().or(z.literal('')).nullable(),
    })
    .optional(),
});

const FlashcardCardInputSchema = z.object({
  type: z.enum(['basic', 'cloze', 'qa', 'image']),
  prompt: FaceSchema,
  response: FaceSchema,
  hint: z.string().optional().or(z.literal('')).nullable(),
  explanation: z.string().optional().or(z.literal('')).nullable(),
  tags: z.array(z.string()).optional().default([]),
  order: z.number().int().min(0).optional(),
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

    await connectToDatabase();

    const deck = await FlashcardDeckModel.findById(params.deckId);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = { deckId: deck._id };
    if (search) {
      filter.$or = [
        { 'prompt.text': { $regex: search, $options: 'i' } },
        { 'prompt.richText': { $regex: search, $options: 'i' } },
        { 'response.text': { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } },
      ];
    }

    const cards = await FlashcardCardModel.find(filter)
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      cards: cards.map(sanitizeCard),
      total: cards.length,
    });
  } catch (error) {
    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.error('Error fetching flashcard cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await assertEditorOrAdmin(userId);

    await connectToDatabase();

    const deck = await FlashcardDeckModel.findById(params.deckId);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = FlashcardCardInputSchema.parse(body);

    const promptMedia = parsed.prompt.media ?? {
      lottieIds: [],
      imageUrls: [],
      audioUrl: undefined,
    };
    const responseMedia = parsed.response.media ?? {
      lottieIds: [],
      imageUrls: [],
      audioUrl: undefined,
    };

    const [coverPromptImages, coverResponseImages, promptAudio, responseAudio] =
      await Promise.all([
        resolveAssetShortcodesInArray(promptMedia.imageUrls),
        resolveAssetShortcodesInArray(responseMedia.imageUrls),
        resolveAssetShortcodes(promptMedia.audioUrl ?? undefined),
        resolveAssetShortcodes(responseMedia.audioUrl ?? undefined),
      ]);

    const lastCard = await FlashcardCardModel.findOne({ deckId: deck._id })
      .sort({ order: -1 })
      .lean();

    const card = await FlashcardCardModel.create({
      deckId: deck._id,
      type: parsed.type,
      prompt: {
        text: parsed.prompt.text?.trim() || undefined,
        richText: parsed.prompt.richText?.trim() || undefined,
        media: {
          lottieIds: (promptMedia.lottieIds ?? []).map(
            id => new Types.ObjectId(id)
          ),
          imageUrls: coverPromptImages,
          audioUrl: promptAudio?.trim() || undefined,
        },
      },
      response: {
        text: parsed.response.text?.trim() || undefined,
        richText: parsed.response.richText?.trim() || undefined,
        media: {
          lottieIds: (responseMedia.lottieIds ?? []).map(
            id => new Types.ObjectId(id)
          ),
          imageUrls: coverResponseImages,
          audioUrl: responseAudio?.trim() || undefined,
        },
      },
      hint: parsed.hint?.trim() || undefined,
      explanation: parsed.explanation?.trim() || undefined,
      tags: parsed.tags ?? [],
      order: parsed.order ?? (lastCard ? lastCard.order + 1 : 0),
    });

    await FlashcardDeckModel.updateOne(
      { _id: deck._id },
      { $inc: { cardCount: 1 } }
    );

    return NextResponse.json(sanitizeCard(card));
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

    console.error('Error creating flashcard card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
