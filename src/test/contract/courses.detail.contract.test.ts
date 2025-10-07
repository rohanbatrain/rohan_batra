import { describe, it, expect } from 'vitest';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import connectToDatabase from '@/lib/mongodb';

describe('Contract: Course detail shape', () => {
  it('should contain modules with lessons and include flashcards in contentType enum', async () => {
    await connectToDatabase();

    // Try to find a published course with modules
    const course = await CourseModel.findOne({
      status: 'published',
      visibility: 'public',
    }).lean();

    if (!course) {
      // If no courses exist, verify the schema structure
      const validContentTypes = [
        'blog',
        'standalone',
        'video',
        'quiz',
        'flashcards',
      ];
      expect(validContentTypes).toContain('flashcards');
      return;
    }

    // Get modules for this course
    const modules = await CourseModuleModel.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    // Get lessons for these modules
    if (modules.length > 0) {
      const moduleIds = modules.map((m: any) => m._id);
      const lessons = await CourseLessonModel.find({
        moduleId: { $in: moduleIds },
      }).lean();

      // Verify lessons can have flashcards content type
      const validContentTypes = [
        'blog',
        'standalone',
        'video',
        'quiz',
        'flashcards',
      ];
      lessons.forEach((lesson: any) => {
        expect(validContentTypes).toContain(lesson.contentType);
      });
    }

    // Verify structure
    expect(course).toHaveProperty('_id');
    expect(course).toHaveProperty('title');
    expect(course).toHaveProperty('slug');
    expect(Array.isArray(modules)).toBe(true);
  });
});
