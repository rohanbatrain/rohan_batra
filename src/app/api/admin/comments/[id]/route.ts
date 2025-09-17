import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { z } from 'zod';

const CommentUpdateSchema = z.object({
  content: z.string().min(1).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'spam']).optional(),
  featured: z.boolean().optional(),
  moderatorNote: z.string().optional(),
  flagged: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const comment = await Comment.findById(id)
      .populate('parentComment', 'content author createdAt')
      .populate('contentId', 'title slug')
      .populate('replies', 'content author status createdAt');

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const includeReplies = url.searchParams.get('includeReplies') === 'true';

    const response = {
      success: true,
      comment: {
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
        replies: includeReplies
          ? comment.replies
          : comment.replies?.length || 0,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        moderationHistory: comment.moderationHistory,
        flagReasons: comment.flagReasons,
        moderatorNote: comment.moderatorNote,
        ipAddress: comment.ipAddress,
        userAgent: comment.userAgent,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
        includeReplies,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin comment GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comment',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const validatedData = CommentUpdateSchema.parse(body);

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    const previousStatus = comment.status;
    const currentTime = new Date();

    const moderationEntry = {
      action: 'updated',
      moderatorId: user._id,
      moderatorName: user.name,
      timestamp: currentTime,
      metadata: {
        fields: Object.keys(validatedData),
        previousStatus,
        newStatus: validatedData.status,
      },
    };

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        $set: { ...validatedData, updatedAt: currentTime },
        $push: { moderationHistory: moderationEntry },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      comment: {
        _id: updatedComment._id,
        content: updatedComment.content,
        author: updatedComment.author,
        contentType: updatedComment.contentType,
        contentId: updatedComment.contentId,
        status: updatedComment.status,
        featured: updatedComment.featured,
        flagged: updatedComment.flagged,
        likes: updatedComment.likes,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        moderatorNote: updatedComment.moderatorNote,
      },
      message: 'Comment updated successfully',
      changes: Object.keys(validatedData),
    });
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

    console.error('Admin comment PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update comment',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required for deletion' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanent deletion
      await Comment.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Comment permanently deleted',
        comment: {
          _id: comment._id,
          content: comment.content.substring(0, 100),
          author: comment.author,
        },
      });
    } else {
      // Soft deletion
      const currentTime = new Date();
      const moderationEntry = {
        action: 'soft_deleted',
        moderatorId: user._id,
        moderatorName: user.name,
        timestamp: currentTime,
        reason: 'Admin deletion',
      };

      const deletedComment = await Comment.findByIdAndUpdate(
        id,
        {
          $set: {
            deletedAt: currentTime,
            deletedBy: user._id,
          },
          $push: { moderationHistory: moderationEntry },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Comment soft deleted',
        comment: {
          _id: deletedComment._id,
          content: deletedComment.content.substring(0, 100),
          author: deletedComment.author,
          deletedAt: deletedComment.deletedAt,
        },
      });
    }
  } catch (error) {
    console.error('Admin comment DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete comment',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
