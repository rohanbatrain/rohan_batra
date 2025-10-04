import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ExperienceService } from '@/lib/services/experience-service';
import { ExperienceReorderUpdate } from '@/types/experience';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// Validation schema for reorder request
const reorderSchema = z.array(
  z.object({
    id: z.string().min(1, 'Experience ID is required'),
    displayOrder: z.number().int().min(0, 'Display order must be non-negative'),
  })
);

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
 * POST /api/admin/experience/reorder
 * Batch update displayOrder for multiple experiences
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
    const validationResult = reorderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data as ExperienceReorderUpdate[];

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    const success = await ExperienceService.reorder(updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update some experiences' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Experiences reordered successfully', count: updates.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reordering experiences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
