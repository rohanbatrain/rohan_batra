import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import LottieAsset from '@/models/LottieAsset';
import User from '@/models/User';
import { z } from 'zod';

const LottieCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  animationData: z.object({}).passthrough(),
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
  isPublic: z.boolean().default(false),
  featured: z.boolean().default(false),
});

const BulkActionSchema = z.object({
  action: z.enum(['delete', 'feature', 'unfeature', 'publish', 'unpublish']),
  assetIds: z.array(z.string()).min(1),
});

export async function GET(request: NextRequest) {
  try {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      100
    );
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const featured = url.searchParams.get('featured');
    const isPublic = url.searchParams.get('isPublic');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const includeAnalytics =
      url.searchParams.get('includeAnalytics') === 'true';
    const includeAnimationData =
      url.searchParams.get('includeAnimationData') === 'true';

    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (featured !== null) {
      filter.featured = featured === 'true';
    }

    if (isPublic !== null) {
      filter.isPublic = isPublic === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projection = includeAnimationData ? {} : { animationData: 0 };

    const assets = await LottieAsset.find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalAssets = await LottieAsset.countDocuments(filter);
    const totalPages = Math.ceil(totalAssets / limit);

    const summary = await LottieAsset.aggregate([
      {
        $facet: {
          categoryBreakdown: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          tagBreakdown: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          featuredCount: [{ $match: { featured: true } }, { $count: 'count' }],
          publicCount: [{ $match: { isPublic: true } }, { $count: 'count' }],
          totalUsage: [
            { $group: { _id: null, total: { $sum: '$usage.totalUsages' } } },
          ],
          avgFileSize: [
            {
              $group: {
                _id: null,
                avg: { $avg: '$fileSize' },
                total: { $sum: '$fileSize' },
              },
            },
          ],
        },
      },
    ]);

    const response = {
      success: true,
      assets: assets.map(a => ({
        id: a._id.toString(),
        _id: a._id.toString(),
        name: a.name,
        description: a.description,
        fileName: a.fileName,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        url: a.getFileUrl ? a.getFileUrl() : undefined,
        metadata: {
          width: a.width,
          height: a.height,
          duration: a.duration,
          frameRate: a.frameRate,
        },
        usageCount: a.usage?.totalUsages || 0,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        deletedAt: (a as any).deletedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalAssets,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        total: totalAssets,
        categoryBreakdown: summary[0].categoryBreakdown,
        tagBreakdown: summary[0].tagBreakdown,
        featuredCount: summary[0].featuredCount[0]?.count || 0,
        publicCount: summary[0].publicCount[0]?.count || 0,
        totalUsage: summary[0].totalUsage[0]?.total || 0,
        avgFileSize: summary[0].avgFileSize[0]?.avg || 0,
        totalFileSize: summary[0].avgFileSize[0]?.total || 0,
      },
      filters: {
        category,
        tag,
        featured,
        isPublic,
        search,
        sortBy,
        sortOrder,
        includeAnalytics,
        includeAnimationData,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin lottie GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Lottie assets',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Handle bulk actions
    if (body.action && body.assetIds) {
      const bulkData = BulkActionSchema.parse(body);

      const updateData: Record<string, unknown> = {};

      switch (bulkData.action) {
        case 'feature':
          updateData.featured = true;
          break;
        case 'unfeature':
          updateData.featured = false;
          break;
        case 'publish':
          updateData.isPublic = true;
          break;
        case 'unpublish':
          updateData.isPublic = false;
          break;
        case 'delete':
          updateData.deletedAt = new Date();
          updateData.deletedBy = user._id;
          break;
      }

      const result = await LottieAsset.updateMany(
        { _id: { $in: bulkData.assetIds } },
        { $set: updateData }
      );

      return NextResponse.json({
        success: true,
        action: bulkData.action,
        affectedAssets: result.modifiedCount,
        message: `Successfully ${bulkData.action}ed ${result.modifiedCount} assets`,
      });
    }

    // Handle single asset creation
    const validatedData = LottieCreateSchema.parse(body);

    // Calculate file size from animation data if not provided
    const animationDataSize = JSON.stringify(
      validatedData.animationData
    ).length;

    const newAsset = new LottieAsset({
      ...validatedData,
      fileSize: animationDataSize,
      usage: {
        totalUsages: 0,
        projects: [],
        blogPosts: [],
      },
      audit: {
        createdBy: user._id,
        createdAt: new Date(),
        log: [
          {
            action: 'created',
            userId: user._id,
            userName: user.name,
            timestamp: new Date(),
            metadata: { category: validatedData.category },
          },
        ],
      },
    });

    await newAsset.save();

    return NextResponse.json(
      {
        success: true,
        asset: {
          _id: newAsset._id,
          name: newAsset.name,
          description: newAsset.description,
          tags: newAsset.tags,
          category: newAsset.category,
          fileUrl: newAsset.fileUrl,
          thumbnailUrl: newAsset.thumbnailUrl,
          duration: newAsset.duration,
          frameRate: newAsset.frameRate,
          dimensions: newAsset.dimensions,
          fileSize: newAsset.fileSize,
          isPublic: newAsset.isPublic,
          featured: newAsset.featured,
          createdAt: newAsset.createdAt,
          usage: newAsset.usage,
        },
        message: 'Lottie asset created successfully',
      },
      { status: 201 }
    );
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

    console.error('Admin lottie POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create Lottie asset',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
