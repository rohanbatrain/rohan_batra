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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      200
    ); // Max 200 items
    const timeframe = url.searchParams.get('timeframe') || '7d';
    const activityType = url.searchParams.get('activityType');
    const userId_filter = url.searchParams.get('userId');
    const includeDetails = url.searchParams.get('includeDetails') === 'true';
    const sortBy = url.searchParams.get('sortBy') || 'timestamp';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
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
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build base filter
    const baseFilter = {
      createdAt: { $gte: startDate, $lte: now },
      ...(userId_filter && { userId: userId_filter }),
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Define activity types and their data sources
    const activityTypes = [
      'content_created',
      'content_updated',
      'content_published',
      'content_deleted',
      'comment_created',
      'comment_approved',
      'comment_rejected',
      'comment_deleted',
      'user_registered',
      'user_login',
      'user_role_changed',
      'user_deleted',
      'media_uploaded',
      'media_deleted',
      'settings_updated',
      'backup_created',
      'system_event',
    ];

    // Gather activity data from different sources
    const activities: Record<string, unknown>[] = [];

    // Blog post activities
    if (
      !activityType ||
      ['content_created', 'content_updated', 'content_published'].includes(
        activityType
      )
    ) {
      const blogPosts = await BlogPost.find(baseFilter)
        .populate('authorId', 'name email')
        .sort({
          [sortBy === 'timestamp' ? 'createdAt' : sortBy]:
            sortOrder === 'desc' ? -1 : 1,
        })
        .limit(limit * 2) // Get more to filter properly
        .select(
          'title slug status createdAt updatedAt publishedAt authorId categories analytics'
        );

      blogPosts.forEach(post => {
        // Content created
        if (!activityType || activityType === 'content_created') {
          activities.push({
            id: `blog_created_${post._id}`,
            type: 'content_created',
            timestamp: post.createdAt,
            userId: post.authorId?._id,
            userName: post.authorId?.name || 'Unknown',
            userEmail: post.authorId?.email,
            action: 'created',
            resource: {
              type: 'blog_post',
              id: post._id,
              title: post.title,
              slug: post.slug,
            },
            metadata: {
              category: post.category,
              status: post.status,
              views: post.analytics?.views || 0,
            },
            severity: 'info',
            ipAddress: '127.0.0.1', // Would come from request in real implementation
            userAgent: 'Admin Dashboard',
          });
        }

        // Content published (if published date exists and differs from created)
        if (
          (!activityType || activityType === 'content_published') &&
          post.publishedAt &&
          post.publishedAt > post.createdAt
        ) {
          activities.push({
            id: `blog_published_${post._id}`,
            type: 'content_published',
            timestamp: post.publishedAt,
            userId: post.authorId?._id,
            userName: post.authorId?.name || 'Unknown',
            userEmail: post.authorId?.email,
            action: 'published',
            resource: {
              type: 'blog_post',
              id: post._id,
              title: post.title,
              slug: post.slug,
            },
            metadata: {
              previousStatus: 'draft',
              newStatus: 'published',
            },
            severity: 'info',
            ipAddress: '127.0.0.1',
            userAgent: 'Admin Dashboard',
          });
        }
      });
    }

    // Project activities
    if (
      !activityType ||
      ['content_created', 'content_updated'].includes(activityType)
    ) {
      const projects = await Project.find(baseFilter)
        .sort({
          [sortBy === 'timestamp' ? 'createdAt' : sortBy]:
            sortOrder === 'desc' ? -1 : 1,
        })
        .limit(limit)
        .select('title slug status createdAt updatedAt technologies analytics');

      projects.forEach(project => {
        activities.push({
          id: `project_created_${project._id}`,
          type: 'content_created',
          timestamp: project.createdAt,
          userId: null, // Projects might not have specific authors
          userName: 'System',
          userEmail: null,
          action: 'created',
          resource: {
            type: 'portfolio_project',
            id: project._id,
            title: project.title,
            slug: project.slug,
          },
          metadata: {
            technologies: project.technologies,
            status: project.status,
            views: project.analytics?.views || 0,
          },
          severity: 'info',
          ipAddress: '127.0.0.1',
          userAgent: 'Admin Dashboard',
        });
      });
    }

    // Comment activities
    if (
      !activityType ||
      ['comment_created', 'comment_approved', 'comment_rejected'].includes(
        activityType
      )
    ) {
      const comments = await Comment.find(baseFilter)
        .populate('postId', 'title')
        .sort({
          [sortBy === 'timestamp' ? 'createdAt' : sortBy]:
            sortOrder === 'desc' ? -1 : 1,
        })
        .limit(limit)
        .select(
          'content authorName authorEmail status createdAt postId parentId'
        );

      comments.forEach(comment => {
        activities.push({
          id: `comment_created_${comment._id}`,
          type: 'comment_created',
          timestamp: comment.createdAt,
          userId: null, // Comments might not have registered user IDs
          userName: comment.authorName || 'Anonymous',
          userEmail: comment.authorEmail,
          action: 'created',
          resource: {
            type: 'comment',
            id: comment._id,
            content: comment.content.substring(0, 100) + '...',
            postTitle:
              comment.postId &&
              typeof comment.postId === 'object' &&
              'title' in comment.postId
                ? (comment.postId as { title: string }).title
                : 'Unknown Post',
          },
          metadata: {
            status: comment.status,
            isReply: !!comment.parentId,
            length: comment.content.length,
          },
          severity: comment.status === 'spam' ? 'warning' : 'info',
          ipAddress: '127.0.0.1',
          userAgent: 'Web Browser',
        });
      });
    }

    // User activities
    if (
      !activityType ||
      ['user_registered', 'user_role_changed'].includes(activityType)
    ) {
      const users = await User.find(baseFilter)
        .sort({
          [sortBy === 'timestamp' ? 'createdAt' : sortBy]:
            sortOrder === 'desc' ? -1 : 1,
        })
        .limit(limit)
        .select('name email role createdAt lastLoginAt');

      users.forEach(userDoc => {
        activities.push({
          id: `user_registered_${userDoc._id}`,
          type: 'user_registered',
          timestamp: userDoc.createdAt,
          userId: userDoc._id,
          userName: userDoc.name,
          userEmail: userDoc.email,
          action: 'registered',
          resource: {
            type: 'user',
            id: userDoc._id,
            name: userDoc.name,
            email: userDoc.email,
          },
          metadata: {
            role: userDoc.role,
            hasLoggedIn: !!userDoc.lastLoginAt,
          },
          severity: 'info',
          ipAddress: '127.0.0.1',
          userAgent: 'Registration Form',
        });
      });
    }

    // Like activities
    if (!activityType || activityType === 'engagement') {
      const likes = await Like.find(baseFilter)
        .populate('userId', 'name email')
        .sort({
          [sortBy === 'timestamp' ? 'createdAt' : sortBy]:
            sortOrder === 'desc' ? -1 : 1,
        })
        .limit(limit)
        .select('contentType contentId userId createdAt');

      likes.forEach(like => {
        activities.push({
          id: `like_added_${like._id}`,
          type: 'engagement',
          timestamp: like.createdAt,
          userId: like.userId?._id,
          userName:
            like.userId &&
            typeof like.userId === 'object' &&
            'name' in like.userId
              ? (like.userId as { name: string }).name
              : 'Anonymous',
          userEmail:
            like.userId &&
            typeof like.userId === 'object' &&
            'email' in like.userId
              ? (like.userId as { email: string }).email
              : undefined,
          action: 'liked',
          resource: {
            type: like.targetType,
            id: like.targetId,
          },
          metadata: {
            contentType: like.targetType,
          },
          severity: 'info',
          ipAddress: '127.0.0.1',
          userAgent: 'Web Browser',
        });
      });
    }

    // Lottie asset activities
    if (!activityType || activityType === 'media_uploaded') {
      const assets = await LottieAsset.find(baseFilter)
        .sort({
          [sortBy === 'timestamp' ? 'createdAt' : sortBy]:
            sortOrder === 'desc' ? -1 : 1,
        })
        .limit(limit)
        .select('name fileSize metadata createdAt');

      assets.forEach(asset => {
        activities.push({
          id: `asset_uploaded_${asset._id}`,
          type: 'media_uploaded',
          timestamp: asset.createdAt,
          userId: null,
          userName: 'System',
          userEmail: null,
          action: 'uploaded',
          resource: {
            type: 'lottie_asset',
            id: asset._id,
            name: asset.name,
          },
          metadata: {
            fileSize: asset.fileSize,
            category: asset.metadata?.category,
          },
          severity: 'info',
          ipAddress: '127.0.0.1',
          userAgent: 'Admin Dashboard',
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp as string | number | Date).getTime();
      const timeB = new Date(b.timestamp as string | number | Date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    // Apply pagination after sorting
    const paginatedActivities = activities.slice(skip, skip + limit);

    // Calculate summary statistics
    const totalActivities = activities.length;
    const totalPages = Math.ceil(totalActivities / limit);

    const activityBreakdown = activities.reduce(
      (acc: Record<string, number>, activity) => {
        const activityType = String(activity.type);
        acc[activityType] = (acc[activityType] || 0) + 1;
        return acc;
      },
      {}
    );

    const severityBreakdown = activities.reduce(
      (acc: Record<string, number>, activity) => {
        const severityLevel = String(activity.severity);
        acc[severityLevel] = (acc[severityLevel] || 0) + 1;
        return acc;
      },
      {}
    );

    // Get top users by activity count
    const userActivityCount = activities.reduce(
      (acc: Record<string, number>, activity) => {
        if (activity.userId && activity.userName) {
          const key = activity.userName as string;
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const topUsers = Object.entries(userActivityCount)
      .map(([userName, count]) => ({ userName, activityCount: count }))
      .sort(
        (a: { activityCount: number }, b: { activityCount: number }) =>
          b.activityCount - a.activityCount
      )
      .slice(0, 10);

    // Build hourly distribution for the timeframe
    const hourlyDistribution = Array(24).fill(0);
    activities.forEach(activity => {
      const hour = new Date(
        activity.timestamp as string | number | Date
      ).getHours();
      hourlyDistribution[hour]++;
    });

    const response = {
      success: true,
      activities: includeDetails
        ? paginatedActivities
        : paginatedActivities.map(a => ({
            id: a.id,
            type: a.type,
            timestamp: a.timestamp,
            userName: a.userName,
            action: a.action,
            resource: a.resource,
            severity: a.severity,
          })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalActivities,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        totalActivities,
        timeframe,
        activityBreakdown,
        severityBreakdown,
        topUsers,
        hourlyDistribution,
      },
      filters: {
        timeframe,
        activityType: activityType || 'all',
        userId: userId_filter,
        sortBy,
        sortOrder,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        queryExecutionTime: Date.now() - now.getTime(),
        availableActivityTypes: activityTypes,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin activity error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin activity data',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
