import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import FlashcardCardModel from '@/models/FlashcardCard';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import { calculateNextReview, EaseLevel } from '@/lib/scheduler/sm2';

const ReviewInputSchema = z.object({
  cardId: z.string(),
  easeLevel: z.enum(['again', 'hard', 'good', 'easy']),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const parsed = ReviewInputSchema.parse(body);

    const card = await FlashcardCardModel.findById(parsed.cardId);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Get current scheduling or initialize
    const currentScheduling = card.scheduling || {
      intervalDays: 0,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
    };

    // Calculate next review using SM-2
    const nextScheduling = calculateNextReview(
      currentScheduling,
      parsed.easeLevel as EaseLevel
    );

    // Update card
    card.scheduling = nextScheduling;
    await card.save();

    // Update deck due count
    const deck = await FlashcardDeckModel.findById(card.deckId);
    if (deck) {
      // Recalculate due count for the deck
      const dueCards = await FlashcardCardModel.countDocuments({
        deckId: deck._id,
        $or: [
          { 'scheduling.nextReviewAt': { $lte: new Date() } },
          { 'scheduling.nextReviewAt': null },
        ],
      });
      deck.dueCount = dueCards;
      await deck.save();
    }

    return NextResponse.json({
      success: true,
      scheduling: nextScheduling,
      message: 'Review recorded successfully',
    });
  } catch (error) {
    console.error('Error recording review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}
