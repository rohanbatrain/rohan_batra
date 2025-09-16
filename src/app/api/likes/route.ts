import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import LikeModel from '@/models/Like';
import { Like } from '@/types/like';

// GET /api/likes - Get likes for a target (post or comment)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType'); // 'post' or 'comment'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

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
    await connectToDatabase();
    // For demo, use Clerk userId from header (replace with Clerk middleware in production)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
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
    // Toggle like
    const result = await LikeModel.toggleLike(userId, targetId, targetType);
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
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
