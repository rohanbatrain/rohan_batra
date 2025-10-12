import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import Braindump from '@/models/Braindump';
import { checkRateLimit, publicApiLimiter, getCachedTrendingBraindumps, cacheTrendingBraindumps } from '@/lib/ratelimit';
import { TrendingQuerySchema } from '@/types/analytics';

// GET /api/analytics/trending - Get trending braindumps
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    const rateLimitResult = await checkRateLimit(publicApiLimiter, identifier);

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

    const { searchParams } = new URL(request.url);
    
    // Validate query params
    const validationResult = TrendingQuerySchema.safeParse({
      period: searchParams.get('period') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { period = '7d', limit = 10 } = validationResult.data;

    // Check cache first
    const cached = await getCachedTrendingBraindumps(period);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: {
          period,
          trending: cached,
          cached: true,
        },
      });
    }

    // Calculate time range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    // Calculate trending score based on views, shares, comments, reactions
    // Score = (views * 1) + (shares * 5) + (comments * 3) + (reactions * 2)
    const trendingBraindumps = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          type: { $in: ['view', 'share_link', 'share_twitter', 'share_linkedin', 'comment', 'reaction'] },
        },
      },
      {
        $group: {
          _id: '$braindumpId',
          views: {
            $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] },
          },
          shares: {
            $sum: {
              $cond: [
                { $in: ['$type', ['share_link', 'share_twitter', 'share_linkedin']] },
                1,
                0,
              ],
            },
          },
          comments: {
            $sum: { $cond: [{ $eq: ['$type', 'comment'] }, 1, 0] },
          },
          reactions: {
            $sum: { $cond: [{ $eq: ['$type', 'reaction'] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ['$views', 1] },
              { $multiply: ['$shares', 5] },
              { $multiply: ['$comments', 3] },
              { $multiply: ['$reactions', 2] },
            ],
          },
        },
      },
      {
        $sort: { trendingScore: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    // Get braindump details
    const braindumpIds = trendingBraindumps.map((t) => t._id);
    const braindumps = await Braindump.find({
      _id: { $in: braindumpIds },
      visibility: { $in: ['public', 'unlisted'] },
    }).select('_id content slug tags visibility publicMetadata createdAt');

    // Merge data
    const trendingWithDetails = trendingBraindumps.map((t) => {
      const braindump = braindumps.find((b) => b._id.toString() === t._id.toString());
      
      if (!braindump) return null;

      return {
        braindumpId: t._id.toString(),
        slug: braindump.slug,
        content: braindump.content.substring(0, 200) + '...',
        tags: braindump.tags,
        trendingScore: t.trendingScore,
        views: t.views,
        shares: t.shares,
        comments: t.comments,
        reactions: t.reactions,
        visibility: braindump.visibility,
        createdAt: braindump.createdAt,
      };
    }).filter(Boolean);

    // Cache results
    await cacheTrendingBraindumps(period, trendingWithDetails);

    return NextResponse.json({
      success: true,
      data: {
        period,
        trending: trendingWithDetails,
        cached: false,
      },
    });
  } catch (error) {
    console.error('Error fetching trending braindumps:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending braindumps',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
