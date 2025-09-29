import { Types } from 'mongoose';

import connectToDatabase from '@/lib/mongodb';
import CourseModel, { ICourse } from '@/models/Course';
import CourseEnrollmentModel, {
  ICourseEnrollment,
} from '@/models/CourseEnrollment';
import CourseProgressModel, { ICourseProgress } from '@/models/CourseProgress';
import CertificateModel, { ICertificate } from '@/models/Certificate';
import DashboardRecommendationModel, {
  IDashboardRecommendation,
} from '@/models/DashboardRecommendation';
import {
  DashboardCourseSummary,
  DashboardMetrics,
  DashboardRecommendationItem,
  DashboardSummary,
  CourseSummary,
} from '@/types/dashboard';
import { Certificate, CourseEnrollment, CourseProgress } from '@/types/courses';

interface DashboardSummaryOptions {
  includeRecommendations?: boolean;
  recommendationsLimit?: number;
}

type LeanEnrollment = ICourseEnrollment & { _id: Types.ObjectId };
type LeanCourse = ICourse & { _id: Types.ObjectId };
type LeanProgress = ICourseProgress & { _id: Types.ObjectId };
type LeanCertificate = ICertificate & { _id: Types.ObjectId };
type LeanDashboardRecommendation = IDashboardRecommendation & {
  _id: Types.ObjectId;
};

const toStringId = (value: Types.ObjectId | string | null | undefined) =>
  value ? value.toString() : null;

const mapCourseSummary = (course: LeanCourse): CourseSummary => ({
  id: course._id.toString(),
  slug: course.slug,
  title: course.title,
  subtitle: course.subtitle ?? null,
  summary: course.summary,
  heroImage: course.heroImage ?? null,
  heroLottieId: toStringId(course.heroLottieId) ?? null,
  difficulty: course.difficulty,
  categories: course.categories ?? [],
  tags: course.tags ?? [],
  estimatedDurationMinutes: course.estimatedDurationMinutes ?? undefined,
  lessonCount: course.lessonCount ?? 0,
  status: course.status,
  isFeatured: Boolean(course.isFeatured),
  visibility: course.visibility,
  publishedAt: course.publishedAt ?? null,
  structureVersion: course.structureVersion ?? 1,
});

const mapEnrollment = (enrollment: LeanEnrollment): CourseEnrollment => ({
  _id: enrollment._id.toString(),
  courseId: enrollment.courseId.toString(),
  userId: enrollment.userId.toString(),
  status: enrollment.status,
  origin: enrollment.origin,
  enrolledAt: enrollment.enrolledAt,
  lastAccessedAt: enrollment.lastAccessedAt ?? null,
  completedAt: enrollment.completedAt ?? null,
  certificateId: toStringId(enrollment.certificateId),
  notes: enrollment.notes ?? undefined,
  settings: enrollment.settings ?? {},
  createdAt: enrollment.createdAt,
  updatedAt: enrollment.updatedAt,
});

const mapProgress = (progress: LeanProgress): CourseProgress => ({
  _id: progress._id.toString(),
  enrollmentId: progress.enrollmentId.toString(),
  courseId: progress.courseId.toString(),
  userId: progress.userId.toString(),
  completedLessonIds: (progress.completedLessonIds ?? []).map(id =>
    id.toString()
  ),
  incompleteLessonIds: (progress.incompleteLessonIds ?? []).map(id =>
    id.toString()
  ),
  currentLessonId: toStringId(progress.currentLessonId),
  moduleProgress: (progress.moduleProgress ?? []).map(snapshot => ({
    moduleId: snapshot.moduleId.toString(),
    completedWeight: snapshot.completedWeight,
    totalWeight: snapshot.totalWeight,
    percentage: snapshot.percentage,
  })),
  percentageComplete: progress.percentageComplete ?? 0,
  timeSpentSeconds: progress.timeSpentSeconds ?? 0,
  streak: progress.streak
    ? {
        currentCount: progress.streak.currentCount ?? 0,
        longestCount: progress.streak.longestCount ?? 0,
        lastUpdatedAt: progress.streak.lastUpdatedAt,
      }
    : null,
  quizAttempts: (progress.quizAttempts ?? []).map(lesson => ({
    lessonId: lesson.lessonId.toString(),
    attempts: (lesson.attempts ?? []).map(attempt => ({
      score: attempt.score ?? undefined,
      passed: attempt.passed,
      attemptedAt: attempt.attemptedAt,
    })),
  })),
  checkpoints: progress.checkpoints
    ? progress.checkpoints.map(checkpoint => ({
        lessonId: checkpoint.lessonId.toString(),
        cursor: checkpoint.cursor,
      }))
    : undefined,
  lastUpdatedAt: progress.lastUpdatedAt,
  createdAt: progress.createdAt,
  updatedAt: progress.updatedAt,
});

const mapCertificate = (certificate: LeanCertificate): Certificate => ({
  _id: certificate._id.toString(),
  courseId: certificate.courseId.toString(),
  userId: certificate.userId.toString(),
  enrollmentId: certificate.enrollmentId.toString(),
  providerKey: certificate.providerKey,
  status: certificate.status,
  issuedAt: certificate.issuedAt ?? null,
  certificateNumber: certificate.certificateNumber,
  qrCodeUrl: certificate.qrCodeUrl ?? null,
  pdfUrl: certificate.pdfUrl ?? null,
  pngUrl: certificate.pngUrl ?? null,
  verificationUrl: certificate.verificationUrl,
  sbdReferenceId: certificate.sbdReferenceId ?? null,
  downloadCount: certificate.downloadCount ?? 0,
  shareable: certificate.shareable ?? undefined,
  metadata: certificate.metadata ?? undefined,
  createdAt: certificate.createdAt,
  updatedAt: certificate.updatedAt,
});

const mapRecommendationItems = (
  doc?: LeanDashboardRecommendation | null
): DashboardRecommendationItem[] => {
  if (!doc?.recommendations?.length) {
    return [];
  }

  return doc.recommendations.map(item => ({
    type: item.type,
    id: item.id,
    title: item.title,
    reason: item.reason,
  }));
};

const buildMetrics = (
  enrollments: CourseEnrollment[],
  progresses: CourseProgress[]
): DashboardMetrics => {
  const totalCourses = enrollments.length;
  const coursesInProgress = enrollments.filter(enrollment =>
    ['in_progress'].includes(enrollment.status)
  ).length;
  const completedCount = enrollments.filter(
    enrollment => enrollment.status === 'completed'
  ).length;
  const completionRate =
    totalCourses === 0 ? 0 : (completedCount / totalCourses) * 100;

  const streak = progresses.reduce((max, progress) => {
    const current = progress.streak?.currentCount ?? 0;
    return Math.max(max, current);
  }, 0);

  return {
    totalCourses,
    coursesInProgress,
    completionRate: Number(completionRate.toFixed(2)),
    streak,
  };
};

const combineCourseSummaries = (
  enrollments: LeanEnrollment[],
  courses: LeanCourse[],
  progresses: LeanProgress[]
): DashboardCourseSummary[] => {
  const courseMap = new Map<string, LeanCourse>();
  courses.forEach(course => {
    courseMap.set(course._id.toString(), course);
  });

  const progressMap = new Map<string, CourseProgress>();
  progresses.forEach(progress => {
    progressMap.set(progress.enrollmentId.toString(), mapProgress(progress));
  });

  return enrollments.map(enrollment => {
    const courseDoc = courseMap.get(enrollment.courseId.toString());
    const courseSummary = courseDoc ? mapCourseSummary(courseDoc) : undefined;
    return {
      course: courseSummary ?? {
        id: enrollment.courseId.toString(),
        slug: '',
        title: 'Unknown Course',
        summary: '',
        categories: [],
        tags: [],
        lessonCount: 0,
        difficulty: 'beginner',
        isFeatured: false,
        status: 'draft',
        structureVersion: 1,
        visibility: 'public',
      },
      enrollment: mapEnrollment(enrollment),
      progress: progressMap.get(enrollment._id.toString()) ?? null,
    };
  });
};

export class DashboardService {
  static async getSummary(
    userId: string,
    options: DashboardSummaryOptions = {}
  ): Promise<DashboardSummary> {
    await connectToDatabase();

    const includeRecommendations = options.includeRecommendations ?? true;
    const recommendationsLimit = options.recommendationsLimit ?? 6;

    const enrollmentsPromise = CourseEnrollmentModel.find({
      userId,
    })
      .sort({ enrolledAt: -1 })
      .limit(50)
      .lean<LeanEnrollment[]>();

    const progressesPromise = CourseProgressModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean<LeanProgress[]>();

    const certificatesPromise = CertificateModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean<LeanCertificate[]>();

    const [enrollments, progresses, certificates] = await Promise.all([
      enrollmentsPromise,
      progressesPromise,
      certificatesPromise,
    ]);

    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    const courses = courseIds.length
      ? await CourseModel.find({ _id: { $in: courseIds } }).lean<LeanCourse[]>()
      : [];

    const courseSummaries = combineCourseSummaries(
      enrollments,
      courses,
      progresses
    );

    const mappedCertificates = certificates.map(mapCertificate);
    const mappedEnrollments = courseSummaries.map(entry => entry.enrollment);
    const mappedProgresses = courseSummaries
      .map(entry => entry.progress)
      .filter((progress): progress is CourseProgress => Boolean(progress));

    const metrics = buildMetrics(mappedEnrollments, mappedProgresses);

    let recommendations: DashboardRecommendationItem[] = [];

    if (includeRecommendations) {
      const [personalized, generic] = await Promise.all([
        DashboardRecommendationModel.findOne({ userId })
          .sort({ expiresAt: -1 })
          .lean<LeanDashboardRecommendation | null>(),
        DashboardRecommendationModel.findOne({ userId: null })
          .sort({ expiresAt: -1 })
          .lean<LeanDashboardRecommendation | null>(),
      ]);

      recommendations = mapRecommendationItems(personalized ?? generic).slice(
        0,
        recommendationsLimit
      );
    }

    return {
      enrolledCourses: courseSummaries,
      recommendedContent: recommendations,
      certificates: mappedCertificates,
      metrics,
    };
  }

  static async getCertificates(userId: string): Promise<Certificate[]> {
    await connectToDatabase();

    const certificates = await CertificateModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean<LeanCertificate[]>();

    return certificates.map(mapCertificate);
  }

  static async getRecommendations(
    userId: string,
    limit = 6
  ): Promise<DashboardRecommendationItem[]> {
    await connectToDatabase();

    const [personalized, generic] = await Promise.all([
      DashboardRecommendationModel.findOne({ userId })
        .sort({ expiresAt: -1 })
        .lean<LeanDashboardRecommendation | null>(),
      DashboardRecommendationModel.findOne({ userId: null })
        .sort({ expiresAt: -1 })
        .lean<LeanDashboardRecommendation | null>(),
    ]);

    return mapRecommendationItems(personalized ?? generic).slice(0, limit);
  }
}

export default DashboardService;
