import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import CharacterModel from '@/models/Character';
import { z } from 'zod';

// Validation schema for character creation/update
const CharacterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  role: z
    .enum(['protagonist', 'antagonist', 'supporting', 'minor'])
    .default('supporting'),
  appearance: z.string().optional(),
  personality: z.string().optional(),
  background: z.string().optional(),
  motivations: z.string().optional(),
  relationships: z
    .array(
      z.object({
        characterId: z.string(),
        relationshipType: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  characterArc: z.string().optional(),
  notes: z.string().optional(),
  profileImage: z.string().url().optional(),
  age: z.number().int().min(0).optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
});

// GET /api/admin/books/[id]/characters - Get all characters for a book
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

    const { id: bookId } = params;

    // Verify book exists and user has access
    const bookFilter: Record<string, unknown> = { _id: bookId };
    if (userRole === 'editor') {
      bookFilter.authorId = userId;
    }

    const book = await BookModel.findOne(bookFilter);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Get characters for the book
    const characters = await CharacterModel.find({ bookId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/books/[id]/characters - Create a new character
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

    const { id: bookId } = params;
    const body = await request.json();
    const validatedData = CharacterSchema.parse(body);

    await connectToDatabase();

    // Verify book exists and user has access
    const bookFilter: Record<string, unknown> = { _id: bookId };
    if (userRole === 'editor') {
      bookFilter.authorId = userId;
    }

    const book = await BookModel.findOne(bookFilter);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Check if character name already exists in this book
    const existingCharacter = await CharacterModel.findOne({
      bookId,
      name: validatedData.name,
    });

    if (existingCharacter) {
      return NextResponse.json(
        { error: 'Character name already exists in this book' },
        { status: 400 }
      );
    }

    // Create new character
    const character = new CharacterModel({
      ...validatedData,
      bookId,
      authorId: userId,
      slug: validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedCharacter = await character.save();

    return NextResponse.json(savedCharacter, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
