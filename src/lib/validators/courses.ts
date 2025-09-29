import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const objectIdSchema = z
  .string()
  .regex(objectIdRegex, 'Invalid ObjectId value');
export const slugSchema = z
  .string()
  .min(1)
  .regex(slugRegex, 'Invalid slug format');

export const CourseProgressUpdateSchema = z
  .object({
    completedLessonIds: z.array(objectIdSchema).optional(),
    currentLessonId: objectIdSchema.nullable().optional(),
    quizAttempts: z
      .array(
        z.object({
          lessonId: objectIdSchema,
          score: z.number().min(0).max(100).optional(),
          passed: z.boolean(),
        })
      )
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (
      !value.completedLessonIds &&
      !value.currentLessonId &&
      !value.quizAttempts
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one progress field must be provided.',
      });
    }
  });

const CurriculumLessonSchema = z
  .object({
    lessonId: objectIdSchema.optional(),
    title: z.string().min(3).max(200),
    contentType: z.enum(['blog', 'standalone', 'video', 'quiz']),
    blogSlug: slugSchema.optional().nullable(),
    standaloneContent: z.string().min(1).optional().nullable(),
    standaloneFormat: z.enum(['mdx', 'novelsh']).optional(),
    externalResource: z
      .object({
        provider: z.enum(['youtube', 'vimeo', 'loom', 'custom']),
        url: z.string().url(),
        durationSeconds: z.number().nonnegative().optional(),
        thumbnailUrl: z.string().url().optional(),
      })
      .optional()
      .nullable(),
    quizId: objectIdSchema.optional().nullable(),
    estimatedDurationMinutes: z.number().min(1),
    isPreviewable: z.boolean().optional(),
  })
  .superRefine((lesson, ctx) => {
    switch (lesson.contentType) {
      case 'blog':
        if (!lesson.blogSlug) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Blog lessons require blogSlug.',
          });
        }
        break;
      case 'standalone':
        if (!lesson.standaloneContent) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Standalone lessons require standaloneContent.',
          });
        }
        break;
      case 'video':
        if (!lesson.externalResource) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Video lessons require an externalResource.',
          });
        }
        break;
      case 'quiz':
        if (!lesson.quizId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Quiz lessons require a quizId.',
          });
        }
        break;
      default:
        break;
    }
  });

const CurriculumModuleSchema = z.object({
  moduleId: objectIdSchema.optional(),
  title: z.string().min(3).max(150),
  summary: z.string().max(300).optional().nullable(),
  order: z.number().int().min(0),
  lessons: z.array(CurriculumLessonSchema).min(0),
});

export const CurriculumPayloadSchema = z.object({
  modules: z
    .array(CurriculumModuleSchema)
    .nonempty('At least one module is required to save curriculum.'),
});

export const CertificateReissuePayloadSchema = z.object({
  providerKey: z.string().optional(),
  reason: z.string().max(500).optional(),
});

export type CourseProgressUpdateInput = z.infer<
  typeof CourseProgressUpdateSchema
>;
export type CurriculumPayloadInput = z.infer<typeof CurriculumPayloadSchema>;
export type CertificateReissuePayloadInput = z.infer<
  typeof CertificateReissuePayloadSchema
>;
