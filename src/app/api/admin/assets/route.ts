import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import LottieAsset from '@/models/LottieAsset';
import { blogPostCircuitBreaker } from '@/lib/circuit-breaker';
import { featureFlags } from '@/lib/feature-flags';

// GET /api/admin/assets - List all assets with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = sessionClaims?.metadata?.role;
    if (userRole !== 'admin' && userRole !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with circuit breaker protection
    const result = await blogPostCircuitBreaker.execute(async () => {
      const [assets, total] = await Promise.all([
        LottieAsset.find(query)
          .populate('uploadedBy', 'id firstName lastName email')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        LottieAsset.countDocuments(query)
      ]);

      return { assets, total };
    });

    const totalPages = Math.ceil(result.total / limit);

    return NextResponse.json({
      success: true,
      data: {
        assets: result.assets,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or editor
    const userRole = sessionClaims?.metadata?.role;
    if (userRole !== 'admin' && userRole !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if asset integration feature is enabled
    const featureFlagContext = {
      userId: userId,
      userEmail: undefined, // Not available from Clerk session claims
      userRole: userRole,
      environment: process.env.NODE_ENV as 'development' | 'test' | 'production',
    };    const hasAssetIntegration = featureFlags.isAdvancedFeatureEnabled('assetIntegration', featureFlagContext);
    if (!hasAssetIntegration.enabled) {
      return NextResponse.json(
        { error: 'Asset integration feature not available' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      fileName,
      filePath,
      fileSize,
      mimeType,
      width,
      height,
      frameRate,
      duration,
      loop = true,
      autoplay = false,
      tags = [],
      category = 'other',
    } = body;

    // Validate required fields
    if (!name || !fileName || !filePath || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, fileName, filePath, fileSize, mimeType' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create new asset with circuit breaker protection
    const asset = await blogPostCircuitBreaker.execute(async () => {
      return await LottieAsset.create({
        name,
        description,
        fileName,
        filePath,
        fileSize,
        mimeType,
        width,
        height,
        frameRate,
        duration,
        loop,
        autoplay,
        tags,
        category,
        uploadedBy: userId,
      });
    });

    // Populate the uploadedBy field for response
    await asset.populate('uploadedBy', 'id firstName lastName email');

    return NextResponse.json({
      success: true,
      data: asset,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating asset:', error);
    
    if (error instanceof Error && error.message.includes('Invalid file extension')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}