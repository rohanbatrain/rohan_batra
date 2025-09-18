import connectToDatabase from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import UserModel from '@/models/User';
import type { ProjectWithAuthor } from '@/types/project';

export async function getPublishedProjects(
  limit: number = 100
): Promise<ProjectWithAuthor[]> {
  try {
    await connectToDatabase();
    
    // Import UserModel to ensure it's registered
    UserModel;

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
        avatar: project.authorId.avatar,
      },
    }));

    return projectsWithAuthor;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithAuthor | null> {
  try {
    await connectToDatabase();

    const project = await ProjectModel.findOne({
      slug,
      status: 'published'
    })
    .populate('authorId', 'firstName lastName email avatar role');

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
        avatar: project.authorId.avatar,
      },
    };
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
}
