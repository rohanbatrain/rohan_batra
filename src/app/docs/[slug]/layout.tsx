import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import DocProject from '@/models/DocProject';
import DocSection from '@/models/DocSection';
import DocsSidebar from '@/components/docs/docs-sidebar';
import DocsHeader from '@/components/docs/docs-header';

interface DocsLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata({ params }: DocsLayoutProps): Promise<Metadata> {
  await connectDB();
  const project: any = await DocProject.findOne({ slug: params.slug, status: 'published' }).lean();

  if (!project) {
    return {
      title: 'Documentation Not Found',
    };
  }

  return {
    title: project.seo?.metaTitle || project.title,
    description: project.seo?.metaDescription || project.description,
    openGraph: {
      title: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.description,
      images: project.seo?.ogImage ? [project.seo.ogImage] : [],
    },
  };
}

export default async function DocsLayout({ children, params }: DocsLayoutProps) {
  await connectDB();
  
  const project: any = await DocProject.findOne({ slug: params.slug, status: 'published' }).lean();

  if (!project) {
    notFound();
  }

  // Fetch sections and pages for sidebar
  const sections: any = await DocSection.find({ docProjectId: project._id })
    .sort({ order: 1 })
    .lean();

  return (
    <div className='min-h-screen flex flex-col'>
      <DocsHeader project={project} sections={sections} />
      
      <div className='flex-1 container mx-auto max-w-7xl flex'>
        <aside className='hidden lg:block w-64 flex-shrink-0 border-r sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto'>
          <DocsSidebar project={project} sections={sections} />
        </aside>

        <main className='flex-1 overflow-x-hidden'>
          {children}
        </main>
      </div>

      <footer className='border-t py-8'>
        <div className='container mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground'>
          <p>© {new Date().getFullYear()} {project.title}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
