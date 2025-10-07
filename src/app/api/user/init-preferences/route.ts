import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';

/**
 * Admin endpoint to initialize preferences for the current user
 * GET /api/user/init-preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[INIT PREFS] Current preferences:', user.preferences);

    // Initialize preferences with defaults
    const result = await UserModel.updateOne(
      { clerkId: userId },
      {
        $set: {
          'preferences.editor': user.preferences?.editor || 'rich-html',
          'preferences.theme': user.preferences?.theme || 'auto',
          'preferences.language': user.preferences?.language || 'en',
          'preferences.notifications.email':
            user.preferences?.notifications?.email ?? true,
          'preferences.notifications.browser':
            user.preferences?.notifications?.browser ?? true,
          'preferences.notifications.mobile':
            user.preferences?.notifications?.mobile ?? false,
        },
      }
    );

    // Fetch updated user
    const updated = await UserModel.findOne({ clerkId: userId }).select(
      'preferences'
    );

    console.log('[INIT PREFS] Updated preferences:', updated?.preferences);

    return NextResponse.json({
      success: true,
      message: 'Preferences initialized',
      modified: result.modifiedCount,
      preferences: updated?.preferences,
    });
  } catch (error) {
    console.error('Error initializing preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
