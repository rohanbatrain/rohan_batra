import { MetadataRoute } from 'next';
import { getBlogPostsWithPagination } from '@/lib/blog-service';
import { getProjectsWithPagination } from '@/lib/portfolio-service';
import { BlogPostWithAuthor } from '@/types/blog-post';
import { Project } from '@/types/project';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rohanbatra.dev';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  try {
    // Get data directly from database services (no HTTP calls)
    const [blogPostsData, projectsData] = await Promise.all([
      getBlogPostsWithPagination({
        page: 1,
        limit: 100,
        status: 'published',
      }),
      getProjectsWithPagination({
        page: 1,
        limit: 100,
        status: 'published',
      }),
    ]);

    const blogPages = blogPostsData.posts.map((post: BlogPostWithAuthor) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    const projectPages = projectsData.projects.map((project: Project) => ({
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified: new Date(project.updatedAt || project.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...blogPages, ...projectPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if there's an error
    return staticPages;
  }
}
