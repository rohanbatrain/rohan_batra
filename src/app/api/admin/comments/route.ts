import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { z } from 'zod';

const BulkActionSchema = z.object({
  action: z.enum([
    'approve',
    'reject',
    'spam',
    'delete',
    'restore',
    'feature',
    'unfeature',
  ]),
  commentIds: z.array(z.string()).min(1),
  reason: z.string().optional(),
});

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
      parseInt(url.searchParams.get('limit') || '20'),
      100
    );
    const status = url.searchParams.get('status');
    const contentType = url.searchParams.get('contentType');
    const contentId = url.searchParams.get('contentId');
    const featured = url.searchParams.get('featured');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const includeDeleted = url.searchParams.get('includeDeleted') === 'true';
    const flaggedOnly = url.searchParams.get('flaggedOnly') === 'true';

    const filter: Record<string, unknown> = {};

    if (!includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    if (status) {
      filter.status = status;
    }

    if (contentType) {
      filter.contentType = contentType;
    }

    if (contentId) {
      filter.contentId = contentId;
    }

    if (featured !== null) {
      filter.featured = featured === 'true';
    }

    if (flaggedOnly) {
      filter.flagged = true;
    }

    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } },
        { 'author.name': { $regex: search, $options: 'i' } },
        { 'author.email': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: { [key: string]: 1 | -1 } = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const comments = await Comment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('parentComment', 'content author createdAt')
      .populate('contentId', 'title slug');

    const totalComments = await Comment.countDocuments(filter);
    const totalPages = Math.ceil(totalComments / limit);

    const summary = await Comment.aggregate([
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          contentTypeBreakdown: [
            { $group: { _id: '$contentType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          pendingComments: [
            { $match: { status: 'pending' } },
            { $count: 'count' },
          ],
          flaggedComments: [{ $match: { flagged: true } }, { $count: 'count' }],
          featuredComments: [
            { $match: { featured: true } },
            { $count: 'count' },
          ],
          recentActivity: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                content: { $substr: ['$content', 0, 100] },
                author: '$author.name',
                status: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    const response = {
      success: true,
      comments: comments.map(comment => ({
        _id: comment._id,
        content: comment.content,
        author: comment.author,
        contentType: comment.contentType,
        contentId: comment.contentId,
        parentComment: comment.parentComment,
        status: comment.status,
        featured: comment.featured,
        flagged: comment.flagged,
        likes: comment.likes,
        replies: comment.replies?.length || 0,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        moderationHistory: comment.moderationHistory,
        flagReasons: comment.flagReasons,
        moderatorNote: comment.moderatorNote,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalComments,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        total: totalComments,
        statusBreakdown: summary[0].statusBreakdown,
        contentTypeBreakdown: summary[0].contentTypeBreakdown,
        pendingComments: summary[0].pendingComments[0]?.count || 0,
        flaggedComments: summary[0].flaggedComments[0]?.count || 0,
        featuredComments: summary[0].featuredComments[0]?.count || 0,
        recentActivity: summary[0].recentActivity,
      },
      filters: {
        status,
        contentType,
        contentId,
        featured,
        search,
        sortBy,
        sortOrder,
        includeDeleted,
        flaggedOnly,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin comments GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comments',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

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
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Handle bulk actions
    if (body.action && body.commentIds) {
      const bulkData = BulkActionSchema.parse(body);

      const updateData: Record<string, unknown> = {};
      const currentTime = new Date();

      const moderationEntry = {
        action: bulkData.action,
        moderatorId: user._id,
        moderatorName: user.name,
        timestamp: currentTime,
        reason: bulkData.reason,
      };

      switch (bulkData.action) {
        case 'approve':
          updateData.status = 'approved';
          break;
        case 'reject':
          updateData.status = 'rejected';
          break;
        case 'spam':
          updateData.status = 'spam';
          updateData.flagged = true;
          break;
        case 'delete':
          updateData.deletedAt = currentTime;
          updateData.deletedBy = user._id;
          break;
        case 'restore':
          updateData.deletedAt = null;
          updateData.deletedBy = null;
          break;
        case 'feature':
          updateData.featured = true;
          break;
        case 'unfeature':
          updateData.featured = false;
          break;
      }

      updateData.$push = { moderationHistory: moderationEntry };

      const result = await Comment.updateMany(
        { _id: { $in: bulkData.commentIds } },
        updateData
      );

      return NextResponse.json({
        success: true,
        action: bulkData.action,
        affectedComments: result.modifiedCount,
        message: `Successfully ${bulkData.action}ed ${result.modifiedCount} comments`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin comments POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process comments',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
