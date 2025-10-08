import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { getAllCardsInHierarchy, getDeckByScope } from '@/lib/flashcards/hierarchy';

/**
 * GET /api/flashcards/study?scope=course|module|lesson&courseId=...&moduleId=...&lessonId=...
 * Get cards for study session at any hierarchy level
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') as 'course' | 'module' | 'lesson';
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');

    if (!scope || !['course', 'module', 'lesson'].includes(scope)) {
      return NextResponse.json(
        { error: 'Invalid scope. Must be course, module, or lesson' },
        { status: 400 }
      );
    }

    // Get the appropriate deck
    const deck = await getDeckByScope(scope, courseId || undefined, moduleId || undefined, lessonId || undefined);

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found for this scope' },
        { status: 404 }
      );
    }

    // Get all cards in hierarchy
    const cards = await getAllCardsInHierarchy(deck._id.toString());

    // Enrich cards with data
    const enrichedCards = cards.map(card => ({
      id: card._id.toString(),
      deckId: card.deckId.toString(),
      type: card.type,
      prompt: card.prompt,
      response: card.response,
      hint: card.hint,
      explanation: card.explanation,
      tags: card.tags,
      order: card.order,
      scheduling: card.scheduling || {
        intervalDays: 0,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        nextReviewAt: null,
      },
    }));

    // Filter for due cards
    const now = new Date();
    const dueCards = enrichedCards.filter(card => {
      if (!card.scheduling.nextReviewAt) return true; // New cards
      return new Date(card.scheduling.nextReviewAt) <= now;
    });

    return NextResponse.json({
      deck: {
        id: deck._id.toString(),
        title: deck.title,
        subtitle: deck.subtitle,
        path: deck.path,
        level: deck.level,
        cardCount: deck.cardCount,
      },
      scope,
      totalCards: enrichedCards.length,
      dueCards: dueCards.length,
      cards: dueCards, // Return only due cards for study
      allCards: enrichedCards, // Include all for reference
    });
  } catch (error: any) {
    console.error('Error fetching study cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study cards', details: error.message },
      { status: 500 }
    );
  }
}
