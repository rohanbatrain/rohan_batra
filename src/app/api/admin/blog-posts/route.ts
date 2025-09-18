import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import User from '@/models/User';
import { z } from 'zod';

// Validation schemas
const BlogPostCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().min(1).max(300), // Make required as model expects it
  slug: z.string().min(1).max(100),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featuredImage: z.string().optional(), // Allow empty string or URL
  tags: z.array(z.string()).default([]),
  category: z.string().min(1), // Make required as model expects it
  featured: z.boolean().optional().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  publishedAt: z.string().datetime().optional(),
});

const BulkActionSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
  postIds: z.array(z.string()).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user and check admin permissions
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      100
    );
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const author = url.searchParams.get('author');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const includeAnalytics =
      url.searchParams.get('includeAnalytics') === 'true';

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (author) {
      filter.authorId = author;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    // Execute query with conditional field selection
    let query = BlogPost.find(filter)
      .populate('authorId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (!includeAnalytics) {
      query = query.select(
        '-analytics.detailedMetrics -analytics.socialShares.details'
      );
    }

    const posts = await query;

    // Get total count for pagination
    const totalPosts = await BlogPost.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    // Get summary statistics
    const summary = await BlogPost.aggregate([
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          categoryBreakdown: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          authorBreakdown: [
            {
              $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author',
              },
            },
            { $unwind: '$author' },
            { $group: { _id: '$author.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          totalViews: [
            { $group: { _id: null, total: { $sum: '$analytics.views' } } },
          ],
          averageReadTime: [
            { $group: { _id: null, average: { $avg: '$analytics.readTime' } } },
          ],
        },
      },
    ]);

    const response = {
      success: true,
      posts: posts.map(post => ({
        _id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        status: post.status,
        categories: post.categories,
        tags: post.tags,
        featuredImage: post.featuredImage,
        authorId: post.authorId,
        author: post.authorId
          ? {
              _id: (
                post.authorId as { _id: string; name: string; email: string }
              )._id,
              name: (
                post.authorId as { _id: string; name: string; email: string }
              ).name,
              email: (
                post.authorId as { _id: string; name: string; email: string }
              ).email,
            }
          : null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
        scheduledFor: post.scheduledFor,
        analytics: includeAnalytics
          ? post.analytics
          : {
              views: post.analytics?.views || 0,
              likes: post.analytics?.likes || 0,
              comments: post.analytics?.comments || 0,
              readTime: post.analytics?.readTime || 0,
            },
        seo: {
          title: post.seoTitle,
          description: post.seoDescription,
        },
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        total: totalPosts,
        statusBreakdown: summary[0].statusBreakdown,
        categoryBreakdown: summary[0].categoryBreakdown,
        authorBreakdown: summary[0].authorBreakdown,
        totalViews: summary[0].totalViews[0]?.total || 0,
        averageReadTime: Math.round(
          summary[0].averageReadTime[0]?.average || 0
        ),
      },
      filters: {
        status,
        category,
        author,
        search,
        sortBy,
        sortOrder,
        includeAnalytics,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin blog posts GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user and check admin permissions
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Handle bulk actions
    if (body.action && body.postIds) {
      const bulkData = BulkActionSchema.parse(body);

      const updateData: Record<string, unknown> = {};
      const currentTime = new Date();

      switch (bulkData.action) {
        case 'publish':
          updateData.status = 'published';
          updateData.publishedAt = currentTime;
          break;
        case 'unpublish':
          updateData.status = 'draft';
          updateData.publishedAt = null;
          break;
        case 'archive':
          updateData.status = 'archived';
          break;
        case 'delete':
          // Soft delete - mark as deleted
          updateData.deletedAt = currentTime;
          updateData.deletedBy = user._id;
          break;
      }

      const result = await BlogPost.updateMany(
        { _id: { $in: bulkData.postIds } },
        {
          $set: updateData,
          $push: {
            'audit.log': {
              action: bulkData.action,
              userId: user._id,
              userName: user.name,
              timestamp: currentTime,
              metadata: { bulk: true, count: bulkData.postIds.length },
            },
          },
        }
      );

      return NextResponse.json({
        success: true,
        action: bulkData.action,
        affectedPosts: result.modifiedCount,
        message: `Successfully ${bulkData.action}ed ${result.modifiedCount} posts`,
      });
    }

    // Handle single post creation
    const validatedData = BlogPostCreateSchema.parse(body);

    // Generate slug if not provided or empty
    if (!validatedData.slug || validatedData.slug.trim() === '') {
      validatedData.slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Check for duplicate slug
    const existingPost = await BlogPost.findOne({ slug: validatedData.slug });
    if (existingPost) {
      validatedData.slug = `${validatedData.slug}-${Date.now()}`;
    }

    // Create the blog post with proper field mapping
    const postData = {
      title: validatedData.title,
      slug: validatedData.slug,
      excerpt: validatedData.excerpt,
      content: validatedData.content,
      category: validatedData.category,
      tags: validatedData.tags,
      status: validatedData.status,
      featured: validatedData.featured || false,
      featuredImageUrl: validatedData.featuredImage || '',
      seoTitle: validatedData.seoTitle || '',
      seoDescription: validatedData.seoDescription || '',
      authorId: user._id,
      readingTime: Math.ceil(validatedData.content.split(' ').length / 200),
      publishedAt: validatedData.status === 'published' ? new Date() : null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    };

    const newPost = new BlogPost(postData);
    await newPost.save();

    // Populate author for response
    await newPost.populate('authorId', 'name email');

    return NextResponse.json(
      {
        success: true,
        post: {
          _id: newPost._id,
          title: newPost.title,
          slug: newPost.slug,
          excerpt: newPost.excerpt,
          status: newPost.status,
          categories: newPost.categories,
          tags: newPost.tags,
          featuredImage: newPost.featuredImage,
          author: {
            _id: (
              newPost.authorId as { _id: string; name: string; email: string }
            )._id,
            name: (
              newPost.authorId as { _id: string; name: string; email: string }
            ).name,
            email: (
              newPost.authorId as { _id: string; name: string; email: string }
            ).email,
          },
          createdAt: newPost.createdAt,
          updatedAt: newPost.updatedAt,
          publishedAt: newPost.publishedAt,
          analytics: newPost.analytics,
          seo: {
            title: newPost.seoTitle,
            description: newPost.seoDescription,
          },
        },
        message: 'Blog post created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Blog post validation error:', error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin blog posts POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create blog post',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
