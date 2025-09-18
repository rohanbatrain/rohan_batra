import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

// Avatar configuration schema for validation
const AvatarConfigSchema = z.object({
  style: z.enum([
    'adventurer',
    'avataaars',
    'big-ears',
    'bottts',
    'fun-emoji',
    'identicon',
    'lorelei',
    'micah',
    'miniavs',
    'open-peeps',
    'personas',
    'pixel-art',
  ]),
  seed: z.string().min(1).max(100),
  backgroundColor: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/, 'Must be a valid 6-digit hex color'),
  radius: z.number().min(0).max(50),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: adminId } = await auth();

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if the current user is admin
    const adminUser = await User.findOne({ clerkId: adminId });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId: targetUserId } = params;
    const body = await request.json();

    // Validate the avatar configuration
    const validationResult = AvatarConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid avatar configuration',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const avatarConfig = validationResult.data;

    // Update the target user's avatar
    const targetUser = await User.findOneAndUpdate(
      { clerkId: targetUserId },
      {
        $set: {
          avatarConfig,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        select: 'clerkId email name avatarConfig',
      }
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User avatar configuration updated successfully',
      user: {
        clerkId: targetUser.clerkId,
        email: targetUser.email,
        name: targetUser.name,
        avatarConfig: targetUser.avatarConfig,
      },
    });
  } catch (error) {
    console.error('Error updating user avatar config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: adminId } = await auth();

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if the current user is admin
    const adminUser = await User.findOne({ clerkId: adminId });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId: targetUserId } = params;

    // Reset to default avatar configuration
    const defaultConfig = {
      style: 'adventurer' as const,
      seed: `user-${targetUserId}`,
      backgroundColor: 'b6e3f4',
      radius: 50,
    };

    const targetUser = await User.findOneAndUpdate(
      { clerkId: targetUserId },
      {
        $set: {
          avatarConfig: defaultConfig,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        select: 'clerkId email name avatarConfig',
      }
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User avatar configuration reset to default',
      user: {
        clerkId: targetUser.clerkId,
        email: targetUser.email,
        name: targetUser.name,
        avatarConfig: targetUser.avatarConfig,
      },
    });
  } catch (error) {
    console.error('Error resetting user avatar config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}