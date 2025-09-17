import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CharacterModel from '@/models/Character';
import CharacterJournalModel from '@/models/CharacterJournal';
import { z } from 'zod';

// Validation schema for journal creation/update
const JournalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().optional(),
  entryType: z.enum(['backstory', 'development', 'notes', 'relationship']).default('notes'),
  isPrivate: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  relatedCharacterIds: z.array(z.string()).optional(),
  mood: z.string().optional(),
  summary: z.string().optional(),
});

// GET /api/admin/characters/[id]/journals - Get all journals for a character
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: characterId } = params;

    // Verify character exists and user has access
    const characterFilter: Record<string, unknown> = { _id: characterId };
    if (userRole === 'editor') {
      characterFilter.authorId = userId;
    }

    const character = await CharacterModel.findOne(characterFilter);

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const entryType = searchParams.get('entryType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter for journals
    const journalFilter: Record<string, unknown> = { characterId };
    if (entryType) {
      journalFilter.entryType = entryType;
    }

    const skip = (page - 1) * limit;

    // Get journals with pagination
    const [journals, total] = await Promise.all([
      CharacterJournalModel.find(journalFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CharacterJournalModel.countDocuments(journalFilter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      journals,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/characters/[id]/journals - Create a new journal entry
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: characterId } = params;
    const body = await request.json();
    const validatedData = JournalSchema.parse(body);

    await connectToDatabase();

    // Verify character exists and user has access
    const characterFilter: Record<string, unknown> = { _id: characterId };
    if (userRole === 'editor') {
      characterFilter.authorId = userId;
    }

    const character = await CharacterModel.findOne(characterFilter);

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Create new journal entry
    const journal = new CharacterJournalModel({
      ...validatedData,
      characterId,
      authorId: userId,
      bookId: character.bookId,
      slug: validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedJournal = await journal.save();

    return NextResponse.json(savedJournal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating journal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}