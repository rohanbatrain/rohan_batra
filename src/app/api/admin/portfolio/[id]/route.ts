import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { z } from 'zod';

const ProjectUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().max(500).optional(),
  slug: z.string().min(1).max(100).optional(),
  technologies: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        caption: z.string().optional(),
      })
    )
    .optional(),
  links: z
    .object({
      live: z.string().url().optional(),
      github: z.string().url().optional(),
      demo: z.string().url().optional(),
      documentation: z.string().url().optional(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().max(60).optional(),
      description: z.string().max(160).optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  publishedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

export async function GET(
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

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const includeAnalytics =
      url.searchParams.get('includeAnalytics') === 'true';
    const includeAudit = url.searchParams.get('includeAudit') === 'true';

    const response = {
      success: true,
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        shortDescription: project.shortDescription,
        slug: project.slug,
        technologies: project.technologies,
        categories: project.categories,
        status: project.status,
        featured: project.featured,
        images: project.images,
        links: project.links,
        seo: project.seo,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        publishedAt: project.publishedAt,
        completedAt: project.completedAt,
        analytics: includeAnalytics
          ? project.analytics
          : {
              views: project.analytics?.views || 0,
              likes: project.analytics?.likes || 0,
              shares: project.analytics?.shares || 0,
            },
        audit: includeAudit ? project.audit : undefined,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
        includeAnalytics,
        includeAudit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin project GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
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
    const validatedData = ProjectUpdateSchema.parse(body);

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check for slug conflicts if updating slug
    if (validatedData.slug && validatedData.slug !== project.slug) {
      const existingProject = await Project.findOne({
        slug: validatedData.slug,
        _id: { $ne: id },
      });

      if (existingProject) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug already exists',
            field: 'slug',
          },
          { status: 409 }
        );
      }
    }

    const previousStatus = project.status;
    const currentTime = new Date();
    const updateData: Record<string, unknown> = { ...validatedData };

    // Handle status changes
    if (validatedData.status && validatedData.status !== previousStatus) {
      if (validatedData.status === 'published' && !project.publishedAt) {
        updateData.publishedAt = currentTime;
      } else if (validatedData.status !== 'published') {
        updateData.publishedAt = null;
      }
    }

    // Add audit trail entry
    const auditEntry = {
      action: 'updated',
      userId: user._id,
      userName: user.name,
      timestamp: currentTime,
      metadata: {
        fields: Object.keys(validatedData),
        previousStatus,
        newStatus: validatedData.status,
      },
    };

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        $set: { ...updateData, updatedAt: currentTime },
        $push: { 'audit.log': auditEntry },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      project: {
        _id: updatedProject._id,
        title: updatedProject.title,
        description: updatedProject.description,
        shortDescription: updatedProject.shortDescription,
        slug: updatedProject.slug,
        technologies: updatedProject.technologies,
        categories: updatedProject.categories,
        status: updatedProject.status,
        featured: updatedProject.featured,
        images: updatedProject.images,
        links: updatedProject.links,
        seo: updatedProject.seo,
        createdAt: updatedProject.createdAt,
        updatedAt: updatedProject.updatedAt,
        publishedAt: updatedProject.publishedAt,
        completedAt: updatedProject.completedAt,
        analytics: {
          views: updatedProject.analytics?.views || 0,
          likes: updatedProject.analytics?.likes || 0,
          shares: updatedProject.analytics?.shares || 0,
        },
      },
      message: 'Project updated successfully',
      changes: Object.keys(validatedData),
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

    console.error('Admin project PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project',
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
      return NextResponse.json(
        { success: false, error: 'Admin access required for deletion' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanent deletion
      await Project.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Project permanently deleted',
        project: {
          _id: project._id,
          title: project.title,
          slug: project.slug,
        },
      });
    } else {
      // Soft deletion
      const currentTime = new Date();
      const auditEntry = {
        action: 'soft_deleted',
        userId: user._id,
        userName: user.name,
        timestamp: currentTime,
        metadata: { reason: 'Admin deletion' },
      };

      const deletedProject = await Project.findByIdAndUpdate(
        id,
        {
          $set: {
            deletedAt: currentTime,
            deletedBy: user._id,
            status: 'archived',
          },
          $push: { 'audit.log': auditEntry },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Project soft deleted',
        project: {
          _id: deletedProject._id,
          title: deletedProject.title,
          slug: deletedProject.slug,
          deletedAt: deletedProject.deletedAt,
        },
      });
    }
  } catch (error) {
    console.error('Admin project DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
