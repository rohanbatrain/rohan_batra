import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import { z } from 'zod';
import User from '@/models/User';

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Build filter - editors can only access their own books
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor' && currentUser?._id) {
      filter.authorId = currentUser._id;
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

// PUT /api/admin/books/[id] - Update a book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = BookUpdateSchema.parse(body);

    // Build filter - editors can only update their own books
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor' && currentUser?._id) {
      filter.authorId = currentUser._id;
    }

    const book = await BookModel.findOneAndUpdate(
      filter,
      {
        ...validatedData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);
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

// DELETE /api/admin/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  await connectToDatabase();
  const currentUser = await User.findOne({ clerkId: userId });
  const userRole = currentUser?.role || 'user';

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';
    const toTrash = url.searchParams.get('trash') === 'true';

    const book = await BookModel.findById(id);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (permanent && book.deletedAt) {
      await BookModel.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Book permanently deleted' });
    }

    // Soft delete path (default or explicit trash=true)
    const currentTime = new Date();
    await BookModel.findByIdAndUpdate(
      id,
      {
        $set: {
          deletedAt: currentTime,
          deletedBy: currentUser?._id,
        },
      },
      { new: true }
    );

    return NextResponse.json({ message: toTrash ? 'Book moved to trash' : 'Book soft deleted' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
