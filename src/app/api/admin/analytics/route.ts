import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import Project from '@/models/Project';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import User from '@/models/User';
import LottieAsset from '@/models/LottieAsset';
import Book from '@/models/Book';
import Chapter from '@/models/Chapter';
import Character from '@/models/Character';
import CharacterJournal from '@/models/CharacterJournal';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current user and check permissions
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || !['admin', 'editor'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const includeCache = searchParams.get('includeCache') === 'true';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Content statistics
    const [
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      totalProjects,
      featuredProjects,
      totalBooks,
      publishedBooks,
      totalChapters,
      totalCharacters,
      totalCharacterJournals,
      totalComments,
      pendingComments,
      approvedComments,
      totalLikes,
      totalUsers,
      activeUsers,
      adminUsers,
      editorUsers,
      totalLottieAssets,
      recentBlogPosts,
      recentProjects,
      recentComments,
      recentUsers,
      topLikedContent,
      engagementStats,
    ] = await Promise.all([
      // Blog statistics
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' }),

      // Portfolio statistics
      Project.countDocuments(),
      Project.countDocuments({ featured: true }),

      // Book statistics
      Book.countDocuments(),
      Book.countDocuments({ status: 'published' }),
      Chapter.countDocuments(),
      Character.countDocuments(),
      CharacterJournal.countDocuments(),

      // Comment statistics
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Comment.countDocuments({ status: 'approved' }),

      // Like statistics
      Like.countDocuments(),

      // User statistics
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: startDate } }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'editor' }),

      // Asset statistics
      LottieAsset.countDocuments(),

      // Recent content
      BlogPost.find({ createdAt: { $gte: startDate } })
        .select('title status createdAt author')
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),

      Project.find({ createdAt: { $gte: startDate } })
        .select('title featured createdAt')
        .sort({ createdAt: -1 })
        .limit(5),

      Comment.find({ createdAt: { $gte: startDate } })
        .select('content status createdAt author contentType contentId')
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),

      User.find({ createdAt: { $gte: startDate } })
        .select('name email role createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .limit(5),

      // Top liked content (aggregate)
      Like.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$contentId',
            count: { $sum: 1 },
            contentType: { $first: '$contentType' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Engagement statistics
      Comment.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    // Activity trends (daily activity over time)
    const activityTrends = await BlogPost.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          posts: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Popular content (by likes + comments)
    const popularContent = await BlogPost.aggregate([
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'contentId',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'contentId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          engagement: { $add: [{ $size: '$likes' }, { $size: '$comments' }] },
        },
      },
      { $sort: { engagement: -1 } },
      { $limit: 10 },
      {
        $project: {
          title: 1,
          slug: 1,
          status: 1,
          engagement: 1,
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
          createdAt: 1,
        },
      },
    ]);

    // Cache statistics (if Redis is available and requested)
    let cacheStats = null;
    if (includeCache) {
      try {
        const redis = getRedisClient();
        if (redis) {
          const info = await redis.info('memory');
          const keyspace = await redis.info('keyspace');
          const dbsize = await redis.dbsize();

          cacheStats = {
            connected: true,
            memoryUsage:
              info.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'Unknown',
            totalKeys: dbsize,
            keyspaceInfo: keyspace,
            hitRatio: 'Available via Redis INFO stats',
          };
        }
      } catch {
        cacheStats = {
          connected: false,
          error: 'Redis connection failed',
        };
      }
    }

    // Performance metrics
    const performanceMetrics = {
      avgPostsPerDay:
        totalBlogPosts /
        Math.max(
          1,
          Math.ceil(
            (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
          )
        ),
      engagementRate:
        totalComments > 0 ? totalLikes / (totalBlogPosts + totalProjects) : 0,
      userRetention: activeUsers / Math.max(1, totalUsers),
      contentApprovalRate:
        totalComments > 0 ? approvedComments / totalComments : 1,
    };

    const analytics = {
      overview: {
        timeframe,
        dateRange: { start: startDate.toISOString(), end: now.toISOString() },
      },
      content: {
        blogPosts: {
          total: totalBlogPosts,
          published: publishedBlogPosts,
          drafts: draftBlogPosts,
          publishedPercentage:
            totalBlogPosts > 0
              ? Math.round((publishedBlogPosts / totalBlogPosts) * 100)
              : 0,
        },
        projects: {
          total: totalProjects,
          featured: featuredProjects,
          featuredPercentage:
            totalProjects > 0
              ? Math.round((featuredProjects / totalProjects) * 100)
              : 0,
        },
        books: {
          total: totalBooks,
          published: publishedBooks,
          chapters: totalChapters,
          characters: totalCharacters,
          characterJournals: totalCharacterJournals,
          avgChaptersPerBook:
            totalBooks > 0 ? Math.round(totalChapters / totalBooks) : 0,
        },
        assets: {
          lottieAnimations: totalLottieAssets,
        },
      },
      engagement: {
        comments: {
          total: totalComments,
          pending: pendingComments,
          approved: approvedComments,
          approvalRate:
            totalComments > 0
              ? Math.round((approvedComments / totalComments) * 100)
              : 100,
        },
        likes: {
          total: totalLikes,
          avgPerContent:
            totalBlogPosts + totalProjects > 0
              ? Math.round(
                  (totalLikes / (totalBlogPosts + totalProjects)) * 10
                ) / 10
              : 0,
        },
        trends: engagementStats.map(stat => ({
          date: stat._id,
          comments: stat.count,
        })),
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        editors: editorUsers,
        regularUsers: totalUsers - adminUsers - editorUsers,
        activityRate:
          totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      },
      performance: performanceMetrics,
      recentActivity: {
        blogPosts: recentBlogPosts,
        projects: recentProjects,
        comments: recentComments,
        users: recentUsers,
      },
      trends: {
        activity: activityTrends.map(trend => ({
          date: trend._id,
          posts: trend.posts,
        })),
        popular: popularContent,
        topLiked: topLikedContent,
      },
      ...(cacheStats && { cache: cacheStats }),
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for recording custom analytics events
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current user and check permissions
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || !['admin', 'editor'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { event, data, category } = body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Store custom analytics event in Redis with TTL
    try {
      const redis = getRedisClient();
      if (redis) {
        const eventKey = `analytics:events:${category || 'custom'}:${event}`;
        const eventData = {
          event,
          category: category || 'custom',
          data: data || {},
          userId: currentUser._id,
          timestamp: new Date().toISOString(),
        };

        // Store event with 90-day TTL
        await redis.setex(
          `${eventKey}:${Date.now()}`,
          90 * 24 * 60 * 60, // 90 days
          JSON.stringify(eventData)
        );

        // Increment event counter
        await redis.incr(`${eventKey}:count`);
        await redis.expire(`${eventKey}:count`, 90 * 24 * 60 * 60);
      }
    } catch (error) {
      console.warn('Failed to store analytics event in Redis:', error);
      // Continue without Redis - not critical for main functionality
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics event recorded',
    });
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record analytics event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
