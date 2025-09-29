export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type CourseStatus = 'draft' | 'published' | 'archived';

export type CourseVisibility = 'public' | 'unlisted';

export interface CourseReleaseSchedule {
  publishAt: Date;
  timezone?: string;
}

export interface CourseSEOOverrides {
  title?: string | null;
  description?: string | null;
  image?: string | null;
}

export interface Course {
  _id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  heroImage?: string | null;
  heroLottieId?: string | null;
  difficulty: CourseDifficulty;
  categories: string[];
  tags: string[];
  estimatedDurationMinutes?: number;
  lessonCount: number;
  prerequisiteCourseIds: string[];
  prerequisiteBlogSlugs: string[];
  recommendedBlogSlugs: string[];
  recommendedBookIds: string[];
  flashcardDeckIds: string[];
  status: CourseStatus;
  visibility: CourseVisibility;
  isFeatured: boolean;
  seo?: CourseSEOOverrides;
  releaseSchedule?: CourseReleaseSchedule | null;
  structureVersion: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

export interface CourseModule {
  _id?: string;
  courseId: string;
  title: string;
  summary?: string | null;
  order: number;
  estimatedDurationMinutes?: number | null;
  lessonIds: string[];
  flashcardDeckIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CourseLessonContentType =
  | 'blog'
  | 'standalone'
  | 'video'
  | 'quiz'
  | 'flashcards';

export interface CourseLessonExternalResource {
  provider: 'youtube' | 'vimeo' | 'loom' | 'custom';
  url: string;
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
}

export interface CourseLessonAssetBundle {
  lottieIds?: string[];
  imageUrls?: string[];
}

export interface CourseLesson {
  _id?: string;
  courseId: string;
  moduleId: string;
  title: string;
  slug?: string;
  contentType: CourseLessonContentType;
  blogSlug?: string | null;
  standaloneContent?: string | null;
  standaloneFormat?: 'mdx' | 'novelsh';
  externalResource?: CourseLessonExternalResource | null;
  quizId?: string | null;
  flashcardDeckIds?: string[];
  assets?: CourseLessonAssetBundle;
  estimatedDurationMinutes: number;
  isPreviewable: boolean;
  progressWeight: number;
  prerequisiteLessonIds: string[];
  releaseAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseQuizOption {
  value: string;
  label: string;
}

export interface CourseQuizQuestion {
  questionId: string;
  type: 'single_choice' | 'multiple_choice' | 'free_text';
  prompt: string;
  options?: CourseQuizOption[];
  correctAnswers: string[];
  explanation?: string | null;
}

export interface CourseQuiz {
  _id?: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  passingScore: number;
  timeLimitSeconds?: number | null;
  attemptLimit?: number | null;
  questions: CourseQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export type CourseEnrollmentStatus =
  | 'enrolled'
  | 'in_progress'
  | 'completed'
  | 'withdrawn';

export type CourseEnrollmentOrigin =
  | 'self_enroll'
  | 'admin_grant'
  | 'auto_bundle';

export interface CourseEnrollment {
  _id?: string;
  courseId: string;
  userId: string;
  status: CourseEnrollmentStatus;
  origin: CourseEnrollmentOrigin;
  enrolledAt: Date;
  lastAccessedAt?: Date | null;
  completedAt?: Date | null;
  certificateId?: string | null;
  notes?: string | null;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseProgressModuleSnapshot {
  moduleId: string;
  completedWeight: number;
  totalWeight: number;
  percentage: number;
}

export interface CourseProgressQuizAttempt {
  lessonId: string;
  attempts: Array<{
    score?: number;
    passed: boolean;
    attemptedAt: Date;
  }>;
}

export interface CourseProgress {
  _id?: string;
  enrollmentId: string;
  courseId: string;
  userId: string;
  completedLessonIds: string[];
  incompleteLessonIds: string[];
  currentLessonId?: string | null;
  moduleProgress: CourseProgressModuleSnapshot[];
  percentageComplete: number;
  timeSpentSeconds: number;
  streak?: {
    currentCount: number;
    longestCount: number;
    lastUpdatedAt: Date;
  } | null;
  quizAttempts: CourseProgressQuizAttempt[];
  checkpoints?: Array<{
    lessonId: string;
    cursor: string;
  }>;
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type FlashcardDeckStatus = 'draft' | 'published' | 'archived';

export type FlashcardDeckVisibility = 'public' | 'unlisted' | 'private';

export type FlashcardCardType = 'basic' | 'cloze' | 'qa' | 'image';

export interface FlashcardMedia {
  lottieIds?: string[];
  imageUrls?: string[];
  audioUrl?: string | null;
}

export interface FlashcardDeckLinkTarget {
  scope: 'standalone' | 'course' | 'module' | 'lesson';
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
}

export interface FlashcardCardFace {
  text?: string | null;
  richText?: string | null;
  media?: FlashcardMedia;
}

export interface FlashcardCard {
  _id?: string;
  deckId: string;
  type: FlashcardCardType;
  prompt: FlashcardCardFace;
  response: FlashcardCardFace;
  hint?: string | null;
  explanation?: string | null;
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardDeckAnalytics {
  reviewCount: number;
  uniqueLearners: number;
  averageRating?: number | null;
  lastReviewedAt?: Date | null;
}

export interface FlashcardDeck {
  _id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  tags: string[];
  categories: string[];
  status: FlashcardDeckStatus;
  visibility: FlashcardDeckVisibility;
  isFeatured: boolean;
  estimatedReviewMinutes?: number | null;
  cardCount: number;
  linkTargets: FlashcardDeckLinkTarget[];
  cards?: FlashcardCard[];
  analytics?: FlashcardDeckAnalytics;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

export type FlashcardReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface FlashcardCardProgress {
  cardId: string;
  dueAt: Date;
  intervalMinutes: number;
  easeFactor: number;
  lastReviewedAt?: Date | null;
  consecutiveCorrect: number;
  totalReviews: number;
}

export interface FlashcardProgressStats {
  totalCards: number;
  reviewedCards: number;
  matureCards: number;
  newCards: number;
  lapses: number;
  currentStreak: number;
  longestStreak: number;
}

export interface FlashcardProgress {
  _id?: string;
  deckId: string;
  userId: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  stats: FlashcardProgressStats;
  cardStates: FlashcardCardProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardStudyEntry {
  cardId: string;
  rating: FlashcardReviewRating;
  reviewedAt: Date;
  elapsedSeconds?: number;
  nextDueAt?: Date | null;
}

export interface FlashcardStudySession {
  _id?: string;
  deckId: string;
  userId: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
  entries: FlashcardStudyEntry[];
}

export type CertificateProviderType = 'internal' | 'sbd' | 'external';

export interface CertificateBranding {
  logoUrl?: string | null;
  accentColor?: string | null;
  signatureUrl?: string | null;
}

export interface CertificateTemplateMetadata {
  version: number;
  format: 'landscape' | 'portrait';
  primaryFont?: string | null;
  backgroundAssetId?: string | null;
}

export interface CertificateProvider {
  _id?: string;
  key: string;
  displayName: string;
  type: CertificateProviderType;
  isActive: boolean;
  branding?: CertificateBranding;
  contact?: {
    email?: string | null;
    url?: string | null;
  };
  template?: CertificateTemplateMetadata;
  delivery?: Record<string, unknown>;
  verificationBaseUrl?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type CertificateStatus = 'pending' | 'issued' | 'failed' | 'revoked';

export interface CertificateShareMetadata {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
}

export interface Certificate {
  _id?: string;
  courseId: string;
  userId: string;
  enrollmentId: string;
  providerKey: string;
  status: CertificateStatus;
  issuedAt?: Date | null;
  certificateNumber: string;
  qrCodeUrl?: string | null;
  pdfUrl?: string | null;
  pngUrl?: string | null;
  verificationUrl: string;
  sbdReferenceId?: string | null;
  downloadCount: number;
  shareable?: CertificateShareMetadata;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardRecommendation {
  _id?: string;
  userId?: string | null;
  context: 'course' | 'blog' | 'book';
  sourceId: string;
  recommendations: Array<{
    type: 'course' | 'blog' | 'book';
    id: string;
    title: string;
    reason: string;
  }>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
