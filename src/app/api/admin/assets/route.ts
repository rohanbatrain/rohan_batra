import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { blogPostCircuitBreaker } from '@/lib/circuit-breaker';
import { featureFlags } from '@/lib/feature-flags';
import User from '@/models/User';

// GET /api/admin/assets - List all assets with pagination and filtering
export async function GET(request: NextRequest) {
  try {
  const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const me = await User.findOne({ clerkId: userId });
    if (!me || (me.role !== 'admin' && me.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
  const type = searchParams.get('type');
  const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (type) query.type = type;
    if (category) query.category = category; // note: Asset doesn't define category, kept for forward-compat
    if (isActive !== null) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Execute query with circuit breaker protection
    const result = await blogPostCircuitBreaker.execute(async () => {
      const [assets, total] = await Promise.all([
        Asset.find(query)
          .populate('uploadedBy', 'name email')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Asset.countDocuments(query)
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

// POST /api/admin/assets - Create new asset (kept for future use)
export async function POST(request: NextRequest) {
  try {
  const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or editor
    const me = await User.findOne({ clerkId: userId });
    if (!me || (me.role !== 'admin' && me.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if asset integration feature is enabled
    const featureFlagContext = {
      userId: userId,
      userEmail: undefined,
      userRole: me.role,
      environment: process.env.NODE_ENV as 'development' | 'test' | 'production',
    };
    const hasAssetIntegration = featureFlags.isAdvancedFeatureEnabled('assetIntegration', featureFlagContext);
    if (!hasAssetIntegration.enabled) {
      return NextResponse.json(
        { error: 'Asset integration feature not available' },
        { status: 403 }
      );
    }

    // This JSON-based create endpoint is not used (file uploads go to /uploads).
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });

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