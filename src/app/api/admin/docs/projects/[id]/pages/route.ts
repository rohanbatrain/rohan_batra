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

const PageInputSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().max(300).optional(),
  content: z.string(),
  contentFormat: z.enum(['mdx', 'markdown']).default('mdx'),
  sectionId: z.string().optional().nullable(),
  parentPageId: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  features: z.object({
    showToc: z.boolean().optional(),
    showBreadcrumbs: z.boolean().optional(),
    showLastUpdated: z.boolean().optional(),
    allowComments: z.boolean().optional(),
    showEditLink: z.boolean().optional(),
  }).optional(),
  seo: z.object({
    title: z.string().max(70).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional(),
  }).optional(),
  relatedPages: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
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

// Extract headings from content for TOC
function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    headings.push({ level, text, id });
  }

  return headings;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
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

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await DocProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const pages = await DocPageModel.find({ docProjectId: project._id })
      .sort({ order: 1 })
      .lean();

    const response = pages.map((page: any) => ({
      id: page._id.toString(),
      docProjectId: page.docProjectId.toString(),
      sectionId: page.sectionId?.toString(),
      title: page.title,
      slug: page.slug,
      description: page.description,
      contentFormat: page.contentFormat,
      order: page.order,
      parentPageId: page.parentPageId?.toString(),
      headings: page.headings,
      status: page.status,
      publishedAt: page.publishedAt,
      features: page.features,
      seo: page.seo,
      analytics: page.analytics,
      relatedPages: page.relatedPages?.map((id: any) => id.toString()),
      prerequisites: page.prerequisites?.map((id: any) => id.toString()),
      createdBy: page.createdBy.toString(),
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }));

    return NextResponse.json({ pages: response });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
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

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await DocProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = PageInputSchema.parse(body);

    // Generate or validate slug
    let slug = parsed.slug?.trim();
    if (slug) {
      const exists = await DocPageModel.exists({
        docProjectId: project._id,
        slug,
      });
      if (exists) {
        return NextResponse.json(
          { error: 'Slug already exists in this project' },
          { status: 409 }
        );
      }
    } else {
      slug = await uniqueSlug(parsed.title, async candidate => {
        const exists = await DocPageModel.exists({
          docProjectId: project._id,
          slug: candidate,
        });
        return Boolean(exists);
      });
    }

    // Validate section if provided
    if (parsed.sectionId && Types.ObjectId.isValid(parsed.sectionId)) {
      const section = await DocSectionModel.findOne({
        _id: new Types.ObjectId(parsed.sectionId),
        docProjectId: project._id,
      });
      if (!section) {
        return NextResponse.json(
          { error: 'Section not found' },
          { status: 404 }
        );
      }
    }

    // Validate parent page if provided
    if (parsed.parentPageId && Types.ObjectId.isValid(parsed.parentPageId)) {
      const parentPage = await DocPageModel.findOne({
        _id: new Types.ObjectId(parsed.parentPageId),
        docProjectId: project._id,
      });
      if (!parentPage) {
        return NextResponse.json(
          { error: 'Parent page not found' },
          { status: 404 }
        );
      }
    }

    // Extract headings from content
    const headings = extractHeadings(parsed.content);

    // Validate related pages and prerequisites
    const relatedPages = parsed.relatedPages
      ?.filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id)) || [];
    
    const prerequisites = parsed.prerequisites
      ?.filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id)) || [];

    const page = new DocPageModel({
      docProjectId: project._id,
      sectionId: parsed.sectionId && Types.ObjectId.isValid(parsed.sectionId)
        ? new Types.ObjectId(parsed.sectionId)
        : undefined,
      title: parsed.title,
      slug,
      description: parsed.description?.trim(),
      content: parsed.content,
      contentFormat: parsed.contentFormat,
      order: parsed.order ?? 0,
      parentPageId: parsed.parentPageId && Types.ObjectId.isValid(parsed.parentPageId)
        ? new Types.ObjectId(parsed.parentPageId)
        : undefined,
      headings,
      status: parsed.status,
      features: {
        showToc: parsed.features?.showToc ?? true,
        showBreadcrumbs: parsed.features?.showBreadcrumbs ?? true,
        showLastUpdated: parsed.features?.showLastUpdated ?? true,
        allowComments: parsed.features?.allowComments ?? false,
        showEditLink: parsed.features?.showEditLink ?? false,
      },
      seo: parsed.seo,
      analytics: {
        views: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: 0,
        searchAppearances: 0,
        externalReferrals: 0,
      },
      relatedPages,
      prerequisites,
      createdBy: currentUser!._id,
    });

    await page.save();

    return NextResponse.json(
      { page: page.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
