import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import TryHackMeRoomModel from '@/models/TryHackMeRoom';
import UserModel from '@/models/User';

async function assertEditorOrAdmin(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId }).select(['role']).lean();
  const role = (currentUser as any)?.role || 'user';
  return { ok: role === 'editor' || role === 'admin' } as const;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authz = await assertEditorOrAdmin(userId);
  if (!authz.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectToDatabase();

  const body = await request.json();
  const update: any = {};
  for (const key of ['title','thmRoomId','slug','link','difficulty','points','completedAt','tags']) {
    if (key in body) update[key] = body[key];
  }
  const updated = await TryHackMeRoomModel.findByIdAndUpdate(params.id, update, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ room: { ...(updated.toJSON() as any), _id: updated._id.toString() } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authz = await assertEditorOrAdmin(userId);
  if (!authz.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectToDatabase();
  const res = await TryHackMeRoomModel.deleteOne({ _id: params.id });
  if (res.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: 1 });
}
