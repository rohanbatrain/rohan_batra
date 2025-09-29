import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import { getAuthorizedUser } from '../../route';
import { syncDeckLinkTargets } from '@/lib/flashcards/sync-link-targets';
import { ModuleInputSchema, sanitizeLesson, sanitizeModule } from './utils';

export async function GET(
  _: NextRequest,
  { params }: { params: { courseId: string } }
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

    const courseId = Types.ObjectId.isValid(params.courseId)
      ? new Types.ObjectId(params.courseId)
      : null;

    const course = courseId
      ? await CourseModel.findById(courseId).select(['_id'])
      : await CourseModel.findOne({ slug: params.courseId }).select(['_id']);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const modules = await CourseModuleModel.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    const moduleIds = modules.map(module => module._id);

    const lessons = moduleIds.length
      ? await CourseLessonModel.find({ moduleId: { $in: moduleIds } })
          .sort({ updatedAt: -1 })
          .lean()
      : [];

    const lessonsByModule = new Map<string, any[]>();
    lessons.forEach(lesson => {
      const key = lesson.moduleId.toString();
      if (!lessonsByModule.has(key)) {
        lessonsByModule.set(key, []);
      }
      lessonsByModule.get(key)!.push(lesson);
    });

    const payload = modules.map(module => {
      const moduleLessonIds = (module.lessonIds ?? []).map((id: any) =>
        id.toString()
      );
      const moduleLessons = lessonsByModule.get(module._id.toString()) ?? [];
      const lessonLookup = new Map(
        moduleLessons.map(lesson => [lesson._id.toString(), lesson])
      );

      const orderedLessons = moduleLessonIds
        .map(id => lessonLookup.get(id))
        .filter(Boolean) as any[];

      const remainingLessons = moduleLessons.filter(
        lesson => !moduleLessonIds.includes(lesson._id.toString())
      );

      return sanitizeModule(module, [...orderedLessons, ...remainingLessons]);
    });

    return NextResponse.json({ modules: payload });
  } catch (error) {
    console.error('Error listing modules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
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

    const courseDoc = Types.ObjectId.isValid(params.courseId)
      ? await CourseModel.findById(params.courseId)
      : await CourseModel.findOne({ slug: params.courseId });

    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = ModuleInputSchema.parse(body);

    const flashcardDeckIds = parsed.flashcardDeckIds
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));

    const existingModules = await CourseModuleModel.find({
      courseId: courseDoc._id,
    })
      .sort({ order: -1 })
      .limit(1)
      .lean();

    const defaultOrder = existingModules.length
      ? existingModules[0].order + 1
      : 0;

    const moduleDoc = await CourseModuleModel.create({
      courseId: courseDoc._id,
      title: parsed.title,
      summary: parsed.summary?.trim() || undefined,
      order: parsed.order ?? defaultOrder,
      estimatedDurationMinutes:
        parsed.estimatedDurationMinutes === null
          ? undefined
          : parsed.estimatedDurationMinutes,
      lessonIds: [],
      flashcardDeckIds,
    });

    if (flashcardDeckIds.length > 0) {
      await syncDeckLinkTargets([], flashcardDeckIds, {
        scope: 'module',
        courseId: courseDoc._id,
        moduleId: moduleDoc._id,
      });
    }

    return NextResponse.json(sanitizeModule(moduleDoc), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
