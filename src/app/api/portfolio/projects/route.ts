import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import UserModel from '@/models/User';
import { currentUser } from '@clerk/nextjs/server';
import { ProjectWithAuthor } from '@/types/project';

// GET /api/portfolio/projects - Get all portfolio projects with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const technology = searchParams.get('technology');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, unknown> = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Technology filter
    if (technology) {
      query.technologies = { $in: [technology] };
    }

    // Featured filter
    if (featured !== null && featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await ProjectModel.countDocuments(query);

    // Get projects with author population
    const projects = await ProjectModel.find(query)
      .populate('author', 'name email avatar role')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform to include author info
    const projectsWithAuthor: ProjectWithAuthor[] = projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      featuredImage: project.images?.[0] || '', // Use first image as featured
      images: project.images,
      category: project.category,
      technologies: project.technologies,
      status: project.status,
      featured: project.featured,
      liveUrl: project.liveUrl,
      githubUrl: project.sourceUrl, // Map sourceUrl to githubUrl
      startDate: project.startDate,
      endDate: project.endDate,
      tags: project.tags,
      viewCount: project.viewCount,
      likeCount: 0, // Not implemented yet
      authorId: project.author._id.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      author: {
        id: project.author._id.toString(),
        firstName: project.author.name.split(' ')[0] || '',
        lastName: project.author.name.split(' ').slice(1).join(' ') || '',
        avatar: project.author.avatar,
      },
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithAuthor,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
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
