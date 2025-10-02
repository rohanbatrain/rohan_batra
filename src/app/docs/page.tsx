import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import DocProject from '@/models/DocProject';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, Search, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation Hub | Rohan Batra',
  description: 'Browse comprehensive documentation for all projects',
};

export default async function DocsHubPage() {
  await connectDB();
  
  const projects: any[] = await DocProject.find({
    status: 'published',
    visibility: { $in: ['public', 'unlisted'] },
  })
    .select('title slug description logoUrl analytics updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Hero Section */}
      <section className='border-b bg-background'>
        <div className='container mx-auto max-w-7xl px-6 py-16 lg:py-24'>
          <div className='text-center space-y-4'>
            <div className='inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4'>
              <BookOpen className='h-8 w-8 text-primary' />
            </div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
              Documentation Hub
            </h1>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              Comprehensive guides, tutorials, and references for all projects
            </p>
          </div>

          {/* Search Bar (Placeholder for future implementation) */}
          <div className='max-w-2xl mx-auto mt-8'>
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
              <input
                type='text'
                placeholder='Search documentation... (Coming soon)'
                disabled
                className='w-full pl-12 pr-4 py-4 rounded-lg border bg-background shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className='container mx-auto max-w-7xl px-6 py-16'>
        {projects.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-16'>
              <BookOpen className='h-16 w-16 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Documentation Available</h3>
              <p className='text-muted-foreground text-center max-w-md'>
                Documentation projects will appear here once they are published.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h2 className='text-2xl font-bold'>Available Documentation</h2>
                <p className='text-muted-foreground'>
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'} available
                </p>
              </div>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {projects.map((project) => (
                <Link
                  key={project._id.toString()}
                  href={`/docs/${project.slug}`}
                  className='group'
                >
                  <Card className='h-full transition-all hover:shadow-lg hover:border-primary/50'>
                    <CardHeader>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1 min-w-0'>
                          <CardTitle className='truncate group-hover:text-primary transition-colors'>
                            {project.title}
                          </CardTitle>
                          <CardDescription className='line-clamp-2 mt-2'>
                            {project.description || 'No description available'}
                          </CardDescription>
                        </div>
                        {project.logoUrl && (
                          <img
                            src={project.logoUrl}
                            alt={project.title}
                            className='h-12 w-12 rounded object-cover flex-shrink-0'
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span>
                            {project.analytics?.totalViews || 0} views
                          </span>
                          <span>•</span>
                          <span>
                            Updated{' '}
                            {new Date(project.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Call to Action */}
      <section className='border-t bg-muted/30'>
        <div className='container mx-auto max-w-7xl px-6 py-16 text-center'>
          <h2 className='text-2xl font-bold mb-4'>Looking for something specific?</h2>
          <p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
            Can't find the documentation you're looking for? Check out the portfolio or blog for more resources.
          </p>
          <div className='flex gap-4 justify-center'>
            <Button asChild variant='outline'>
              <Link href='/portfolio'>
                <ExternalLink className='mr-2 h-4 w-4' />
                View Portfolio
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/blog'>
                <ExternalLink className='mr-2 h-4 w-4' />
                Read Blog
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
