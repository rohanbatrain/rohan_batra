import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import SiteSetting from '@/models/SiteSetting';
import User from '@/models/User';
import { z } from 'zod';

const SettingUpdateSchema = z.object({
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  validation: z
    .object({
      required: z.boolean().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const setting = await SiteSetting.findOne({ key });

    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const includeHistory = url.searchParams.get('includeHistory') === 'true';

    const response = {
      success: true,
      setting: {
        _id: setting._id,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        category: setting.category,
        description: setting.description,
        isPublic: setting.isPublic,
        validation: setting.validation,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
        history: includeHistory
          ? setting.history
          : setting.history?.slice(-3) || [],
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
        includeHistory,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin setting GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch setting',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for settings management',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = SettingUpdateSchema.parse(body);

    const setting = await SiteSetting.findOne({ key });

    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }

    const currentTime = new Date();

    // Add history entry
    const historyEntry = {
      action: 'updated',
      userId: user._id,
      userName: user.name,
      timestamp: currentTime,
      previousValue: setting.value,
      newValue: validatedData.value,
      metadata: {
        fields: Object.keys(validatedData),
      },
    };

    const updatedSetting = await SiteSetting.findByIdAndUpdate(
      setting._id,
      {
        $set: {
          value: validatedData.value,
          type: validatedData.type || setting.type,
          category: validatedData.category || setting.category,
          description: validatedData.description || setting.description,
          isPublic: validatedData.isPublic ?? setting.isPublic,
          validation: validatedData.validation || setting.validation,
          updatedAt: currentTime,
        },
        $push: { history: historyEntry },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      setting: {
        _id: updatedSetting._id,
        key: updatedSetting.key,
        value: updatedSetting.value,
        type: updatedSetting.type,
        category: updatedSetting.category,
        description: updatedSetting.description,
        isPublic: updatedSetting.isPublic,
        validation: updatedSetting.validation,
        updatedAt: updatedSetting.updatedAt,
      },
      message: 'Setting updated successfully',
      changes: Object.keys(validatedData),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin setting PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update setting',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for settings deletion',
        },
        { status: 403 }
      );
    }

    const setting = await SiteSetting.findOne({ key });

    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }

    await SiteSetting.findByIdAndDelete(setting._id);

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully',
      setting: {
        _id: setting._id,
        key: setting.key,
        category: setting.category,
      },
    });
  } catch (error) {
    console.error('Admin setting DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete setting',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
