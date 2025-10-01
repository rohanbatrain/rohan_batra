import { MetadataRoute } from 'next';
import { getBlogPostsWithPagination } from '@/lib/blog-service';
import { getProjectsWithPagination } from '@/lib/portfolio-service';
import { BlogPostWithAuthor } from '@/types/blog-post';
import { Project } from '@/types/project';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import { listPublishedBooks, listPublishedChapters } from '@/lib/book-service';
import Character from '@/models/Character';
import CharacterJournal from '@/models/CharacterJournal';

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
    {
      url: `${baseUrl}/characters`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  try {
    // Get data directly from database services (no HTTP calls)
    await connectToDatabase();
    const [blogPostsData, projectsData] = await Promise.all([
      getBlogPostsWithPagination(1, 100),
      getProjectsWithPagination(1, 100),
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

    // Characters (public only) and their public journals
    const characters = await Character.find({
      visibility: 'public',
      deletedAt: { $exists: false },
    })
      .select('slug updatedAt createdAt')
      .lean();
    const characterPages = characters.map((c: any) => ({
      url: `${baseUrl}/characters/${c.slug}`,
      lastModified: new Date(c.updatedAt || c.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const characterIds = characters.map((c: any) => c._id);
    const journals = await CharacterJournal.find({
      characterId: { $in: characterIds },
      status: 'published',
      isPrivate: false,
      deletedAt: { $exists: false },
    })
      .select('slug characterId publishedAt updatedAt')
      .lean();

    // Map characterId -> slug for building URLs
    const byId = new Map(characters.map((c: any) => [String(c._id), c.slug]));
    const journalPages = journals
      .map((j: any) => {
        const charSlug = byId.get(String(j.characterId));
        if (!charSlug) return null;
        return {
          url: `${baseUrl}/characters/${charSlug}/journals/${j.slug}`,
          lastModified: new Date(j.updatedAt || j.publishedAt || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.5,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

  // Books and chapters (public only)
    const bookPages: MetadataRoute.Sitemap = [];
    const { books } = await listPublishedBooks({ page: 1, limit: 100 });
    for (const b of books as any[]) {
      bookPages.push({
        url: `${baseUrl}/books/${b.slug}`,
        lastModified: new Date(b.updatedAt || b.publishedAt || b.createdAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
      const chapters = await listPublishedChapters(String(b._id));
      for (const c of chapters as any[]) {
        if (!c.slug) continue;
        bookPages.push({
          url: `${baseUrl}/books/${b.slug}/${c.slug}`,
          lastModified: new Date(c.updatedAt || c.createdAt),
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
    }

    // Courses (public + published)
    const courses = await Course.find({ status: 'published', visibility: 'public' })
      .select('slug updatedAt publishedAt createdAt')
      .lean();
    const coursePages = courses.map((c: any) => ({
      url: `${baseUrl}/courses/${c.slug}`,
      lastModified: new Date(c.updatedAt || c.publishedAt || c.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...blogPages,
      ...projectPages,
      ...characterPages,
      ...journalPages,
      ...bookPages,
      {
        url: `${baseUrl}/courses`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      ...coursePages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if there's an error
    return staticPages;
  }
}
