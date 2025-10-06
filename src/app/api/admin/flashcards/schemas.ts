import { z } from 'zod';

export const LinkTargetSchema = z
  .object({
    scope: z.enum(['standalone', 'course', 'module', 'lesson']),
    courseId: z.string().optional(),
    moduleId: z.string().optional(),
    lessonId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === 'course' && !value.courseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'courseId required when scope is course',
        path: ['courseId'],
      });
    }
    if (value.scope === 'module') {
      if (!value.courseId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'courseId required when scope is module',
          path: ['courseId'],
        });
      }
      if (!value.moduleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'moduleId required when scope is module',
          path: ['moduleId'],
        });
      }
    }
    if (value.scope === 'lesson') {
      if (!value.courseId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'courseId required when scope is lesson',
          path: ['courseId'],
        });
      }
      if (!value.moduleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'moduleId required when scope is lesson',
          path: ['moduleId'],
        });
      }
      if (!value.lessonId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'lessonId required when scope is lesson',
          path: ['lessonId'],
        });
      }
    }
  });

export const FlashcardDeckInputSchema = z.object({
  title: z.string().min(3).max(200),
  subtitle: z.string().max(200).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  coverImage: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
  isFeatured: z.boolean().optional().default(false),
  estimatedReviewMinutes: z.number().int().min(0).nullable().optional(),
  linkTargets: z.array(LinkTargetSchema).optional().default([]),
});

export const sanitizeDeck = (deck: any) => ({
  id: deck._id.toString(),
  title: deck.title,
  slug: deck.slug,
  subtitle: deck.subtitle ?? null,
  description: deck.description ?? null,
  coverImage: deck.coverImage ?? null,
  status: deck.status,
  visibility: deck.visibility,
  isFeatured: Boolean(deck.isFeatured),
  tags: deck.tags ?? [],
  categories: deck.categories ?? [],
  cardCount: deck.cardCount ?? 0,
  estimatedReviewMinutes: deck.estimatedReviewMinutes ?? null,
  analytics: deck.analytics ?? null,
  linkTargets:
    deck.linkTargets?.map((target: any) => ({
      scope: target.scope,
      courseId: target.courseId ? target.courseId.toString() : null,
      moduleId: target.moduleId ? target.moduleId.toString() : null,
      lessonId: target.lessonId ? target.lessonId.toString() : null,
    })) ?? [],
  createdAt: deck.createdAt,
  updatedAt: deck.updatedAt,
  publishedAt: deck.publishedAt ?? null,
});
