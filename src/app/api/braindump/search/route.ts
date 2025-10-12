/**
 * API Route: GET /api/braindump/search
 * Full-text search for public braindumps
 */

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { searchBraindumps, getSearchSuggestions } from '@/lib/search';
import { checkRateLimit, publicApiLimiter } from '@/lib/ratelimit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier =
      request.headers.get('x-forwarded-for') ||
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const tags = searchParams.get('tags');
    const sortBy = searchParams.get('sort') as 'relevance' | 'recent' | 'popular' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const suggestions = searchParams.get('suggestions') === 'true';

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query must be at least 2 characters',
        },
        { status: 400 }
      );
    }

    // Handle suggestions request
    if (suggestions) {
      const suggestionResults = await getSearchSuggestions(query, 5);

      return NextResponse.json({
        success: true,
        data: {
          suggestions: suggestionResults,
        },
      });
    }

    // Parse tags
    const tagArray = tags ? tags.split(',').map((t) => t.trim()) : [];

    // Perform search
    const results = await searchBraindumps({
      query: query.trim(),
      tags: tagArray,
      visibility: ['public', 'unlisted'],
      limit,
      skip: (page - 1) * limit,
      sortBy: sortBy || 'relevance',
    });

    // Calculate pagination info
    const total = results.length; // Note: This is approximate for current page
    const hasMore = results.length === limit;

    return NextResponse.json({
      success: true,
      data: {
        query: query.trim(),
        results,
        pagination: {
          page,
          limit,
          total,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
