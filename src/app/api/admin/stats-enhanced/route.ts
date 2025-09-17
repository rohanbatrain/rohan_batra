import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import Project from '@/models/Project';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import User from '@/models/User';
import LottieAsset from '@/models/LottieAsset';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user and check admin permissions
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const includeDetails = url.searchParams.get('includeDetails') === 'true';
    const category = url.searchParams.get('category');

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
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

    // Build aggregation pipelines for different content types
    const contentStats = await Promise.all([
      // Blog post statistics
      BlogPost.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            published: [
              { $match: { status: 'published' } },
              { $count: 'count' },
            ],
            draft: [{ $match: { status: 'draft' } }, { $count: 'count' }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: 'count' },
            ],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            byCategory: [
              { $unwind: '$categories' },
              { $group: { _id: '$categories', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
            topViewed: [
              { $sort: { 'analytics.views': -1 } },
              { $limit: 5 },
              { $project: { title: 1, slug: 1, 'analytics.views': 1 } },
            ],
          },
        },
      ]),

      // Project statistics
      Project.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            published: [
              { $match: { status: 'published' } },
              { $count: 'count' },
            ],
            draft: [{ $match: { status: 'draft' } }, { $count: 'count' }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: 'count' },
            ],
            byTechnology: [
              { $unwind: '$technologies' },
              { $group: { _id: '$technologies', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
            topViewed: [
              { $sort: { 'analytics.views': -1 } },
              { $limit: 5 },
              { $project: { title: 1, slug: 1, 'analytics.views': 1 } },
            ],
          },
        },
      ]),

      // Comment statistics
      Comment.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            approved: [{ $match: { status: 'approved' } }, { $count: 'count' }],
            pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
            spam: [{ $match: { status: 'spam' } }, { $count: 'count' }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: 'count' },
            ],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),

      // User statistics
      User.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            admins: [{ $match: { role: 'admin' } }, { $count: 'count' }],
            editors: [{ $match: { role: 'editor' } }, { $count: 'count' }],
            users: [{ $match: { role: 'user' } }, { $count: 'count' }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: 'count' },
            ],
            byRole: [
              { $group: { _id: '$role', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            active: [
              { $match: { lastLoginAt: { $gte: startDate } } },
              { $count: 'count' },
            ],
          },
        },
      ]),

      // Like statistics
      Like.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: 'count' },
            ],
            byType: [
              { $group: { _id: '$contentType', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),

      // Lottie asset statistics
      LottieAsset.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: 'count' },
            ],
            totalSize: [
              { $group: { _id: null, totalSize: { $sum: '$fileSize' } } },
            ],
            byCategory: [
              { $group: { _id: '$metadata.category', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),
    ]);

    const [
      blogStats,
      projectStats,
      commentStats,
      userStats,
      likeStats,
      lottieStats,
    ] = contentStats;

    // Helper function to get count from aggregation result
    const getCount = (result: Array<{ count: number }>) =>
      result[0]?.count || 0;

    // Build response based on category filter
    const response: Record<string, unknown> = {
      success: true,
      timeframe,
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    if (!category || category === 'overview') {
      response.overview = {
        totalContent:
          getCount(blogStats[0].total) + getCount(projectStats[0].total),
        totalBlogPosts: getCount(blogStats[0].total),
        totalProjects: getCount(projectStats[0].total),
        totalComments: getCount(commentStats[0].total),
        totalUsers: getCount(userStats[0].total),
        totalLikes: getCount(likeStats[0].total),
        totalAssets: getCount(lottieStats[0].total),
        recentActivity: {
          newPosts: getCount(blogStats[0].recent),
          newProjects: getCount(projectStats[0].recent),
          newComments: getCount(commentStats[0].recent),
          newUsers: getCount(userStats[0].recent),
          newLikes: getCount(likeStats[0].recent),
        },
      };
    }

    if (!category || category === 'content') {
      response.content = {
        blogPosts: {
          total: getCount(blogStats[0].total),
          published: getCount(blogStats[0].published),
          draft: getCount(blogStats[0].draft),
          recent: getCount(blogStats[0].recent),
          byStatus: blogStats[0].byStatus,
          byCategory: blogStats[0].byCategory,
          topViewed: includeDetails ? blogStats[0].topViewed : undefined,
        },
        projects: {
          total: getCount(projectStats[0].total),
          published: getCount(projectStats[0].published),
          draft: getCount(projectStats[0].draft),
          recent: getCount(projectStats[0].recent),
          byTechnology: projectStats[0].byTechnology,
          topViewed: includeDetails ? projectStats[0].topViewed : undefined,
        },
      };
    }

    if (!category || category === 'engagement') {
      response.engagement = {
        comments: {
          total: getCount(commentStats[0].total),
          approved: getCount(commentStats[0].approved),
          pending: getCount(commentStats[0].pending),
          spam: getCount(commentStats[0].spam),
          recent: getCount(commentStats[0].recent),
          byStatus: commentStats[0].byStatus,
        },
        likes: {
          total: getCount(likeStats[0].total),
          recent: getCount(likeStats[0].recent),
          byType: likeStats[0].byType,
        },
      };
    }

    if (!category || category === 'users') {
      response.users = {
        total: getCount(userStats[0].total),
        admins: getCount(userStats[0].admins),
        editors: getCount(userStats[0].editors),
        users: getCount(userStats[0].users),
        recent: getCount(userStats[0].recent),
        active: getCount(userStats[0].active),
        byRole: userStats[0].byRole,
      };
    }

    if (!category || category === 'media') {
      const totalSize = lottieStats[0].totalSize[0]?.totalSize || 0;
      response.media = {
        lottieAssets: {
          total: getCount(lottieStats[0].total),
          recent: getCount(lottieStats[0].recent),
          totalSize: totalSize,
          averageSize:
            getCount(lottieStats[0].total) > 0
              ? Math.round(totalSize / getCount(lottieStats[0].total))
              : 0,
          byCategory: lottieStats[0].byCategory,
        },
      };
    }

    // Add metadata if details are requested
    if (includeDetails) {
      response.metadata = {
        queryPerformance: {
          executionTime: Date.now() - now.getTime(),
          queriesExecuted: 6,
          cacheHit: false,
        },
        dataFreshness: {
          lastContentUpdate: await getLastContentUpdate(),
          lastUserActivity: await getLastUserActivity(),
        },
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getLastContentUpdate(): Promise<string> {
  const lastBlogPost = await BlogPost.findOne(
    {},
    {},
    { sort: { updatedAt: -1 } }
  );
  const lastProject = await Project.findOne(
    {},
    {},
    { sort: { updatedAt: -1 } }
  );

  const lastBlogUpdate = lastBlogPost?.updatedAt || new Date(0);
  const lastProjectUpdate = lastProject?.updatedAt || new Date(0);

  return lastBlogUpdate > lastProjectUpdate
    ? lastBlogUpdate.toISOString()
    : lastProjectUpdate.toISOString();
}

async function getLastUserActivity(): Promise<string> {
  const lastComment = await Comment.findOne(
    {},
    {},
    { sort: { createdAt: -1 } }
  );
  const lastLike = await Like.findOne({}, {}, { sort: { createdAt: -1 } });

  const lastCommentTime = lastComment?.createdAt || new Date(0);
  const lastLikeTime = lastLike?.createdAt || new Date(0);

  return lastCommentTime > lastLikeTime
    ? lastCommentTime.toISOString()
    : lastLikeTime.toISOString();
}
