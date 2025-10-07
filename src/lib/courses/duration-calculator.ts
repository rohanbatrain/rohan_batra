/**
 * Duration Calculation Utilities for Courses
 *
 * Handles hierarchical duration calculations for courses with sub-lessons:
 * - Sub-lessons: Use their own duration
 * - Parent lessons: Sum of (parent content duration + all sub-lessons)
 * - Modules: Sum of all top-level lessons (which include their sub-lessons)
 * - Courses: Sum of all modules
 *
 * Note: For formatting durations, use formatMinutes() from '@/lib/courses/format'
 */

export interface LessonDuration {
  _id: string;
  estimatedDurationMinutes: number;
  contentType?: string;
  standaloneContent?: string | null;
  externalResource?: any;
  blogSlug?: string | null;
  quizId?: string | null;
  parentLessonId?: string | null;
  subLessons?: LessonDuration[];
}

export interface ModuleDuration {
  estimatedDurationMinutes?: number | null;
  lessons: LessonDuration[];
}

export interface CourseDuration {
  estimatedDurationMinutes?: number | null;
  modules: ModuleDuration[];
}

/**
 * Check if a lesson has its own content (not just a container for sub-lessons)
 *
 * A lesson is considered to have content if it has:
 * - standaloneContent (MDX/Novel content)
 * - externalResource (video)
 * - blogSlug (linked blog post)
 * - quizId (quiz)
 *
 * Otherwise, it's a container parent whose sole purpose is to organize sub-lessons.
 */
export function hasOwnContent(lesson: LessonDuration): boolean {
  return Boolean(
    lesson.standaloneContent ||
      lesson.externalResource ||
      lesson.blogSlug ||
      lesson.quizId
  );
}

/**
 * Calculate the total duration for a single lesson
 *
 * Rules:
 * - If lesson has sub-lessons:
 *   - If parent has content: parent duration + sum(sub-lessons)
 *   - If parent is container: sum(sub-lessons) only
 * - If standalone lesson: own duration
 *
 * Example:
 *   Container parent (0m) + 3 sub-lessons (15m each) = 45m
 *   Content parent (30m) + 2 sub-lessons (20m each) = 70m
 *   Standalone lesson (25m) = 25m
 */
export function calculateLessonDuration(lesson: LessonDuration): number {
  // Check if lesson has sub-lessons
  if (lesson.subLessons && lesson.subLessons.length > 0) {
    // Calculate total duration of all sub-lessons
    const subLessonsTotal = lesson.subLessons.reduce(
      (sum, subLesson) => sum + subLesson.estimatedDurationMinutes,
      0
    );

    // If parent is a container (no content), return only sub-lessons total
    if (!hasOwnContent(lesson)) {
      return subLessonsTotal;
    }

    // Parent has content: add parent duration + sub-lessons
    return lesson.estimatedDurationMinutes + subLessonsTotal;
  }

  // Standalone lesson - return its own duration
  return lesson.estimatedDurationMinutes;
}

/**
 * Calculate the total duration for a module
 *
 * Rules:
 * - If module has manual override (estimatedDurationMinutes set): use it
 * - Otherwise: sum all top-level lessons (which include their sub-lessons)
 *
 * Note: Sub-lessons are NOT counted separately; they're included in their
 * parent's duration via calculateLessonDuration().
 */
export function calculateModuleDuration(module: ModuleDuration): number {
  // If module has manual override, use it
  if (
    module.estimatedDurationMinutes !== null &&
    module.estimatedDurationMinutes !== undefined
  ) {
    return module.estimatedDurationMinutes;
  }

  // Calculate from lessons (only top-level, not sub-lessons)
  return module.lessons.reduce((sum, lesson) => {
    // Skip sub-lessons (they're counted in parent)
    if (lesson.parentLessonId) {
      return sum;
    }

    return sum + calculateLessonDuration(lesson);
  }, 0);
}

/**
 * Calculate the total duration for a course
 *
 * Rules:
 * - If course has manual override: use it
 * - Otherwise: sum all modules
 */
export function calculateCourseDuration(course: CourseDuration): number {
  // If course has manual override, use it
  if (
    course.estimatedDurationMinutes !== null &&
    course.estimatedDurationMinutes !== undefined
  ) {
    return course.estimatedDurationMinutes;
  }

  // Calculate from modules
  return course.modules.reduce(
    (sum, module) => sum + calculateModuleDuration(module),
    0
  );
}

/**
 * Get duration breakdown for a lesson with sub-lessons
 * Useful for displaying tooltips or detailed views
 *
 * Example usage:
 *   const { parentDuration, subLessonsDuration, totalDuration } =
 *     getLessonDurationBreakdown(lesson);
 *
 *   // Display: "Parent: 30m | Sub-lessons: 45m | Total: 75m"
 */
export function getLessonDurationBreakdown(lesson: LessonDuration): {
  parentDuration: number;
  subLessonsDuration: number;
  totalDuration: number;
  hasContent: boolean;
} {
  const hasContent = hasOwnContent(lesson);
  const parentDuration = hasContent ? lesson.estimatedDurationMinutes : 0;
  const subLessonsDuration =
    lesson.subLessons?.reduce(
      (sum, sub) => sum + sub.estimatedDurationMinutes,
      0
    ) || 0;
  const totalDuration = parentDuration + subLessonsDuration;

  return {
    parentDuration,
    subLessonsDuration,
    totalDuration,
    hasContent,
  };
}
