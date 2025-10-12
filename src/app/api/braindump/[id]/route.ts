import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Braindump from '@/models/Braindump';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { checkRateLimit, publicApiLimiter } from '@/lib/ratelimit';

// GET /api/braindump/[id] - Public view of a single braindump
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid braindump ID',
        },
        { status: 400 }
      );
    }

    // Find braindump by ID or slug
    const braindump = await Braindump.findOne({
      $or: [
        { _id: new Types.ObjectId(id) },
        { slug: id },
      ],
    });

    if (!braindump) {
      return NextResponse.json(
        {
          success: false,
          error: 'Braindump not found',
        },
        { status: 404 }
      );
    }

    // Check visibility - only public/unlisted can be viewed without auth
    if (!['public', 'unlisted'].includes(braindump.visibility)) {
      return NextResponse.json(
        {
          success: false,
          error: 'This braindump is private',
        },
        { status: 403 }
      );
    }

    // Increment view count
    await Braindump.findByIdAndUpdate(braindump._id, {
      $inc: { 'publicMetadata.viewCount': 1 },
    });

    // Track analytics event (non-blocking)
    AnalyticsEvent.create({
      type: 'view',
      braindumpId: braindump._id,
      metadata: {
        referrer: request.headers.get('referer') || 'direct',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ip: identifier,
      },
    }).catch((err: Error) => console.error('Failed to track analytics:', err));

    // Return public JSON
    return NextResponse.json({
      success: true,
      data: braindump.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error fetching braindump:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch braindump',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
