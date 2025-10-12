import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import BraindumpReaction from '@/models/BraindumpReaction';
import Braindump from '@/models/Braindump';
import Notification from '@/models/Notification';
import { checkRateLimit, reactionLimiter } from '@/lib/ratelimit';
import { ToggleReactionSchema, REACTION_EMOJIS } from '@/types/social';
import { requireCSRFToken, csrfErrorResponse } from '@/lib/csrf';

// POST /api/braindump/[id]/reactions - Toggle reaction
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

    // CSRF protection
    const csrfValid = await requireCSRFToken(request);
    if (!csrfValid) {
      return csrfErrorResponse();
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(reactionLimiter, userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'You can add maximum 50 reactions per minute',
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

    // Check if user can view (and therefore react to) this braindump
    const canView = await braindump.canView(userId);

    if (!canView) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to react to this braindump',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = ToggleReactionSchema.safeParse(body);

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

    const { emoji } = validationResult.data;

    // Toggle reaction
    const result = await BraindumpReaction.toggle(
      new Types.ObjectId(id),
      userId,
      emoji
    );

    // Create notification for braindump author if reaction was added (non-blocking)
    if (result.action === 'added' && braindump.userId.toString() !== userId) {
      Notification.createNotification(
        braindump.userId.toString(),
        'reaction',
        'New reaction on your braindump',
        `Someone reacted with ${emoji}`,
        {
          relatedBraindumpId: braindump._id,
          actionUrl: `/braindump/${braindump.slug || braindump._id}`,
        }
      ).catch((err: Error) => console.error('Failed to create notification:', err));
    }

    // Get updated reaction counts
    const reactionCounts = await BraindumpReaction.getReactionCounts(new Types.ObjectId(id));

    return NextResponse.json({
      success: true,
      data: {
        action: result.action,
        emoji,
        reactionCounts,
      },
      message: result.action === 'added' ? 'Reaction added' : 'Reaction removed',
    });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to toggle reaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/braindump/[id]/reactions - Get reaction counts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get reaction counts
    const reactionCounts = await BraindumpReaction.getReactionCounts(new Types.ObjectId(id));

    // Get user's reactions if authenticated
    const { userId } = await auth();
    let userReactions: string[] = [];

    if (userId) {
      userReactions = await BraindumpReaction.getUserReactions(
        new Types.ObjectId(id),
        userId
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reactionCounts,
        userReactions,
      },
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
