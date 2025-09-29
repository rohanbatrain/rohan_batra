import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import { assertEditorOrAdmin } from '../../route';
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

const FlashcardCardUpdateSchema = z
  .object({
    type: z.enum(['basic', 'cloze', 'qa', 'image']).optional(),
    prompt: FaceSchema.optional(),
    response: FaceSchema.optional(),
    hint: z.string().optional().or(z.literal('')).nullable(),
    explanation: z.string().optional().or(z.literal('')).nullable(),
    tags: z.array(z.string()).optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine(data => !(data.type === 'cloze' && !data.prompt), {
    message: 'Cloze cards require prompt payload',
    path: ['prompt'],
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { deckId: string; cardId: string } }
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

    const card = await FlashcardCardModel.findOne({
      _id: params.cardId,
      deckId: deck._id,
    });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = FlashcardCardUpdateSchema.parse(body);

    if (parsed.type) {
      card.type = parsed.type;
    }

    if (parsed.prompt) {
      const promptMedia = parsed.prompt.media ?? {
        lottieIds: [],
        imageUrls: [],
        audioUrl: undefined,
      };
      const [promptImages, promptAudio] = await Promise.all([
        resolveAssetShortcodesInArray(promptMedia.imageUrls),
        resolveAssetShortcodes(promptMedia.audioUrl ?? undefined),
      ]);

      card.prompt = {
        text: parsed.prompt.text?.trim() || undefined,
        richText: parsed.prompt.richText?.trim() || undefined,
        media: {
          lottieIds: (promptMedia.lottieIds ?? []).map(
            id => new Types.ObjectId(id)
          ),
          imageUrls: promptImages,
          audioUrl: promptAudio?.trim() || undefined,
        },
      } as typeof card.prompt;
    }

    if (parsed.response) {
      const responseMedia = parsed.response.media ?? {
        lottieIds: [],
        imageUrls: [],
        audioUrl: undefined,
      };
      const [responseImages, responseAudio] = await Promise.all([
        resolveAssetShortcodesInArray(responseMedia.imageUrls),
        resolveAssetShortcodes(responseMedia.audioUrl ?? undefined),
      ]);

      card.response = {
        text: parsed.response.text?.trim() || undefined,
        richText: parsed.response.richText?.trim() || undefined,
        media: {
          lottieIds: (responseMedia.lottieIds ?? []).map(
            id => new Types.ObjectId(id)
          ),
          imageUrls: responseImages,
          audioUrl: responseAudio?.trim() || undefined,
        },
      } as typeof card.response;
    }

    if (parsed.hint !== undefined) {
      card.hint = parsed.hint?.trim() || undefined;
    }
    if (parsed.explanation !== undefined) {
      card.explanation = parsed.explanation?.trim() || undefined;
    }
    if (parsed.tags) {
      card.tags = parsed.tags;
    }

    if (parsed.order !== undefined && parsed.order !== card.order) {
      const newOrder = parsed.order;
      if (newOrder > card.order) {
        await FlashcardCardModel.updateMany(
          { deckId: deck._id, order: { $gt: card.order, $lte: newOrder } },
          { $inc: { order: -1 } }
        );
      } else {
        await FlashcardCardModel.updateMany(
          { deckId: deck._id, order: { $gte: newOrder, $lt: card.order } },
          { $inc: { order: 1 } }
        );
      }
      card.order = newOrder;
    }

    await card.save();

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

    console.error('Error updating flashcard card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { deckId: string; cardId: string } }
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

    const card = await FlashcardCardModel.findOneAndDelete({
      _id: params.cardId,
      deckId: deck._id,
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    await FlashcardDeckModel.updateOne(
      { _id: deck._id },
      { $inc: { cardCount: -1 } }
    );

    await FlashcardCardModel.updateMany(
      { deckId: deck._id, order: { $gt: card.order } },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.error('Error deleting flashcard card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
