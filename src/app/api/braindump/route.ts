import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Braindump from '@/models/Braindump';
import { checkRateLimit, publicApiLimiter } from '@/lib/ratelimit';
import { BraindumpQuerySchema } from '@/types/braindump';

// GET /api/braindump - Public listing of braindumps
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public endpoint
    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    const rateLimitResult = await checkRateLimit(publicApiLimiter, identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Reset in ${Math.ceil(rateLimitResult.reset / 1000)}s`,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil(rateLimitResult.reset / 1000).toString(),
          }
        }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    
    // Validate query params with Zod
    const queryResult = BraindumpQuerySchema.safeParse({
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined,
      tag: searchParams.get('tag') || undefined,
      sort: searchParams.get('sort') || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { page = 1, limit = 20, search, tag, sort = 'newest' } = queryResult.data;
    const skip = (page - 1) * limit;

    // Build query - only show public or unlisted braindumps
    const query: any = {
      visibility: { $in: ['public', 'unlisted'] },
    };

    if (search) {
      query.$text = { $search: search };
    }

    if (tag) {
      query.tags = tag;
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'views') {
      sortOptions = { 'publicMetadata.viewCount': -1, createdAt: -1 };
    } else if (sort === 'shares') {
      sortOptions = { 'publicMetadata.shareCount': -1, createdAt: -1 };
    }

    // Get braindumps with pagination
    const [braindumps, total] = await Promise.all([
      Braindump.find(query)
        .select('-userId -sharedWith -editHistory') // Exclude private fields
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Braindump.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        braindumps: braindumps.map(b => ({
          ...b,
          _id: b._id.toString(),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching public braindumps:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch braindumps',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
