import { notFound } from 'next/navigation';
import { ProjectWithAuthor } from '@/types/project';
import {
  getProjectBySlug,
  getPublishedProjects,
} from '@/lib/portfolio-service';
import ProjectDetailClient from './ProjectDetailClient';

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

  return <ProjectDetailClient project={project} />;
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
