import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CharacterJournalModel from '@/models/CharacterJournal';
import { z } from 'zod';

// Validation schema for journal update
const JournalUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().optional(),
  entryType: z.enum(['backstory', 'development', 'notes', 'relationship']),
  isPrivate: z.boolean(),
  tags: z.array(z.string()).optional(),
  relatedCharacterIds: z.array(z.string()).optional(),
  mood: z.string().optional(),
  summary: z.string().optional(),
});

// GET /api/admin/journals/[id] - Get a specific journal entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for editor/admin role
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    const userRole = metadata?.role || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { id } = await params;

    // Build filter - editors can only access their own journals
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    const journal = await CharacterJournalModel.findOne(filter).lean();

    if (!journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
    }

    return NextResponse.json(journal);
  } catch (error) {
    console.error('Error fetching journal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/journals/[id] - Update a specific journal entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for editor/admin role
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    const userRole = metadata?.role || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = JournalUpdateSchema.parse(body);

    await connectToDatabase();

    // Build filter - editors can only update their own journals
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Check if journal exists and user has permission
    const existingJournal = await CharacterJournalModel.findOne(filter);

    if (!existingJournal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
    }

    // Update the journal
    const updatedJournal = await CharacterJournalModel.findOneAndUpdate(
      filter,
      {
        ...validatedData,
        slug: validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        updatedAt: new Date(),
      },
      { new: true, lean: true }
    );

    return NextResponse.json(updatedJournal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating journal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/journals/[id] - Delete a specific journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for editor/admin role
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    const userRole = metadata?.role || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await connectToDatabase();

    // Build filter - editors can only delete their own journals
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Check if journal exists and user has permission
    const existingJournal = await CharacterJournalModel.findOne(filter);

    if (!existingJournal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
    }

    // Delete the journal
    await CharacterJournalModel.findOneAndDelete(filter);

    return NextResponse.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
