import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import UserModel from '@/models/User';
import { createAuditLog } from '@/lib/audit-log';

const ReorderSchema = z.object({
  cardIds: z
    .array(z.string())
    .min(1, 'At least one card ID required')
    .max(1000, 'Maximum 1000 cards can be reordered at once'),
});

/**
 * PATCH /api/admin/flashcards/[deckId]/cards/reorder
 * Reorder flashcard cards
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ deckId: string }> }
) {
  const params = await props.params;
  await connectToDatabase();

  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const user = await UserModel.findOne({ clerkId: userId }).select('role');
    if (!user || !['editor', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Validate request
    const body = await request.json();
    const validation = ReorderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { cardIds } = validation.data;

    // Find deck by ID or slug
    const deck = await FlashcardDeckModel.findOne({
      $or: [
        Types.ObjectId.isValid(params.deckId) ? { _id: params.deckId } : { slug: params.deckId },
        { slug: params.deckId }
      ],
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Verify all cards exist and belong to this deck
    const cards = await FlashcardCardModel.find({
      _id: { $in: cardIds.map((id) => new Types.ObjectId(id)) },
      deckId: deck._id,
    });

    if (cards.length !== cardIds.length) {
      return NextResponse.json(
        { error: 'Some cards not found or do not belong to this deck' },
        { status: 400 }
      );
    }

    // Update order for each card based on position in array
    const updatePromises = cardIds.map((cardId, index) => {
      return FlashcardCardModel.findByIdAndUpdate(
        new Types.ObjectId(cardId),
        { order: index + 1 },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Create audit log
    await createAuditLog(
      {
        userId,
        action: 'update',
        resource: 'FlashcardCard',
        resourceId: 'reorder',
        changes: {
          before: { deckId: deck._id.toString(), deckTitle: deck.title },
          after: { reordered: cardIds.length, newOrder: cardIds },
        },
      },
      request
    );

    return NextResponse.json({
      success: true,
      reordered: cardIds.length,
    });
  } catch (error) {
    console.error('Error reordering cards:', error);
    return NextResponse.json({ error: 'Failed to reorder cards' }, { status: 500 });
  }
}
