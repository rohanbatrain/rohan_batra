import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import BraindumpComment from '@/models/BraindumpComment';
import Braindump from '@/models/Braindump';
import Notification from '@/models/Notification';
import { checkRateLimit, commentLimiter, publicApiLimiter } from '@/lib/ratelimit';
import { CreateCommentSchema } from '@/types/social';
import { sanitizeCommentContent } from '@/lib/sanitize';
import { requireCSRFToken, csrfErrorResponse } from '@/lib/csrf';

// GET /api/braindump/[id]/comments - Get comments for a braindump
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check if braindump exists and is accessible
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

    // Check visibility
    if (!['public', 'unlisted'].includes(braindump.visibility)) {
      return NextResponse.json(
        {
          success: false,
          error: 'This braindump is private',
        },
        { status: 403 }
      );
    }

    // Get comments with threading (top-level comments with replies)
    const topLevelComments = await BraindumpComment.find({
      braindumpId: new Types.ObjectId(id),
      parentId: null,
      status: { $in: ['approved', 'pending'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get all replies for top-level comments
    const commentIds = topLevelComments.map((c: any) => c._id);
    const replies = await BraindumpComment.find({
      parentId: { $in: commentIds },
      status: { $in: ['approved', 'pending'] },
    })
      .sort({ createdAt: 1 })
      .lean();

    // Group replies by parent
    const repliesByParent: Record<string, any[]> = {};
    replies.forEach((reply: any) => {
      const parentId = reply.parentId.toString();
      if (!repliesByParent[parentId]) {
        repliesByParent[parentId] = [];
      }
      repliesByParent[parentId].push({
        _id: reply._id.toString(),
        authorId: reply.authorId,
        content: reply.content,
        status: reply.status,
        createdAt: reply.createdAt,
      });
    });

    // Build threaded comments
    const comments = topLevelComments.map((comment: any) => ({
      _id: comment._id.toString(),
      authorId: comment.authorId,
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt,
      replies: repliesByParent[comment._id.toString()] || [],
    }));

    // Get total count
    const totalCount = await BraindumpComment.countDocuments({
      braindumpId: new Types.ObjectId(id),
      status: { $in: ['approved', 'pending'] },
    });

    return NextResponse.json({
      success: true,
      data: {
        comments,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/braindump/[id]/comments - Create a comment
export async function POST(
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

    // CSRF protection for state-changing requests
    const csrfValid = await requireCSRFToken(request);
    if (!csrfValid) {
      return csrfErrorResponse();
    }

    // Rate limiting - strict for comments
    const rateLimitResult = await checkRateLimit(commentLimiter, userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'You can post maximum 10 comments per hour',
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

    // Check if braindump exists and is accessible
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

    // Check if user can view (and therefore comment on) this braindump
    const canView = await braindump.canView(userId);

    if (!canView) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to comment on this braindump',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Sanitize content
    const sanitizedContent = sanitizeCommentContent(data.content);

    // Validate parent comment if provided
    if (data.parentId) {
      const parentComment = await BraindumpComment.findById(data.parentId);

      if (!parentComment || parentComment.braindumpId.toString() !== id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Parent comment not found or does not belong to this braindump',
          },
          { status: 400 }
        );
      }

      // Check if parent has a parent (no nested replies beyond 1 level)
      if (parentComment.parentId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot reply to a reply. Only one level of nesting is allowed',
          },
          { status: 400 }
        );
      }
    }

    // Create comment
    const comment = await BraindumpComment.create({
      braindumpId: new Types.ObjectId(id),
      authorId: userId,
      content: sanitizedContent,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : undefined,
      status: 'approved', // Auto-approve for now
    });

    // Notify braindump author (if not the commenter)
    if (braindump.userId.toString() !== userId) {
      Notification.createNotification(
        braindump.userId.toString(),
        'comment',
        'New comment on your braindump',
        `Someone commented: "${sanitizedContent.substring(0, 50)}..."`,
        {
          relatedBraindumpId: new Types.ObjectId(id),
          relatedCommentId: comment._id,
          actionUrl: `/braindump/${braindump.slug || id}#comment-${comment._id}`,
        }
      ).catch(err => console.error('Failed to create notification:', err));
    }

    return NextResponse.json({
      success: true,
      data: {
        comment: {
          _id: comment._id.toString(),
          braindumpId: comment.braindumpId.toString(),
          authorId: comment.authorId,
          content: comment.content,
          parentId: comment.parentId?.toString(),
          status: comment.status,
          createdAt: comment.createdAt,
        },
      },
      message: 'Comment posted successfully',
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create comment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
