import { NextRequest, NextResponse } from 'next/server';
import { ExperienceService } from '@/lib/services/experience-service';

/**
 * GET /api/experience
 * Public endpoint - Get published experiences
 * Supports ?limit=n for homepage (e.g., limit=3)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Validate limit if provided
    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      );
    }

    const experiences = await ExperienceService.getPublished(limit);

    return NextResponse.json({
      experiences,
      count: experiences.length,
    });
  } catch (error) {
    console.error('Error fetching public experiences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
