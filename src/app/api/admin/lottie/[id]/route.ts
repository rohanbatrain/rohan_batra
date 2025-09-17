import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import LottieAsset from '@/models/LottieAsset';
import User from '@/models/User';
import { z } from 'zod';

const LottieUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  animationData: z.object({}).passthrough().optional(),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().positive().optional(),
  frameRate: z.number().positive().optional(),
  dimensions: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  metadata: z.object({}).passthrough().optional(),
  isPublic: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const asset = await LottieAsset.findById(id);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Lottie asset not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const includeAnalytics =
      url.searchParams.get('includeAnalytics') === 'true';
    const includeAnimationData =
      url.searchParams.get('includeAnimationData') === 'true';
    const includeAudit = url.searchParams.get('includeAudit') === 'true';

    const response = {
      success: true,
      asset: {
        _id: asset._id,
        name: asset.name,
        description: asset.description,
        tags: asset.tags,
        category: asset.category,
        fileUrl: asset.fileUrl,
        thumbnailUrl: asset.thumbnailUrl,
        duration: asset.duration,
        frameRate: asset.frameRate,
        dimensions: asset.dimensions,
        fileSize: asset.fileSize,
        isPublic: asset.isPublic,
        featured: asset.featured,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        deletedAt: asset.deletedAt,
        usage: includeAnalytics
          ? asset.usage
          : {
              totalUsages: asset.usage?.totalUsages || 0,
              lastUsed: asset.usage?.lastUsed,
            },
        animationData: includeAnimationData ? asset.animationData : undefined,
        metadata: asset.metadata,
        audit: includeAudit ? asset.audit : undefined,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
        includeAnalytics,
        includeAnimationData,
        includeAudit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin lottie GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Lottie asset',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const validatedData = LottieUpdateSchema.parse(body);

    const asset = await LottieAsset.findById(id);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Lottie asset not found' },
        { status: 404 }
      );
    }

    const currentTime = new Date();
    const updateData: Record<string, unknown> = { ...validatedData };

    // Recalculate file size if animation data is updated
    if (validatedData.animationData) {
      updateData.fileSize = JSON.stringify(validatedData.animationData).length;
    }

    // Add audit trail entry
    const auditEntry = {
      action: 'updated',
      userId: user._id,
      userName: user.name,
      timestamp: currentTime,
      metadata: {
        fields: Object.keys(validatedData),
      },
    };

    const updatedAsset = await LottieAsset.findByIdAndUpdate(
      id,
      {
        $set: { ...updateData, updatedAt: currentTime },
        $push: { 'audit.log': auditEntry },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      asset: {
        _id: updatedAsset._id,
        name: updatedAsset.name,
        description: updatedAsset.description,
        tags: updatedAsset.tags,
        category: updatedAsset.category,
        fileUrl: updatedAsset.fileUrl,
        thumbnailUrl: updatedAsset.thumbnailUrl,
        duration: updatedAsset.duration,
        frameRate: updatedAsset.frameRate,
        dimensions: updatedAsset.dimensions,
        fileSize: updatedAsset.fileSize,
        isPublic: updatedAsset.isPublic,
        featured: updatedAsset.featured,
        createdAt: updatedAsset.createdAt,
        updatedAt: updatedAsset.updatedAt,
        usage: {
          totalUsages: updatedAsset.usage?.totalUsages || 0,
          lastUsed: updatedAsset.usage?.lastUsed,
        },
        metadata: updatedAsset.metadata,
      },
      message: 'Lottie asset updated successfully',
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

    console.error('Admin lottie PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update Lottie asset',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { success: false, error: 'Admin access required for deletion' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';

    const asset = await LottieAsset.findById(id);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Lottie asset not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanent deletion
      await LottieAsset.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Lottie asset permanently deleted',
        asset: {
          _id: asset._id,
          name: asset.name,
          category: asset.category,
        },
      });
    } else {
      // Soft deletion
      const currentTime = new Date();
      const auditEntry = {
        action: 'soft_deleted',
        userId: user._id,
        userName: user.name,
        timestamp: currentTime,
        metadata: { reason: 'Admin deletion' },
      };

      const deletedAsset = await LottieAsset.findByIdAndUpdate(
        id,
        {
          $set: {
            deletedAt: currentTime,
            deletedBy: user._id,
          },
          $push: { 'audit.log': auditEntry },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Lottie asset soft deleted',
        asset: {
          _id: deletedAsset._id,
          name: deletedAsset.name,
          category: deletedAsset.category,
          deletedAt: deletedAsset.deletedAt,
        },
      });
    }
  } catch (error) {
    console.error('Admin lottie DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete Lottie asset',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
