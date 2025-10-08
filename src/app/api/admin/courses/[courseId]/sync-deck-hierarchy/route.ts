import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import {
  getOrCreateCourseDeck,
  getOrCreateModuleDeck,
  getOrCreateLessonDeck,
  updateDeckCardCounts,
} from '@/lib/flashcards/hierarchy';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import UserModel from '@/models/User';

/**
 * POST /api/admin/courses/[courseId]/sync-deck-hierarchy
 * Create full deck hierarchy for a course
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check authorization
    const currentUser = await UserModel.findOne({ clerkId: userId });
    const userRole = (currentUser?.role as string) || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const params = await props.params;
    const { courseId } = params;

    // Get course
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Create or get course root deck
    const courseDeck = await getOrCreateCourseDeck(
      courseId,
      course.slug,
      course.title,
      currentUser!._id.toString()
    );

    // Add course deck to course's flashcardDeckIds if not present
    if (!course.flashcardDeckIds?.includes(courseDeck._id)) {
      course.flashcardDeckIds = course.flashcardDeckIds || [];
      course.flashcardDeckIds.push(courseDeck._id);
      await course.save();
    }

    const results = {
      courseDeck: {
        id: courseDeck._id,
        title: courseDeck.title,
        path: courseDeck.path,
        level: courseDeck.level,
      },
      moduleDecks: [] as any[],
      lessonDecks: [] as any[],
    };

    // Get all modules in course
    const modules = await CourseModuleModel.find({
      courseId: course._id,
    }).sort({ order: 1 });

    for (const module of modules) {
      // Create module deck
      const moduleDeck = await getOrCreateModuleDeck(
        module._id.toString(),
        module.title,
        courseId,
        courseDeck._id.toString(),
        currentUser!._id.toString()
      );

      // Add module deck to module's flashcardDeckIds
      if (!module.flashcardDeckIds?.includes(moduleDeck._id)) {
        module.flashcardDeckIds = module.flashcardDeckIds || [];
        module.flashcardDeckIds.push(moduleDeck._id);
        await module.save();
      }

      results.moduleDecks.push({
        id: moduleDeck._id,
        title: moduleDeck.title,
        path: moduleDeck.path,
        level: moduleDeck.level,
        moduleId: module._id,
      });

      // Get all lessons in module
      const lessons = await CourseLessonModel.find({
        courseId: course._id,
        moduleId: module._id,
        parentLessonId: null, // Top-level lessons only
      }).sort({ order: 1 });

      for (const lesson of lessons) {
        // Create lesson deck
        const lessonDeck = await getOrCreateLessonDeck(
          lesson._id.toString(),
          lesson.title,
          courseId,
          module._id.toString(),
          moduleDeck._id.toString(),
          null,
          null,
          currentUser!._id.toString()
        );

        // Add lesson deck to lesson's flashcardDeckIds
        if (!lesson.flashcardDeckIds?.includes(lessonDeck._id)) {
          lesson.flashcardDeckIds = lesson.flashcardDeckIds || [];
          lesson.flashcardDeckIds.push(lessonDeck._id);
          await lesson.save();
        }

        results.lessonDecks.push({
          id: lessonDeck._id,
          title: lessonDeck.title,
          path: lessonDeck.path,
          level: lessonDeck.level,
          lessonId: lesson._id,
        });

        // Get sub-lessons
        const subLessons = await CourseLessonModel.find({
          parentLessonId: lesson._id,
        }).sort({ order: 1 });

        for (const subLesson of subLessons) {
          const subLessonDeck = await getOrCreateLessonDeck(
            subLesson._id.toString(),
            subLesson.title,
            courseId,
            module._id.toString(),
            moduleDeck._id.toString(),
            lesson._id.toString(),
            lessonDeck._id.toString(),
            currentUser!._id.toString()
          );

          // Add sub-lesson deck to sub-lesson's flashcardDeckIds
          if (!subLesson.flashcardDeckIds?.includes(subLessonDeck._id)) {
            subLesson.flashcardDeckIds = subLesson.flashcardDeckIds || [];
            subLesson.flashcardDeckIds.push(subLessonDeck._id);
            await subLesson.save();
          }

          results.lessonDecks.push({
            id: subLessonDeck._id,
            title: subLessonDeck.title,
            path: subLessonDeck.path,
            level: subLessonDeck.level,
            lessonId: subLesson._id,
            parentLessonId: lesson._id,
          });
        }
      }
    }

    // Update card counts for all decks
    await updateDeckCardCounts(courseDeck._id.toString());

    return NextResponse.json({
      success: true,
      message: 'Deck hierarchy synchronized',
      results,
    });
  } catch (error: any) {
    console.error('Error syncing deck hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to sync deck hierarchy', details: error.message },
      { status: 500 }
    );
  }
}
