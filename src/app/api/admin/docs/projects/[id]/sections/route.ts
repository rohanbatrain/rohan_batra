import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import DocProjectModel from '@/models/DocProject';
import DocSectionModel from '@/models/DocSection';
import UserModel from '@/models/User';
import { uniqueSlug } from '@/lib/slug';

const SectionInputSchema = z.object({
  title: z.string().min(2).max(150),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().max(300).optional(),
  icon: z.string().optional(),
  parentSectionId: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  depth: z.number().int().min(0).max(5).optional(),
  expanded: z.boolean().optional(),
  hidden: z.boolean().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
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

    const sections = await DocSectionModel.find({ docProjectId: project._id })
      .sort({ depth: 1, order: 1 })
      .lean();

    const response = sections.map((section: any) => ({
      id: section._id.toString(),
      docProjectId: section.docProjectId.toString(),
      title: section.title,
      slug: section.slug,
      description: section.description,
      icon: section.icon,
      parentSectionId: section.parentSectionId?.toString(),
      order: section.order,
      depth: section.depth,
      expanded: section.expanded,
      hidden: section.hidden,
      status: section.status,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    }));

    return NextResponse.json({ sections: response });
  } catch (error) {
    console.error('Error fetching sections:', error);
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

    const body = await request.json();
    const parsed = SectionInputSchema.parse(body);

    // Generate or validate slug
    let slug = parsed.slug?.trim();
    if (slug) {
      const exists = await DocSectionModel.exists({
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
        const exists = await DocSectionModel.exists({
          docProjectId: project._id,
          slug: candidate,
        });
        return Boolean(exists);
      });
    }

    // Validate parent section if provided
    let depth = 0;
    if (parsed.parentSectionId) {
      if (!Types.ObjectId.isValid(parsed.parentSectionId)) {
        return NextResponse.json(
          { error: 'Invalid parent section ID' },
          { status: 400 }
        );
      }

      const parentSection: any = await DocSectionModel.findOne({
        _id: new Types.ObjectId(parsed.parentSectionId),
        docProjectId: project._id,
      });

      if (!parentSection) {
        return NextResponse.json(
          { error: 'Parent section not found' },
          { status: 404 }
        );
      }

      depth = parentSection.depth + 1;
      if (depth > 5) {
        return NextResponse.json(
          { error: 'Maximum nesting depth (5) exceeded' },
          { status: 400 }
        );
      }
    }

    const section = new DocSectionModel({
      docProjectId: project._id,
      title: parsed.title,
      slug,
      description: parsed.description?.trim(),
      icon: parsed.icon?.trim(),
      parentSectionId: parsed.parentSectionId
        ? new Types.ObjectId(parsed.parentSectionId)
        : undefined,
      order: parsed.order ?? 0,
      depth: parsed.depth ?? depth,
      expanded: parsed.expanded ?? true,
      hidden: parsed.hidden ?? false,
      status: parsed.status,
    });

    await section.save();

    return NextResponse.json(
      { section: section.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
