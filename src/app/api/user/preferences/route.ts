import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';

const preferencesSchema = z.object({
  editor: z.enum(['rich-html', 'mdx']).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    browser: z.boolean().optional(),
    mobile: z.boolean().optional(),
  }).optional(),
});

// GET /api/user/preferences - Get current user's preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ clerkId: userId })
      .select('preferences')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge with defaults to ensure all fields exist
    const userPrefs = (user as any).preferences || {};
    const preferences = {
      editor: userPrefs.editor || 'rich-html',
      theme: userPrefs.theme || 'auto',
      language: userPrefs.language || 'en',
      notifications: {
        email: userPrefs.notifications?.email ?? true,
        browser: userPrefs.notifications?.browser ?? true,
        mobile: userPrefs.notifications?.mobile ?? false,
      },
    };

    console.log('[GET /api/user/preferences] User preferences from DB:', userPrefs);
    console.log('[GET /api/user/preferences] Returning merged preferences:', preferences);

    return NextResponse.json({
      preferences,
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/preferences - Update current user's preferences
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[PATCH /api/user/preferences] Request body:', body);
    const parsed = preferencesSchema.parse(body);

    await connectToDatabase();

    const updateFields: any = {};

    if (parsed.editor) {
      updateFields['preferences.editor'] = parsed.editor;
      console.log('[PATCH /api/user/preferences] Updating editor preference to:', parsed.editor);
    }

    if (parsed.theme) {
      updateFields['preferences.theme'] = parsed.theme;
    }

    if (parsed.language) {
      updateFields['preferences.language'] = parsed.language;
    }

    if (parsed.notifications) {
      if (parsed.notifications.email !== undefined) {
        updateFields['preferences.notifications.email'] = parsed.notifications.email;
      }
      if (parsed.notifications.browser !== undefined) {
        updateFields['preferences.notifications.browser'] = parsed.notifications.browser;
      }
      if (parsed.notifications.mobile !== undefined) {
        updateFields['preferences.notifications.mobile'] = parsed.notifications.mobile;
      }
    }

    console.log('[PATCH /api/user/preferences] Update fields:', updateFields);

    // First, let's verify the user exists
    const existingUser = await UserModel.findOne({ clerkId: userId });
    if (!existingUser) {
      console.error('[PATCH /api/user/preferences] User not found for clerkId:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[PATCH /api/user/preferences] Existing preferences before update:', existingUser.preferences);

    // Update the user
    const user = await UserModel.findOneAndUpdate(
      { clerkId: userId },
      { $set: updateFields },
      { new: true, runValidators: false, strict: false }
    );

    if (!user) {
      console.error('[PATCH /api/user/preferences] User not found for clerkId:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[PATCH /api/user/preferences] Updated user preferences:', user.preferences);
    console.log('[PATCH /api/user/preferences] Full user object:', JSON.stringify(user, null, 2));

    return NextResponse.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
