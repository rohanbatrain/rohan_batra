import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const recommendations = await DashboardService.getRecommendations(
      userId,
      limit
    );

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        summary: {
          total: recommendations.length,
          byCourse: recommendations.filter(r => r.type === 'course').length,
          byBlog: recommendations.filter(r => r.type === 'blog').length,
          byBook: recommendations.filter(r => r.type === 'book').length,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard recommendations API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recommendations',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
