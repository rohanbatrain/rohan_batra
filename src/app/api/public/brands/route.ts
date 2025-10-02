import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BrandModel from '@/models/Brand';
import SocialProfileModel from '@/models/SocialProfile';

// GET /api/public/brands - Public endpoint for brands and profiles
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Only fetch active, public brands
    const brands = await BrandModel.find({
      isActive: true,
      visibility: 'public',
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Fetch public profiles for each brand
    const brandsWithProfiles = await Promise.all(
      brands.map(async (brand: any) => {
        const profiles = await SocialProfileModel.find({
          brandId: brand._id,
          isActive: true,
          visibility: 'public',
        })
          .sort({ order: 1 })
          .lean();

        return {
          id: brand._id.toString(),
          name: brand.name,
          displayName: brand.displayName,
          slug: brand.slug,
          description: brand.description,
          type: brand.type,
          isPrimary: brand.isPrimary,
          order: brand.order,
          theme: brand.theme,
          metadata: brand.metadata,
          profiles: profiles.map((profile: any) => ({
            id: profile._id.toString(),
            platform: profile.platform,
            username: profile.username,
            profileUrl: profile.profileUrl,
            displayName: profile.displayName,
            isVerified: profile.isVerified,
            order: profile.order,
            stats: profile.stats,
          })),
        };
      })
    );

    // Sort by order and put primary brand first
    const sortedBrands = brandsWithProfiles.sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return a.order - b.order;
    });

    return NextResponse.json({ brands: sortedBrands });
  } catch (error) {
    console.error('Error fetching public brands:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
