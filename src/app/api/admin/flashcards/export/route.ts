import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import {
  exportDecksV2,
  importDecksV2,
  exportDeckWithChildren,
} from '@/lib/flashcards/export-import-v2';

const ImportOptionsSchema = z.object({
  mergeStrategy: z.enum(['skip', 'overwrite', 'duplicate']).default('skip'),
  preserveScheduling: z.boolean().default(false),
});

/**
 * POST /api/admin/flashcards/export
 * Export decks to V2 format
 */
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
    const deckIds = body.deckIds as string[] | undefined;
    const singleDeckId = body.deckId as string | undefined;

    let exportData;

    if (singleDeckId) {
      // Export single deck with children
      exportData = await exportDeckWithChildren(singleDeckId, currentUser!._id);
    } else {
      // Export all or selected decks
      exportData = await exportDecksV2(currentUser!._id, deckIds);
    }

    // Return as downloadable JSON
    const filename = `flashcards-export-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting decks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
