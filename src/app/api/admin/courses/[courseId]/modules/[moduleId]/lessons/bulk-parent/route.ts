import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import { getAuthorizedUser } from '../../../../../route';

const BulkSchema = z.object({
  lessonIds: z.array(z.string()).min(1),
  parentLessonId: z.string().nullable().optional(),
});

async function findCourse(courseIdOrSlug: string) {
  if (Types.ObjectId.isValid(courseIdOrSlug)) {
    return CourseModel.findById(courseIdOrSlug);
  }
  return CourseModel.findOne({ slug: courseIdOrSlug });
}

async function findModule(courseId: Types.ObjectId, moduleId: string) {
  if (!Types.ObjectId.isValid(moduleId)) return null;
  return CourseModuleModel.findOne({ _id: new Types.ObjectId(moduleId), courseId });
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await ctx.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const courseDoc = await findCourse(courseId);
    if (!courseDoc) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    const moduleDoc = await findModule(courseDoc._id, moduleId);
    if (!moduleDoc) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

    const body = await request.json();
    const parsed = BulkSchema.parse(body);
    const ids = parsed.lessonIds
      .filter((id: string) => Types.ObjectId.isValid(id))
      .map((id: string) => new Types.ObjectId(id));
    if (ids.length === 0) return NextResponse.json({ error: 'No valid lesson IDs' }, { status: 400 });

    let parentId: Types.ObjectId | undefined;
    if (parsed.parentLessonId) {
      if (!Types.ObjectId.isValid(parsed.parentLessonId)) {
        return NextResponse.json({ error: 'Invalid parent lesson' }, { status: 400 });
      }
      const parent = await CourseLessonModel.findOne({ _id: new Types.ObjectId(parsed.parentLessonId), courseId: courseDoc._id }).lean();
      if (!parent) return NextResponse.json({ error: 'Parent lesson not found' }, { status: 404 });
      if (parent.moduleId.toString() !== moduleDoc._id.toString()) {
        return NextResponse.json({ error: 'Parent lesson must be in the same module' }, { status: 400 });
      }
      parentId = new Types.ObjectId(parsed.parentLessonId);
    }

    // Ensure all targeted lessons are in this course/module
    const lessons = await CourseLessonModel.find({
      _id: { $in: ids },
      courseId: courseDoc._id,
      moduleId: moduleDoc._id,
    }).select(['_id']).lean();
    const allowed = new Set(lessons.map(l => l._id.toString()));
    const safeIds = ids.filter(id => allowed.has(id.toString()));
    if (safeIds.length === 0) return NextResponse.json({ error: 'No lessons found to update' }, { status: 404 });

    // Prevent self-parent if only one id equals parent
    if (parentId && safeIds.some(id => id.toString() === parentId!.toString())) {
      return NextResponse.json({ error: 'A lesson cannot be its own parent' }, { status: 400 });
    }

    // Find previous parents of these lessons to clean up childOrder if needed
    const prevParentDocs = await CourseLessonModel.find({
      _id: { $in: safeIds },
    })
      .select(['_id', 'parentLessonId'])
      .lean();
    const prevParentIds = Array.from(
      new Set(
        prevParentDocs
          .map(d => d.parentLessonId?.toString())
          .filter(
            (v): v is string =>
              Boolean(v) && (!parentId || v !== parentId.toString())
          )
      )
    ).map(id => new Types.ObjectId(id));

    // Remove selected lessons from any previous parents' childOrder arrays (excluding the new parent if same)
    if (prevParentIds.length > 0) {
      await CourseLessonModel.updateMany(
        { _id: { $in: prevParentIds } },
        { $pull: { childOrder: { $in: safeIds } } }
      );
    }

    // Apply parent to all selected lessons
    await CourseLessonModel.updateMany(
      { _id: { $in: safeIds } },
      { $set: { parentLessonId: parentId || null } }
    );

    // If parent is set, update its childOrder to include the selected lessons appended
    if (parentId) {
      const parent = await CourseLessonModel.findById(parentId);
      if (parent) {
        const current = (parent.childOrder ?? []).map(id => id.toString());
        const additions = safeIds
          .map(id => id.toString())
          .filter(id => !current.includes(id));
        parent.childOrder = [
          ...(parent.childOrder ?? []),
          ...additions.map(id => new Types.ObjectId(id)),
        ];
        await parent.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Bulk parent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
