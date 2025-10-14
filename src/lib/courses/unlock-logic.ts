/**
 * Progressive Unlock Logic for Courses
 * 
 * Implements sequential unlocking of modules and lessons based on completion.
 * Users must complete content in order to access the next item.
 * 
 * Rules:
 * 1. First module is always unlocked
 * 2. Within a module, first lesson is unlocked
 * 3. Subsequent lessons unlock when previous lesson is completed
 * 4. Within a lesson, first sub-lesson is unlocked
 * 5. Subsequent sub-lessons unlock when previous sub-lesson is completed
 * 6. Next module unlocks when all lessons in current module are completed
 */

import { Types } from 'mongoose';

interface Lesson {
  _id: Types.ObjectId | string;
  moduleId: Types.ObjectId | string;
  parentLessonId?: Types.ObjectId | string | null;
  subLessons?: Lesson[];
  [key: string]: any;
}

interface Module {
  _id: Types.ObjectId | string;
  lessons: Lesson[];
  [key: string]: any;
}

interface UnlockStatus {
  isLocked: boolean;
  reason?: string;
  requiredLessonId?: string;
}

/**
 * Get all lesson IDs including sub-lessons (flattened)
 */
export function getAllLessonIds(lessons: Lesson[]): string[] {
  const ids: string[] = [];
  
  for (const lesson of lessons) {
    ids.push(String(lesson._id));
    
    if (Array.isArray(lesson.subLessons) && lesson.subLessons.length > 0) {
      ids.push(...getAllLessonIds(lesson.subLessons));
    }
  }
  
  return ids;
}

/**
 * Check if a specific lesson is locked
 */
export function isLessonLocked(
  lessonId: string,
  moduleIndex: number,
  lessonIndexInModule: number,
  modules: Module[],
  completedLessonIds: string[] = []
): UnlockStatus {
  const completedSet = new Set(completedLessonIds);
  
  // First module, first lesson is always unlocked
  if (moduleIndex === 0 && lessonIndexInModule === 0) {
    return { isLocked: false };
  }
  
  const currentModule = modules[moduleIndex];
  
  // If not the first lesson in current module, check if previous lesson is completed
  if (lessonIndexInModule > 0) {
    const previousLesson = currentModule.lessons[lessonIndexInModule - 1];
    const previousLessonId = String(previousLesson._id);
    
    // Check if previous lesson and all its sub-lessons are completed
    const allPreviousIds = getAllLessonIds([previousLesson]);
    const allCompleted = allPreviousIds.every(id => completedSet.has(id));
    
    if (!allCompleted) {
      return {
        isLocked: true,
        reason: 'Complete the previous lesson first',
        requiredLessonId: previousLessonId
      };
    }
    
    return { isLocked: false };
  }
  
  // First lesson of a non-first module: check if all lessons in previous module are completed
  if (moduleIndex > 0) {
    const previousModule = modules[moduleIndex - 1];
    const allPreviousModuleLessonIds = getAllLessonIds(previousModule.lessons);
    const allCompleted = allPreviousModuleLessonIds.every(id => completedSet.has(id));
    
    if (!allCompleted) {
      return {
        isLocked: true,
        reason: 'Complete all lessons in the previous module first',
        requiredLessonId: allPreviousModuleLessonIds[0]
      };
    }
    
    return { isLocked: false };
  }
  
  return { isLocked: false };
}

/**
 * Check if a sub-lesson is locked
 */
export function isSubLessonLocked(
  subLessonId: string,
  subLessonIndex: number,
  parentLesson: Lesson,
  completedLessonIds: string[] = []
): UnlockStatus {
  const completedSet = new Set(completedLessonIds);
  
  // First sub-lesson is unlocked if parent is unlocked
  if (subLessonIndex === 0) {
    return { isLocked: false };
  }
  
  // Check if previous sub-lesson is completed
  if (!parentLesson.subLessons || subLessonIndex >= parentLesson.subLessons.length) {
    return { isLocked: false };
  }
  
  const previousSubLesson = parentLesson.subLessons[subLessonIndex - 1];
  const previousSubLessonId = String(previousSubLesson._id);
  
  if (!completedSet.has(previousSubLessonId)) {
    return {
      isLocked: true,
      reason: 'Complete the previous sub-lesson first',
      requiredLessonId: previousSubLessonId
    };
  }
  
  return { isLocked: false };
}

/**
 * Check if a module is locked
 */
export function isModuleLocked(
  moduleIndex: number,
  modules: Module[],
  completedLessonIds: string[] = []
): UnlockStatus {
  // First module is always unlocked
  if (moduleIndex === 0) {
    return { isLocked: false };
  }
  
  const completedSet = new Set(completedLessonIds);
  
  // Check if all lessons in previous module are completed
  const previousModule = modules[moduleIndex - 1];
  const allPreviousModuleLessonIds = getAllLessonIds(previousModule.lessons);
  const allCompleted = allPreviousModuleLessonIds.every(id => completedSet.has(id));
  
  if (!allCompleted) {
    return {
      isLocked: true,
      reason: 'Complete all lessons in the previous module first'
    };
  }
  
  return { isLocked: false };
}

/**
 * Get next unlocked lesson for a user
 */
export function getNextUnlockedLesson(
  modules: Module[],
  completedLessonIds: string[] = []
): { moduleIndex: number; lessonIndex: number; lessonId: string } | null {
  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
    const module = modules[moduleIndex];
    
    for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
      const lesson = module.lessons[lessonIndex];
      const lessonId = String(lesson._id);
      const status = isLessonLocked(lessonId, moduleIndex, lessonIndex, modules, completedLessonIds);
      
      if (!status.isLocked && !completedLessonIds.includes(lessonId)) {
        return { moduleIndex, lessonIndex, lessonId };
      }
      
      // Check sub-lessons
      if (Array.isArray(lesson.subLessons)) {
        for (let subIndex = 0; subIndex < lesson.subLessons.length; subIndex++) {
          const subLesson = lesson.subLessons[subIndex];
          const subLessonId = String(subLesson._id);
          const subStatus = isSubLessonLocked(subLessonId, subIndex, lesson, completedLessonIds);
          
          if (!subStatus.isLocked && !completedLessonIds.includes(subLessonId)) {
            return { moduleIndex, lessonIndex, lessonId: subLessonId };
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Calculate course progress statistics
 */
export function calculateProgressStats(
  modules: Module[],
  completedLessonIds: string[] = []
) {
  const totalLessons = modules.reduce((acc, module) => {
    return acc + getAllLessonIds(module.lessons).length;
  }, 0);
  
  const completedCount = completedLessonIds.length;
  const percentageComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  return {
    totalLessons,
    completedCount,
    percentageComplete,
    remainingLessons: totalLessons - completedCount
  };
}

/**
 * Enrich modules with unlock status for each lesson
 */
export function enrichModulesWithUnlockStatus(
  modules: Module[],
  completedLessonIds: string[] = []
): (Module & { isLocked: boolean; lessons: (Lesson & { isLocked: boolean; lockReason?: string })[] })[] {
  return modules.map((module, moduleIndex) => {
    const moduleStatus = isModuleLocked(moduleIndex, modules, completedLessonIds);
    
    const enrichedLessons = module.lessons.map((lesson, lessonIndex) => {
      const lessonId = String(lesson._id);
      const lessonStatus = isLessonLocked(lessonId, moduleIndex, lessonIndex, modules, completedLessonIds);
      
      // Enrich sub-lessons
      const enrichedSubLessons = Array.isArray(lesson.subLessons)
        ? lesson.subLessons.map((subLesson, subIndex) => {
            const subLessonId = String(subLesson._id);
            const subStatus = isSubLessonLocked(subLessonId, subIndex, lesson, completedLessonIds);
            
            return {
              ...subLesson,
              isLocked: subStatus.isLocked,
              lockReason: subStatus.reason
            };
          })
        : [];
      
      return {
        ...lesson,
        isLocked: lessonStatus.isLocked,
        lockReason: lessonStatus.reason,
        subLessons: enrichedSubLessons
      };
    });
    
    return {
      ...module,
      isLocked: moduleStatus.isLocked,
      lessons: enrichedLessons
    };
  });
}
