import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import { ProjectWithAuthor } from '@/types/project';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET /api/portfolio/projects/[slug] - Get a single portfolio project by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project slug is required',
        },
        { status: 400 }
      );
    }

    // Find the project by slug and populate author
    const project = await ProjectModel.findOne({
      slug,
      status: 'published', // Only return published projects
    }).populate('author', 'name email avatar role');

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portfolio project not found',
        },
        { status: 404 }
      );
    }

    // Increment view count
    await ProjectModel.findByIdAndUpdate(project._id, {
      $inc: { viewCount: 1 },
    });

    // Transform to include author info
    const projectWithAuthor: ProjectWithAuthor = {
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      images: project.images,
      gallery: project.gallery || [],
      category: project.category,
      technologies: project.technologies,
      status: project.status,
      featured: project.featured,
      featuredImage: project.featuredImage,
      demoUrl: project.liveUrl,
      liveUrl: project.liveUrl,
      sourceUrl: project.sourceUrl,
      startDate: project.startDate,
      endDate: project.endDate,
      client: project.client,
      tags: project.tags,
      viewCount: project.viewCount + 1, // Include the incremented view
      authorId: project.author._id.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      author: {
        id: project.author._id.toString(),
        firstName: project.author.name.split(' ')[0] || '',
        lastName: project.author.name.split(' ').slice(1).join(' ') || '',
        avatar: project.author.avatar,
      },
    };

    return NextResponse.json({
      success: true,
      data: projectWithAuthor,
    });
  } catch (error) {
    console.error('Error fetching portfolio project:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portfolio project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
