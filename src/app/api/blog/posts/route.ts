import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPostModel from '@/models/BlogPost';
import UserModel from '@/models/User';
import { BlogPostWithAuthor } from '@/types/blog-post';

// GET /api/blog/posts - Get all blog posts with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, unknown> = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await BlogPostModel.countDocuments(query);

    // Get posts with author population
    const posts = await BlogPostModel.find(query)
      .populate('author', 'name email avatar role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform to include author info
    const postsWithAuthor: BlogPostWithAuthor[] = posts.map(post => ({
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      images: post.images || [],
      category: post.category,
      tags: post.tags,
      status: post.status,
      featured: post.featured,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      readingTime: post.readingTime,
      viewCount: post.viewCount,
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
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        posts: postsWithAuthor,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
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
