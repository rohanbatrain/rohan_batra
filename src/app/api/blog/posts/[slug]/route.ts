import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostBySlug } from '@/lib/blog-service';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET /api/blog/posts/[slug] - Get a single blog post by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post slug is required',
        },
        { status: 400 }
      );
    }

    // Get the blog post using the service
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog post',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
