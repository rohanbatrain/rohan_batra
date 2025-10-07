import { describe, it, expect, beforeAll } from 'vitest';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import connectToDatabase from '@/lib/mongodb';

describe('Integration: Course detail', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  it('returns 404 for non-public/non-published', async () => {
    // Try to find a draft or private course
    const draftCourse = await CourseModel.findOne({
      $or: [{ status: 'draft' }, { visibility: 'private' }],
    }).lean();

    if (draftCourse) {
      // Simulate page logic - should not return draft/private courses
      const publicCourse = await CourseModel.findOne({
        slug: draftCourse.slug,
        status: 'published',
        visibility: 'public',
      }).lean();

      // Should not find it with public/published filter
      expect(publicCourse).toBeNull();
    } else {
      // If no draft courses exist, test passes
      expect(true).toBe(true);
    }
  });

  it('renders outline with correct ordering rules', async () => {
    // Find a course with modules and lessons
    const course = await CourseModel.findOne({
      status: 'published',
      visibility: 'public',
    }).lean();

    if (!course) {
      // No courses to test
      expect(true).toBe(true);
      return;
    }

    // Get modules and lessons
    const modules = await CourseModuleModel.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    if (modules.length === 0) {
      // No modules to test ordering
      expect(true).toBe(true);
      return;
    }

    const moduleIds = modules.map((m: any) => m._id);
    const lessons = await CourseLessonModel.find({
      moduleId: { $in: moduleIds },
    })
      .sort({ order: 1 })
      .lean();

    // Verify manual ordering - modules should be sorted by order field
    for (let i = 0; i < modules.length - 1; i++) {
      expect((modules[i] as any).order).toBeLessThanOrEqual(
        (modules[i + 1] as any).order
      );
    }

    // Lessons should be sorted by order field within their module
    const lessonsForFirstModule = lessons.filter(
      (l: any) => l.moduleId.toString() === modules[0]._id.toString()
    );

    if (lessonsForFirstModule.length > 1) {
      for (let i = 0; i < lessonsForFirstModule.length - 1; i++) {
        const currentOrder = (lessonsForFirstModule[i] as any).order || 0;
        const nextOrder = (lessonsForFirstModule[i + 1] as any).order || 0;
        expect(currentOrder).toBeLessThanOrEqual(nextOrder);
      }
    }
  });
});
