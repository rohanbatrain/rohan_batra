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
const updateBrandSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  displayName: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-_]+$/).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['professional', 'creative', 'personal', 'other']).optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
  order: z.number().min(0).optional(),
  theme: z
    .object({
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      icon: z.string().max(50).optional(),
    })
    .optional(),
  metadata: z
    .object({
      followers: z.number().min(0).optional(),
      totalPosts: z.number().min(0).optional(),
      websiteUrl: z.string().url().optional(),
    })
    .optional(),
});

// GET /api/admin/brands/[id] - Get single brand
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    await connectToDatabase();

    const brand: any = await BrandModel.findById(id).lean();

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Get associated social profiles
    const profiles = await SocialProfileModel.find({ brandId: brand._id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      brand: {
        id: brand._id.toString(),
        name: brand.name,
        displayName: brand.displayName,
        slug: brand.slug,
        description: brand.description,
        type: brand.type,
        visibility: brand.visibility,
        isPrimary: brand.isPrimary,
        isActive: brand.isActive,
        order: brand.order,
        theme: brand.theme,
        metadata: brand.metadata,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
        profiles: profiles.map((profile: any) => ({
          id: profile._id.toString(),
          platform: profile.platform,
          username: profile.username,
          profileUrl: profile.profileUrl,
          displayName: profile.displayName,
          isActive: profile.isActive,
          isVerified: profile.isVerified,
          order: profile.order,
          visibility: profile.visibility,
          stats: profile.stats,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateBrandSchema.parse(body);

    await connectToDatabase();

    // If setting as primary, unset other primary brands
    if (parsed.isPrimary) {
      await BrandModel.updateMany({ _id: { $ne: id }, isPrimary: true }, { isPrimary: false });
    }

    const brand = await BrandModel.findByIdAndUpdate(id, parsed, {
      new: true,
      runValidators: true,
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({
      brand: {
        id: brand._id.toString(),
        name: brand.name,
        displayName: brand.displayName,
        slug: brand.slug,
        description: brand.description,
        type: brand.type,
        visibility: brand.visibility,
        isPrimary: brand.isPrimary,
        isActive: brand.isActive,
        order: brand.order,
        theme: brand.theme,
        metadata: brand.metadata,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/brands/[id] - Delete brand
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    await connectToDatabase();

    const brand = await BrandModel.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Delete associated social profiles
    await SocialProfileModel.deleteMany({ brandId: id });

    return NextResponse.json({
      message: 'Brand deleted successfully',
      brand: {
        id: brand._id.toString(),
        name: brand.name,
      },
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
