import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import LikeModel from '@/models/Like';
import UserModel from '@/models/User';
import { Like } from '@/types/like';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit';

// GET /api/likes - Get likes for a target (post or comment)
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for GET requests
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      max: 100, // 100 requests per minute
      windowMs: 60000,
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType'); // 'post' or 'comment'
    const page = parseInt(searchParams.get('page') || '1');
    // Cap limit at 100 to prevent excessive data retrieval
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!targetId || !targetType) {
      return NextResponse.json(
        {
          success: false,
          error: 'targetId and targetType are required',
        },
        { status: 400 }
      );
    }

    // Build query
    const query: Record<string, unknown> = {
      targetId,
      targetType,
    };

    // Pagination
    const skip = (page - 1) * limit;
    const total = await LikeModel.countDocuments(query);

    // Get likes
    const likes = await LikeModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform likes
    const likesData: Like[] = likes.map(like => ({
      _id: like._id.toString(),
      userId: like.userId.toString(),
      targetId: like.targetId.toString(),
      targetType: like.targetType,
      createdAt: like.createdAt,
      updatedAt: like.updatedAt,
    }));

    // Pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        likes: likesData,
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
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch likes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/likes - Toggle like for a target (post or comment)
export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting for POST (write operations)
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      max: 20, // 20 like/unlike per minute
      windowMs: 60000,
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    await connectToDatabase();

    // Use Clerk authentication instead of fake header
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

    // Get user's database ID
    const user = await UserModel.findOne({ clerkId: userId })
      .select('_id')
      .lean();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { targetId, targetType } = body;

    if (!targetId || !targetType) {
      return NextResponse.json(
        {
          success: false,
          error: 'targetId and targetType are required',
        },
        { status: 400 }
      );
    }

    // Validate targetType
    if (!['post', 'comment'].includes(targetType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'targetType must be "post" or "comment"',
        },
        { status: 400 }
      );
    }

    // Toggle like using user's database ID
    const result = await LikeModel.toggleLike(
      (user as any)._id.toString(),
      targetId,
      targetType
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: result.action === 'added' ? 'Liked' : 'Unliked',
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to toggle like',
      },
      { status: 500 }
    );
  }
}
