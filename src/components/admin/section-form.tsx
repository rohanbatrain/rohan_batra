'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const sectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  parentSectionId: z.string().optional().or(z.literal('')),
  order: z.number().int().min(0),
  isExpanded: z.boolean(),
});

type FormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  projectId: string;
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export default function SectionForm({ projectId }: SectionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: sectionsData } = useSWR(
    `/api/admin/docs/projects/${projectId}/sections`,
    fetcher
  );

  const sections = sectionsData?.sections ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      order: 0,
      isExpanded: true,
      parentSectionId: '',
    },
  });

  const title = watch('title');

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
      const response = await fetch(`/api/admin/docs/projects/${projectId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create section');
      }

      toast({
        title: 'Success',
        description: 'Section created successfully',
      });

      router.push(`/admin/docs/${projectId}`);
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
    <div className='container mx-auto max-w-3xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold'>New Section</h1>
          <p className='text-muted-foreground'>Create a new documentation section</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Section Details</CardTitle>
            <CardDescription>Basic information about the section</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title *</Label>
              <Input id='title' {...register('title')} placeholder='Getting Started' />
              {errors.title && <p className='text-sm text-red-600'>{errors.title.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>URL Slug *</Label>
              <Input id='slug' {...register('slug')} placeholder='getting-started' />
              {errors.slug && <p className='text-sm text-red-600'>{errors.slug.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='parentSectionId'>Parent Section (Optional)</Label>
              <Select
                value={watch('parentSectionId')}
                onValueChange={value => setValue('parentSectionId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='None (Root level)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>None (Root level)</SelectItem>
                  {sections
                    .filter((s: any) => s.depth < 4) // Max 5 levels
                    .map((section: any) => (
                      <SelectItem key={section._id} value={section._id}>
                        {'  '.repeat(section.depth)}
                        {section.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className='text-sm text-muted-foreground'>
                Select a parent to nest this section (max 5 levels)
              </p>
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

            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='isExpanded'
                {...register('isExpanded')}
                className='h-4 w-4'
              />
              <Label htmlFor='isExpanded' className='font-normal'>
                Expand by default in sidebar
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            <Save className='mr-2 h-4 w-4' />
            {isSubmitting ? 'Creating...' : 'Create Section'}
          </Button>
        </div>
      </form>
    </div>
  );
}
