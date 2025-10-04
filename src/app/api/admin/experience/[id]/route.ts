import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ExperienceService } from '@/lib/services/experience-service';
import { ExperienceUpdateInput } from '@/types/experience';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// Validation schema for updating experience
const updateExperienceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  company: z.string().min(1).max(200).optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companyLogo: z.string().url().optional().or(z.literal('')),
  employmentType: z
    .enum([
      'Full-time',
      'Part-time',
      'Self-employed',
      'Freelance',
      'Contract',
      'Internship',
      'Apprenticeship',
      'Seasonal',
    ])
    .optional(),
  startDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .nullable()
    .optional(),
  isCurrent: z.boolean().optional(),
  location: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  descriptionFormat: z.enum(['rich-text', 'markdown']).optional(),
  skills: z.array(z.string()).optional(),
  displayOrder: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
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
 * GET /api/admin/experience/:id
 * Get a single experience by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminRole();

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Editor access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid experience ID' },
        { status: 400 }
      );
    }

    const experience = await ExperienceService.getById(id);

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/experience/:id
 * Update an existing experience
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminRole();

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Editor access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid experience ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateExperienceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const input = validationResult.data as ExperienceUpdateInput;

    // Additional validation: if both dates provided, endDate must be after startDate
    if (input.startDate && input.endDate) {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      if (end <= start) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    const experience = await ExperienceService.update(id, input);

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/experience/:id
 * Delete an experience
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminRole();

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Editor access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid experience ID' },
        { status: 400 }
      );
    }

    const deleted = await ExperienceService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
