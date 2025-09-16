import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CommentModel from '@/models/Comment';
import BlogPostModel from '@/models/BlogPost';
import ProjectModel from '@/models/Project';
import { CommentWithAuthor } from '@/types/comment';

// GET /api/comments - Get comments for a target (blog post or project)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType'); // 'post' or 'project'
    const status = searchParams.get('status') || 'approved';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!targetId || !targetType) {
      return NextResponse.json(
        {
          success: false,
          error: 'targetId and targetType are required',
        },
        { status: 400 }
      );
    }

    // Validate target existence
    let targetExists = false;
    if (targetType === 'post') {
      targetExists = !!(await BlogPostModel.findById(targetId));
    } else if (targetType === 'project') {
      targetExists = !!(await ProjectModel.findById(targetId));
    }
    if (!targetExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target not found',
        },
        { status: 404 }
      );
    }

    // Build query
    const query: Record<string, unknown> = {
      targetId,
      targetType,
    };
    if (status !== 'all') {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await CommentModel.countDocuments(query);

    // Get comments with author population
    const comments = await CommentModel.find(query)
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 }) // oldest first for threads
      .skip(skip)
      .limit(limit);

    // Transform to include author info
    const commentsWithAuthor: CommentWithAuthor[] = comments.map(comment => ({
      _id: comment._id.toString(),
      content: comment.content,
      authorId: comment.author._id.toString(),
      postId: comment.targetType === 'post' ? comment.targetId.toString() : '',
      parentId: comment.parentId?.toString() || undefined,
      status: comment.status,
      isReply: !!comment.parentId,
      depth: comment.depth,
      likeCount: comment.likeCount ?? 0,
      replyCount: comment.replyCount ?? 0,
      authorName: comment.author.name,
      authorEmail: comment.author.email,
      authorAvatar: comment.author.avatar,
      authorWebsite: undefined,
      ipAddress: undefined,
      userAgent: undefined,
      approvedAt: comment.approvedAt,
      approvedBy: comment.approvedBy,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author._id.toString(),
        firstName: comment.author.name.split(' ')[0] || '',
        lastName: comment.author.name.split(' ').slice(1).join(' ') || '',
        avatar: comment.author.avatar,
      },
    }));

    // Pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        comments: commentsWithAuthor,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
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

// POST /api/comments - Add a new comment to a blog post or project
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get the current user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      content,
      targetId,
      targetType, // 'post' or 'project'
      parentId,
    } = body;

    if (!content || !targetId || !targetType) {
      return NextResponse.json(
        {
          success: false,
          error: 'content, targetId, and targetType are required',
        },
        { status: 400 }
      );
    }

    // Validate target existence
    let targetExists = false;
    if (targetType === 'post') {
      targetExists = !!(await BlogPostModel.findById(targetId));
    } else if (targetType === 'project') {
      targetExists = !!(await ProjectModel.findById(targetId));
    }
    if (!targetExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target not found',
        },
        { status: 404 }
      );
    }

    // Create the comment
    const newComment = new CommentModel({
      content,
      author: clerkUser.id,
      targetId,
      targetType,
      parentId: parentId || null,
      status: 'pending',
      depth: parentId ? 1 : 0,
      likeCount: 0,
      replyCount: 0,
    });

    const savedComment = await newComment.save();
    await savedComment.populate('author', 'name email avatar');

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: savedComment._id.toString(),
          content: savedComment.content,
          authorId: savedComment.author._id.toString(),
          postId:
            savedComment.targetType === 'post'
              ? savedComment.targetId.toString()
              : '',
          parentId: savedComment.parentId?.toString() || undefined,
          status: savedComment.status,
          isReply: !!savedComment.parentId,
          depth: savedComment.depth,
          likeCount: savedComment.likeCount ?? 0,
          replyCount: savedComment.replyCount ?? 0,
          authorName: savedComment.author.name,
          authorEmail: savedComment.author.email,
          authorAvatar: savedComment.author.avatar,
          createdAt: savedComment.createdAt,
          updatedAt: savedComment.updatedAt,
          author: {
            id: savedComment.author._id.toString(),
            firstName: savedComment.author.name.split(' ')[0] || '',
            lastName:
              savedComment.author.name.split(' ').slice(1).join(' ') || '',
            avatar: savedComment.author.avatar,
          },
        },
        message: 'Comment submitted for moderation',
      },
      { status: 201 }
    );
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
