import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Braindump from '@/models/Braindump';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { checkRateLimit, authenticatedApiLimiter } from '@/lib/ratelimit';

// GET /api/analytics/braindump/[id] - Get analytics for a braindump
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(authenticatedApiLimiter, userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid braindump ID',
        },
        { status: 400 }
      );
    }

    // Find braindump and verify ownership
    const braindump = await Braindump.findById(id);

    if (!braindump) {
      return NextResponse.json(
        {
          success: false,
          error: 'Braindump not found',
        },
        { status: 404 }
      );
    }

    // Check if user can view analytics (owner only for now)
    const canView = await braindump.canView(userId);
    if (!canView) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to view analytics for this braindump',
        },
        { status: 403 }
      );
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get event counts by type
    const eventCounts = await AnalyticsEvent.aggregate([
      {
        $match: {
          braindumpId: new Types.ObjectId(id),
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const countsByType: Record<string, number> = {};
    eventCounts.forEach((e) => {
      countsByType[e._id] = e.count;
    });

    // Get unique view count
    const uniqueViews = await AnalyticsEvent.distinct('userId', {
      braindumpId: new Types.ObjectId(id),
      type: 'view',
      timestamp: { $gte: startDate },
    });

    // Get daily timeline
    const timeline = await AnalyticsEvent.aggregate([
      {
        $match: {
          braindumpId: new Types.ObjectId(id),
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          views: {
            $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] },
          },
          shares: {
            $sum: { $cond: [{ $eq: ['$type', 'share_link'] }, 1, 0] },
          },
          comments: {
            $sum: { $cond: [{ $eq: ['$type', 'comment'] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get top referrers
    const referrers = await AnalyticsEvent.aggregate([
      {
        $match: {
          braindumpId: new Types.ObjectId(id),
          type: 'view',
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$metadata.referrer',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        braindumpId: id,
        period: `${days} days`,
        totalViews: countsByType['view'] || 0,
        uniqueViews: uniqueViews.length,
        totalShares: (countsByType['share_link'] || 0) + (countsByType['share_twitter'] || 0) + (countsByType['share_linkedin'] || 0),
        totalComments: countsByType['comment'] || 0,
        totalReactions: countsByType['reaction'] || 0,
        eventCounts: countsByType,
        timeline,
        topReferrers: referrers.map((r) => ({
          referrer: r._id || 'direct',
          count: r.count,
        })),
        publicMetadata: braindump.publicMetadata,
      },
    });
  } catch (error) {
    console.error('Error fetching braindump analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
