import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ExperienceService } from '@/lib/services/experience-service';
import { ExperienceCreateInput } from '@/types/experience';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// Validation schema for creating experience
const createExperienceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  company: z.string().min(1, 'Company is required').max(200),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companyLogo: z.string().url().optional().or(z.literal('')),
  employmentType: z.enum([
    'Full-time',
    'Part-time',
    'Self-employed',
    'Freelance',
    'Contract',
    'Internship',
    'Apprenticeship',
    'Seasonal',
  ]),
  startDate: z
    .string()
    .or(z.date())
    .transform(val => new Date(val)),
  endDate: z
    .string()
    .or(z.date())
    .transform(val => new Date(val))
    .nullable()
    .optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().min(1, 'Location is required').max(200),
  description: z.string().min(1, 'Description is required'),
  descriptionFormat: z.enum(['rich-text', 'markdown']).default('rich-text'),
  skills: z.array(z.string()).default([]),
  displayOrder: z.number().int().min(0).optional(),
  published: z.boolean().default(false),
});

// Helper to check admin role
async function checkAdminRole() {
  const { userId } = await auth();

  if (!userId) {
    return { authorized: false, userId: null };
  }

  await connectToDatabase();

  // Check if user has admin or editor role
  const user = await User.findOne({ clerkId: userId });
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return { authorized: false, userId };
  }

  return { authorized: true, userId };
}

/**
 * GET /api/admin/experience
 * List all experiences with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await checkAdminRole();

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Editor access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const publishedParam = searchParams.get('published');
    const search = searchParams.get('search') || undefined;

    const published =
      publishedParam === 'true'
        ? true
        : publishedParam === 'false'
          ? false
          : undefined;

    const result = await ExperienceService.list({
      page,
      limit,
      published,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/experience
 * Create a new experience
 */
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await checkAdminRole();

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Editor access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createExperienceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const input = validationResult.data as ExperienceCreateInput;

    // Additional validation: endDate must be after startDate
    if (input.endDate && input.endDate <= input.startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const experience = await ExperienceService.create(input);

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
