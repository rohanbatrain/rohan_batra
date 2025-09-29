import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import UserModel from '@/models/User';
import { ProjectWithAuthor } from '@/types/project';

// GET /api/portfolio/projects - Get all portfolio projects with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || undefined;
    const technology = searchParams.get('technology') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const categoriesParam = searchParams.get('categories') || undefined;
    const categoriesMode = (searchParams.get('mode') || 'any').toLowerCase();
    const categoryMode = (
      searchParams.get('categoryMode') || 'any'
    ).toLowerCase();
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search') || undefined;
    const debug =
      (searchParams.get('debug') || '').toString() === '1' ||
      (searchParams.get('debug') || '').toString().toLowerCase() === 'true';

    await connectToDatabase();
    await UserModel.countDocuments().limit(1).exec();

    const query: any = { status };
    if (category) {
      if (categoryMode === 'primary') {
        query.category = category;
      } else if (categoryMode === 'secondary') {
        query.categories = category;
      } else {
        query.$or = [
          ...(query.$or || []),
          { category },
          { categories: category },
        ];
      }
    }
    if (categoriesParam) {
      const list = categoriesParam
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (list.length) {
        if (categoriesMode === 'all') {
          // require every category to be present across category or categories[]
          query.$and = [
            ...(query.$and || []),
            ...list.map(c => ({ $or: [{ category: c }, { categories: c }] })),
          ];
        } else {
          // any
          query.$or = [
            ...(query.$or || []),
            { category: { $in: list } },
            { categories: { $in: list } },
          ];
        }
      }
    }

    const orFilters: any[] = [];
    if (technology) {
      const tech = technology.toString();
      orFilters.push({
        technologies: { $in: [tech, new RegExp(`^${tech}$`, 'i')] },
      });
      orFilters.push({ tags: tech.toLowerCase() });
    }
    if (tag) {
      const t = tag.toString();
      orFilters.push({ tags: t.toLowerCase() });
      orFilters.push({ technologies: { $in: [t, new RegExp(`^${t}$`, 'i')] } });
    }
    if (search) {
      const rx = new RegExp(search, 'i');
      orFilters.push({ title: rx });
      orFilters.push({ description: rx });
    }
    if (orFilters.length) query.$or = [...(query.$or || []), ...orFilters];

    if (featured === 'true') query.featured = true;
    if (featured === 'false') query.featured = false;

    const skip = (page - 1) * limit;

    const [projects, totalProjects] = await Promise.all([
      ProjectModel.find(query)
        .populate('authorId', 'firstName lastName email role')
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProjectModel.countDocuments(query),
    ]);

    const projectsWithAuthor: ProjectWithAuthor[] = projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      images: project.images,
      gallery: project.gallery || [],
      featuredImage: project.featuredImage,
      category: project.category,
      categories: (project as any).categories || [],
      technologies: project.technologies,
      status: project.status,
      featured: project.featured,
      demoUrl: project.liveUrl,
      liveUrl: project.liveUrl,
      sourceUrl: project.sourceUrl,
      startDate: project.startDate,
      endDate: project.endDate,
      client: project.client || '',
      tags: project.tags,
      viewCount: project.viewCount,
      authorId: project.authorId._id.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      author: {
        id: project.authorId._id.toString(),
        firstName: (project.authorId as any).firstName,
        lastName: (project.authorId as any).lastName,
        avatar: '',
      },
    }));

    // Optional debug: compute match reasons without changing shape of projects
    let debugInfo: any = undefined;
    if (debug) {
      const reasons: Record<string, string[]> = {};
      const categoryList = categoriesParam
        ? categoriesParam
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : category
          ? [category]
          : [];
      for (const p of projects) {
        const id = p._id.toString();
        const entries: string[] = [];
        for (const c of categoryList) {
          if (p.category === c) entries.push(`primary-category matches "${c}"`);
          if (
            Array.isArray((p as any).categories) &&
            (p as any).categories.includes(c)
          )
            entries.push(`secondary-categories contain "${c}"`);
        }
        if (technology) {
          const t = technology.toString();
          const tLower = t.toLowerCase();
          if (
            Array.isArray(p.technologies) &&
            p.technologies.some(
              (x: unknown) => String(x as any).toLowerCase() === tLower
            )
          )
            entries.push(`technology list contains "${t}"`);
          if (Array.isArray(p.tags) && p.tags.includes(tLower))
            entries.push(`tags contain "${tLower}"`);
        }
        if (tag) {
          const t = tag.toString();
          const tLower = t.toLowerCase();
          if (Array.isArray(p.tags) && p.tags.includes(tLower))
            entries.push(`tags contain "${tLower}"`);
          if (
            Array.isArray(p.technologies) &&
            p.technologies.some(
              (x: unknown) => String(x as any).toLowerCase() === tLower
            )
          )
            entries.push(`technology list contains "${t}"`);
        }
        if (search) {
          const rx = new RegExp(search, 'i');
          if (rx.test(p.title)) entries.push('title matches search');
          if (rx.test(p.description || ''))
            entries.push('description matches search');
        }
        reasons[id] = entries.length ? entries : ['matched by query'];
      }
      debugInfo = {
        reasons,
        appliedFilters: {
          category,
          categories: categoriesParam
            ? categoriesParam
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            : [],
          categoriesMode,
          technology,
          tag,
          search,
        },
        queryUsed: query,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithAuthor,
        totalProjects,
        totalPages: Math.ceil(totalProjects / limit),
        currentPage: page,
        ...(debug ? { debug: debugInfo } : {}),
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portfolio projects',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/portfolio/projects - Create a new portfolio project
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get the current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Find the user in our database
    const user = await UserModel.findOne({
      email: clerkUser.emailAddresses[0].emailAddress,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if user has permission to create projects
    if (!['editor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to create projects',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      longDescription,
      images = [],
      category,
      technologies = [],
      status = 'draft',
      featured = false,
      demoUrl,
      sourceUrl,
      liveUrl,
      startDate,
      endDate,
      client,
      tags = [],
    } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, description, and category are required',
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingProject = await ProjectModel.findOne({ slug });
    if (existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'A project with this title already exists',
        },
        { status: 409 }
      );
    }

    // Create the project
    const newProject = new ProjectModel({
      title,
      slug,
      description,
      longDescription,
      images,
      category,
      technologies,
      status,
      featured,
      demoUrl,
      sourceUrl,
      liveUrl,
      startDate,
      endDate,
      client,
      tags,
      viewCount: 0,
      authorId: user._id,
    });

    const savedProject = await newProject.save();

    // Populate author for response
    await savedProject.populate('author', 'name email avatar role');

    // Transform to include author info
    const projectWithAuthor: ProjectWithAuthor = {
      _id: savedProject._id.toString(),
      title: savedProject.title,
      slug: savedProject.slug,
      description: savedProject.description,
      longDescription: savedProject.longDescription,
      images: savedProject.images,
      gallery: savedProject.gallery || [],
      featuredImage: savedProject.featuredImage,
      category: savedProject.category,
      technologies: savedProject.technologies,
      status: savedProject.status,
      featured: savedProject.featured,
      demoUrl: savedProject.demoUrl,
      sourceUrl: savedProject.sourceUrl,
      liveUrl: savedProject.liveUrl,
      startDate: savedProject.startDate,
      endDate: savedProject.endDate,
      client: savedProject.client,
      tags: savedProject.tags,
      viewCount: savedProject.viewCount,
      authorId: savedProject.author._id.toString(),
      createdAt: savedProject.createdAt,
      updatedAt: savedProject.updatedAt,
      author: {
        id: savedProject.author._id.toString(),
        firstName: savedProject.author.name.split(' ')[0] || '',
        lastName: savedProject.author.name.split(' ').slice(1).join(' ') || '',
        avatar: savedProject.author.avatar,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: projectWithAuthor,
        message: 'Portfolio project created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating portfolio project:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create portfolio project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
