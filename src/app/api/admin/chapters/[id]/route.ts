import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import ChapterModel from '@/models/Chapter';
import BookModel from '@/models/Book';
import { z } from 'zod';

// Validation schema for chapter update
const ChapterUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().optional(),
  summary: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'completed']),
  order: z.number().int().min(1),
  wordCount: z.number().min(0).optional(),
  isPublished: z.boolean(),
  notes: z.string().optional(),
});

// GET /api/admin/chapters/[id] - Get a specific chapter
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

    // Build filter - editors can only access their own chapters
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    const chapter = await ChapterModel.findOne(filter).lean();

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/chapters/[id] - Update a specific chapter
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
    const validatedData = ChapterUpdateSchema.parse(body);

    await connectToDatabase();

    // Build filter - editors can only update their own chapters
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Get the existing chapter to check word count changes
    const existingChapter = await ChapterModel.findOne(filter);

    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const oldWordCount = existingChapter.wordCount || 0;
    const newWordCount = validatedData.wordCount || 0;
    const wordCountDiff = newWordCount - oldWordCount;

    // Check if order changed and conflicts with existing chapters
    if (validatedData.order !== existingChapter.order) {
      const conflictingChapter = await ChapterModel.findOne({
        bookId: existingChapter.bookId,
        order: validatedData.order,
        _id: { $ne: id },
      });

      if (conflictingChapter) {
        return NextResponse.json(
          { error: 'Chapter order already exists' },
          { status: 400 }
        );
      }
    }

    // Update the chapter
    const updatedChapter = await ChapterModel.findOneAndUpdate(
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

    // Update book's word count if there's a difference
    if (wordCountDiff !== 0) {
      await BookModel.findByIdAndUpdate(existingChapter.bookId, {
        $inc: { currentWordCount: wordCountDiff },
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(updatedChapter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/chapters/[id] - Delete a specific chapter
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

    // Build filter - editors can only delete their own chapters
    const filter: Record<string, unknown> = { _id: id };
    if (userRole === 'editor') {
      filter.authorId = userId;
    }

    // Get the existing chapter to update book word count
    const existingChapter = await ChapterModel.findOne(filter);

    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const wordCountToDeduct = existingChapter.wordCount || 0;

    // Delete the chapter
    await ChapterModel.findOneAndDelete(filter);

    // Update book's word count
    if (wordCountToDeduct > 0) {
      await BookModel.findByIdAndUpdate(existingChapter.bookId, {
        $inc: { currentWordCount: -wordCountToDeduct },
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
