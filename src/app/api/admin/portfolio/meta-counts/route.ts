import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import ProjectModel from '@/models/Project';
import { currentUser } from '@clerk/nextjs/server';
import type { PipelineStage } from 'mongoose';

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();
    const clerk = await currentUser();
    const email = clerk?.emailAddresses?.[0]?.emailAddress;
    if (!email) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const user = await UserModel.findOne({ email });
    if (!user || user.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const pipeline: PipelineStage[] = [
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 as 1 | -1 } },
    ];
    const byCategory = await (ProjectModel as any).aggregate(pipeline);
    return NextResponse.json({ success: true, data: { byCategory } });
  } catch (e) {
    console.error('admin meta-counts error', e);
    return NextResponse.json({ success: false, error: 'Failed to aggregate' }, { status: 500 });
  }
}
