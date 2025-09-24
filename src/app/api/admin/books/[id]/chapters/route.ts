import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import ChapterModel from '@/models/Chapter';
import { z } from 'zod';
import { uniqueSlug } from '@/lib/slug';
import User from '@/models/User';

// Validation schema for chapter creation
const ChapterCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().optional(),
  summary: z.string().optional(),
  chapterNumber: z.number().int().min(1).optional(),
  isPublished: z.boolean().optional().default(false),
});

// GET /api/admin/books/[id]/chapters - Get all chapters for a book
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

    // Get chapters for the book, sorted by orderIndex
    const chapters = await ChapterModel.find({ bookId })
      .sort({ orderIndex: 1 })
      .lean();

    const shaped = chapters.map((c: any) => ({
      _id: c._id,
      title: c.title,
      content: c.content,
      summary: c.notes || '',
      chapterNumber: c.orderIndex,
      wordCount: c.wordCount || 0,
      isPublished: c.status === 'complete',
      bookId: bookId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ chapters: shaped });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: bookId } = await params;
  const body = await request.json();
  const validatedData = ChapterCreateSchema.parse(body);

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

    // Determine chapter order index
    let orderIndex: number;
    if (typeof validatedData.chapterNumber === 'number') {
      // If provided, ensure it's not taken
      const existingChapter = await ChapterModel.findOne({ bookId, orderIndex: validatedData.chapterNumber });
      if (existingChapter) {
        return NextResponse.json(
          { error: 'Chapter order already exists' },
          { status: 400 }
        );
      }
      orderIndex = validatedData.chapterNumber;
    } else {
      const last = await ChapterModel.find({ bookId }).sort({ orderIndex: -1 }).limit(1).lean();
      orderIndex = last.length ? (last[0] as any).orderIndex + 1 : 1;
    }

    // Generate unique slug per book
    const slug = await uniqueSlug(validatedData.title, async (candidate: string) => {
      return !!(await ChapterModel.exists({ bookId, slug: candidate }));
    });

    // Create new chapter
    const chapter = new ChapterModel({
      bookId,
      title: validatedData.title,
      slug,
      content: validatedData.content || '',
      notes: validatedData.summary,
  orderIndex,
      status: validatedData.isPublished ? 'complete' : 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedChapter = await chapter.save();

    // Update book's word count by saved chapter's wordCount
    if (savedChapter.wordCount && savedChapter.wordCount > 0) {
      await BookModel.findByIdAndUpdate(bookId, {
        $inc: { currentWordCount: savedChapter.wordCount },
        updatedAt: new Date(),
      });
    }

    const shaped = {
      _id: savedChapter._id,
      title: savedChapter.title,
      content: savedChapter.content,
      summary: savedChapter.notes || '',
      chapterNumber: savedChapter.orderIndex,
      wordCount: savedChapter.wordCount || 0,
      isPublished: savedChapter.status === 'complete',
      bookId: bookId,
      createdAt: savedChapter.createdAt,
      updatedAt: savedChapter.updatedAt,
    };

    return NextResponse.json({ chapter: shaped }, { status: 201 });
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
