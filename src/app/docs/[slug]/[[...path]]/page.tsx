import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import connectDB from '@/lib/mongodb';
import DocProject from '@/models/DocProject';
import DocPage from '@/models/DocPage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import DocBreadcrumbs from '@/components/docs/docs-breadcrumbs';
import BackToTop from '@/components/docs/back-to-top';

interface DocPageProps {
  params: { slug: string; path?: string[] };
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  await connectDB();
  const project: any = await DocProject.findOne({ slug: params.slug }).lean();
  
  if (!project) {
    return { title: 'Page Not Found' };
  }

  // If no path, show project overview
  if (!params.path || params.path.length === 0) {
    return {
      title: project.title,
      description: project.description,
    };
  }

  const pageSlug = params.path.join('/');
  const page: any = await DocPage.findOne({
    docProjectId: project._id,
    slug: pageSlug,
    status: 'published',
  }).lean();

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: `${page.seo?.metaTitle || page.title} | ${project.title}`,
    description: page.seo?.metaDescription || page.excerpt,
    keywords: page.seo?.keywords,
  };
}

export default async function DocPageView({ params }: DocPageProps) {
  await connectDB();
  
  const project: any = await DocProject.findOne({ slug: params.slug, status: 'published' }).lean();

  if (!project) {
    notFound();
  }

  // If no path, show project overview
  if (!params.path || params.path.length === 0) {
    return (
      <div className='py-12 px-6 max-w-4xl mx-auto'>
        <div className='space-y-8'>
          <div className='space-y-4'>
            <h1 className='text-4xl font-bold'>{project.title}</h1>
            {project.description && (
              <p className='text-xl text-muted-foreground'>{project.description}</p>
            )}
          </div>

          <Card>
            <CardContent className='pt-6'>
              <div className='prose prose-gray dark:prose-invert max-w-none'>
                <p>Welcome to the {project.title} documentation.</p>
                <p>Use the sidebar to navigate through the available pages.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pageSlug = params.path.join('/');
  const page: any = await DocPage.findOne({
    docProjectId: project._id,
    slug: pageSlug,
    status: 'published',
  }).lean();

  if (!page) {
    notFound();
  }

  // Increment page view counter
  await DocPage.updateOne(
    { _id: page._id },
    { $inc: { 'analytics.views': 1 } }
  );

  return (
    <div className='py-12 px-6 max-w-4xl mx-auto'>
      <BackToTop />
      <article className='space-y-8'>
        {/* Breadcrumbs */}
        <DocBreadcrumbs
          items={[
            { label: project.title, href: `/docs/${project.slug}` },
            { label: page.title },
          ]}
        />

        {/* Header */}
        <header className='space-y-4'>
          <div className='flex items-center gap-2 flex-wrap'>
            {page.status === 'draft' && <Badge>Draft</Badge>}
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Eye className='h-4 w-4' />
                {page.analytics?.views || 0} views
              </span>
              {page.readingTime && (
                <span className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  {page.readingTime} min read
                </span>
              )}
            </div>
          </div>
          
          <h1 className='text-4xl font-bold'>{page.title}</h1>
          
          {page.excerpt && (
            <p className='text-xl text-muted-foreground'>{page.excerpt}</p>
          )}

          <div className='text-sm text-muted-foreground'>
            Last updated: {new Date(page.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Table of Contents */}
        {page.headings && page.headings.length > 0 && (
          <Card>
            <CardContent className='pt-6'>
              <h2 className='text-sm font-semibold mb-3 uppercase text-muted-foreground'>
                On This Page
              </h2>
              <nav className='space-y-1'>
                {page.headings.map((heading: any, index: number) => (
                  <a
                    key={index}
                    href={`#${heading.id}`}
                    className='block py-1 text-sm hover:text-primary transition-colors'
                    style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <div className='prose prose-gray dark:prose-invert max-w-none'>
          <MDXRemote source={page.content} />
        </div>

        {/* Footer Navigation */}
        <div className='border-t pt-8 mt-12'>
          <div className='flex justify-between items-center'>
            {page.previousPageId ? (
              <Button variant='outline' asChild>
                <Link href='#'>
                  <ChevronLeft className='mr-2 h-4 w-4' />
                  Previous
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {page.nextPageId ? (
              <Button variant='outline' asChild>
                <Link href='#'>
                  Next
                  <ChevronRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
