import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockConnect,
  mockCourseFind,
  mockEnrollmentFind,
  mockProgressFind,
  mockCertificateFind,
  mockRecommendationFindOne,
} = vi.hoisted(() => ({
  mockConnect: vi.fn(),
  mockCourseFind: vi.fn(),
  mockEnrollmentFind: vi.fn(),
  mockProgressFind: vi.fn(),
  mockCertificateFind: vi.fn(),
  mockRecommendationFindOne: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: mockConnect,
}));

const createQueryChain = <T>(result: T) => {
  const chain: any = {
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

vi.mock('@/models/Course', () => ({
  __esModule: true,
  default: {
    find: mockCourseFind,
  },
}));

vi.mock('@/models/CourseEnrollment', () => ({
  __esModule: true,
  default: {
    find: mockEnrollmentFind,
  },
}));

vi.mock('@/models/CourseProgress', () => ({
  __esModule: true,
  default: {
    find: mockProgressFind,
  },
}));

vi.mock('@/models/Certificate', () => ({
  __esModule: true,
  default: {
    find: mockCertificateFind,
  },
}));

vi.mock('@/models/DashboardRecommendation', () => ({
  __esModule: true,
  default: {
    findOne: mockRecommendationFindOne,
  },
}));

import DashboardService from '@/lib/services/dashboard-service';

const objectId = (value: string) => ({
  toString: () => value,
});

const enrollmentDoc = {
  _id: objectId('enroll1'),
  courseId: objectId('course1'),
  userId: objectId('user1'),
  status: 'in_progress',
  origin: 'self_enroll',
  enrolledAt: new Date('2024-01-01T00:00:00Z'),
  lastAccessedAt: new Date('2024-01-02T00:00:00Z'),
  completedAt: null,
  certificateId: null,
  notes: 'keep going',
  settings: { reminders: true },
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
};

const courseDoc = {
  _id: objectId('course1'),
  slug: 'foundations',
  title: 'Fullstack Foundations',
  subtitle: 'Level up',
  summary: 'A starter course',
  heroImage: 'https://cdn.example.com/hero.png',
  heroLottieId: objectId('lottie1'),
  difficulty: 'beginner',
  categories: ['development'],
  tags: ['javascript'],
  estimatedDurationMinutes: 120,
  lessonCount: 12,
  status: 'published',
  isFeatured: true,
  visibility: 'public',
  publishedAt: new Date('2024-01-05T00:00:00Z'),
  structureVersion: 2,
};

const progressDoc = {
  _id: objectId('progress1'),
  enrollmentId: objectId('enroll1'),
  courseId: objectId('course1'),
  userId: objectId('user1'),
  completedLessonIds: [objectId('lesson1')],
  incompleteLessonIds: [],
  currentLessonId: objectId('lesson2'),
  moduleProgress: [
    {
      moduleId: objectId('module1'),
      completedWeight: 1,
      totalWeight: 2,
      percentage: 50,
    },
  ],
  percentageComplete: 50,
  timeSpentSeconds: 3600,
  streak: {
    currentCount: 3,
    longestCount: 5,
    lastUpdatedAt: new Date('2024-01-03T00:00:00Z'),
  },
  quizAttempts: [
    {
      lessonId: objectId('lesson1'),
      attempts: [
        {
          score: 80,
          passed: true,
          attemptedAt: new Date('2024-01-02T00:00:00Z'),
        },
      ],
    },
  ],
  checkpoints: [
    {
      lessonId: objectId('lesson2'),
      cursor: '00:10:00',
    },
  ],
  lastUpdatedAt: new Date('2024-01-04T00:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-04T00:00:00Z'),
};

const certificateDoc = {
  _id: objectId('cert1'),
  courseId: objectId('course1'),
  userId: objectId('user1'),
  enrollmentId: objectId('enroll1'),
  providerKey: 'portfolio',
  status: 'pending',
  issuedAt: null,
  certificateNumber: 'RB-COURSE-2024-FOUNDATION-00001',
  qrCodeUrl: null,
  pdfUrl: null,
  pngUrl: null,
  verificationUrl:
    'https://portfolio/certificates/RB-COURSE-2024-FOUNDATION-00001',
  sbdReferenceId: null,
  downloadCount: 0,
  shareable: undefined,
  metadata: undefined,
  createdAt: new Date('2024-01-06T00:00:00Z'),
  updatedAt: new Date('2024-01-06T00:00:00Z'),
};

const recommendationDoc = {
  _id: objectId('rec1'),
  userId: objectId('user1'),
  context: 'course',
  sourceId: 'recent-course',
  expiresAt: new Date('2024-02-01T00:00:00Z'),
  createdAt: new Date('2024-01-07T00:00:00Z'),
  updatedAt: new Date('2024-01-07T00:00:00Z'),
  recommendations: [
    {
      type: 'course',
      id: 'course2',
      title: 'Advanced Patterns',
      reason: 'Continue your journey',
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();

  mockConnect.mockResolvedValue(undefined);

  mockEnrollmentFind.mockReturnValue(createQueryChain([enrollmentDoc]));
  mockProgressFind.mockReturnValue(createQueryChain([progressDoc]));
  mockCertificateFind.mockReturnValue(createQueryChain([certificateDoc]));
  mockCourseFind.mockReturnValue(createQueryChain([courseDoc]));

  mockRecommendationFindOne
    .mockReturnValueOnce(createQueryChain(recommendationDoc))
    .mockReturnValueOnce(createQueryChain(null));
});

describe('DashboardService', () => {
  it('composes dashboard summary with metrics and recommendations', async () => {
    const summary = await DashboardService.getSummary('user1');

    expect(mockConnect).toHaveBeenCalled();
    expect(summary.enrolledCourses).toHaveLength(1);
    const [entry] = summary.enrolledCourses;
    expect(entry.course.title).toBe('Fullstack Foundations');
    expect(entry.enrollment.status).toBe('in_progress');
    expect(entry.progress?.percentageComplete).toBe(50);

    expect(summary.metrics).toEqual({
      totalCourses: 1,
      coursesInProgress: 1,
      completionRate: 0,
      streak: 3,
    });

    expect(summary.certificates).toHaveLength(1);
    expect(summary.recommendedContent).toEqual([
      {
        type: 'course',
        id: 'course2',
        title: 'Advanced Patterns',
        reason: 'Continue your journey',
      },
    ]);
  });

  it('handles empty records and skips recommendations when disabled', async () => {
    mockEnrollmentFind.mockReturnValue(createQueryChain([]));
    mockProgressFind.mockReturnValue(createQueryChain([]));
    mockCertificateFind.mockReturnValue(createQueryChain([]));
    mockCourseFind.mockReturnValue(createQueryChain([]));

    const summary = await DashboardService.getSummary('user1', {
      includeRecommendations: false,
    });

    expect(summary.enrolledCourses).toEqual([]);
    expect(summary.metrics).toEqual({
      totalCourses: 0,
      coursesInProgress: 0,
      completionRate: 0,
      streak: 0,
    });
    expect(summary.recommendedContent).toEqual([]);
    expect(mockRecommendationFindOne).not.toHaveBeenCalled();
  });

  it('fetches certificates independently', async () => {
    const result = await DashboardService.getCertificates('user1');
    expect(result).toHaveLength(1);
    expect(result[0].certificateNumber).toBe('RB-COURSE-2024-FOUNDATION-00001');
  });

  it('falls back to generic recommendations when personalized missing', async () => {
    // First summary call already consumed personalized+generic. Reset mocks for this test scenario.
    mockRecommendationFindOne.mockReset();
    mockRecommendationFindOne
      .mockReturnValueOnce(createQueryChain(null))
      .mockReturnValueOnce(
        createQueryChain({
          ...recommendationDoc,
          userId: null,
        })
      );

    const recommendations = await DashboardService.getRecommendations(
      'user1',
      5
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].id).toBe('course2');
  });
});
