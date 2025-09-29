import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import { getAuthorizedUser } from '../../../../route';
import { LessonInputSchema, sanitizeLesson } from '../../utils';
import {
  resolveAssetShortcodes,
  resolveAssetShortcodesInArray,
} from '@/lib/assets/resolve-shortcodes';
import { syncDeckLinkTargets } from '@/lib/flashcards/sync-link-targets';
import { uniqueSlug } from '@/lib/slug';

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

function toObjectId(id: string) {
  return new Types.ObjectId(id);
}

export async function GET(
  _: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
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

    const lessons = await CourseLessonModel.find({
      moduleId: moduleDoc._id,
    }).lean();
    const lessonIds = (moduleDoc.lessonIds ?? []).map(id => id.toString());
    const lessonMap = new Map(
      lessons.map(lesson => [lesson._id.toString(), lesson])
    );

    const orderedLessons = lessonIds
      .map(id => lessonMap.get(id))
      .filter(Boolean) as any[];
    const remainingLessons = lessons.filter(
      lesson => !lessonIds.includes(lesson._id.toString())
    );

    return NextResponse.json({
      lessons: [...orderedLessons, ...remainingLessons].map(sanitizeLesson),
    });
  } catch (error) {
    console.error('Error listing lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
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

    const body = await request.json();
    const parsed = LessonInputSchema.parse(body);

    const slugSource = parsed.slug?.trim()
      ? parsed.slug.trim()
      : parsed.contentType !== 'blog'
        ? parsed.title
        : undefined;

    let slug: string | undefined;
    if (slugSource) {
      slug = await uniqueSlug(slugSource, async candidate => {
        const exists = await CourseLessonModel.exists({ slug: candidate });
        return Boolean(exists);
      });
    }

    const flashcardDeckIds = (parsed.flashcardDeckIds ?? [])
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));

    const prerequisiteLessonIds = (parsed.prerequisiteLessonIds ?? [])
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));

    const lottieIds = parsed.assets?.lottieIds
      ? parsed.assets.lottieIds
          .filter(id => Types.ObjectId.isValid(id))
          .map(id => new Types.ObjectId(id))
      : undefined;

    const imageUrls = parsed.assets?.imageUrls
      ? await resolveAssetShortcodesInArray(parsed.assets.imageUrls)
      : undefined;

    const assets =
      lottieIds || (imageUrls && imageUrls.length > 0)
        ? {
            lottieIds:
              lottieIds && lottieIds.length > 0 ? lottieIds : undefined,
            imageUrls:
              imageUrls && imageUrls.length > 0 ? imageUrls : undefined,
          }
        : undefined;

    const standaloneContent = parsed.standaloneContent
      ? await resolveAssetShortcodes(parsed.standaloneContent)
      : undefined;

    const releaseAt = parsed.releaseAt ? new Date(parsed.releaseAt) : undefined;

    const lessonDoc = await CourseLessonModel.create({
      courseId: courseDoc._id,
      moduleId: moduleDoc._id,
      title: parsed.title,
      slug,
      contentType: parsed.contentType,
      blogSlug: parsed.blogSlug?.trim() || undefined,
      standaloneContent: standaloneContent?.trim() || undefined,
      standaloneFormat: parsed.standaloneFormat ?? 'mdx',
      externalResource: parsed.externalResource
        ? { ...parsed.externalResource }
        : undefined,
      quizId:
        parsed.quizId && Types.ObjectId.isValid(parsed.quizId)
          ? new Types.ObjectId(parsed.quizId)
          : undefined,
      flashcardDeckIds,
      assets,
      estimatedDurationMinutes: parsed.estimatedDurationMinutes,
      isPreviewable: parsed.isPreviewable ?? false,
      progressWeight: parsed.progressWeight ?? 1,
      prerequisiteLessonIds,
      releaseAt,
    });

    moduleDoc.lessonIds = [...(moduleDoc.lessonIds ?? []), lessonDoc._id];
    await moduleDoc.save();

    courseDoc.lessonCount = (courseDoc.lessonCount ?? 0) + 1;
    await courseDoc.save();

    if (flashcardDeckIds.length > 0) {
      await syncDeckLinkTargets([], flashcardDeckIds, {
        scope: 'lesson',
        courseId: courseDoc._id,
        moduleId: moduleDoc._id,
        lessonId: lessonDoc._id,
      });
    }

    return NextResponse.json(sanitizeLesson(lessonDoc), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && /duplicate key/i.test(error.message)) {
      return NextResponse.json(
        { error: 'Slug already in use' },
        { status: 409 }
      );
    }

    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
