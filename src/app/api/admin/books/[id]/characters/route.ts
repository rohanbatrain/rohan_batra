import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import CharacterModel from '@/models/Character';
import { z } from 'zod';
import User from '@/models/User';

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';
    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: bookId } = await params;

    // Verify book exists and user has access
    const bookFilter: Record<string, unknown> = { _id: bookId };
    if (userRole === 'editor' && currentUser?._id) {
      bookFilter.authorId = currentUser._id;
    }

    const book = await BookModel.findOne(bookFilter);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Filters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const significance = searchParams.get('significance') || undefined;
    const q = searchParams.get('q') || undefined;

    const charFilter: Record<string, unknown> = { bookId };
    if (role) charFilter['role'] = role;
    if (significance) charFilter['significance'] = significance;
    if (q) charFilter['$or'] = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];

    // Get characters for the book
    const characters = await CharacterModel.find(charFilter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/books/[id]/characters - Create or attach a character
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: bookId } = await params;
  const body = await request.json();
  const attachSchema = z.object({ characterId: z.string().optional(), role: CharacterSchema.shape.role.optional(), significance: z.string().optional() });
  const attach = attachSchema.safeParse(body);

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';
    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify book exists and user has access
    const bookFilter: Record<string, unknown> = { _id: bookId };
    if (userRole === 'editor' && currentUser?._id) {
      bookFilter.authorId = currentUser._id;
    }

    const book = await BookModel.findOne(bookFilter);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Attach existing character path
    if (attach.success && attach.data.characterId) {
      const existing = await CharacterModel.findById(attach.data.characterId);
      if (!existing) return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      existing.bookId = (book as any)._id;
      if (attach.data.role) (existing as any).role = attach.data.role;
      if (attach.data.significance) (existing as any).significance = attach.data.significance as any;
      (existing as any).updatedAt = new Date();
      const saved = await existing.save();
      return NextResponse.json(saved, { status: 200 });
    }

    // Create new character
    const validatedData = CharacterSchema.parse(body);
    const nameExists = await CharacterModel.findOne({ bookId, name: validatedData.name });
    if (nameExists) {
      return NextResponse.json({ error: 'Character name already exists in this book' }, { status: 400 });
    }
    const character = new CharacterModel({
      ...validatedData,
      bookId,
      authorId: userId,
      slug: validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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

// DELETE /api/admin/books/[id]/characters - Detach a character from the book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: bookId } = await params;
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    if (!characterId) return NextResponse.json({ error: 'characterId required' }, { status: 400 });

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';
    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const bookFilter: Record<string, unknown> = { _id: bookId };
    if (userRole === 'editor' && currentUser?._id) bookFilter.authorId = currentUser._id;
    const book = await BookModel.findOne(bookFilter);
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const character = await CharacterModel.findOne({ _id: characterId, bookId });
    if (!character) return NextResponse.json({ error: 'Character not found in this book' }, { status: 404 });

    character.bookId = null as any;
    (character as any).updatedAt = new Date();
    await character.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error detaching character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
