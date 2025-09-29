import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import CourseModel from '@/models/Course';
import CourseLessonModel from '@/models/CourseLesson';
import CourseQuizModel from '@/models/CourseQuiz';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CertificateModel from '@/models/Certificate';

const createCourse = (overrides: Record<string, unknown> = {}) =>
  new CourseModel({
    slug: 'fullstack-foundations',
    title: 'Fullstack Foundations',
    summary:
      'A starter course covering frontend and backend foundations in depth.',
    difficulty: 'beginner',
    categories: ['development'],
    tags: ['fullstack'],
    lessonCount: 1,
    structureVersion: 1,
    createdBy: new mongoose.Types.ObjectId(),
    ...overrides,
  });

describe('CourseModel', () => {
  it('enforces slug formatting', () => {
    const course = createCourse({ slug: 'Invalid Slug' });
    const error = course.validateSync();
    expect(error?.errors.slug?.kind).toBe('regexp');
  });

  it('requires lessons before publishing', () => {
    const course = createCourse({ status: 'published', lessonCount: 0 });
    const error = course.validateSync();
    expect(error?.message).toContain(
      'Published courses must include at least one lesson'
    );
  });

  it('accepts valid course payload', () => {
    const course = createCourse();
    const error = course.validateSync();
    expect(error).toBeUndefined();
  });
});

describe('CourseLessonModel', () => {
  const base = {
    courseId: new mongoose.Types.ObjectId(),
    moduleId: new mongoose.Types.ObjectId(),
    title: 'Introduction',
    estimatedDurationMinutes: 10,
  };

  it('requires blogSlug for blog lessons', () => {
    const lesson = new CourseLessonModel({ ...base, contentType: 'blog' });
    const error = lesson.validateSync();
    expect(error?.message).toContain('blogSlug');
  });

  it('requires standaloneContent for standalone lessons', () => {
    const lesson = new CourseLessonModel({
      ...base,
      contentType: 'standalone',
      standaloneContent: '',
    });
    const error = lesson.validateSync();
    expect(error?.message).toContain('standaloneContent');
  });

  it('passes validation for video lessons with resource', () => {
    const lesson = new CourseLessonModel({
      ...base,
      contentType: 'video',
      externalResource: {
        provider: 'youtube',
        url: 'https://youtube.com/watch?v=123',
      },
    });
    const error = lesson.validateSync();
    expect(error).toBeUndefined();
  });
});

describe('CourseQuizModel', () => {
  it('requires at least one question', () => {
    const quiz = new CourseQuizModel({
      courseId: new mongoose.Types.ObjectId(),
      moduleId: new mongoose.Types.ObjectId(),
      lessonId: new mongoose.Types.ObjectId(),
      title: 'Quiz',
      questions: [],
    });

    const error = quiz.validateSync();
    expect(error?.message).toContain('Quiz must contain at least one question');
  });

  it('requires options for single choice questions', () => {
    const quiz = new CourseQuizModel({
      courseId: new mongoose.Types.ObjectId(),
      moduleId: new mongoose.Types.ObjectId(),
      lessonId: new mongoose.Types.ObjectId(),
      title: 'Quiz',
      questions: [
        {
          questionId: 'q1',
          type: 'single_choice',
          prompt: 'Pick one',
          correctAnswers: ['a'],
        },
      ],
    });

    const error = quiz.validateSync();
    expect(error?.message).toContain('Choice-based questions require options');
  });
});

describe('CourseEnrollmentModel', () => {
  it('prevents completedAt when status is not completed', () => {
    const enrollment = new CourseEnrollmentModel({
      courseId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      completedAt: new Date(),
    });

    const error = enrollment.validateSync();
    expect(error?.message).toContain('completedAt can only be set');
  });
});

describe('CertificateModel', () => {
  it('requires asset links when issued', () => {
    const certificate = new CertificateModel({
      courseId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      enrollmentId: new mongoose.Types.ObjectId(),
      providerKey: 'portfolio',
      certificateNumber: 'RB-COURSE-2025-FOUNDATIONS-00001',
      verificationUrl: 'https://example.com',
      status: 'issued',
    });

    const error = certificate.validateSync();
    expect(error?.message).toContain(
      'Issued certificates require pdfUrl and pngUrl'
    );
  });

  it('passes validation for pending certificate', () => {
    const certificate = new CertificateModel({
      courseId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      enrollmentId: new mongoose.Types.ObjectId(),
      providerKey: 'portfolio',
      certificateNumber: 'RB-COURSE-2025-FOUNDATIONS-00001',
      verificationUrl: 'https://example.com',
      status: 'pending',
    });

    const error = certificate.validateSync();
    expect(error).toBeUndefined();
  });
});
