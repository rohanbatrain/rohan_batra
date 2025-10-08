import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import UserModel from '@/models/User';
import { createAuditLog } from '@/lib/audit-log';

/**
 * POST /api/admin/flashcards/[deckId]/cards/[cardId]/duplicate
 * Duplicate a flashcard card
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ deckId: string; cardId: string }> }
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

    // Find the card to duplicate
    const originalCard = await FlashcardCardModel.findOne({
      _id: new Types.ObjectId(params.cardId),
      deckId: deck._id,
    });

    if (!originalCard) {
      return NextResponse.json(
        { error: 'Card not found or does not belong to this deck' },
        { status: 404 }
      );
    }

    // Get the next order value
    const lastCard = await FlashcardCardModel.findOne({ deckId: deck._id })
      .sort({ order: -1 })
      .select('order');
    const nextOrder = lastCard ? lastCard.order + 1 : 1;

    // Create the duplicated card
    const duplicatedCard = new FlashcardCardModel({
      deckId: deck._id,
      type: originalCard.type,
      prompt: {
        ...originalCard.prompt,
        text: originalCard.prompt?.text 
          ? `${originalCard.prompt.text} (copy)` 
          : originalCard.prompt?.text,
        richText: originalCard.prompt?.richText,
      },
      response: { ...originalCard.response },
      hint: originalCard.hint,
      explanation: originalCard.explanation,
      tags: [...originalCard.tags],
      order: nextOrder,
    });

    await duplicatedCard.save();

    // Update deck card count
    deck.cardCount = await FlashcardCardModel.countDocuments({ deckId: deck._id });
    await deck.save();

    // Create audit log
    await createAuditLog(
      {
        userId,
        action: 'create',
        resource: 'FlashcardCard',
        resourceId: duplicatedCard._id,
        changes: {
          before: {},
          after: {
            duplicatedFrom: originalCard._id.toString(),
            deckId: deck._id.toString(),
            deckTitle: deck.title,
          },
        },
      },
      request
    );

    // Convert to plain object and rename _id to id
    const cardObj = duplicatedCard.toObject();
    const responseCard = {
      id: cardObj._id.toString(),
      deckId: cardObj.deckId.toString(),
      type: cardObj.type,
      prompt: cardObj.prompt,
      response: cardObj.response,
      hint: cardObj.hint,
      explanation: cardObj.explanation,
      tags: cardObj.tags,
      order: cardObj.order,
      createdAt: cardObj.createdAt,
      updatedAt: cardObj.updatedAt,
    };

    return NextResponse.json(responseCard, { status: 201 });
  } catch (error) {
    console.error('Error duplicating card:', error);
    return NextResponse.json({ error: 'Failed to duplicate card' }, { status: 500 });
  }
}
