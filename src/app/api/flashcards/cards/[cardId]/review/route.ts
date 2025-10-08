/**
 * POST /api/flashcards/cards/[cardId]/review
 * 
 * Record a flashcard review and update scheduling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import FlashcardCard from '@/models/FlashcardCard';
import { calculateNextReview, type ReviewRating } from '@/lib/flashcards/scheduling';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ cardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const params = await props.params;
    const { cardId } = params;
    const body = await request.json();
    const { rating } = body as { rating: ReviewRating };

    // Validate rating
    if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be: again, hard, good, or easy' },
        { status: 400 }
      );
    }

    // Find the card
    const card = await FlashcardCard.findById(cardId);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Calculate new scheduling
    const currentScheduling = {
      interval: card.scheduling?.intervalDays || 0,
      repetitions: card.scheduling?.repetitions || 0,
      easeFactor: card.scheduling?.easeFactor || 2.5,
      nextReviewAt: card.scheduling?.nextReviewAt || undefined,
      lastReviewedAt: card.scheduling?.lastReviewedAt || undefined,
    };

    const newScheduling = calculateNextReview(rating, currentScheduling);

    // Update card with new scheduling
    card.scheduling = {
      intervalDays: newScheduling.interval,
      easeFactor: newScheduling.easeFactor,
      repetitions: newScheduling.repetitions,
      nextReviewAt: newScheduling.nextReviewAt,
      lastReviewedAt: newScheduling.lastReviewedAt,
    };

    await card.save();

    return NextResponse.json({
      success: true,
      scheduling: newScheduling,
      message: `Next review in ${newScheduling.interval} day(s)`,
    });
  } catch (error) {
    console.error('Error reviewing flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}
