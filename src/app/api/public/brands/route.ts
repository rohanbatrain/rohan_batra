import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BrandModel from '@/models/Brand';
import SocialProfileModel from '@/models/SocialProfile';
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitPresets,
  createRateLimitResponse,
} from '@/lib/rate-limit';

// GET /api/public/brands - Public endpoint for brands and profiles
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, rateLimitPresets.public);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    await connectToDatabase();

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Only fetch active, public brands
    const [brands, totalCount] = await Promise.all([
      BrandModel.find({
        isActive: true,
        visibility: 'public',
      })
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BrandModel.countDocuments({
        isActive: true,
        visibility: 'public',
      }),
    ]);

    // Get all brand IDs to fetch profiles in one query (avoiding N+1)
    const brandIds = brands.map((b: any) => b._id);
    
    // Fetch all public profiles for these brands in one query
    const allProfiles = await SocialProfileModel.find({
      brandId: { $in: brandIds },
      isActive: true,
      visibility: 'public',
    })
      .sort({ order: 1 })
      .lean();

    // Group profiles by brandId
    const profilesByBrand = allProfiles.reduce((acc: any, profile: any) => {
      const brandIdStr = profile.brandId.toString();
      if (!acc[brandIdStr]) {
        acc[brandIdStr] = [];
      }
      acc[brandIdStr].push(profile);
      return acc;
    }, {});

    // Map brands with their profiles (minimized data exposure)
    const brandsWithProfiles = brands.map((brand: any) => {
      const brandIdStr = brand._id.toString();
      const profiles = profilesByBrand[brandIdStr] || [];

      return {
        id: brandIdStr,
        name: brand.name,
        displayName: brand.displayName,
        slug: brand.slug,
        description: brand.description,
        // Remove internal fields: type, isPrimary, order
        theme: brand.theme,
        profiles: profiles.map((profile: any) => ({
          id: profile._id.toString(),
          platform: profile.platform,
          username: profile.username,
          profileUrl: profile.profileUrl,
          displayName: profile.displayName,
          isVerified: profile.isVerified,
          // Remove internal field: order
          stats: profile.stats,
        })),
      };
    });

    // Sort to put primary brand first (but don't expose isPrimary flag)
    const sortedBrands = brandsWithProfiles.sort((a, b) => {
      // Primary brand stays first based on internal data, but we don't expose that
      const aBrand = brands.find((br: any) => br._id.toString() === a.id);
      const bBrand = brands.find((br: any) => br._id.toString() === b.id);
      
      if (aBrand?.isPrimary) return -1;
      if (bBrand?.isPrimary) return 1;
      return 0;
    });

    return NextResponse.json({
      brands: sortedBrands,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching public brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
