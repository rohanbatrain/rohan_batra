'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Book, FileText, Eye, Search as SearchIcon, Plus, ExternalLink } from 'lucide-react';

interface DocProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  logoUrl?: string;
  projectId?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  pageCount: number;
  analytics: {
    totalViews: number;
    totalSearches: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export default function DocsAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, error, isLoading, mutate } = useSWR<{ projects: DocProject[] }>(
    `/api/admin/docs/projects${
      statusFilter !== 'all' || visibilityFilter !== 'all' || search
        ? `?${new URLSearchParams({
            ...(statusFilter !== 'all' && { status: statusFilter }),
            ...(visibilityFilter !== 'all' && { visibility: visibilityFilter }),
            ...(search && { search }),
          })}`
        : ''
    }`,
    fetcher,
    { keepPreviousData: true }
  );

  const projects = data?.projects ?? [];

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

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'private':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'unlisted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='container mx-auto max-w-7xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold'>Documentation Projects</h1>
          <p className='text-muted-foreground'>
            Manage documentation for your portfolio projects
          </p>
        </div>
        <Button onClick={() => router.push('/admin/docs/new')}>
          <Plus className='mr-2 h-4 w-4' />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex-1 min-w-[200px]'>
              <div className='relative'>
                <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search projects...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='published'>Published</SelectItem>
                <SelectItem value='archived'>Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='Visibility' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Visibility</SelectItem>
                <SelectItem value='public'>Public</SelectItem>
                <SelectItem value='private'>Private</SelectItem>
                <SelectItem value='unlisted'>Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-full' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-20 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center text-red-600'>
              {(error as Error).message || 'Failed to load projects'}
            </div>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <Book className='h-16 w-16 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No documentation projects yet</h3>
            <p className='text-muted-foreground mb-4 text-center max-w-md'>
              Create your first documentation project to get started with writing comprehensive
              docs for your portfolio projects.
            </p>
            <Button onClick={() => router.push('/admin/docs/new')}>
              <Plus className='mr-2 h-4 w-4' />
              Create Documentation Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {projects.map(project => (
            <Card key={project.id} className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 min-w-0'>
                    <CardTitle className='truncate'>{project.title}</CardTitle>
                    <CardDescription className='truncate'>{project.slug}</CardDescription>
                  </div>
                  {project.logoUrl && (
                    <img
                      src={project.logoUrl}
                      alt={project.title}
                      className='h-10 w-10 rounded object-cover flex-shrink-0'
                    />
                  )}
                </div>
                <div className='flex gap-2 pt-2'>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  <Badge className={getVisibilityColor(project.visibility)}>
                    {project.visibility}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-sm text-muted-foreground line-clamp-2'>
                  {project.description}
                </p>
                
                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <FileText className='h-4 w-4' />
                    <span>{project.pageCount} pages</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Eye className='h-4 w-4' />
                    <span>{project.analytics.totalViews} views</span>
                  </div>
                </div>

                <div className='flex gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => router.push(`/admin/docs/${project.id}`)}
                  >
                    Manage
                  </Button>
                  {project.status === 'published' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => window.open(`/docs/${project.slug}`, '_blank')}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
