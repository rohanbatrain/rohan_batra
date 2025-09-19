import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import User from '@/models/User';
import { z } from 'zod';
import { featureFlags, FeatureFlagContext } from '@/lib/feature-flags';
import { blogPostCircuitBreaker } from '@/lib/circuit-breaker';

// Enhanced validation schemas with conditional fields
const BlogPostCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  markdown: z.string().optional(),
  excerpt: z.string().min(1).max(300),
  slug: z.string().min(1).max(100),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1),
  featured: z.boolean().optional().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  publishedAt: z.string().datetime().optional(),
  // Enhanced fields (conditionally validated)
  attachedAssets: z.array(z.object({
    asset: z.string(),
    usage: z.enum(['featured', 'content', 'gallery', 'attachment']).default('content'),
    caption: z.string().optional(),
    altText: z.string().optional(),
    position: z.number().optional(),
    metadata: z.record(z.any()).optional(),
  })).optional(),
  seoMetadata: z.object({
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.string().url().optional(),
    openGraph: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      type: z.string().optional(),
    }).optional(),
    twitter: z.object({
      card: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
    structuredData: z.record(z.any()).optional(),
  }).optional(),
});

const BulkActionSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
  postIds: z.array(z.string()).min(1),
});

// Helper function to create feature flag context from user
function createFeatureFlagContext(user: any): FeatureFlagContext {
  return {
    userId: user._id?.toString(),
    userEmail: user.email,
    userRole: user.role,
    environment: process.env.NODE_ENV,
    timestamp: new Date(),
  };
}

// Helper function to filter enhanced fields based on feature flags
function filterEnhancedFields(data: any, context: FeatureFlagContext) {
  const filtered = { ...data };

  // Remove enhanced fields if features are disabled
  if (!featureFlags.isAdvancedFeatureEnabled('assetIntegration', context).enabled) {
    delete filtered.attachedAssets;
  }

  if (!featureFlags.isAdvancedFeatureEnabled('enhancedValidation', context).enabled) {
    delete filtered.seoMetadata;
    delete filtered.validation;
    delete filtered.analytics;
  }

  return filtered;
}

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

    // Wrap in circuit breaker for enhanced reliability
    return await blogPostCircuitBreaker.execute(async () => {
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
      const context = createFeatureFlagContext(user);

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

      // Global audit trail entry
      try {
        const AuditLog = (await import('@/models/AuditLog')).default;
        await AuditLog.create({
          action: `blog.${bulkData.action}`,
          entityType: 'BlogPost',
          entityId: bulkData.postIds.join(','),
          userId: user._id.toString(),
          userEmail: user.email,
          meta: { bulk: true, count: result.modifiedCount },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        action: bulkData.action,
        affectedPosts: result.modifiedCount,
        message: `Successfully ${bulkData.action}ed ${result.modifiedCount} posts`,
      });
    }

    // Handle single post creation with enhanced features
    let validatedData;
    
    try {
      validatedData = BlogPostCreateSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        // Check if enhanced validation is enabled
        if (featureFlags.isAdvancedFeatureEnabled('enhancedValidation', context).enabled) {
          throw validationError; // Full validation for enhanced features
        } else {
          // Fallback: validate only basic fields
          const basicSchema = BlogPostCreateSchema.omit({
            attachedAssets: true,
            seoMetadata: true,
          });
          validatedData = basicSchema.parse(body);
        }
      } else {
        throw validationError;
      }
    }

    // Filter enhanced fields based on feature flags
    const filteredData = filterEnhancedFields(validatedData, context);

    // Generate slug if not provided or empty
    if (!filteredData.slug || filteredData.slug.trim() === '') {
      filteredData.slug = filteredData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Check for duplicate slug
    const existingPost = await BlogPost.findOne({ slug: filteredData.slug });
    if (existingPost) {
      filteredData.slug = `${filteredData.slug}-${Date.now()}`;
    }

    // Create the blog post with progressive feature support
    const postData: any = {
      title: filteredData.title,
      slug: filteredData.slug,
      excerpt: filteredData.excerpt,
      content: filteredData.content,
      markdown: filteredData.markdown || undefined,
      contentType: filteredData.markdown ? 'markdown' : 'html',
      category: filteredData.category,
      tags: filteredData.tags,
      status: filteredData.status,
      featured: filteredData.featured || false,
      featuredImageUrl: filteredData.featuredImage || '',
      seoTitle: filteredData.seoTitle || '',
      seoDescription: filteredData.seoDescription || '',
      authorId: user._id,
      readingTime: Math.ceil(filteredData.content.split(' ').length / 200),
      publishedAt: filteredData.status === 'published' ? new Date() : null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    };

    // Add enhanced fields if features are enabled
    if (featureFlags.isAdvancedFeatureEnabled('assetIntegration', context).enabled && filteredData.attachedAssets) {
      postData.attachedAssets = filteredData.attachedAssets;
    }

    if (featureFlags.isAdvancedFeatureEnabled('enhancedValidation', context).enabled && filteredData.seoMetadata) {
      postData.seoMetadata = filteredData.seoMetadata;
    }

  const newPost = new BlogPost(postData);
  await newPost.save();

    // Populate author for response
    await newPost.populate('authorId', 'name email');

    // Build response with feature-appropriate fields
    const responsePost: any = {
      _id: newPost._id,
      title: newPost.title,
      slug: newPost.slug,
      excerpt: newPost.excerpt,
      status: newPost.status,
      category: newPost.category,
      tags: newPost.tags,
      featuredImage: newPost.featuredImage,
      author: {
        _id: (newPost.authorId as { _id: string; name: string; email: string })._id,
        name: (newPost.authorId as { _id: string; name: string; email: string }).name,
        email: (newPost.authorId as { _id: string; name: string; email: string }).email,
      },
      createdAt: newPost.createdAt,
      updatedAt: newPost.updatedAt,
      publishedAt: newPost.publishedAt,
      seo: {
        title: newPost.seoTitle,
        description: newPost.seoDescription,
      },
    };

    // Include enhanced fields in response if features are enabled
    if (featureFlags.isAdvancedFeatureEnabled('assetIntegration', context).enabled && newPost.attachedAssets) {
      responsePost.attachedAssets = newPost.attachedAssets;
    }

    if (featureFlags.isAdvancedFeatureEnabled('enhancedValidation', context).enabled && newPost.seoMetadata) {
      responsePost.seoMetadata = newPost.seoMetadata;
    }

    // Global audit trail entry
    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'blog.create',
        entityType: 'BlogPost',
        entityId: newPost._id.toString(),
        userId: user._id.toString(),
        userEmail: user.email,
        meta: { slug: newPost.slug, title: newPost.title },
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        post: responsePost,
        message: 'Blog post created successfully',
        features: {
          assetIntegration: featureFlags.isAdvancedFeatureEnabled('assetIntegration', context).enabled,
          enhancedValidation: featureFlags.isAdvancedFeatureEnabled('enhancedValidation', context).enabled,
          advancedAnalytics: featureFlags.isAdvancedFeatureEnabled('advancedAnalytics', context).enabled,
        },
      },
      { status: 201 }
    );
    }); // Close circuit breaker execute
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
