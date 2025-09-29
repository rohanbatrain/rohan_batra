import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import Project from '@/models/Project';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import User from '@/models/User';
import Book from '@/models/Book';
import Chapter from '@/models/Chapter';
import Character from '@/models/Character';
import LottieAsset from '@/models/LottieAsset';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if user has admin role
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timeframe = searchParams.get('timeframe') || '30d';
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const category = searchParams.get('category');

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      // Calculate date range based on timeframe if no explicit dates provided
      const now = new Date();
      let startDateCalc: Date;

      switch (timeframe) {
        case '24h':
          startDateCalc = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDateCalc = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDateCalc = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDateCalc = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDateCalc = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDateCalc = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      dateFilter = {
        createdAt: { $gte: startDateCalc },
      };
    }

    // Gather comprehensive statistics
    const [
      totalPosts,
      totalProjects,
      totalComments,
      totalLikes,
      totalUsers,
      totalBooks,
      totalChapters,
      totalCharacters,
      totalLottieAssets,
      publishedPosts,
      draftPosts,
      recentPosts,
      recentComments,
      recentBooks,
      topCategories,
      systemMetrics,
      lottieAssetStats,
    ] = await Promise.all([
      // Basic counts
      BlogPost.countDocuments(dateFilter),
      Project.countDocuments(dateFilter),
      Comment.countDocuments(dateFilter),
      Like.countDocuments(dateFilter),
      User.countDocuments(dateFilter),
      Book.countDocuments(dateFilter),
      Chapter.countDocuments(dateFilter),
      Character.countDocuments(dateFilter),
      LottieAsset.countDocuments(dateFilter),

      // Post status breakdown
      BlogPost.countDocuments({ ...dateFilter, published: true }),
      BlogPost.countDocuments({ ...dateFilter, published: false }),

      // Recent activity (last 7 days)
      BlogPost.find({
        ...dateFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug createdAt'),

      Comment.find({
        ...dateFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('content postId authorName createdAt'),

      // Recent books
      Book.find({
        ...dateFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title currentWordCount status createdAt'),

      // Category breakdown
      BlogPost.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // System health metrics
      Promise.resolve({
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      }),

      // Lottie asset statistics
      LottieAsset.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            recent: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
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

    // Calculate growth metrics (comparing with previous period)
    const periodLength =
      startDate && endDate
        ? new Date(endDate).getTime() - new Date(startDate).getTime()
        : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

    const previousPeriodStart = new Date(Date.now() - 2 * periodLength);
    const previousPeriodEnd = new Date(Date.now() - periodLength);

    const [previousPosts, previousComments] = await Promise.all([
      BlogPost.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
      }),
      Comment.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
      }),
    ]);

    const stats = {
      overview: {
        totalPosts,
        totalProjects,
        totalComments,
        totalLikes,
        totalUsers,
        totalBooks,
        totalChapters,
        totalCharacters,
        totalLottieAssets,
        publishedPosts,
        draftPosts,
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        publishedPercentage:
          totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0,
        averageLength: 0, // Will be calculated separately if needed
        growth:
          previousPosts > 0
            ? Math.round(((totalPosts - previousPosts) / previousPosts) * 100)
            : 0,
      },
      books: {
        total: totalBooks,
        chapters: totalChapters,
        characters: totalCharacters,
        recentActivity: recentBooks.map(book => ({
          id: book._id,
          title: book.title,
          wordCount: book.currentWordCount,
          status: book.status,
          createdAt: book.createdAt,
        })),
      },
      activity: {
        recentPosts: recentPosts.map(post => ({
          id: post._id,
          title: post.title,
          slug: post.slug,
          createdAt: post.createdAt,
        })),
        recentComments: recentComments.map(comment => ({
          id: comment._id,
          content: comment.content.substring(0, 100),
          postId: comment.postId,
          authorName: comment.authorName,
          createdAt: comment.createdAt,
        })),
        recentBooks: recentBooks.map(book => ({
          id: book._id,
          title: book.title,
          wordCount: book.currentWordCount,
          status: book.status,
          createdAt: book.createdAt,
        })),
        commentsGrowth:
          previousComments > 0
            ? Math.round(
                ((totalComments - previousComments) / previousComments) * 100
              )
            : 0,
      },
      categories: topCategories.map(cat => ({
        name: cat._id,
        count: cat.count,
        percentage:
          totalPosts > 0 ? Math.round((cat.count / totalPosts) * 100) : 0,
      })),
      media: {
        lottieAssets: {
          total: totalLottieAssets,
          recent: lottieAssetStats[0]?.recent[0]?.count || 0,
          totalSize: lottieAssetStats[0]?.totalSize[0]?.totalSize || 0,
          averageSize:
            totalLottieAssets > 0 &&
            lottieAssetStats[0]?.totalSize[0]?.totalSize
              ? Math.round(
                  lottieAssetStats[0].totalSize[0].totalSize / totalLottieAssets
                )
              : 0,
          byCategory: lottieAssetStats[0]?.byCategory || [],
        },
      },
      system: {
        health: 'good',
        uptime: Math.round(systemMetrics.uptime),
        memoryUsage: {
          rss: Math.round(systemMetrics.memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(
            systemMetrics.memoryUsage.heapUsed / 1024 / 1024
          ), // MB
          heapTotal: Math.round(
            systemMetrics.memoryUsage.heapTotal / 1024 / 1024
          ), // MB
        },
        nodeVersion: systemMetrics.nodeVersion,
        timestamp: systemMetrics.timestamp,
        databaseStatus: 'connected',
      },
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
        generated: new Date().toISOString(),
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
