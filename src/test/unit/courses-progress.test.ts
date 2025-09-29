import { describe, it, expect } from 'vitest';
import {
  calculateModuleProgress,
  calculateCourseProgress,
  mergeCompletedLessons,
  applyProgressUpdate,
} from '@/lib/courses/progress';

describe('calculateModuleProgress', () => {
  it('computes weighted percentage', () => {
    const progress = calculateModuleProgress(
      {
        moduleId: 'module-1',
        lessons: [
          { lessonId: 'l1', weight: 1 },
          { lessonId: 'l2', weight: 2 },
          { lessonId: 'l3', weight: 1 },
        ],
      },
      new Set(['l2'])
    );

    expect(progress.totalWeight).toBe(4);
    expect(progress.completedWeight).toBe(2);
    expect(progress.percentage).toBe(50);
  });
});

describe('calculateCourseProgress', () => {
  it('aggregates module progress', () => {
    const summary = calculateCourseProgress(
      [
        {
          moduleId: 'module-1',
          lessons: [
            { lessonId: 'l1', weight: 1 },
            { lessonId: 'l2', weight: 1 },
          ],
        },
        {
          moduleId: 'module-2',
          lessons: [
            { lessonId: 'l3', weight: 2 },
            { lessonId: 'l4', weight: 1 },
          ],
        },
      ],
      ['l1', 'l3']
    );

    expect(summary.percentageComplete).toBeCloseTo(60, 1);
    expect(summary.moduleProgress).toHaveLength(2);
  });
});

describe('mergeCompletedLessons', () => {
  it('merges additions and removals', () => {
    const merged = mergeCompletedLessons(['a', 'b'], ['c'], ['a']);
    expect(merged.sort()).toEqual(['b', 'c']);
  });
});

describe('applyProgressUpdate', () => {
  it('applies updates to progress state', () => {
    const next = applyProgressUpdate(
      {
        completedLessonIds: ['a'],
        currentLessonId: 'a',
      },
      {
        completedLessonIds: ['b'],
        currentLessonId: 'c',
      }
    );

    expect(next.completedLessonIds.sort()).toEqual(['a', 'b']);
    expect(next.currentLessonId).toBe('c');
  });
});
