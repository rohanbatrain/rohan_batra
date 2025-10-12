import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import SharePermission from '@/models/SharePermission';
import Braindump from '@/models/Braindump';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { checkRateLimit, authenticatedApiLimiter } from '@/lib/ratelimit';
import { GrantSharePermissionSchema } from '@/types/social';
import { requireCSRFToken, csrfErrorResponse } from '@/lib/csrf';

// POST /api/braindump/[id]/share - Grant share permission
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
    const rateLimitResult = await checkRateLimit(authenticatedApiLimiter, userId);

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

    // Find braindump
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

    // Check ownership - only owner can share
    const user = await User.findOne({ clerkId: userId });
    if (!user || braindump.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the owner can share this braindump',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = GrantSharePermissionSchema.safeParse(body);

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

    // Validate target user exists
    const targetUser = await User.findOne({ clerkId: data.userId });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target user not found',
        },
        { status: 404 }
      );
    }

    // Grant permission
    const permission = await SharePermission.grantPermission(
      new Types.ObjectId(id),
      data.userId,
      data.permission,
      userId
    );

    // Create notification (non-blocking)
    Notification.create({
      userId: data.userId,
      type: 'share',
      title: 'Braindump shared with you',
      message: `${user.name || 'Someone'} shared a braindump with you`,
      relatedBraindumpId: braindump._id,
      actionUrl: `/braindump/${braindump.slug || braindump._id}`,
      actor: userId,
      read: false,
    }).catch((err: Error) => console.error('Failed to create notification:', err));

    return NextResponse.json({
      success: true,
      data: {
        permission: {
          _id: permission._id.toString(),
          braindumpId: permission.braindumpId.toString(),
          userId: permission.userId,
          permission: permission.permission,
          grantedBy: permission.grantedBy,
          grantedAt: permission.grantedAt,
        },
      },
      message: 'Permission granted successfully',
    });
  } catch (error) {
    console.error('Error granting permission:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to grant permission',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
