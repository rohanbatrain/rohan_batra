'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Edit,
  FileText,
  Plus,
  Settings,
  Eye,
  Trash2,
  ExternalLink,
  FolderTree,
} from 'lucide-react';

interface DocProject {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  analytics: {
    totalViews: number;
    totalSearches: number;
    avgTimeOnPage: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface DocSection {
  _id: string;
  title: string;
  slug: string;
  order: number;
  depth: number;
  parentSectionId?: string;
  isExpanded: boolean;
}

interface DocPage {
  _id: string;
  title: string;
  slug: string;
  sectionId?: string;
  status: 'draft' | 'published';
  order: number;
  analytics: {
    views: number;
  };
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export default function DocProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params?.id as string;

  const { data: projectData, error: projectError, isLoading: projectLoading } = useSWR<{
    project: DocProject;
  }>(`/api/admin/docs/projects/${projectId}`, fetcher);

  const { data: sectionsData, mutate: mutateSections } = useSWR<{ sections: DocSection[] }>(
    `/api/admin/docs/projects/${projectId}/sections`,
    fetcher
  );

  const { data: pagesData, mutate: mutatePages } = useSWR<{ pages: DocPage[] }>(
    `/api/admin/docs/projects/${projectId}/pages`,
    fetcher
  );

  const project = projectData?.project;
  const sections = sectionsData?.sections ?? [];
  const pages = pagesData?.pages ?? [];

  const handleDeleteProject = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this project? This will also delete all sections and pages.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/docs/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });

      router.push('/admin/docs');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (projectLoading) {
    return (
      <div className='container mx-auto max-w-7xl space-y-6 p-6'>
        <Skeleton className='h-12 w-3/4' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className='container mx-auto max-w-7xl space-y-6 p-6'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center text-red-600'>
              {projectError?.message || 'Project not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-7xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.push('/admin/docs')}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              {project.logoUrl && (
                <img src={project.logoUrl} alt='' className='h-12 w-12 rounded object-cover' />
              )}
              <div>
                <h1 className='text-3xl font-bold'>{project.title}</h1>
                <p className='text-muted-foreground'>/docs/{project.slug}</p>
              </div>
            </div>
            <div className='flex gap-2'>
              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              <Badge variant='outline'>{project.visibility}</Badge>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          {project.status === 'published' && (
            <Button
              variant='outline'
              onClick={() => window.open(`/docs/${project.slug}`, '_blank')}
            >
              <ExternalLink className='mr-2 h-4 w-4' />
              View Live
            </Button>
          )}
          <Button variant='outline' onClick={() => router.push(`/admin/docs/${projectId}/edit`)}>
            <Settings className='mr-2 h-4 w-4' />
            Settings
          </Button>
          <Button variant='destructive' onClick={handleDeleteProject}>
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{project.analytics.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{project.analytics.totalSearches.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Avg. Time on Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {Math.round(project.analytics.avgTimeOnPage)}s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='structure' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='structure'>
            <FolderTree className='mr-2 h-4 w-4' />
            Structure
          </TabsTrigger>
          <TabsTrigger value='pages'>
            <FileText className='mr-2 h-4 w-4' />
            All Pages ({pages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='structure' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Documentation Structure</CardTitle>
                  <CardDescription>
                    Organize sections and pages in a hierarchical structure
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => router.push(`/admin/docs/${projectId}/sections/new`)}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Add Section
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => router.push(`/admin/docs/${projectId}/pages/new`)}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Add Page
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 && pages.length === 0 ? (
                <div className='text-center py-12'>
                  <FolderTree className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>No content yet</h3>
                  <p className='text-muted-foreground mb-4'>
                    Start by creating sections to organize your documentation
                  </p>
                  <Button onClick={() => router.push(`/admin/docs/${projectId}/sections/new`)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Create First Section
                  </Button>
                </div>
              ) : (
                <div className='space-y-2'>
                  {/* Root sections */}
                  {sections
                    .filter(s => !s.parentSectionId)
                    .sort((a, b) => a.order - b.order)
                    .map(section => (
                      <SectionTreeItem
                        key={section._id}
                        section={section}
                        allSections={sections}
                        pages={pages}
                        projectId={projectId}
                        router={router}
                      />
                    ))}

                  {/* Orphan pages (not in any section) */}
                  {pages
                    .filter(p => !p.sectionId)
                    .sort((a, b) => a.order - b.order)
                    .map(page => (
                      <PageTreeItem key={page._id} page={page} projectId={projectId} router={router} />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='pages' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>All Pages</CardTitle>
                <Button
                  size='sm'
                  onClick={() => router.push(`/admin/docs/${projectId}/pages/new`)}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  New Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className='text-center py-12'>
                  <FileText className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>No pages yet</h3>
                  <p className='text-muted-foreground mb-4'>Create your first documentation page</p>
                  <Button onClick={() => router.push(`/admin/docs/${projectId}/pages/new`)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Create First Page
                  </Button>
                </div>
              ) : (
                <div className='space-y-2'>
                  {pages.map(page => (
                    <div
                      key={page._id}
                      className='flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <div className='font-medium'>{page.title}</div>
                          <div className='text-sm text-muted-foreground'>/{page.slug}</div>
                        </div>
                        <Badge
                          variant='outline'
                          className={
                            page.status === 'published' ? 'bg-green-50 text-green-700' : ''
                          }
                        >
                          {page.status}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground flex items-center gap-1'>
                          <Eye className='h-3 w-3' />
                          {page.analytics.views}
                        </span>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => router.push(`/admin/docs/pages/${page._id}/edit`)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper components for tree rendering
function SectionTreeItem({
  section,
  allSections,
  pages,
  projectId,
  router,
}: {
  section: DocSection;
  allSections: DocSection[];
  pages: DocPage[];
  projectId: string;
  router: any;
}) {
  const [isExpanded, setIsExpanded] = useState(section.isExpanded);
  const childSections = allSections
    .filter(s => s.parentSectionId === section._id)
    .sort((a, b) => a.order - b.order);
  const sectionPages = pages.filter(p => p.sectionId === section._id).sort((a, b) => a.order - b.order);
  const hasChildren = childSections.length > 0 || sectionPages.length > 0;

  return (
    <div>
      <div
        className='flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors'
        style={{ marginLeft: `${section.depth * 24}px` }}
      >
        <div className='flex items-center gap-2'>
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='text-muted-foreground hover:text-foreground'
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <FolderTree className='h-4 w-4 text-blue-500' />
          <span className='font-medium'>{section.title}</span>
          <span className='text-sm text-muted-foreground'>/{section.slug}</span>
        </div>
        <Button size='sm' variant='ghost'>
          <Edit className='h-4 w-4' />
        </Button>
      </div>

      {isExpanded && (
        <div className='space-y-2 mt-2'>
          {childSections.map(child => (
            <SectionTreeItem
              key={child._id}
              section={child}
              allSections={allSections}
              pages={pages}
              projectId={projectId}
              router={router}
            />
          ))}
          {sectionPages.map(page => (
            <PageTreeItem
              key={page._id}
              page={page}
              projectId={projectId}
              router={router}
              depth={section.depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PageTreeItem({
  page,
  projectId,
  router,
  depth = 0,
}: {
  page: DocPage;
  projectId: string;
  router: any;
  depth?: number;
}) {
  return (
    <div
      className='flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors'
      style={{ marginLeft: `${(depth + 1) * 24}px` }}
    >
      <div className='flex items-center gap-3'>
        <FileText className='h-4 w-4 text-muted-foreground' />
        <div>
          <span className='font-medium'>{page.title}</span>
          <span className='text-sm text-muted-foreground ml-2'>/{page.slug}</span>
        </div>
        <Badge variant='outline' className={page.status === 'published' ? 'bg-green-50 text-green-700' : ''}>
          {page.status}
        </Badge>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground flex items-center gap-1'>
          <Eye className='h-3 w-3' />
          {page.analytics.views}
        </span>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => router.push(`/admin/docs/pages/${page._id}/edit`)}
        >
          <Edit className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
