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
  backgroundColor: z.string().regex(/^[0-9a-fA-F]{6}$/, 'Must be a valid 6-digit hex color'),
  radius: z.number().min(0).max(50),
});

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ clerkId: userId }).select('avatarConfig');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      avatarConfig: user.avatarConfig || {
        style: 'adventurer',
        seed: `user-${userId}`,
        backgroundColor: 'b6e3f4',
        radius: 50,
      },
    });
  } catch (error) {
    console.error('Error fetching avatar config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    await connectToDatabase();
    
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $set: { 
          avatarConfig,
          updatedAt: new Date(),
        },
      },
      { 
        new: true,
        upsert: true, // Create user if doesn't exist
        select: 'avatarConfig',
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Avatar configuration updated successfully',
      avatarConfig: user.avatarConfig,
    });
  } catch (error) {
    console.error('Error updating avatar config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Reset to default avatar configuration
    const defaultConfig = {
      style: 'adventurer' as const,
      seed: `user-${userId}`,
      backgroundColor: 'b6e3f4',
      radius: 50,
    };

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $set: { 
          avatarConfig: defaultConfig,
          updatedAt: new Date(),
        },
      },
      { 
        new: true,
        select: 'avatarConfig',
      }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar configuration reset to default',
      avatarConfig: user.avatarConfig,
    });
  } catch (error) {
    console.error('Error resetting avatar config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}