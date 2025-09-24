import connectToDatabase from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import UserModel from '@/models/User';
import type { ProjectWithAuthor } from '@/types/project';

export async function getPublishedProjects(
  limit: number = 100
): Promise<ProjectWithAuthor[]> {
  try {
    await connectToDatabase();

    // Ensure UserModel is loaded for populate to work
    await UserModel.countDocuments().limit(1).exec();

    const projects = await ProjectModel.find({
      status: 'published',
    })
      .populate('authorId', 'firstName lastName email role')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit);

    const projectsWithAuthor = projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      images: project.images,
      gallery: project.gallery || [],
      featuredImage: project.featuredImage,
      category: project.category,
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
        firstName: project.authorId.firstName,
        lastName: project.authorId.lastName,
        avatar: '', // User model doesn't have avatar field
      },
    }));

    return projectsWithAuthor;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getFeaturedProjectsOnly(
  limit: number = 3
): Promise<ProjectWithAuthor[]> {
  try {
    await connectToDatabase();
    await UserModel.countDocuments().limit(1).exec();

    const projects = await ProjectModel.find({ status: 'published', featured: true })
      .populate('authorId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    return projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      images: project.images,
      gallery: project.gallery || [],
      featuredImage: project.featuredImage,
      category: project.category,
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
        firstName: project.authorId.firstName,
        lastName: project.authorId.lastName,
        avatar: '',
      },
    }));
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithAuthor | null> {
  try {
    await connectToDatabase();

    // Ensure UserModel is loaded for populate to work
    await UserModel.countDocuments().limit(1).exec();

    const project = await ProjectModel.findOne({
      slug,
      status: 'published',
    })
      .populate('authorId', 'firstName lastName email role');

    if (!project) {
      return null;
    }

    return {
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      images: project.images,
      gallery: project.gallery || [],
      featuredImage: project.featuredImage,
      category: project.category,
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
        firstName: project.authorId.firstName,
        lastName: project.authorId.lastName,
        avatar: '', // User model doesn't have avatar field
      },
    };
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
}

export async function getProjectsWithPagination(
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<{
  projects: ProjectWithAuthor[];
  totalProjects: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    await connectToDatabase();

    // Ensure UserModel is loaded for populate to work
    await UserModel.countDocuments().limit(1).exec();

    const query: { status: string; category?: string } = { status: 'published' };
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [projects, totalProjects] = await Promise.all([
      ProjectModel.find(query)
        .populate('authorId', 'firstName lastName email role')
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProjectModel.countDocuments(query),
    ]);

    const projectsWithAuthor = projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      images: project.images,
      gallery: project.gallery || [],
      featuredImage: project.featuredImage,
      category: project.category,
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
        firstName: project.authorId.firstName,
        lastName: project.authorId.lastName,
        avatar: '', // User model doesn't have avatar field
      },
    }));

    return {
      projects: projectsWithAuthor,
      totalProjects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching projects with pagination:', error);
    return {
      projects: [],
      totalProjects: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}
