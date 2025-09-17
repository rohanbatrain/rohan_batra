import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import { z } from 'zod';

// Validation schema for book creation/update
const BookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  genre: z.string().min(1, 'Genre is required'),
  status: z
    .enum(['planning', 'drafting', 'editing', 'completed', 'published'])
    .default('planning'),
  targetWordCount: z.number().positive().optional(),
  visibility: z.enum(['private', 'public', 'shared']).default('private'),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().url().optional(),
  subtitle: z.string().optional(),
});

// GET /api/admin/books - List all books with filtering and pagination
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (genre) {
      filter.genre = genre;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
      ];
    }

    // If user is editor, only show their books
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    const skip = (page - 1) * limit;

    // Get books with pagination and populate author info
    const [books, total] = await Promise.all([
      BookModel.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      BookModel.countDocuments(filter),
    ]);

    // Calculate stats
    const stats = await BookModel.aggregate([
      ...(userRole === 'editor' ? [{ $match: { authorId: userId } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalWords: { $sum: '$currentWordCount' },
        },
      },
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: stats.reduce(
        (
          acc: Record<string, { count: number; totalWords: number }>,
          stat: { _id: string; count: number; totalWords: number }
        ) => {
          acc[stat._id] = {
            count: stat.count,
            totalWords: stat.totalWords,
          };
          return acc;
        },
        {} as Record<string, { count: number; totalWords: number }>
      ),
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/books - Create a new book
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = BookSchema.parse(body);

    await connectToDatabase();

    // Create new book
    const book = new BookModel({
      ...validatedData,
      authorId: userId,
      currentWordCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedBook = await book.save();

    return NextResponse.json(savedBook, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
