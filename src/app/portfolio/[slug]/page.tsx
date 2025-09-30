import { notFound } from 'next/navigation';
import { ProjectWithAuthor } from '@/types/project';
import {
  getProjectBySlug,
  getPublishedProjects,
} from '@/lib/portfolio-service';
import ProjectDetailClient from './ProjectDetailClient';
import { getPublishedBlogPosts } from '@/lib/blog-service';
import RelatedContentRail from '@/components/shared/RelatedContentRail';
import SkillChips from '@/components/shared/SkillChips';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Server-side data fetching
async function getProject(slug: string): Promise<ProjectWithAuthor | null> {
  return getProjectBySlug(slug);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  // Related posts by shared tags (take top 3)
  const allPosts = await getPublishedBlogPosts(100);
  const tags = (project.tags || []).map(t => String(t));
  const relatedPosts = allPosts
    .filter(p => Array.isArray(p.tags) && p.tags.some(t => tags.includes(String(t))))
    .slice(0, 3);

  return (
    <>
      <ProjectDetailClient project={project} />
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Built with / Skills */}
        <div className='mt-10'>
          <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3'>Built with</h3>
          <SkillChips tags={tags} />
        </div>

        {/* Related Posts */}
        <RelatedContentRail title='Related Articles' type='posts' items={relatedPosts} viewAllHref={tags[0] ? `/blog?tag=${encodeURIComponent(tags[0])}` : undefined} />
      </div>
    </>
  );
}

// Generate static params for build time (optional)
export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects(100);
    return projects.map(project => ({
      slug: project.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  return {
    title: `${project.title} - Portfolio`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'article',
      images: project.images.length > 0 ? [project.images[0]] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: project.images.length > 0 ? [project.images[0]] : undefined,
    },
    keywords: [...project.technologies, ...project.tags],
  };
}
