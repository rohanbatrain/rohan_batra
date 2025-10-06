import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import CourseEnrollment from '@/models/CourseEnrollment';
import CourseLesson from '@/models/CourseLesson';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const { lessonId, markAsComplete = true } = await req.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get user document
    const userDoc = (await User.findOne({ clerkId: userId }).lean()) as { _id: any } | null;
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check enrollment
    const enrollment = await CourseEnrollment.findOne({
      courseId,
      userId: userDoc._id,
    }).lean();

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    // Verify lesson belongs to course
    const lesson = await CourseLesson.findOne({
      _id: lessonId,
      courseId,
    }).lean();

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Get or create progress
    let progress = await CourseProgress.findOne({
      enrollmentId: enrollment._id,
    });

    if (!progress) {
      progress = new CourseProgress({
        courseId,
        userId: userDoc._id,
        enrollmentId: enrollment._id,
        completedLessonIds: [],
        incompleteLessonIds: [],
      });
    }

    // Add to completed if not already there, or remove if unmarking
    const lessonObjectId = lesson._id;
    const isAlreadyCompleted = progress.completedLessonIds.some(
      (id) => id.toString() === lessonObjectId.toString()
    );

    if (markAsComplete && !isAlreadyCompleted) {
      // Mark as complete
      progress.completedLessonIds.push(lessonObjectId);

      // Remove from incomplete if present
      progress.incompleteLessonIds = progress.incompleteLessonIds.filter(
        (id) => id.toString() !== lessonObjectId.toString()
      );

      // Update current lesson
      progress.currentLessonId = lessonObjectId;
      progress.lastUpdatedAt = new Date();

      // Calculate percentage complete
      const totalLessons = await CourseLesson.countDocuments({ courseId });
      progress.percentageComplete = Math.round(
        (progress.completedLessonIds.length / totalLessons) * 100
      );

      await progress.save();
    } else if (!markAsComplete && isAlreadyCompleted) {
      // Mark as incomplete (unmark)
      progress.completedLessonIds = progress.completedLessonIds.filter(
        (id) => id.toString() !== lessonObjectId.toString()
      );

      // Add back to incomplete if not present
      const isInIncomplete = progress.incompleteLessonIds.some(
        (id) => id.toString() === lessonObjectId.toString()
      );
      if (!isInIncomplete) {
        progress.incompleteLessonIds.push(lessonObjectId);
      }

      progress.lastUpdatedAt = new Date();

      // Recalculate percentage complete
      const totalLessons = await CourseLesson.countDocuments({ courseId });
      progress.percentageComplete = Math.round(
        (progress.completedLessonIds.length / totalLessons) * 100
      );

      await progress.save();
    }

    return NextResponse.json({
      success: true,
      progress: {
        completedLessonIds: progress.completedLessonIds.map((id) =>
          id.toString()
        ),
        percentageComplete: progress.percentageComplete,
      },
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
