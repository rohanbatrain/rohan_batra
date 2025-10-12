import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BraindumpModel from '@/models/Braindump';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/admin/braindump/[id]/backlinks
 * Get braindumps that link to this one
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid braindump ID' }, { status: 400 });
    }

    await connectToDatabase();

    const user = (await User.findOne({ clerkId }).lean()) as { _id: mongoose.Types.ObjectId } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;

    // Find braindumps that link to this one
    const backlinks = await BraindumpModel.find({
      userId,
      linkedTo: id,
    })
      .select('_id content tags priority status createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ backlinks });
  } catch (error: any) {
    console.error('Backlinks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backlinks', details: error.message },
      { status: 500 }
    );
  }
}
