import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import { z } from 'zod';

// Validation schema for book update
const BookUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  genre: z.string().min(1, 'Genre is required'),
  status: z.enum(['planning', 'drafting', 'editing', 'completed', 'published']),
  targetWordCount: z.number().positive().optional(),
  visibility: z.enum(['private', 'public', 'shared']),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().url().optional(),
  subtitle: z.string().optional(),
  currentWordCount: z.number().min(0).optional(),
});

// GET /api/admin/books/[id] - Get a specific book
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

    // Build filter - editors can only access their own books
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    const book = await BookModel.findOne(filter).lean();

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/books/[id] - Update a specific book
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
    const validatedData = BookUpdateSchema.parse(body);

    await connectToDatabase();

    // Build filter - editors can only update their own books
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Check if book exists and user has permission
    const existingBook = await BookModel.findOne(filter);

    if (!existingBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Update the book
    const updatedBook = await BookModel.findOneAndUpdate(
      filter,
      {
        ...validatedData,
        updatedAt: new Date(),
      },
      { new: true, lean: true }
    );

    return NextResponse.json(updatedBook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/books/[id] - Delete a specific book
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

    // Build filter - editors can only delete their own books
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Check if book exists and user has permission
    const existingBook = await BookModel.findOne(filter);

    if (!existingBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Delete the book
    await BookModel.findOneAndDelete(filter);

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
