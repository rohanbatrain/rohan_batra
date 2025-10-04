import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';

// Debug endpoint to check what's actually in the database
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get the full user document
    const user = await UserModel.findOne({ clerkId: userId }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      clerkId: (user as any).clerkId,
      email: (user as any).email,
      preferences: (user as any).preferences,
      fullUser: user, // Include full document for debugging
    });
  } catch (error) {
    console.error('Error fetching user debug info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
