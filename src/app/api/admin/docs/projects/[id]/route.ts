import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import DocProjectModel from '@/models/DocProject';
import DocSectionModel from '@/models/DocSection';
import DocPageModel from '@/models/DocPage';
import UserModel from '@/models/User';

const DocProjectUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().min(10).max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  projectId: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  config: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    primaryColor: z.string().optional(),
    sidebarPosition: z.enum(['left', 'right']).optional(),
    showToc: z.boolean().optional(),
    showBreadcrumbs: z.boolean().optional(),
    showLastUpdated: z.boolean().optional(),
    showContributors: z.boolean().optional(),
  }).optional(),
  externalLinks: z.object({
    github: z.string().url().optional().or(z.literal('')),
    npm: z.string().url().optional().or(z.literal('')),
    demo: z.string().url().optional().or(z.literal('')),
    support: z.string().url().optional().or(z.literal('')),
  }).optional(),
  seo: z.object({
    title: z.string().max(70).optional(),
    description: z.string().max(160).optional(),
    image: z.string().url().optional().or(z.literal('')),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

async function getAuthorizedUser(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId });
  const userRole = (currentUser?.role as string) || 'user';

  if (!['editor', 'admin'].includes(userRole)) {
    return { authorized: false as const, currentUser, userRole };
  }

  return { authorized: true as const, currentUser, userRole };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project: any = await DocProjectModel.findById(id).lean();
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get sections and pages for this project
    const [sections, pages] = await Promise.all([
      DocSectionModel.find({ docProjectId: project._id })
        .sort({ order: 1 })
        .lean(),
      DocPageModel.find({ docProjectId: project._id })
        .sort({ order: 1 })
        .lean(),
    ]);

    const response = {
      project: {
        id: project._id.toString(),
        title: project.title,
        slug: project.slug,
        description: project.description,
        logoUrl: project.logoUrl,
        projectId: project.projectId?.toString(),
        status: project.status,
        visibility: project.visibility,
        config: project.config,
        externalLinks: project.externalLinks,
        seo: project.seo,
        analytics: project.analytics,
        accessControl: project.accessControl,
        createdBy: project.createdBy.toString(),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        publishedAt: project.publishedAt,
      },
      sections: sections.map((s: any) => ({
        id: s._id.toString(),
        docProjectId: s.docProjectId.toString(),
        title: s.title,
        slug: s.slug,
        description: s.description,
        icon: s.icon,
        parentSectionId: s.parentSectionId?.toString(),
        order: s.order,
        depth: s.depth,
        expanded: s.expanded,
        hidden: s.hidden,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      pages: pages.map((p: any) => ({
        id: p._id.toString(),
        docProjectId: p.docProjectId.toString(),
        sectionId: p.sectionId?.toString(),
        title: p.title,
        slug: p.slug,
        description: p.description,
        contentFormat: p.contentFormat,
        order: p.order,
        parentPageId: p.parentPageId?.toString(),
        status: p.status,
        publishedAt: p.publishedAt,
        features: p.features,
        analytics: p.analytics,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching doc project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await DocProjectModel.findById(id);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = DocProjectUpdateSchema.parse(body);

    // Check slug uniqueness if changing
    if (parsed.slug && parsed.slug !== project.slug) {
      const existing = await DocProjectModel.exists({
        slug: parsed.slug,
        _id: { $ne: project._id },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Slug already in use' },
          { status: 409 }
        );
      }
      project.slug = parsed.slug;
    }

    // Update fields
    if (parsed.title) project.title = parsed.title;
    if (parsed.description) project.description = parsed.description;
    if (parsed.logoUrl !== undefined) {
      project.logoUrl = parsed.logoUrl.trim() || undefined;
    }
    if (parsed.projectId !== undefined) {
      project.projectId =
        parsed.projectId && Types.ObjectId.isValid(parsed.projectId)
          ? new Types.ObjectId(parsed.projectId)
          : undefined;
    }
    if (parsed.status) project.status = parsed.status;
    if (parsed.visibility) project.visibility = parsed.visibility;
    if (parsed.config) project.config = { ...project.config, ...parsed.config };
    if (parsed.externalLinks) {
      project.externalLinks = { ...project.externalLinks, ...parsed.externalLinks };
    }
    if (parsed.seo) {
      project.seo = { ...project.seo, ...parsed.seo };
    }

    await project.save();

    return NextResponse.json({ success: true, project: project.toJSON() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating doc project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await DocProjectModel.findById(id);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete all sections and pages associated with this project
    await Promise.all([
      DocSectionModel.deleteMany({ docProjectId: project._id }),
      DocPageModel.deleteMany({ docProjectId: project._id }),
    ]);

    await DocProjectModel.deleteOne({ _id: project._id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting doc project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
