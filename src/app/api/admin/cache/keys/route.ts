import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern') || '*';

    // For now, return empty keys since we don't have Redis/cache setup
    // This can be expanded when actual caching is implemented
    const cacheKeys: any[] = [];

    return NextResponse.json({
      success: true,
      data: {
        keys: cacheKeys,
        pattern,
        total: cacheKeys.length,
        message: 'Cache service not configured. This is a placeholder endpoint.',
      },
    });
  } catch (error) {
    console.error('Cache keys error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache keys',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}