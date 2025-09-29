import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import { getAuthorizedUser } from '../../../route';
import { ModuleUpdateSchema, sanitizeModule } from '../utils';
import { syncDeckLinkTargets } from '@/lib/flashcards/sync-link-targets';

const ModuleUpdatePayloadSchema = ModuleUpdateSchema.partial();

async function findCourse(courseIdOrSlug: string) {
  if (Types.ObjectId.isValid(courseIdOrSlug)) {
    return CourseModel.findById(courseIdOrSlug);
  }
  return CourseModel.findOne({ slug: courseIdOrSlug });
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

    if (!Types.ObjectId.isValid(params.moduleId)) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const moduleDoc = await CourseModuleModel.findOne({
      _id: new Types.ObjectId(params.moduleId),
      courseId: courseDoc._id,
    }).lean();

    if (!moduleDoc) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const lessons = await CourseLessonModel.find({
      moduleId: moduleDoc._id,
    }).lean();
    const lessonIds = (moduleDoc.lessonIds ?? []).map((id: any) =>
      id.toString()
    );
    const lessonLookup = new Map(
      lessons.map(lesson => [lesson._id.toString(), lesson])
    );

    const orderedLessons = lessonIds
      .map(id => lessonLookup.get(id))
      .filter(Boolean) as any[];
    const remainingLessons = lessons.filter(
      lesson => !lessonIds.includes(lesson._id.toString())
    );

    return NextResponse.json(
      sanitizeModule(moduleDoc, [...orderedLessons, ...remainingLessons])
    );
  } catch (error) {
    console.error('Error fetching module detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    if (!Types.ObjectId.isValid(params.moduleId)) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const moduleDoc = await CourseModuleModel.findOne({
      _id: new Types.ObjectId(params.moduleId),
      courseId: courseDoc._id,
    });

    if (!moduleDoc) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const prevDeckIds = (moduleDoc.flashcardDeckIds ?? []).map(
      id => new Types.ObjectId(id)
    );

    const body = await request.json();
    const parsed = ModuleUpdatePayloadSchema.parse(body);

    if (parsed.title !== undefined) {
      moduleDoc.title = parsed.title;
    }

    if (parsed.summary !== undefined) {
      moduleDoc.summary = parsed.summary?.trim() || undefined;
    }

    if (parsed.order !== undefined) {
      moduleDoc.order = parsed.order;
    }

    if (parsed.estimatedDurationMinutes !== undefined) {
      moduleDoc.estimatedDurationMinutes =
        parsed.estimatedDurationMinutes === null
          ? undefined
          : parsed.estimatedDurationMinutes;
    }

    if (parsed.flashcardDeckIds !== undefined) {
      const nextDeckIds = parsed.flashcardDeckIds
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));

      moduleDoc.flashcardDeckIds = nextDeckIds;

      await syncDeckLinkTargets(prevDeckIds, nextDeckIds, {
        scope: 'module',
        courseId: courseDoc._id,
        moduleId: moduleDoc._id,
      });
    }

    if (parsed.lessonIds !== undefined) {
      const moduleLessons = await CourseLessonModel.find({
        moduleId: moduleDoc._id,
      }).select(['_id']);
      const lessonLookup = new Set(
        moduleLessons.map(lesson => lesson._id.toString())
      );

      const filteredLessonIds = parsed.lessonIds.filter(id =>
        lessonLookup.has(id)
      );
      moduleDoc.lessonIds = filteredLessonIds.map(id => toObjectId(id));
    }

    await moduleDoc.save();

    const lessons = await CourseLessonModel.find({
      moduleId: moduleDoc._id,
    }).lean();
    const moduleLessonIds = (moduleDoc.lessonIds ?? []).map(id =>
      id.toString()
    );
    const lessonMap = new Map(
      lessons.map(lesson => [lesson._id.toString(), lesson])
    );
    const orderedLessons = moduleLessonIds
      .map(id => lessonMap.get(id))
      .filter(Boolean) as any[];
    const remainingLessons = lessons.filter(
      lesson => !moduleLessonIds.includes(lesson._id.toString())
    );

    return NextResponse.json(
      sanitizeModule(moduleDoc, [...orderedLessons, ...remainingLessons])
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (!Types.ObjectId.isValid(params.moduleId)) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const moduleDoc = await CourseModuleModel.findOne({
      _id: new Types.ObjectId(params.moduleId),
      courseId: courseDoc._id,
    });

    if (!moduleDoc) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const lessons = await CourseLessonModel.find({ moduleId: moduleDoc._id });

    const moduleDeckIds = (moduleDoc.flashcardDeckIds ?? []).map(
      id => new Types.ObjectId(id)
    );
    if (moduleDeckIds.length > 0) {
      await syncDeckLinkTargets(moduleDeckIds, [], {
        scope: 'module',
        courseId: courseDoc._id,
        moduleId: moduleDoc._id,
      });
    }

    await Promise.all(
      lessons.map(async lesson => {
        const lessonDeckIds = (lesson.flashcardDeckIds ?? []).map(
          id => new Types.ObjectId(id)
        );
        if (lessonDeckIds.length > 0) {
          await syncDeckLinkTargets(lessonDeckIds, [], {
            scope: 'lesson',
            courseId: courseDoc._id,
            moduleId: moduleDoc._id,
            lessonId: lesson._id,
          });
        }
      })
    );

    await CourseLessonModel.deleteMany({ moduleId: moduleDoc._id });
    await CourseModuleModel.deleteOne({ _id: moduleDoc._id });

    if (lessons.length > 0) {
      courseDoc.lessonCount = Math.max(
        0,
        (courseDoc.lessonCount ?? 0) - lessons.length
      );
      await courseDoc.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
