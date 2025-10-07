import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import BulkOperationRecordModel from '@/models/BulkOperationRecord';
import UserModel from '@/models/User';
import { parseBulkImportFile } from '@/lib/flashcards/bulk-import';

/**
 * POST /api/admin/flashcards/[deckId]/cards/bulk
 * Bulk import flashcards from file (Markdown, JSON, CSV, YAML)
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ deckId: string }> }
) {
  const params = await props.params;
  const bulkOp = { _id: null as Types.ObjectId | null };

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check permissions
    const currentUser = await UserModel.findOne({ clerkId: userId });
    const userRole = (currentUser?.role as string) || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Find deck
    const deckQuery = Types.ObjectId.isValid(params.deckId)
      ? { _id: new Types.ObjectId(params.deckId) }
      : { slug: params.deckId };

    const deck = await FlashcardDeckModel.findOne(deckQuery);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt';

    // Create bulk operation record
    const bulkOperation = new BulkOperationRecordModel({
      operationType: 'import',
      ownerId: currentUser?._id,
      targetDeckId: deck._id,
      status: 'in-progress',
      totalItems: 0,
      succeeded: 0,
      failed: 0,
      startedAt: new Date(),
    });

    await bulkOperation.save();
    bulkOp._id = bulkOperation._id;

    // Parse cards from file
    const parseResult = await parseBulkImportFile(fileContent, fileType);

    if (!parseResult.success) {
      bulkOperation.status = 'failed';
      bulkOperation.finishedAt = new Date();
      bulkOperation.errorSummary = parseResult.error || 'Failed to parse file';
      await bulkOperation.save();

      return NextResponse.json(
        { error: parseResult.error || 'Invalid file format' },
        { status: 400 }
      );
    }

    const cards = parseResult.cards || [];
    bulkOperation.totalItems = cards.length;
    await bulkOperation.save();

    // Get the next order value
    const lastCard = await FlashcardCardModel.findOne({ deckId: deck._id })
      .sort({ order: -1 })
      .lean();
    let nextOrder = (lastCard?.order || 0) + 1;

    // Insert cards in batch
    const errors: string[] = [];
    let successCount = 0;

    for (const cardData of cards) {
      try {
        const card = new FlashcardCardModel({
          deckId: deck._id,
          type: cardData.type || 'basic',
          prompt: cardData.prompt,
          response: cardData.response,
          hint: cardData.hint,
          explanation: cardData.explanation,
          tags: cardData.tags || [],
          order: nextOrder++,
        });

        await card.save();
        successCount++;
      } catch (error) {
        errors.push(
          `Card ${successCount + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Update deck card count
    deck.cardCount = await FlashcardCardModel.countDocuments({
      deckId: deck._id,
    });
    await deck.save();

    // Update bulk operation status
    bulkOperation.succeeded = successCount;
    bulkOperation.failed = cards.length - successCount;
    bulkOperation.status = errors.length === 0 ? 'completed' : 'failed';
    bulkOperation.finishedAt = new Date();
    if (errors.length > 0) {
      bulkOperation.errorSummary = errors.slice(0, 10).join('; ');
    }
    await bulkOperation.save();

    return NextResponse.json({
      operationId: bulkOperation._id.toString(),
      totalCards: cards.length,
      succeeded: successCount,
      failed: cards.length - successCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    console.error('Error importing flashcards:', error);

    // Update bulk operation if created
    if (bulkOp._id) {
      try {
        const bulkOperation = await BulkOperationRecordModel.findById(
          bulkOp._id
        );
        if (bulkOperation) {
          bulkOperation.status = 'failed';
          bulkOperation.finishedAt = new Date();
          bulkOperation.errorSummary =
            error instanceof Error ? error.message : 'Unknown error';
          await bulkOperation.save();
        }
      } catch (updateError) {
        console.error('Failed to update bulk operation:', updateError);
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
