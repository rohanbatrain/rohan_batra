import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import { importDecksV2, ExportV2Format } from '@/lib/flashcards/export-import-v2';

const ImportOptionsSchema = z.object({
  mergeStrategy: z.enum(['skip', 'overwrite', 'duplicate']).default('skip'),
  preserveScheduling: z.boolean().default(false),
});

/**
 * POST /api/admin/flashcards/import
 * Import decks from V2 format
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const optionsJson = formData.get('options') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse options
    const options = optionsJson
      ? ImportOptionsSchema.parse(JSON.parse(optionsJson))
      : ImportOptionsSchema.parse({});

    // Read file content
    const fileContent = await file.text();
    const exportData: ExportV2Format = JSON.parse(fileContent);

    // Validate format
    if (exportData.version !== '2.0') {
      return NextResponse.json(
        { error: `Unsupported export version: ${exportData.version}` },
        { status: 400 }
      );
    }

    // Import decks
    const result = await importDecksV2(currentUser!._id, exportData, options);

    return NextResponse.json({
      success: true,
      decksImported: result.decksImported,
      cardsImported: result.cardsImported,
      errors: result.errors.length > 0 ? result.errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error importing decks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
