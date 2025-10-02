import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import DocProjectModel from '@/models/DocProject';
import DocSectionModel from '@/models/DocSection';
import DocPageModel from '@/models/DocPage';
import UserModel from '@/models/User';
import { uniqueSlug } from '@/lib/slug';

const DocProjectInputSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().min(10).max(500),
  logoUrl: z.string().url().optional().or(z.literal('')),
  projectId: z.string().optional(), // Link to portfolio project
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
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

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      filter.status = status;
    }

    if (visibility && ['public', 'private', 'unlisted'].includes(visibility)) {
      filter.visibility = visibility;
    }

    if (projectId && Types.ObjectId.isValid(projectId)) {
      filter.projectId = new Types.ObjectId(projectId);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await DocProjectModel.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    // Get page counts for each project
    const projectIds = projects.map(p => p._id);
    const pageCounts = await DocPageModel.aggregate([
      { $match: { docProjectId: { $in: projectIds } } },
      { $group: { _id: '$docProjectId', count: { $sum: 1 } } },
    ]);

    const pageCountMap = new Map(
      pageCounts.map((p: any) => [p._id.toString(), p.count])
    );

    const response = projects.map((project: any) => ({
      id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      logoUrl: project.logoUrl,
      projectId: project.projectId?.toString(),
      status: project.status,
      visibility: project.visibility,
      pageCount: pageCountMap.get(project._id.toString()) || 0,
      analytics: project.analytics,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      publishedAt: project.publishedAt,
    }));

    return NextResponse.json({ projects: response });
  } catch (error) {
    console.error('Error fetching doc projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorized, currentUser } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = DocProjectInputSchema.parse(body);

    // Generate or validate slug
    let slug = parsed.slug?.trim();
    if (slug) {
      const exists = await DocProjectModel.exists({ slug });
      if (exists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        );
      }
    } else {
      slug = await uniqueSlug(parsed.title, async candidate => {
        const exists = await DocProjectModel.exists({ slug: candidate });
        return Boolean(exists);
      });
    }

    const docProject = new DocProjectModel({
      title: parsed.title,
      slug,
      description: parsed.description,
      logoUrl: parsed.logoUrl?.trim() || undefined,
      projectId: parsed.projectId && Types.ObjectId.isValid(parsed.projectId)
        ? new Types.ObjectId(parsed.projectId)
        : undefined,
      status: parsed.status,
      visibility: parsed.visibility,
      config: parsed.config || {},
      externalLinks: parsed.externalLinks,
      seo: parsed.seo,
      analytics: {
        totalViews: 0,
        totalSearches: 0,
        popularPages: [],
      },
      createdBy: currentUser!._id,
    });

    await docProject.save();

    return NextResponse.json(
      { project: docProject.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating doc project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
