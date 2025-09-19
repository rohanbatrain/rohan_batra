import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const now = new Date();

    const updated = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $inc: { loginCount: 1 },
        $set: { lastLoginAt: now, lastActiveAt: now },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[track-login] error:', error);
    return NextResponse.json(
      { error: 'Failed to track login' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';