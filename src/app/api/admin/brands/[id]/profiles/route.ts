import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import BrandModel from '@/models/Brand';
import SocialProfileModel from '@/models/SocialProfile';
import UserModel from '@/models/User';

// Helper function to check authorization
async function getAuthorizedUser(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId });
  const userRole = (currentUser?.role as string) || 'user';

  if (!['editor', 'admin'].includes(userRole)) {
    return { authorized: false as const, currentUser, userRole };
  }

  return { authorized: true as const, currentUser, userRole };
}

// Validation schema
const createProfileSchema = z.object({
  platform: z.enum([
    'instagram',
    'twitter',
    'linkedin',
    'github',
    'youtube',
    'tiktok',
    'facebook',
    'threads',
    'mastodon',
    'bluesky',
    'medium',
    'dev.to',
    'hashnode',
    'dribbble',
    'behance',
    'pinterest',
    'snapchat',
    'reddit',
    'discord',
    'telegram',
    'whatsapp',
    'spotify',
    'twitch',
    'tinder',
    'bumble',
    'hinge',
    'website',
    'email',
    'other',
  ]),
  username: z.string().min(1).max(100),
  profileUrl: z.string().url(),
  displayName: z.string().max(100).optional(),
  description: z.string().max(300).optional(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  order: z.number().min(0).default(0),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  stats: z
    .object({
      followers: z.number().min(0).optional(),
      following: z.number().min(0).optional(),
      posts: z.number().min(0).optional(),
    })
    .optional(),
  customIcon: z.string().max(50).optional(),
});

// GET /api/admin/brands/[id]/profiles - List profiles for brand
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(brandId)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    await connectToDatabase();

    const brand = await BrandModel.findById(brandId);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const profiles = await SocialProfileModel.find({ brandId })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      profiles: profiles.map((profile: any) => ({
        id: profile._id.toString(),
        brandId: profile.brandId.toString(),
        platform: profile.platform,
        username: profile.username,
        profileUrl: profile.profileUrl,
        displayName: profile.displayName,
        description: profile.description,
        isActive: profile.isActive,
        isVerified: profile.isVerified,
        order: profile.order,
        visibility: profile.visibility,
        stats: profile.stats,
        customIcon: profile.customIcon,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/brands/[id]/profiles - Create new profile
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(brandId)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createProfileSchema.parse(body);

    await connectToDatabase();

    const brand = await BrandModel.findById(brandId);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Check for duplicate platform + username combo for this brand
    const existingProfile = await SocialProfileModel.findOne({
      brandId,
      platform: parsed.platform,
      username: parsed.username,
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile with this platform and username already exists for this brand' },
        { status: 409 }
      );
    }

    const profile = await SocialProfileModel.create({
      ...parsed,
      brandId,
    });

    return NextResponse.json({
      profile: {
        id: profile._id.toString(),
        brandId: profile.brandId.toString(),
        platform: profile.platform,
        username: profile.username,
        profileUrl: profile.profileUrl,
        displayName: profile.displayName,
        description: profile.description,
        isActive: profile.isActive,
        isVerified: profile.isVerified,
        order: profile.order,
        visibility: profile.visibility,
        stats: profile.stats,
        customIcon: profile.customIcon,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
