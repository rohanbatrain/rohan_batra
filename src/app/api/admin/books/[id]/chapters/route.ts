import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import ChapterModel from '@/models/Chapter';
import { z } from 'zod';

// Validation schema for chapter creation/update
const ChapterSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().optional(),
  summary: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'completed']).default('draft'),
  order: z.number().int().min(1),
  wordCount: z.number().min(0).optional(),
  isPublished: z.boolean().default(false),
  notes: z.string().optional(),
});

// GET /api/admin/books/[id]/chapters - Get all chapters for a book
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

    // Get chapters for the book
    const chapters = await ChapterModel.find({ bookId })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/books/[id]/chapters - Create a new chapter
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
    const validatedData = ChapterSchema.parse(body);

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

    // Check if chapter order already exists
    const existingChapter = await ChapterModel.findOne({
      bookId,
      order: validatedData.order,
    });

    if (existingChapter) {
      return NextResponse.json(
        { error: 'Chapter order already exists' },
        { status: 400 }
      );
    }

    // Create new chapter
    const chapter = new ChapterModel({
      ...validatedData,
      bookId,
      authorId: userId,
      slug: validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedChapter = await chapter.save();

    // Update book's word count if wordCount is provided
    if (validatedData.wordCount) {
      await BookModel.findByIdAndUpdate(bookId, {
        $inc: { currentWordCount: validatedData.wordCount },
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(savedChapter, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
