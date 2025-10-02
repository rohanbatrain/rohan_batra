'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dynamic import for MDX preview to avoid SSR issues
const MDXPreview = dynamic(() => import('@/components/admin/mdx-preview'), {
  ssr: false,
  loading: () => <div className='p-8 text-center text-muted-foreground'>Loading preview...</div>,
});

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-/]+$/, 'Slug must contain only lowercase letters, numbers, hyphens, and slashes'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  sectionId: z.string().optional().or(z.literal('')),
  parentPageId: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'published']),
  order: z.number().int().min(0),
  seo: z.object({
    metaTitle: z.string().max(200).optional().or(z.literal('')),
    metaDescription: z.string().max(500).optional().or(z.literal('')),
    keywords: z.string().optional().or(z.literal('')),
  }),
});

type FormData = z.infer<typeof pageSchema>;

interface DocEditorProps {
  projectId: string;
  pageId?: string;
  initialData?: Partial<FormData>;
}

export default function DocEditor({ projectId, pageId, initialData }: DocEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'preview' | 'editor'>('split');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      status: 'draft',
      order: 0,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
      ...initialData,
    },
  });

  const title = watch('title');
  const content = watch('content');
  const status = watch('status');

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !pageId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', generatedSlug);
    }
  }, [title, setValue, pageId]);

  // Auto-save functionality
  useEffect(() => {
    if (!pageId) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        const data = watch();
        await fetch(`/api/admin/docs/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [content, pageId, watch]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const url = pageId
        ? `/api/admin/docs/pages/${pageId}`
        : `/api/admin/docs/projects/${projectId}/pages`;
      const method = pageId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save page');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: pageId ? 'Page updated successfully' : 'Page created successfully',
      });

      if (!pageId) {
        router.push(`/admin/docs/pages/${result.page._id}/edit`);
      }
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

  const handlePublish = async () => {
    setValue('status', 'published');
    await handleSubmit(onSubmit)();
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='border-b bg-background sticky top-0 z-10'>
        <div className='container mx-auto flex items-center justify-between p-4'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-lg font-semibold'>
                {pageId ? 'Edit Page' : 'New Page'}
              </h1>
              {isSaving && <p className='text-sm text-muted-foreground'>Saving...</p>}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <div className='hidden lg:flex gap-1 border rounded-md p-1'>
              <Button
                size='sm'
                variant={previewMode === 'editor' ? 'secondary' : 'ghost'}
                onClick={() => setPreviewMode('editor')}
              >
                <Code className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                variant={previewMode === 'split' ? 'secondary' : 'ghost'}
                onClick={() => setPreviewMode('split')}
              >
                Split
              </Button>
              <Button
                size='sm'
                variant={previewMode === 'preview' ? 'secondary' : 'ghost'}
                onClick={() => setPreviewMode('preview')}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </div>

            <Button variant='outline' onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              <Save className='mr-2 h-4 w-4' />
              Save Draft
            </Button>

            {status === 'draft' && (
              <Button onClick={handlePublish} disabled={isSubmitting}>
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full grid lg:grid-cols-2 gap-0'>
          {/* Editor Pane */}
          {(previewMode === 'editor' || previewMode === 'split') && (
            <div className='h-full overflow-y-auto border-r'>
              <div className='p-6 space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>Title *</Label>
                  <Input
                    id='title'
                    {...register('title')}
                    placeholder='Getting Started'
                    className='text-lg font-semibold'
                  />
                  {errors.title && (
                    <p className='text-sm text-red-600'>{errors.title.message}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='slug'>URL Slug *</Label>
                  <Input id='slug' {...register('slug')} placeholder='getting-started' />
                  {errors.slug && (
                    <p className='text-sm text-red-600'>{errors.slug.message}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='excerpt'>Excerpt</Label>
                  <Textarea
                    id='excerpt'
                    {...register('excerpt')}
                    placeholder='A brief description of this page'
                    rows={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='content'>Content (MDX) *</Label>
                  <Textarea
                    id='content'
                    {...register('content')}
                    placeholder='# Welcome&#10;&#10;Start writing your documentation here...'
                    rows={20}
                    className='font-mono text-sm'
                  />
                  {errors.content && (
                    <p className='text-sm text-red-600'>{errors.content.message}</p>
                  )}
                </div>

                <Tabs defaultValue='settings'>
                  <TabsList>
                    <TabsTrigger value='settings'>Settings</TabsTrigger>
                    <TabsTrigger value='seo'>SEO</TabsTrigger>
                  </TabsList>

                  <TabsContent value='settings' className='space-y-4'>
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
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='order'>Order</Label>
                      <Input
                        id='order'
                        type='number'
                        {...register('order', { valueAsNumber: true })}
                        placeholder='0'
                      />
                      <p className='text-sm text-muted-foreground'>
                        Lower numbers appear first in navigation
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='sectionId'>Section (Optional)</Label>
                      <Input
                        id='sectionId'
                        {...register('sectionId')}
                        placeholder='Section ID'
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value='seo' className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='metaTitle'>Meta Title</Label>
                      <Input
                        id='metaTitle'
                        {...register('seo.metaTitle')}
                        placeholder='Override page title for SEO'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='metaDescription'>Meta Description</Label>
                      <Textarea
                        id='metaDescription'
                        {...register('seo.metaDescription')}
                        placeholder='A brief description for search results'
                        rows={3}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='keywords'>Keywords</Label>
                      <Input
                        id='keywords'
                        {...register('seo.keywords')}
                        placeholder='react, tutorial, getting started'
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* Preview Pane */}
          {(previewMode === 'preview' || previewMode === 'split') && (
            <div className='h-full overflow-y-auto bg-muted/30'>
              <div className='p-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>{watch('title') || 'Untitled Page'}</CardTitle>
                    {watch('excerpt') && (
                      <CardDescription>{watch('excerpt')}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <MDXPreview content={content || '# Start writing...'} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
