/**
 * T015: Course Graph API Endpoint
 * 
 * GET /api/courses/:courseId/graph
 * Returns knowledge graph for a course
 * 
 * @pattern Follows /src/app/api/courses/[courseId]/progress/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import User from '@/models/User';
import { buildCourseGraph } from '@/lib/graph/generator';
import { getCachedGraph, setCachedGraph, GraphCacheKeys } from '@/lib/graph/cache';

// Query parameter validation schema
const QuerySchema = z.object({
  depth: z.coerce.number().int().min(1).max(3).default(2),
  includeProgress: z.enum(['true', 'false']).optional(),
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/courses/:courseId/graph
 * 
 * Returns knowledge graph for a course
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    // 1. Auth check (optional - allow public access)
    const { userId } = await auth();

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      depth: searchParams.get('depth') || '2',
      includeProgress: searchParams.get('includeProgress'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { depth, includeProgress } = parsed.data;
    const shouldIncludeProgress = includeProgress === 'true' && !!userId;

    // 3. Connect to database
    await connectToDatabase();

    // 4. Course lookup (slug or ObjectId)
    const { courseId } = await ctx.params;
    const query = Types.ObjectId.isValid(courseId)
      ? { _id: new Types.ObjectId(courseId) }
      : { slug: courseId };

    const course = await CourseModel.findOne(query).lean();

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // 5. User lookup if authenticated
    let userObjectId: Types.ObjectId | null = null;
    if (userId && shouldIncludeProgress) {
      const userDoc = (await User.findOne({ clerkId: userId })
        .select('_id')
        .lean()) as { _id: Types.ObjectId } | null;
      
      if (userDoc) {
        userObjectId = userDoc._id;
      }
    }

    // 6. Build cache key (user-specific or public)
    const cacheKey = GraphCacheKeys.courseGraph(
      course._id.toString(),
      userObjectId?.toString()
    );

    // 7. Check cache
    const cached = await getCachedGraph(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // 8. Generate graph
    const graph = await buildCourseGraph({
      courseId: course._id as Types.ObjectId,
      userId: userObjectId,
      depth,
      includeProgress: shouldIncludeProgress,
    });

    // 9. Cache result (5 minutes TTL)
    await setCachedGraph(cacheKey, graph, 300);

    // 10. Return graph
    return NextResponse.json(graph, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('Error generating course graph:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
