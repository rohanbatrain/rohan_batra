import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import DocPageModel from '@/models/DocPage';
import UserModel from '@/models/User';

const PageUpdateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().max(300).optional(),
  content: z.string().optional(),
  contentFormat: z.enum(['mdx', 'markdown']).optional(),
  sectionId: z.string().optional().nullable(),
  parentPageId: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
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
        { error: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const page: any = await DocPageModel.findById(id).lean();
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    const response = {
      id: page._id.toString(),
      docProjectId: page.docProjectId.toString(),
      sectionId: page.sectionId?.toString(),
      title: page.title,
      slug: page.slug,
      description: page.description,
      content: page.content,
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
      assets: page.assets,
      lastEditedBy: page.lastEditedBy?.toString(),
      editHistory: page.editHistory?.map((entry: any) => ({
        ...entry,
        editedBy: entry.editedBy.toString(),
      })),
      createdBy: page.createdBy.toString(),
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };

    return NextResponse.json({ page: response });
  } catch (error) {
    console.error('Error fetching page:', error);
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

    const { authorized, currentUser } = await getAuthorizedUser(userId);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const page = await DocPageModel.findById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = PageUpdateSchema.parse(body);

    // Check slug uniqueness if changing
    if (parsed.slug && parsed.slug !== page.slug) {
      const existing = await DocPageModel.exists({
        docProjectId: page.docProjectId,
        slug: parsed.slug,
        _id: { $ne: page._id },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Slug already in use' },
          { status: 409 }
        );
      }
      page.slug = parsed.slug;
    }

    // Update fields
    if (parsed.title) page.title = parsed.title;
    if (parsed.description !== undefined) page.description = parsed.description?.trim();
    if (parsed.content !== undefined) {
      page.content = parsed.content;
      // Re-extract headings if content changed
      page.headings = extractHeadings(parsed.content);
    }
    if (parsed.contentFormat) page.contentFormat = parsed.contentFormat;
    if (parsed.sectionId !== undefined) {
      page.sectionId = parsed.sectionId && Types.ObjectId.isValid(parsed.sectionId)
        ? new Types.ObjectId(parsed.sectionId)
        : undefined;
    }
    if (parsed.parentPageId !== undefined) {
      page.parentPageId = parsed.parentPageId && Types.ObjectId.isValid(parsed.parentPageId)
        ? new Types.ObjectId(parsed.parentPageId)
        : undefined;
    }
    if (parsed.order !== undefined) page.order = parsed.order;
    if (parsed.status) page.status = parsed.status;
    if (parsed.features) {
      page.features = { ...page.features, ...parsed.features };
    }
    if (parsed.seo) {
      page.seo = { ...page.seo, ...parsed.seo };
    }
    if (parsed.relatedPages) {
      page.relatedPages = parsed.relatedPages
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));
    }
    if (parsed.prerequisites) {
      page.prerequisites = parsed.prerequisites
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));
    }

    // Update edit history
    page.lastEditedBy = currentUser!._id;
    if (!page.editHistory) {
      page.editHistory = [];
    }
    page.editHistory.push({
      editedBy: currentUser!._id,
      editedAt: new Date(),
      summary: 'Page updated',
    });

    await page.save();

    return NextResponse.json({ success: true, page: page.toJSON() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating page:', error);
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
        { error: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const page = await DocPageModel.findById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    await DocPageModel.deleteOne({ _id: page._id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
