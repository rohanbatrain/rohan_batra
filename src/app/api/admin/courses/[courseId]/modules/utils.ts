import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ModuleInputSchema = z.object({
  title: z.string().min(3).max(150),
  summary: z.string().optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
  estimatedDurationMinutes: z.number().int().min(0).nullable().optional(),
  flashcardDeckIds: z.array(z.string()).optional().default([]),
});

export const ModuleUpdateSchema = ModuleInputSchema.extend({
  lessonIds: z.array(z.string()).optional(),
});

const externalResourceSchema = z.object({
  provider: z.enum(['youtube', 'vimeo', 'loom', 'custom']),
  url: z.string().url(),
  durationSeconds: z.number().int().min(0).optional(),
  thumbnailUrl: z.string().url().optional(),
});

const assetsSchema = z.object({
  lottieIds: z.array(z.string()).optional().default([]),
  imageUrls: z.array(z.string()).optional().default([]),
});

const lessonCreateShape = {
  title: z.string().min(3).max(200),
  slug: z.string().regex(slugRegex).optional().or(z.literal('')),
  contentType: z.enum(['blog', 'standalone', 'video', 'quiz', 'flashcards']),
  blogSlug: z.string().optional().or(z.literal('')),
  standaloneContent: z.string().optional().or(z.literal('')),
  standaloneFormat: z.enum(['mdx', 'novelsh']).optional().default('mdx'),
  externalResource: externalResourceSchema.optional(),
  quizId: z.string().optional().or(z.literal('')),
  flashcardDeckIds: z.array(z.string()).optional().default([]),
  assets: assetsSchema.optional(),
  estimatedDurationMinutes: z.number().int().min(1),
  isPreviewable: z.boolean().optional().default(false),
  progressWeight: z.number().min(0).optional().default(1),
  prerequisiteLessonIds: z.array(z.string()).optional().default([]),
  releaseAt: z.union([z.string(), z.date()]).nullable().optional(),
} as const;

const validateLessonPayload = (
  value: z.infer<z.ZodObject<typeof lessonCreateShape>>,
  ctx: z.RefinementCtx
) => {
  if (value.contentType === 'blog' && !value.blogSlug?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['blogSlug'],
      message: 'blogSlug is required when contentType is blog',
    });
  }

  if (value.contentType === 'standalone' && !value.standaloneContent?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['standaloneContent'],
      message: 'standaloneContent is required for standalone lessons',
    });
  }

  if (value.contentType === 'video' && !value.externalResource) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['externalResource'],
      message: 'externalResource is required for video lessons',
    });
  }

  if (value.contentType === 'quiz' && !value.quizId?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['quizId'],
      message: 'quizId is required for quiz lessons',
    });
  }

  if (
    value.contentType === 'flashcards' &&
    (value.flashcardDeckIds ?? []).length === 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['flashcardDeckIds'],
      message: 'At least one flashcard deck is required for flashcards lessons',
    });
  }
};

export const LessonInputSchema = z
  .object(lessonCreateShape)
  .superRefine(validateLessonPayload);

export const LessonUpdateSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    slug: z.string().regex(slugRegex).optional().or(z.literal('')),
    contentType: z
      .enum(['blog', 'standalone', 'video', 'quiz', 'flashcards'])
      .optional(),
    blogSlug: z.string().optional().or(z.literal('')),
    standaloneContent: z.string().optional().or(z.literal('')),
    standaloneFormat: z.enum(['mdx', 'novelsh']).optional(),
    externalResource: externalResourceSchema.optional(),
    quizId: z.string().optional().or(z.literal('')),
    flashcardDeckIds: z.array(z.string()).optional(),
    assets: assetsSchema.optional(),
    estimatedDurationMinutes: z.number().int().min(1).optional(),
    isPreviewable: z.boolean().optional(),
    progressWeight: z.number().min(0).optional(),
    prerequisiteLessonIds: z.array(z.string()).optional(),
    releaseAt: z.union([z.string(), z.date()]).nullable().optional(),
    moduleId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.contentType) {
      return;
    }

    if (
      value.contentType === 'blog' &&
      value.blogSlug !== undefined &&
      !value.blogSlug.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['blogSlug'],
        message: 'blogSlug must be provided when setting contentType to blog',
      });
    }

    if (
      value.contentType === 'standalone' &&
      value.standaloneContent !== undefined &&
      !value.standaloneContent.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['standaloneContent'],
        message:
          'standaloneContent must be provided when setting contentType to standalone',
      });
    }

    if (value.contentType === 'video' && !value.externalResource) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['externalResource'],
        message:
          'externalResource must be provided when setting contentType to video',
      });
    }

    if (
      value.contentType === 'quiz' &&
      value.quizId !== undefined &&
      !value.quizId.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quizId'],
        message: 'quizId must be provided when setting contentType to quiz',
      });
    }

    if (
      value.contentType === 'flashcards' &&
      value.flashcardDeckIds &&
      value.flashcardDeckIds.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['flashcardDeckIds'],
        message:
          'flashcardDeckIds must include at least one deck when setting contentType to flashcards',
      });
    }
  });

export const sanitizeLesson = (lesson: any) => ({
  id: lesson._id.toString(),
  courseId: lesson.courseId.toString(),
  moduleId: lesson.moduleId.toString(),
  title: lesson.title,
  slug: lesson.slug ?? null,
  contentType: lesson.contentType,
  blogSlug: lesson.blogSlug ?? null,
  standaloneContent: lesson.standaloneContent ?? null,
  standaloneFormat: lesson.standaloneFormat ?? 'mdx',
  externalResource: lesson.externalResource ?? null,
  quizId: lesson.quizId ? lesson.quizId.toString() : null,
  flashcardDeckIds: (lesson.flashcardDeckIds ?? []).map((id: any) =>
    id.toString()
  ),
  assets: lesson.assets ?? null,
  estimatedDurationMinutes: lesson.estimatedDurationMinutes,
  isPreviewable: Boolean(lesson.isPreviewable),
  progressWeight: lesson.progressWeight ?? 1,
  prerequisiteLessonIds: (lesson.prerequisiteLessonIds ?? []).map((id: any) =>
    id.toString()
  ),
  releaseAt: lesson.releaseAt ?? null,
  createdAt: lesson.createdAt,
  updatedAt: lesson.updatedAt,
});

export const sanitizeModule = (module: any, lessons: any[] = []) => ({
  id: module._id.toString(),
  courseId: module.courseId.toString(),
  title: module.title,
  summary: module.summary ?? null,
  order: module.order,
  estimatedDurationMinutes: module.estimatedDurationMinutes ?? null,
  flashcardDeckIds: (module.flashcardDeckIds ?? []).map((id: any) =>
    id.toString()
  ),
  lessonIds: (module.lessonIds ?? []).map((id: any) => id.toString()),
  lessons: lessons.map(sanitizeLesson),
  createdAt: module.createdAt,
  updatedAt: module.updatedAt,
});
