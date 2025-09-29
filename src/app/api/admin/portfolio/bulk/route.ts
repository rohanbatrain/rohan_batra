import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required for bulk deletion' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const permanent = !!body?.permanent;
    const toTrash = !!body?.toTrash;

    if (!ids.length) {
      return NextResponse.json(
        { success: false, error: 'No ids provided' },
        { status: 400 }
      );
    }

    if (permanent) {
      const res = await Project.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({
        success: true,
        deletedCount: res.deletedCount || 0,
      });
    }

    // Soft delete -> perform per-document updates in a transaction so we can add per-project audit entries
    const session = await Project.startSession();
    let modifiedCount = 0;
    try {
      session.startTransaction();
      const currentTime = new Date();

      for (const id of ids) {
        const project = await Project.findById(id).session(session);
        if (!project) continue;

        project.deletedAt = currentTime;
        project.deletedBy = user._id;
        project.status = 'archived';

        project.audit = project.audit || {};
        project.audit.log = project.audit.log || [];
        project.audit.log.push({
          action: toTrash ? 'moved_to_trash' : 'soft_deleted',
          userId: user._id,
          userName: user.name,
          timestamp: currentTime,
          metadata: {
            reason: toTrash ? 'Move to trash' : 'Admin bulk deletion',
            projectId: id,
            title: project.title,
          },
        });

        await project.save({ session });
        modifiedCount++;
      }

      await session.commitTransaction();
      session.endSession();
      return NextResponse.json({ success: true, modifiedCount });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Bulk soft-delete transaction failed', err);
      return NextResponse.json(
        {
          success: false,
          error: 'Bulk soft-delete failed',
          details: String(err),
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Bulk delete error', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk delete',
        details: String(err),
      },
      { status: 500 }
    );
  }
}
