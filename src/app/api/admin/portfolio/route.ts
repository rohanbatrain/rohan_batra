import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { z } from 'zod';

const ProjectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  longDescription: z.string().optional(),
  slug: z.string().min(1).max(100).optional(),
  technologies: z.array(z.string()).default([]),
  category: z.string().min(1), // Make required as model expects it
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  featuredImage: z.string().optional(),
  priority: z.number().min(1).max(10).default(1),
  links: z
    .object({
      live: z.string().optional(),
      github: z.string().optional(),
      demo: z.string().optional(),
      documentation: z.string().optional(),
    })
    .optional(),
  publishedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

const BulkActionSchema = z.object({
  action: z.enum([
    'publish',
    'unpublish',
    'archive',
    'feature',
    'unfeature',
    'delete',
  ]),
  projectIds: z.array(z.string()).min(1),
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
    const technology = url.searchParams.get('technology');
    const featured = url.searchParams.get('featured');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const includeAnalytics =
      url.searchParams.get('includeAnalytics') === 'true';

    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.categories = { $in: [category] };
    }

    if (technology) {
      filter.technologies = { $in: [technology] };
    }

    if (featured !== null) {
      filter.featured = featured === 'true';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with conditional field selection
    let query = Project.find(filter).sort(sort).skip(skip).limit(limit);

    if (!includeAnalytics) {
      query = query.select(
        '-analytics.detailedMetrics -analytics.performanceData'
      );
    }

    const projects = await query;

    const totalProjects = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / limit);

    const summary = await Project.aggregate([
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          technologyBreakdown: [
            { $unwind: '$technologies' },
            { $group: { _id: '$technologies', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          categoryBreakdown: [
            { $unwind: '$categories' },
            { $group: { _id: '$categories', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          featuredCount: [{ $match: { featured: true } }, { $count: 'count' }],
          totalViews: [
            { $group: { _id: null, total: { $sum: '$analytics.views' } } },
          ],
        },
      },
    ]);

    const response = {
      success: true,
      projects: projects.map(project => ({
        _id: project._id,
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        status: project.status,
        featured: project.featured,
        technologies: project.technologies,
        categories: project.categories,
        images: project.images,
        links: project.links,
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
        seo: project.seo,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProjects,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        total: totalProjects,
        statusBreakdown: summary[0].statusBreakdown,
        technologyBreakdown: summary[0].technologyBreakdown,
        categoryBreakdown: summary[0].categoryBreakdown,
        featuredCount: summary[0].featuredCount[0]?.count || 0,
        totalViews: summary[0].totalViews[0]?.total || 0,
      },
      filters: {
        status,
        category,
        technology,
        featured,
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
    console.error('Admin portfolio GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
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
    if (body.action && body.projectIds) {
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
        case 'feature':
          updateData.featured = true;
          break;
        case 'unfeature':
          updateData.featured = false;
          break;
        case 'delete':
          updateData.deletedAt = currentTime;
          updateData.deletedBy = user._id;
          break;
      }

      const result = await Project.updateMany(
        { _id: { $in: bulkData.projectIds } },
        { $set: updateData }
      );

      return NextResponse.json({
        success: true,
        action: bulkData.action,
        affectedProjects: result.modifiedCount,
        message: `Successfully ${bulkData.action}ed ${result.modifiedCount} projects`,
      });
    }

    // Handle single project creation
    const validatedData = ProjectCreateSchema.parse(body);

    // Generate slug if not provided or empty
    if (!validatedData.slug || validatedData.slug.trim() === '') {
      validatedData.slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Check for duplicate slug
    const existingProject = await Project.findOne({ slug: validatedData.slug });
    if (existingProject) {
      validatedData.slug = `${validatedData.slug}-${Date.now()}`;
    }

    // Create the project with proper field mapping
    const projectData = {
      title: validatedData.title,
      slug: validatedData.slug,
      description: validatedData.description,
      longDescription: validatedData.longDescription || '',
      category: validatedData.category,
      technologies: validatedData.technologies,
      status: validatedData.status,
      featured: validatedData.featured || false,
      featuredImage: validatedData.featuredImage || '',
      priority: validatedData.priority || 1,
      authorId: user._id,
      publishedAt: validatedData.status === 'published' ? new Date() : null,
      completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : null,
      viewCount: 0,
      // Handle links properly
      liveUrl: validatedData.links?.live || '',
      sourceUrl: validatedData.links?.github || '',
      demoUrl: validatedData.links?.demo || '',
      documentationUrl: validatedData.links?.documentation || '',
    };

    const newProject = new Project(projectData);

    await newProject.save();

    return NextResponse.json(
      {
        success: true,
        project: {
          _id: newProject._id,
          title: newProject.title,
          slug: newProject.slug,
          shortDescription: newProject.shortDescription,
          status: newProject.status,
          featured: newProject.featured,
          technologies: newProject.technologies,
          categories: newProject.categories,
          images: newProject.images,
          links: newProject.links,
          createdAt: newProject.createdAt,
          publishedAt: newProject.publishedAt,
          analytics: newProject.analytics,
          seo: newProject.seo,
        },
        message: 'Project created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Project validation error:', error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin portfolio POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
