import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import BrandModel from '@/models/Brand';
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
const createBrandSchema = z.object({
  name: z.string().min(2).max(50),
  displayName: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-_]+$/).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['professional', 'creative', 'personal', 'other']),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().min(0).default(0),
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

// GET /api/admin/brands - List all brands
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectToDatabase();

    const brands = await BrandModel.find().sort({ order: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      brands: brands.map((brand: any) => ({
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
      })),
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/brands - Create new brand
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createBrandSchema.parse(body);

    await connectToDatabase();

    // If setting as primary, unset other primary brands
    if (parsed.isPrimary) {
      await BrandModel.updateMany({ isPrimary: true }, { isPrimary: false });
    }

    const brand = await BrandModel.create(parsed);

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

    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
