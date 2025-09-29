import {
  Certificate,
  CourseEnrollment,
  CourseProgress,
  CourseDifficulty,
  CourseStatus,
  CourseVisibility,
} from '@/types/courses';

export type DashboardRecommendationType = 'course' | 'blog' | 'book';

export interface DashboardCourseSummary {
  course: CourseSummary;
  enrollment: CourseEnrollment;
  progress: CourseProgress | null;
}

export interface DashboardRecommendationItem {
  type: DashboardRecommendationType;
  id: string;
  title: string;
  reason: string;
}

export interface DashboardMetrics {
  totalCourses: number;
  coursesInProgress: number;
  completionRate: number;
  streak: number;
}

export interface DashboardSummary {
  enrolledCourses: DashboardCourseSummary[];
  recommendedContent: DashboardRecommendationItem[];
  certificates: Certificate[];
  metrics: DashboardMetrics;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  summary: string;
  heroImage?: string | null;
  heroLottieId?: string | null;
  difficulty: CourseDifficulty;
  categories: string[];
  tags: string[];
  estimatedDurationMinutes?: number;
  lessonCount: number;
  status: CourseStatus;
  isFeatured: boolean;
  visibility: CourseVisibility;
  publishedAt?: Date | null;
  structureVersion: number;
}
