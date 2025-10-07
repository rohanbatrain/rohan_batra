/**
 * T010: Graph Query Utilities
 * 
 * Database query functions for fetching course structure.
 * 
 * @pattern Follows /src/lib/courses/query.ts structure
 */

import { Types } from 'mongoose';
import CourseModel from '@/models/Course';
import CourseLessonModel from '@/models/CourseLesson';
import CourseModuleModel from '@/models/CourseModule';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import type { CourseStructure, LessonContext } from './types';

/**
 * Fetch complete course structure with modules and lessons
 * 
 * @param courseId - Course ID to fetch
 * @returns Course structure with modules, lessons, and lookup map
 */
export async function fetchCourseStructure(
  courseId: Types.ObjectId
): Promise<CourseStructure> {
  // Fetch all modules for the course, sorted by order
  const modules = await CourseModuleModel.find({ courseId })
    .sort({ order: 1 })
    .select('_id title order courseId')
    .lean();

  // Fetch all lessons for the course
  const lessons = await CourseLessonModel.find({ courseId })
    .select('_id title slug moduleId order parentLessonId prerequisiteLessonIds contentType duration')
    .lean();

  // Create a Map for O(1) lesson lookup
  const lessonsById = new Map<string, any>();
  lessons.forEach((lesson) => {
    lessonsById.set(lesson._id.toString(), lesson);
  });

  return {
    modules,
    lessons,
    lessonsById,
  };
}

/**
 * Fetch lesson with related context (prerequisites, sub-lessons, siblings)
 * 
 * @param lessonId - Lesson ID to fetch
 * @param depth - How deep to fetch prerequisites (recursive)
 * @returns Lesson with context
 */
export async function fetchLessonWithContext(
  lessonId: Types.ObjectId,
  depth: number = 2
): Promise<LessonContext> {
  // Fetch the main lesson
  const lesson = await CourseLessonModel.findById(lessonId)
    .select('_id title slug moduleId courseId order parentLessonId prerequisiteLessonIds contentType duration')
    .lean();

  if (!lesson) {
    return {
      lesson: null,
      prerequisites: [],
      subLessons: [],
      siblings: [],
    };
  }

  // Fetch prerequisites recursively up to depth
  const prerequisites: any[] = [];
  if (lesson.prerequisiteLessonIds && lesson.prerequisiteLessonIds.length > 0 && depth > 0) {
    const prereqIds = lesson.prerequisiteLessonIds;
    const prereqLessons = await CourseLessonModel.find({
      _id: { $in: prereqIds },
    })
      .select('_id title slug moduleId order parentLessonId prerequisiteLessonIds contentType duration')
      .lean();

    prerequisites.push(...prereqLessons);

    // If depth > 1, fetch prerequisites of prerequisites
    if (depth > 1) {
      for (const prereq of prereqLessons) {
        if (prereq.prerequisiteLessonIds && prereq.prerequisiteLessonIds.length > 0) {
          const nestedContext = await fetchLessonWithContext(
            prereq._id,
            depth - 1
          );
          prerequisites.push(...nestedContext.prerequisites);
        }
      }
    }
  }

  // Fetch sub-lessons (children)
  const subLessons = await CourseLessonModel.find({
    parentLessonId: lessonId,
  })
    .select('_id title slug moduleId order parentLessonId contentType duration')
    .sort({ order: 1 })
    .lean();

  // Fetch sibling lessons (same module, same parent)
  const siblings = await CourseLessonModel.find({
    moduleId: lesson.moduleId,
    parentLessonId: lesson.parentLessonId || null,
    _id: { $ne: lessonId },
  })
    .select('_id title slug moduleId order parentLessonId contentType duration')
    .sort({ order: 1 })
    .lean();

  return {
    lesson,
    prerequisites,
    subLessons,
    siblings,
  };
}

/**
 * Fetch user progress for a course
 * 
 * @param courseId - Course ID
 * @param userId - User ID
 * @returns Set of completed lesson IDs
 */
export async function fetchUserProgress(
  courseId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<Set<string>> {
  // Find enrollment
  const enrollment = await CourseEnrollmentModel.findOne({
    userId,
    courseId,
  })
    .select('_id')
    .lean();

  if (!enrollment) {
    return new Set<string>();
  }

  // Find all completed lessons
  const progressDocs = await CourseProgressModel.find({
    userId,
    courseId,
    completed: true,
  })
    .select('lessonId')
    .lean();

  // Return Set for O(1) lookup
  const completedIds = new Set<string>();
  progressDocs.forEach((doc: any) => {
    completedIds.add(doc.lessonId.toString());
  });

  return completedIds;
}
