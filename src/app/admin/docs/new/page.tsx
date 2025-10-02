'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const docProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  projectId: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
  visibility: z.enum(['public', 'private', 'unlisted']),
  config: z.object({
    theme: z.object({
      primaryColor: z.string().optional().or(z.literal('')),
      fontFamily: z.string().optional().or(z.literal('')),
      customCss: z.string().optional().or(z.literal('')),
    }),
    sidebar: z.object({
      showPageNumbers: z.boolean(),
      expandByDefault: z.boolean(),
    }),
    analytics: z.object({
      googleAnalyticsId: z.string().optional().or(z.literal('')),
      plausibleDomain: z.string().optional().or(z.literal('')),
    }),
  }),
  seo: z.object({
    metaTitle: z.string().max(200).optional().or(z.literal('')),
    metaDescription: z.string().max(500).optional().or(z.literal('')),
    ogImage: z.string().url().optional().or(z.literal('')),
  }),
  gitIntegration: z.object({
    enabled: z.boolean(),
    repoUrl: z.string().url().optional().or(z.literal('')),
    branch: z.string().optional().or(z.literal('')),
    syncPath: z.string().optional().or(z.literal('')),
  }),
});

type FormData = z.infer<typeof docProjectSchema>;

export default function NewDocProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(docProjectSchema),
    defaultValues: {
      status: 'draft',
      visibility: 'public',
      config: {
        theme: {
          primaryColor: '#3b82f6',
          fontFamily: 'Inter',
          customCss: '',
        },
        sidebar: {
          showPageNumbers: true,
          expandByDefault: false,
        },
        analytics: {
          googleAnalyticsId: '',
          plausibleDomain: '',
        },
      },
      seo: {
        metaTitle: '',
        metaDescription: '',
        ogImage: '',
      },
      gitIntegration: {
        enabled: false,
        repoUrl: '',
        branch: 'main',
        syncPath: 'docs/',
      },
    },
  });

  const title = watch('title');
  const gitEnabled = watch('gitIntegration.enabled');

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', generatedSlug);
    }
  }, [title, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/docs/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Documentation project created successfully',
      });

      router.push(`/admin/docs/${result.project.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto max-w-4xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold'>New Documentation Project</h1>
          <p className='text-muted-foreground'>
            Create a new documentation project for your portfolio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the documentation project</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title *</Label>
              <Input id='title' {...register('title')} placeholder='My Project Documentation' />
              {errors.title && (
                <p className='text-sm text-red-600'>{errors.title.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>URL Slug *</Label>
              <Input id='slug' {...register('slug')} placeholder='my-project-docs' />
              <p className='text-sm text-muted-foreground'>
                Will be available at /docs/{watch('slug') || 'your-slug'}
              </p>
              {errors.slug && (
                <p className='text-sm text-red-600'>{errors.slug.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                {...register('description')}
                placeholder='A comprehensive guide to using...'
                rows={3}
              />
              {errors.description && (
                <p className='text-sm text-red-600'>{errors.description.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='logoUrl'>Logo URL</Label>
              <Input
                id='logoUrl'
                {...register('logoUrl')}
                placeholder='https://example.com/logo.png'
              />
              {errors.logoUrl && (
                <p className='text-sm text-red-600'>{errors.logoUrl.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='projectId'>Link to Portfolio Project (Optional)</Label>
              <Input
                id='projectId'
                {...register('projectId')}
                placeholder='Enter project ID'
              />
              <p className='text-sm text-muted-foreground'>
                Connect this documentation to an existing portfolio project
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status & Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Visibility</CardTitle>
            <CardDescription>Control publication status and access</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={value => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='draft'>Draft</SelectItem>
                  <SelectItem value='published'>Published</SelectItem>
                  <SelectItem value='archived'>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='visibility'>Visibility</Label>
              <Select
                value={watch('visibility')}
                onValueChange={value => setValue('visibility', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='public'>Public - Everyone can view</SelectItem>
                  <SelectItem value='private'>Private - Only authenticated users</SelectItem>
                  <SelectItem value='unlisted'>Unlisted - Only with direct link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Configuration</CardTitle>
            <CardDescription>Customize the appearance of your documentation</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='primaryColor'>Primary Color</Label>
                <Input
                  id='primaryColor'
                  {...register('config.theme.primaryColor')}
                  placeholder='#3b82f6'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='fontFamily'>Font Family</Label>
                <Input
                  id='fontFamily'
                  {...register('config.theme.fontFamily')}
                  placeholder='Inter, system-ui'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='customCss'>Custom CSS</Label>
              <Textarea
                id='customCss'
                {...register('config.theme.customCss')}
                placeholder='.doc-content { ... }'
                rows={3}
              />
            </div>

            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='showPageNumbers'
                  {...register('config.sidebar.showPageNumbers')}
                  className='h-4 w-4'
                />
                <Label htmlFor='showPageNumbers' className='font-normal'>
                  Show page numbers in sidebar
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='expandByDefault'
                  {...register('config.sidebar.expandByDefault')}
                  className='h-4 w-4'
                />
                <Label htmlFor='expandByDefault' className='font-normal'>
                  Expand sidebar sections by default
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Optimize for search engines</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='metaTitle'>Meta Title</Label>
              <Input
                id='metaTitle'
                {...register('seo.metaTitle')}
                placeholder='Override default title for SEO'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='metaDescription'>Meta Description</Label>
              <Textarea
                id='metaDescription'
                {...register('seo.metaDescription')}
                placeholder='A brief description for search results'
                rows={2}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='ogImage'>Open Graph Image</Label>
              <Input
                id='ogImage'
                {...register('seo.ogImage')}
                placeholder='https://example.com/og-image.png'
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            <Save className='mr-2 h-4 w-4' />
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
