import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import ChapterModel from '@/models/Chapter';
import { z } from 'zod';
import User from '@/models/User';

const ReorderSchema = z.object({
  order: z.array(
    z.object({
      chapterId: z.string(),
      chapterNumber: z.number().int().min(1),
    })
  ),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: bookId } = await params;
    const body = await request.json();
    const data = ReorderSchema.parse(body);

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    const userRole = currentUser?.role || 'user';
    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const bookFilter: Record<string, unknown> = { _id: bookId };
    if (userRole === 'editor' && currentUser?._id)
      bookFilter.authorId = currentUser._id;
    const book = await BookModel.findOne(bookFilter);
    if (!book)
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    // Validate unique chapterNumbers in payload
    const numbers = new Set<number>();
    for (const item of data.order) {
      if (numbers.has(item.chapterNumber)) {
        return NextResponse.json(
          { error: 'Duplicate chapter numbers' },
          { status: 400 }
        );
      }
      numbers.add(item.chapterNumber);
    }

    // Validate chapters belong to the book
    const ids = data.order.map(i => i.chapterId);
    const chapters = await ChapterModel.find({
      _id: { $in: ids },
      bookId,
    }).select('_id');
    if (chapters.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more chapters not found in this book' },
        { status: 400 }
      );
    }

    // Apply updates
    await Promise.all(
      data.order.map(item =>
        ChapterModel.updateOne(
          { _id: item.chapterId, bookId },
          { $set: { orderIndex: item.chapterNumber, updatedAt: new Date() } }
        )
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error reordering chapters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
