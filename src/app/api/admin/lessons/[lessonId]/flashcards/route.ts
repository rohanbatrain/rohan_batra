import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CourseLessonModel from '@/models/CourseLesson';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import UserModel from '@/models/User';
import mongoose from 'mongoose';

/**
 * POST /api/admin/lessons/[lessonId]/flashcards
 * Create a flashcard deck for a specific lesson
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get MongoDB user
    const user = await UserModel.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { lessonId } = await params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Fetch the lesson
    const lesson = await CourseLessonModel.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Parse request body for deck details
    const body = await req.json();
    const {
      title = `${lesson.title} - Flashcards`,
      slug = `${lesson.slug}-flashcards`,
      description,
      parentDeckId,
    } = body;

    // Create the flashcard deck
    const deck = await FlashcardDeckModel.create({
      title,
      slug,
      description,
      parentDeckId: parentDeckId || null,
      status: 'draft',
      visibility: 'private',
      linkTargets: [
        {
          scope: 'lesson',
          courseId: lesson.courseId,
          moduleId: lesson.moduleId,
          lessonId: lesson._id,
        },
      ],
      createdBy: user._id,
    });

    // Link the deck to the lesson
    lesson.flashcardDeckIds = lesson.flashcardDeckIds || [];
    if (!lesson.flashcardDeckIds.some((id) => id.equals(deck._id))) {
      lesson.flashcardDeckIds.push(deck._id);
      await lesson.save();
    }

    return NextResponse.json(
      {
        success: true,
        deck: deck.toJSON(),
        message: 'Flashcard deck created and linked to lesson',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating lesson flashcard deck:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A deck with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create flashcard deck', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/lessons/[lessonId]/flashcards
 * Get all flashcard decks for a specific lesson
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { lessonId } = await params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    const lesson = await CourseLessonModel.findById(lessonId).populate(
      'flashcardDeckIds'
    );
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      decks: lesson.flashcardDeckIds || [],
      lessonTitle: lesson.title,
    });
  } catch (error: any) {
    console.error('Error fetching lesson flashcard decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcard decks', details: error.message },
      { status: 500 }
    );
  }
}
