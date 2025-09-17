import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CharacterModel from '@/models/Character';
import { z } from 'zod';

// Validation schema for character update
const CharacterUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']),
  appearance: z.string().optional(),
  personality: z.string().optional(),
  background: z.string().optional(),
  motivations: z.string().optional(),
  relationships: z.array(z.object({
    characterId: z.string(),
    relationshipType: z.string(),
    description: z.string().optional(),
  })).optional(),
  characterArc: z.string().optional(),
  notes: z.string().optional(),
  profileImage: z.string().url().optional(),
  age: z.number().int().min(0).optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
});

// GET /api/admin/characters/[id] - Get a specific character
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

    const { id } = params;

    // Build filter - editors can only access their own characters
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    const character = await CharacterModel.findOne(filter).lean();

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/characters/[id] - Update a specific character
export async function PUT(
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

    const { id } = params;
    const body = await request.json();
    const validatedData = CharacterUpdateSchema.parse(body);

    await connectToDatabase();

    // Build filter - editors can only update their own characters
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Check if character exists and user has permission
    const existingCharacter = await CharacterModel.findOne(filter);

    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check if name changed and conflicts with existing characters
    if (validatedData.name !== existingCharacter.name) {
      const conflictingCharacter = await CharacterModel.findOne({
        bookId: existingCharacter.bookId,
        name: validatedData.name,
        _id: { $ne: id },
      });

      if (conflictingCharacter) {
        return NextResponse.json(
          { error: 'Character name already exists in this book' },
          { status: 400 }
        );
      }
    }

    // Update the character
    const updatedCharacter = await CharacterModel.findOneAndUpdate(
      filter,
      {
        ...validatedData,
        slug: validatedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        updatedAt: new Date(),
      },
      { new: true, lean: true }
    );

    return NextResponse.json(updatedCharacter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/characters/[id] - Delete a specific character
export async function DELETE(
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

    const { id } = params;

    await connectToDatabase();

    // Build filter - editors can only delete their own characters
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Check if character exists and user has permission
    const existingCharacter = await CharacterModel.findOne(filter);

    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Delete the character
    await CharacterModel.findOneAndDelete(filter);

    return NextResponse.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}