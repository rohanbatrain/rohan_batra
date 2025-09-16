import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPostModel from '@/models/BlogPost';
import { BlogPostWithAuthor } from '@/types/blog-post';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/blog/posts/[slug] - Get a single blog post by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post slug is required',
        },
        { status: 400 }
      );
    }

    // Find the blog post by slug and populate author
    const post = await BlogPostModel.findOne({
      slug,
      status: 'published', // Only return published posts
    }).populate('author', 'name email avatar role');

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
        },
        { status: 404 }
      );
    }

    // Increment view count
    await BlogPostModel.findByIdAndUpdate(post._id, {
      $inc: { viewCount: 1 },
    });

    // Transform to include author info
    const postWithAuthor: BlogPostWithAuthor = {
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      images: post.images,
      category: post.category,
      tags: post.tags,
      status: post.status,
      featured: post.featured,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      readingTime: post.readingTime,
      viewCount: post.viewCount + 1, // Include the incremented view
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      authorId: post.author._id.toString(),
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author._id.toString(),
        firstName: post.author.name.split(' ')[0] || '',
        lastName: post.author.name.split(' ').slice(1).join(' ') || '',
        avatar: post.author.avatar,
      },
    };

    return NextResponse.json({
      success: true,
      data: postWithAuthor,
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
