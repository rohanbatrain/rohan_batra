import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Security: Only allow internal requests from middleware
    const isInternal = request.headers.get('x-internal-request');
    if (!isInternal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find user by Clerk ID and return role
    const user = await User.findOne({ clerkId: userId }).select('role');
    const role = user?.role || 'user';

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ role: 'user' }); // Default to user on error
  }
}
