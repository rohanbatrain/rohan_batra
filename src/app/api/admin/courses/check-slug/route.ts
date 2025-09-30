import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import { auth } from '@clerk/nextjs/server';
import { getAuthorizedUser } from '@/app/api/admin/courses/route';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await CourseModel.findOne({ slug }).select(['_id']).lean();
    const isAvailable = !existing;
    return NextResponse.json({ isAvailable });
  } catch (error) {
    console.error('Error checking course slug:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
