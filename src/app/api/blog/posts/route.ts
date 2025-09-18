import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getBlogPostsWithPagination } from '@/lib/blog-service';
import connectToDatabase from '@/lib/mongodb';
import BlogPostModel from '@/models/BlogPost';
import UserModel from '@/models/User';
import { BlogPostWithAuthor } from '@/types/blog-post';

// GET /api/blog/posts - Get all blog posts with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const author = searchParams.get('author') || undefined;
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search') || undefined;

    const result = await getBlogPostsWithPagination({
      page,
      limit,
      category,
      tag,
      author,
      status,
      search,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/blog/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get the current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Find the user in our database
    const user = await UserModel.findOne({
      email: clerkUser.emailAddresses[0].emailAddress,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if user has permission to create posts
    if (!['editor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to create blog posts',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      featuredImage,
      images = [],
      category,
      tags = [],
      status = 'draft',
      featured = false,
      seoTitle,
      seoDescription,
    } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, content, and category are required',
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingPost = await BlogPostModel.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'A blog post with this title already exists',
        },
        { status: 409 }
      );
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Create the blog post
    const newPost = new BlogPostModel({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      images,
      category,
      tags,
      status,
      featured,
      seoTitle,
      seoDescription,
      readingTime,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      author: user._id,
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    const savedPost = await newPost.save();

    // Populate author for response
    await savedPost.populate('author', 'name email avatar role');

    // Transform to include author info
    const postWithAuthor: BlogPostWithAuthor = {
      _id: savedPost._id.toString(),
      title: savedPost.title,
      slug: savedPost.slug,
      excerpt: savedPost.excerpt,
      content: savedPost.content,
      contentType: savedPost.contentType || 'html',
      featuredImage: savedPost.featuredImage,
      images: savedPost.images,
      category: savedPost.category,
      tags: savedPost.tags,
      status: savedPost.status,
      featured: savedPost.featured,
      seoTitle: savedPost.seoTitle,
      seoDescription: savedPost.seoDescription,
      readingTime: savedPost.readingTime,
      viewCount: savedPost.viewCount,
      likeCount: savedPost.likeCount,
      commentCount: savedPost.commentCount,
      attachedAssets: savedPost.attachedAssets || [],
      authorId: savedPost.author._id.toString(),
      publishedAt: savedPost.publishedAt,
      createdAt: savedPost.createdAt,
      updatedAt: savedPost.updatedAt,
      author: {
        id: savedPost.author._id.toString(),
        firstName: savedPost.author.name.split(' ')[0] || '',
        lastName: savedPost.author.name.split(' ').slice(1).join(' ') || '',
        avatar: savedPost.author.avatar,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: postWithAuthor,
        message: 'Blog post created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create blog post',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
