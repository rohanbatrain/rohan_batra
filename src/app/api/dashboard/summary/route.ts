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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeRecommendations =
      searchParams.get('includeRecommendations') !== 'false';
    const recommendationsLimit = parseInt(
      searchParams.get('recommendationsLimit') || '6',
      10
    );

    // Fetch dashboard summary
    const summary = await DashboardService.getSummary(userId, {
      includeRecommendations,
      recommendationsLimit,
    });

    // Enhance with additional computed metrics
    const enhancedSummary = {
      ...summary,
      insights: {
        totalLearningTime: summary.enrolledCourses.reduce((total, course) => {
          return total + (course.progress?.timeSpentSeconds || 0);
        }, 0),
        averageCompletionRate:
          summary.enrolledCourses.length > 0
            ? summary.enrolledCourses.reduce((total, course) => {
                return total + (course.progress?.percentageComplete || 0);
              }, 0) / summary.enrolledCourses.length
            : 0,
        coursesNearCompletion: summary.enrolledCourses.filter(
          course =>
            course.progress &&
            course.progress.percentageComplete >= 80 &&
            course.progress.percentageComplete < 100
        ).length,
        recentActivity: summary.enrolledCourses
          .filter(course => course.enrollment.lastAccessedAt)
          .sort(
            (a, b) =>
              new Date(b.enrollment.lastAccessedAt!).getTime() -
              new Date(a.enrollment.lastAccessedAt!).getTime()
          )
          .slice(0, 5),
      },
      achievements: {
        certificatesEarned: summary.certificates.filter(
          cert => cert.status === 'issued'
        ).length,
        coursesCompleted: summary.enrolledCourses.filter(
          course => course.enrollment.status === 'completed'
        ).length,
        currentStreak: summary.metrics.streak,
        totalCourses: summary.metrics.totalCourses,
      },
    };

    return NextResponse.json({
      success: true,
      data: enhancedSummary,
    });
  } catch (error) {
    console.error('Dashboard summary API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard summary',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
