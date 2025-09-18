import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import User from '@/models/User';
import { z } from 'zod';

const BlogPostUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  slug: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featuredImage: z.string().url().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  publishedAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const post = await BlogPost.findById(id).populate('authorId', 'name email');

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      post: {
        _id: post._id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        slug: post.slug,
        status: post.status,
        category: post.category,
        tags: post.tags,
        featuredImage: post.featuredImage,
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
        analytics: post.analytics,
        seo: {
          title: post.seoTitle,
          description: post.seoDescription,
        },
        audit: post.audit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin blog post GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog post',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = BlogPostUpdateSchema.parse(body);

    // Check if post exists
    const existingPost = await BlogPost.findById(id);
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check for slug uniqueness if slug is being updated
    if (validatedData.slug && validatedData.slug !== existingPost.slug) {
      const slugExists = await BlogPost.findOne({
        slug: validatedData.slug,
        _id: { $ne: id },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug already exists',
            details: [{ path: ['slug'], message: 'Slug already exists' }],
          },
          { status: 400 }
        );
      }
    }

    // Handle status changes
    const statusChanged =
      validatedData.status && validatedData.status !== existingPost.status;
    const updateData: Record<string, unknown> = { ...validatedData };

    if (statusChanged) {
      if (
        validatedData.status === 'published' &&
        existingPost.status !== 'published'
      ) {
        updateData.publishedAt = new Date();
      } else if (validatedData.status !== 'published') {
        updateData.publishedAt = null;
      }
    }

    // Update read time if content changed
    if (validatedData.content) {
      updateData['analytics.readTime'] = Math.ceil(
        validatedData.content.split(' ').length / 200
      );
    }

    // Add audit log entry
    const auditEntry = {
      action: 'updated',
      userId: user._id,
      userName: user.name,
      timestamp: new Date(),
      metadata: {
        changedFields: Object.keys(validatedData),
        statusChanged,
        previousStatus: existingPost.status,
        newStatus: validatedData.status,
      },
    };

    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      {
        $set: { ...updateData, updatedAt: new Date() },
        $push: { 'audit.log': auditEntry },
      },
      { new: true, runValidators: true }
    ).populate('authorId', 'name email');

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, error: 'Failed to update blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: {
        _id: updatedPost._id,
        title: updatedPost.title,
        content: updatedPost.content,
        excerpt: updatedPost.excerpt,
        slug: updatedPost.slug,
        status: updatedPost.status,
        category: updatedPost.category,
        tags: updatedPost.tags,
        featuredImage: updatedPost.featuredImage,
        author: updatedPost.authorId
          ? {
              _id: (
                updatedPost.authorId as {
                  _id: string;
                  name: string;
                  email: string;
                }
              )._id,
              name: (
                updatedPost.authorId as {
                  _id: string;
                  name: string;
                  email: string;
                }
              ).name,
              email: (
                updatedPost.authorId as {
                  _id: string;
                  name: string;
                  email: string;
                }
              ).email,
            }
          : null,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        publishedAt: updatedPost.publishedAt,
        scheduledFor: updatedPost.scheduledFor,
        analytics: updatedPost.analytics,
        seo: {
          title: updatedPost.seoTitle,
          description: updatedPost.seoDescription,
        },
      },
      changes: {
        fieldsModified: Object.keys(validatedData),
        statusChanged,
        previousStatus: existingPost.status,
        newStatus: updatedPost.status,
      },
      message: 'Blog post updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin blog post PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update blog post',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || user.role !== 'admin') {
      // Only admins can delete
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';

    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanent deletion
      await BlogPost.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Blog post permanently deleted',
        deletedPost: {
          _id: post._id,
          title: post.title,
          slug: post.slug,
        },
        permanent: true,
      });
    } else {
      // Soft deletion
      const deletedPost = await BlogPost.findByIdAndUpdate(
        id,
        {
          $set: {
            deletedAt: new Date(),
            deletedBy: user._id,
            status: 'archived',
          },
          $push: {
            'audit.log': {
              action: 'soft_deleted',
              userId: user._id,
              userName: user.name,
              timestamp: new Date(),
              metadata: { permanent: false },
            },
          },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Blog post moved to trash',
        deletedPost: {
          _id: deletedPost._id,
          title: deletedPost.title,
          slug: deletedPost.slug,
          deletedAt: deletedPost.deletedAt,
        },
        permanent: false,
        canRestore: true,
      });
    }
  } catch (error) {
    console.error('Admin blog post DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete blog post',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
