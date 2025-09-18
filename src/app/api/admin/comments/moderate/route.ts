import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';

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
    const status = searchParams.get('status') || 'pending';
    const contentType = searchParams.get('contentType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter query
    const filter: Record<string, string> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (contentType) {
      filter.contentType = contentType;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get comments with pagination
    const skip = (page - 1) * limit;
    const [comments, totalCount] = await Promise.all([
      Comment.find(filter)
        .populate('author', 'name email profileImageUrl')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    // Get content titles for each comment
    const commentsWithContent = await Promise.all(
      comments.map(async comment => {
        let contentTitle = 'Unknown Content';
        try {
          if (comment.contentType === 'blog') {
            const BlogPost = (await import('@/models/BlogPost')).default;
            const post = (await BlogPost.findById(comment.contentId)
              .select('title')
              .lean()) as { title?: string } | null;
            contentTitle = post?.title || 'Deleted Blog Post';
          } else if (comment.contentType === 'project') {
            const Project = (await import('@/models/Project')).default;
            const project = (await Project.findById(comment.contentId)
              .select('title')
              .lean()) as { title?: string } | null;
            contentTitle = project?.title || 'Deleted Project';
          } else if (comment.contentType === 'book') {
            const Book = (await import('@/models/Book')).default;
            const book = (await Book.findById(comment.contentId)
              .select('title')
              .lean()) as { title?: string } | null;
            contentTitle = book?.title || 'Deleted Book';
          }
        } catch (error) {
          console.warn('Failed to get content title:', error);
        }

        return {
          ...comment,
          contentTitle,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        comments: commentsWithContent,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Comment moderation GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for bulk comment moderation actions
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
    const { action, commentIds, status, reason } = body;

    if (
      !action ||
      !commentIds ||
      !Array.isArray(commentIds) ||
      commentIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Action and comment IDs are required' },
        { status: 400 }
      );
    }

    let result;
    let modifiedCount = 0;

    switch (action) {
      case 'approve':
        result = await Comment.updateMany(
          { _id: { $in: commentIds } },
          {
            status: 'approved',
            moderatedBy: currentUser._id,
            moderatedAt: new Date(),
            moderationReason: reason || 'Bulk approved',
          }
        );
        modifiedCount = result.modifiedCount;
        break;

      case 'reject':
        result = await Comment.updateMany(
          { _id: { $in: commentIds } },
          {
            status: 'rejected',
            moderatedBy: currentUser._id,
            moderatedAt: new Date(),
            moderationReason: reason || 'Bulk rejected',
          }
        );
        modifiedCount = result.modifiedCount;
        break;

      case 'spam':
        result = await Comment.updateMany(
          { _id: { $in: commentIds } },
          {
            status: 'spam',
            moderatedBy: currentUser._id,
            moderatedAt: new Date(),
            moderationReason: reason || 'Marked as spam',
          }
        );
        modifiedCount = result.modifiedCount;
        break;

      case 'delete':
        // Soft delete by marking as deleted
        result = await Comment.updateMany(
          { _id: { $in: commentIds } },
          {
            status: 'deleted',
            moderatedBy: currentUser._id,
            moderatedAt: new Date(),
            moderationReason: reason || 'Bulk deleted',
          }
        );
        modifiedCount = result.modifiedCount;
        break;

      case 'hard_delete':
        // Only admins can permanently delete
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            {
              success: false,
              error: 'Only administrators can permanently delete comments',
            },
            { status: 403 }
          );
        }
        result = await Comment.deleteMany({ _id: { $in: commentIds } });
        modifiedCount = result.deletedCount;
        break;

      case 'change_status':
        if (
          !status ||
          !['pending', 'approved', 'rejected', 'spam'].includes(status)
        ) {
          return NextResponse.json(
            {
              success: false,
              error: 'Valid status is required for change_status action',
            },
            { status: 400 }
          );
        }
        result = await Comment.updateMany(
          { _id: { $in: commentIds } },
          {
            status,
            moderatedBy: currentUser._id,
            moderatedAt: new Date(),
            moderationReason: reason || `Status changed to ${status}`,
          }
        );
        modifiedCount = result.modifiedCount;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        modifiedCount,
        requestedCount: commentIds.length,
        message: `Successfully ${action}ed ${modifiedCount} comment(s)`,
      },
    });
  } catch (error) {
    console.error('Comment moderation POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to moderate comments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for individual comment moderation
export async function PUT(request: NextRequest) {
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
    const { commentId, status, reason, editedContent } = body;

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Update comment
    const updateData: {
      moderatedBy: string;
      moderatedAt: Date;
      status?: string;
      moderationReason?: string;
      content?: string;
      edited?: boolean;
      editedAt?: Date;
      editedBy?: string;
    } = {
      moderatedBy: currentUser._id,
      moderatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (reason) {
      updateData.moderationReason = reason;
    }

    if (editedContent !== undefined) {
      // Only admins can edit comment content
      if (currentUser.role !== 'admin') {
        return NextResponse.json(
          {
            success: false,
            error: 'Only administrators can edit comment content',
          },
          { status: 403 }
        );
      }
      updateData.content = editedContent;
      updateData.edited = true;
      updateData.editedAt = new Date();
      updateData.editedBy = currentUser._id;
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email profileImageUrl');

    return NextResponse.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error('Comment moderation PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update comment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
