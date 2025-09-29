import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import { getAuthorizedUser } from '../../../../../route';
import { LessonUpdateSchema, sanitizeLesson } from '../../../utils';
import { slugify } from '@/lib/slug';
import {
  resolveAssetShortcodes,
  resolveAssetShortcodesInArray,
} from '@/lib/assets/resolve-shortcodes';
import { syncDeckLinkTargets } from '@/lib/flashcards/sync-link-targets';

async function findCourse(courseIdOrSlug: string) {
  if (Types.ObjectId.isValid(courseIdOrSlug)) {
    return CourseModel.findById(courseIdOrSlug);
  }
  return CourseModel.findOne({ slug: courseIdOrSlug });
}

async function findModule(courseId: Types.ObjectId, moduleId: string) {
  if (!Types.ObjectId.isValid(moduleId)) return null;
  return CourseModuleModel.findOne({
    _id: new Types.ObjectId(moduleId),
    courseId,
  });
}

export async function GET(
  _: NextRequest,
  {
    params,
  }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const courseDoc = await findCourse(params.courseId);
    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const moduleDoc = await findModule(courseDoc._id, params.moduleId);
    if (!moduleDoc) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (!Types.ObjectId.isValid(params.lessonId)) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lessonDoc = await CourseLessonModel.findOne({
      _id: new Types.ObjectId(params.lessonId),
      courseId: courseDoc._id,
    }).lean();

    if (
      !lessonDoc ||
      lessonDoc.moduleId.toString() !== moduleDoc._id.toString()
    ) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(sanitizeLesson(lessonDoc));
  } catch (error) {
    console.error('Error fetching lesson detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const courseDoc = await findCourse(params.courseId);
    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const moduleDoc = await findModule(courseDoc._id, params.moduleId);
    if (!moduleDoc) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (!Types.ObjectId.isValid(params.lessonId)) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lessonDoc = await CourseLessonModel.findOne({
      _id: new Types.ObjectId(params.lessonId),
      courseId: courseDoc._id,
    });

    if (
      !lessonDoc ||
      lessonDoc.moduleId.toString() !== moduleDoc._id.toString()
    ) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const previousModuleId = lessonDoc.moduleId;
    const prevDeckIds = (lessonDoc.flashcardDeckIds ?? []).map(
      id => new Types.ObjectId(id)
    );

    const body = await request.json();
    const parsed = LessonUpdateSchema.parse(body);

    if (parsed.title !== undefined) {
      lessonDoc.title = parsed.title;
    }

    if (parsed.slug !== undefined) {
      const slugValue = parsed.slug.trim();
      if (!slugValue) {
        lessonDoc.slug = undefined;
      } else {
        const nextSlug = slugify(slugValue);
        if (nextSlug !== lessonDoc.slug) {
          const slugExists = await CourseLessonModel.exists({
            slug: nextSlug,
            _id: { $ne: lessonDoc._id },
          });
          if (slugExists) {
            return NextResponse.json(
              { error: 'Slug already in use' },
              { status: 409 }
            );
          }
          lessonDoc.slug = nextSlug;
        }
      }
    }

    if (parsed.contentType !== undefined) {
      lessonDoc.contentType = parsed.contentType;
    }

    if (parsed.blogSlug !== undefined) {
      lessonDoc.blogSlug = parsed.blogSlug?.trim() || undefined;
    }

    if (parsed.standaloneContent !== undefined) {
      const resolved = parsed.standaloneContent
        ? await resolveAssetShortcodes(parsed.standaloneContent)
        : undefined;
      lessonDoc.standaloneContent = resolved?.trim() || undefined;
    }

    if (parsed.standaloneFormat !== undefined) {
      lessonDoc.standaloneFormat = parsed.standaloneFormat;
    }

    if (parsed.externalResource !== undefined) {
      lessonDoc.externalResource = parsed.externalResource
        ? { ...parsed.externalResource }
        : undefined;
    }

    if (parsed.quizId !== undefined) {
      const quizId = parsed.quizId?.trim();
      lessonDoc.quizId =
        quizId && Types.ObjectId.isValid(quizId)
          ? new Types.ObjectId(quizId)
          : undefined;
    }

    let nextDeckIds = prevDeckIds;
    if (parsed.flashcardDeckIds !== undefined) {
      nextDeckIds = parsed.flashcardDeckIds
        .filter((id: string) => Types.ObjectId.isValid(id))
        .map((id: string) => new Types.ObjectId(id));
      lessonDoc.flashcardDeckIds = nextDeckIds;
    }

    if (parsed.assets !== undefined) {
      const lottieIds = parsed.assets?.lottieIds
        ? parsed.assets.lottieIds
            .filter((id: string) => Types.ObjectId.isValid(id))
            .map((id: string) => new Types.ObjectId(id))
        : undefined;
      const imageUrls = parsed.assets?.imageUrls
        ? await resolveAssetShortcodesInArray(parsed.assets.imageUrls)
        : undefined;
      if (lottieIds?.length || imageUrls?.length) {
        lessonDoc.assets = {
          lottieIds: lottieIds?.length ? lottieIds : undefined,
          imageUrls: imageUrls?.length ? imageUrls : undefined,
        };
      } else {
        lessonDoc.assets = undefined;
      }
    }

    if (parsed.estimatedDurationMinutes !== undefined) {
      lessonDoc.estimatedDurationMinutes = parsed.estimatedDurationMinutes;
    }

    if (parsed.isPreviewable !== undefined) {
      lessonDoc.isPreviewable = parsed.isPreviewable;
    }

    if (parsed.progressWeight !== undefined) {
      lessonDoc.progressWeight = parsed.progressWeight;
    }

    if (parsed.prerequisiteLessonIds !== undefined) {
      const ids = parsed.prerequisiteLessonIds
        .filter((id: string) => Types.ObjectId.isValid(id))
        .map((id: string) => new Types.ObjectId(id));
      if (ids.length > 0) {
        const existing = await CourseLessonModel.find({
          _id: { $in: ids },
          courseId: courseDoc._id,
        }).select(['_id']);
        const existingIds = new Set(
          existing.map(lesson => lesson._id.toString())
        );
        lessonDoc.prerequisiteLessonIds = ids.filter((id: Types.ObjectId) =>
          existingIds.has(id.toString())
        );
      } else {
        lessonDoc.prerequisiteLessonIds = [];
      }
    }

    if (parsed.releaseAt !== undefined) {
      lessonDoc.releaseAt = parsed.releaseAt
        ? new Date(parsed.releaseAt)
        : undefined;
    }

    let moduleChanged = false;
    if (
      parsed.moduleId !== undefined &&
      parsed.moduleId !== lessonDoc.moduleId.toString()
    ) {
      if (!Types.ObjectId.isValid(parsed.moduleId)) {
        return NextResponse.json(
          { error: 'Target module invalid' },
          { status: 400 }
        );
      }
      const nextModuleDoc = await CourseModuleModel.findOne({
        _id: new Types.ObjectId(parsed.moduleId),
        courseId: courseDoc._id,
      });
      if (!nextModuleDoc) {
        return NextResponse.json(
          { error: 'Target module not found' },
          { status: 404 }
        );
      }
      moduleChanged = true;

      if (prevDeckIds.length > 0) {
        await syncDeckLinkTargets(prevDeckIds, [], {
          scope: 'lesson',
          courseId: courseDoc._id,
          moduleId: lessonDoc.moduleId,
          lessonId: lessonDoc._id,
        });
      }

      const oldModuleDoc = await CourseModuleModel.findById(lessonDoc.moduleId);
      if (oldModuleDoc) {
        oldModuleDoc.lessonIds = (oldModuleDoc.lessonIds ?? []).filter(
          id => id.toString() !== lessonDoc._id.toString()
        );
        await oldModuleDoc.save();
      }

      nextModuleDoc.lessonIds = [
        ...(nextModuleDoc.lessonIds ?? []),
        lessonDoc._id,
      ];
      await nextModuleDoc.save();

      lessonDoc.moduleId = nextModuleDoc._id;
    }

    await lessonDoc.save();

    if (moduleChanged) {
      if (nextDeckIds.length > 0) {
        await syncDeckLinkTargets([], nextDeckIds, {
          scope: 'lesson',
          courseId: courseDoc._id,
          moduleId: lessonDoc.moduleId,
          lessonId: lessonDoc._id,
        });
      }
    } else if (parsed.flashcardDeckIds !== undefined) {
      await syncDeckLinkTargets(prevDeckIds, nextDeckIds, {
        scope: 'lesson',
        courseId: courseDoc._id,
        moduleId: lessonDoc.moduleId,
        lessonId: lessonDoc._id,
      });
    }

    const updatedLesson = await CourseLessonModel.findById(
      lessonDoc._id
    ).lean();

    return NextResponse.json(
      updatedLesson ? sanitizeLesson(updatedLesson) : sanitizeLesson(lessonDoc)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  {
    params,
  }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const courseDoc = await findCourse(params.courseId);
    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const moduleDoc = await findModule(courseDoc._id, params.moduleId);
    if (!moduleDoc) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (!Types.ObjectId.isValid(params.lessonId)) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lessonDoc = await CourseLessonModel.findOne({
      _id: new Types.ObjectId(params.lessonId),
      courseId: courseDoc._id,
    });

    if (
      !lessonDoc ||
      lessonDoc.moduleId.toString() !== moduleDoc._id.toString()
    ) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const deckIds = (lessonDoc.flashcardDeckIds ?? []).map(
      id => new Types.ObjectId(id)
    );

    if (deckIds.length > 0) {
      await syncDeckLinkTargets(deckIds, [], {
        scope: 'lesson',
        courseId: courseDoc._id,
        moduleId: lessonDoc.moduleId,
        lessonId: lessonDoc._id,
      });
    }

    await CourseLessonModel.deleteOne({ _id: lessonDoc._id });

    moduleDoc.lessonIds = (moduleDoc.lessonIds ?? []).filter(
      id => id.toString() !== lessonDoc._id.toString()
    );
    await moduleDoc.save();

    courseDoc.lessonCount = Math.max(0, (courseDoc.lessonCount ?? 0) - 1);
    await courseDoc.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
