import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import ChapterModel from '@/models/Chapter';
import { z } from 'zod';
import User from '@/models/User';

const ChapterUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  summary: z.string().optional(),
  chapterNumber: z.number().int().min(1).optional(),
  isPublished: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: bookId, chapterId } = await params;
    const body = await request.json();
    const data = ChapterUpdateSchema.parse(body);

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

    const chapter = await ChapterModel.findOne({ _id: chapterId, bookId });
    if (!chapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });

    const oldWordCount = chapter.wordCount || 0;

    if (typeof data.title !== 'undefined') chapter.title = data.title;
    if (typeof data.content !== 'undefined') chapter.content = data.content;
    if (typeof data.summary !== 'undefined') chapter.notes = data.summary;
    if (typeof data.chapterNumber !== 'undefined') chapter.orderIndex = data.chapterNumber;
    if (typeof data.isPublished !== 'undefined') chapter.status = data.isPublished ? 'complete' : chapter.status === 'complete' ? 'draft' : chapter.status;
    chapter.updatedAt = new Date();

    const saved = await chapter.save();
    const newWordCount = saved.wordCount || 0;
    const diff = newWordCount - oldWordCount;
    if (diff !== 0) {
      await BookModel.findByIdAndUpdate(bookId, { $inc: { currentWordCount: diff }, updatedAt: new Date() });
    }

    const shaped = {
      _id: saved._id,
      title: saved.title,
      content: saved.content,
      summary: saved.notes || '',
      chapterNumber: saved.orderIndex,
      wordCount: saved.wordCount || 0,
      isPublished: saved.status === 'complete',
      bookId: bookId,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };

    return NextResponse.json({ chapter: shaped });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: bookId, chapterId } = await params;

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

    const chapter = await ChapterModel.findOne({ _id: chapterId, bookId });
    if (!chapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });

    const wordCountToDeduct = chapter.wordCount || 0;
    await ChapterModel.deleteOne({ _id: chapterId, bookId });

    if (wordCountToDeduct > 0) {
      await BookModel.findByIdAndUpdate(bookId, { $inc: { currentWordCount: -wordCountToDeduct }, updatedAt: new Date() });
    }

    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
