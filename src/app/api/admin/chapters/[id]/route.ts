import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import ChapterModel from '@/models/Chapter';
import BookModel from '@/models/Book';
import { z } from 'zod';
import User from '@/models/User';

// Validation schema for chapter update (mapped to model)
const ChapterUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().optional(),
  summary: z.string().optional(),
  chapterNumber: z.number().int().min(1).optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/admin/chapters/[id] - Get a specific chapter
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
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    const chapter = await ChapterModel.findById(id);

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // If editor, ensure ownership via parent book
    if (userRole === 'editor' && currentUser?._id) {
      const book = await BookModel.findOne({ _id: chapter.bookId, authorId: currentUser._id }).lean();
      if (!book) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }
    // Shape to contract if needed
    const shaped = {
      _id: (chapter as any)._id,
      title: (chapter as any).title,
      content: (chapter as any).content,
      summary: (chapter as any).notes || '',
      chapterNumber: (chapter as any).orderIndex,
      wordCount: (chapter as any).wordCount || 0,
      isPublished: (chapter as any).status === 'complete',
      bookId: String((chapter as any).bookId),
      createdAt: (chapter as any).createdAt,
      updatedAt: (chapter as any).updatedAt,
    };

    return NextResponse.json({ chapter: shaped });
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';
    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
  const validatedData = ChapterUpdateSchema.parse(body);

    // Load existing chapter
    const existingChapter = await ChapterModel.findById(id);

    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Editor access via book
    if (userRole === 'editor' && currentUser?._id) {
      const owns = await BookModel.exists({ _id: existingChapter.bookId, authorId: currentUser._id });
      if (!owns) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const oldWordCount = existingChapter.wordCount || 0;
  // word count will be recalculated on save from content; compute diff after save
  let wordCountDiff = 0;

    // Check if orderIndex changed and conflicts
    if (typeof validatedData.chapterNumber !== 'undefined' && validatedData.chapterNumber !== existingChapter.orderIndex) {
      const conflictingChapter = await ChapterModel.findOne({
        bookId: existingChapter.bookId,
        orderIndex: validatedData.chapterNumber,
        _id: { $ne: id },
      });

      if (conflictingChapter) {
        return NextResponse.json(
          { error: 'Chapter order already exists' },
          { status: 400 }
        );
      }
    }

    // Apply mapped fields then save
    if (typeof validatedData.title !== 'undefined') existingChapter.title = validatedData.title;
    if (typeof validatedData.content !== 'undefined') existingChapter.content = validatedData.content;
    if (typeof validatedData.summary !== 'undefined') (existingChapter as any).notes = validatedData.summary;
    if (typeof validatedData.chapterNumber !== 'undefined') (existingChapter as any).orderIndex = validatedData.chapterNumber;
    if (typeof validatedData.isPublished !== 'undefined') (existingChapter as any).status = validatedData.isPublished ? 'complete' : (existingChapter as any).status === 'complete' ? 'draft' : (existingChapter as any).status;
    (existingChapter as any).updatedAt = new Date();

    const saved = await existingChapter.save();

    // Update book's word count if there's a difference
    const newWordCount = (saved as any).wordCount || 0;
    wordCountDiff = newWordCount - oldWordCount;
    if (wordCountDiff !== 0) {
      await BookModel.findByIdAndUpdate(existingChapter.bookId, { $inc: { currentWordCount: wordCountDiff }, updatedAt: new Date() });
    }

    const shaped = {
      _id: saved._id,
      title: saved.title,
      content: saved.content,
      summary: (saved as any).notes || '',
      chapterNumber: (saved as any).orderIndex,
      wordCount: saved.wordCount || 0,
      isPublished: (saved as any).status === 'complete',
      bookId: String((saved as any).bookId),
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
    return NextResponse.json({ chapter: shaped });
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';
    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Load existing chapter
    const existingChapter = await ChapterModel.findById(id);

    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Editor access via book
    if (userRole === 'editor' && currentUser?._id) {
      const owns = await BookModel.exists({ _id: existingChapter.bookId, authorId: currentUser._id });
      if (!owns) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const wordCountToDeduct = existingChapter.wordCount || 0;

    // Delete the chapter
  await ChapterModel.deleteOne({ _id: id });

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
