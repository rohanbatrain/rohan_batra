import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const url = new URL(request.url);
    const slug = (url.searchParams.get('slug') || '').toLowerCase();
    const excludeId = url.searchParams.get('excludeId') || undefined;
    if (!slug) return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
  const filter: any = { slug, deletedAt: { $exists: false } };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await Character.exists(filter);
    return NextResponse.json({ success: true, exists: !!exists });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to check slug' }, { status: 500 });
  }
}
