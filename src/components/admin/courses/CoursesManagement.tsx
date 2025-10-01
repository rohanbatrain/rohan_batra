'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  Layers,
  Timer,
  BookOpen,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Archive,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { slugify } from '@/lib/slug';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminCourseSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  difficulty: string;
  lessonCount: number;
  moduleCount: number;
  estimatedDurationMinutes?: number | null;
  isFeatured: boolean;
  publishedAt?: string | null;
  updatedAt: string;
  flashcardDecks: Array<{
    id: string;
    title: string;
    status: string;
    visibility: string;
  }>;
}

interface CoursesResponse {
  courses: AdminCourseSummary[];
  stats: Record<string, number>;
  total: number;
  page: number;
  pageSize: number;
}

interface CreateCourseForm {
  title: string;
  subtitle: string;
  summary: string;
  heroImage: string;
  heroLottieId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'unlisted';
  categories: string;
  tags: string;
  estimatedDurationMinutes: string;
  prerequisiteCourseIds: string;
  prerequisiteBlogSlugs: string;
  recommendedBlogSlugs: string;
  recommendedBookIds: string;
  isFeatured: boolean;
}

const defaultForm: CreateCourseForm = {
  title: '',
  subtitle: '',
  summary: '',
  heroImage: '',
  heroLottieId: '',
  difficulty: 'beginner',
  status: 'draft',
  visibility: 'public',
  categories: '',
  tags: '',
  estimatedDurationMinutes: '',
  prerequisiteCourseIds: '',
  prerequisiteBlogSlugs: '',
  recommendedBlogSlugs: '',
  recommendedBookIds: '',
  isFeatured: false,
};

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) {
      throw new Error('Failed to load courses');
    }
    return res.json();
  });

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const statusColors: Record<string, string> = {
  draft:
    'bg-yellow-100 text-gray-900 dark:bg-yellow-900/50 dark:text-yellow-100',
  published:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  archived:
    'bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-blue-100 text-gray-900 dark:bg-blue-900/50 dark:text-blue-100',
  intermediate:
    'bg-purple-100 text-gray-900 dark:bg-purple-900/50 dark:text-purple-100',
  advanced: 'bg-rose-100 text-gray-900 dark:bg-rose-900/70 dark:text-rose-100',
};

function formatMinutes(minutes?: number | null) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h${remainder ? ` ${remainder}m` : ''}`;
}

const CoursesManagement = () => {
  const [status, setStatus] = useState('all');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'unlisted'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    subtitle: '',
    summary: '',
    difficulty: 'beginner',
    status: 'draft',
    visibility: 'public',
    categories: '',
    tags: '',
    heroImage: '',
    heroLottieId: '',
    estimatedDurationMinutes: '',
    prerequisiteCourseIds: '',
    prerequisiteBlogSlugs: '',
    recommendedBlogSlugs: '',
    recommendedBookIds: '',
    isFeatured: false,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);
  const [isBulkPublishing, setIsBulkPublishing] = useState(false);
  const { toast } = useToast();

  // Slug helpers
  const [slugEdited, setSlugEdited] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isSlugFormatValid, setIsSlugFormatValid] = useState(true);
  const debouncedSlug = useDebounce(newCourse.slug, 500);
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const openCourseManager = (courseId: string) => {
    setSelectedCourseId(courseId);
    setManagerOpen(true);
  };

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== 'all') {
      params.set('status', status);
    }
    if (visibility !== 'all') {
      params.set('visibility', visibility);
    }
    if (activeSearch) {
      params.set('search', activeSearch);
    }
    params.set('page', String(page));
    params.set('limit', String(pageSize));
    const qs = params.toString();
    return `/api/admin/courses${qs ? `?${qs}` : ''}`;
  }, [status, visibility, activeSearch, page]);

  const { data, error, isLoading, mutate } = useSWR<CoursesResponse>(
    query,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleVisibilityChange = (value: 'all' | 'public' | 'unlisted') => {
    setVisibility(value);
    setPage(1);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatus('all');
    setVisibility('all');
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
    mutate();
  };

  const handleDialogChange = (open: boolean) => {
    setIsNewCourseDialogOpen(open);
    if (!open) {
      setStep(1);
      setNewCourse({
        title: '',
        slug: '',
        subtitle: '',
        summary: '',
        difficulty: 'beginner',
        status: 'draft',
        visibility: 'public',
        categories: '',
        tags: '',
        heroImage: '',
        heroLottieId: '',
        estimatedDurationMinutes: '',
        prerequisiteCourseIds: '',
        prerequisiteBlogSlugs: '',
        recommendedBlogSlugs: '',
        recommendedBookIds: '',
        isFeatured: false,
      });
      setSlugEdited(false);
      setIsCheckingSlug(false);
      setIsSlugAvailable(null);
      setIsSlugFormatValid(true);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setNewCourse(prev => {
      const next = { ...prev, [name]: value } as typeof prev;
      if (name === 'title' && !slugEdited) {
        next.slug = slugify(value);
      }
      if (name === 'slug') {
        setSlugEdited(true);
      }
      return next;
    });
  };

  // Validate slug format and check availability when debounced value changes
  useEffect(() => {
    const val = debouncedSlug.trim();
    if (!val) {
      setIsSlugFormatValid(true);
      setIsSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }
    const valid = slugPattern.test(val);
    setIsSlugFormatValid(valid);
    if (!valid) {
      setIsSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }
    let cancelled = false;
    setIsCheckingSlug(true);
  fetch(`/api/admin/courses/check-slug?slug=${encodeURIComponent(val)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('Failed'))))
      .then((data: { isAvailable: boolean }) => {
        if (!cancelled) {
          setIsSlugAvailable(data.isAvailable);
        }
      })
      .catch(() => {
        if (!cancelled) setIsSlugAvailable(null);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingSlug(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSlug]);

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a course title.',
        variant: 'destructive',
      });
      return;
    }

    if (newCourse.summary.trim().length < 50) {
      toast({
        title: 'Summary too short',
        description: 'Course summary must be at least 50 characters.',
        variant: 'destructive',
      });
      return;
    }

    const slugVal = (newCourse.slug || slugify(newCourse.title)).trim();
    if (!slugVal) {
      toast({
        title: 'Slug required',
        description: 'A slug will be auto-generated from the title, but it cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    if (!slugPattern.test(slugVal)) {
      toast({
        title: 'Invalid slug',
        description: 'Use lowercase letters, numbers, and hyphens only.',
        variant: 'destructive',
      });
      return;
    }
    if (isSlugAvailable === false) {
      toast({
        title: 'Slug already taken',
        description: 'Please choose a different slug.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      const payload: Record<string, unknown> = {
        title: newCourse.title.trim(),
        slug: slugVal,
        summary: newCourse.summary.trim(),
        difficulty: newCourse.difficulty,
        status: newCourse.status,
        visibility: newCourse.visibility,
        isFeatured: newCourse.isFeatured,
      };

      if (newCourse.subtitle.trim()) {
        payload.subtitle = newCourse.subtitle.trim();
      }

      if (newCourse.categories.trim()) {
        payload.categories = newCourse.categories
          .split(',')
          .map(entry => entry.trim())
          .filter(Boolean);
      }

      if (newCourse.tags.trim()) {
        payload.tags = newCourse.tags.split(',').map(entry => entry.trim());
      }

      if (newCourse.estimatedDurationMinutes.trim()) {
        const minutes = Number(newCourse.estimatedDurationMinutes);
        if (!Number.isNaN(minutes) && minutes >= 0) {
          payload.estimatedDurationMinutes = minutes;
        }
      }

      if (newCourse.prerequisiteCourseIds.trim()) {
        payload.prerequisiteCourseIds = newCourse.prerequisiteCourseIds
          .split(',')
          .map(entry => entry.trim())
          .filter(Boolean);
      }

      if (newCourse.prerequisiteBlogSlugs.trim()) {
        payload.prerequisiteBlogSlugs = newCourse.prerequisiteBlogSlugs
          .split(',')
          .map(entry => entry.trim())
          .filter(Boolean);
      }

      if (newCourse.recommendedBlogSlugs.trim()) {
        payload.recommendedBlogSlugs = newCourse.recommendedBlogSlugs
          .split(',')
          .map(entry => entry.trim())
          .filter(Boolean);
      }

      if (newCourse.recommendedBookIds.trim()) {
        payload.recommendedBookIds = newCourse.recommendedBookIds
          .split(',')
          .map(entry => entry.trim())
          .filter(Boolean);
      }

      payload.flashcardDeckIds = [];

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to create course');
      }

      toast({
        title: 'Course created',
        description: 'New course has been added successfully.',
      });
      handleDialogChange(false);
      mutate();
    } catch (err) {
      toast({
        title: 'Unable to create course',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectAll = () => {
    if (!data?.courses) return;
    if (selectedCourses.size === data.courses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(data.courses.map(c => c.id)));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedCourses.size} course(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      const deletePromises = Array.from(selectedCourses).map(courseId =>
        fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
      );
      
      const results = await Promise.allSettled(deletePromises);
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast({
        title: 'Bulk delete completed',
        description: `Successfully deleted ${succeeded} course(s).${failed > 0 ? ` Failed: ${failed}` : ''}`,
        variant: failed > 0 ? 'destructive' : 'default',
      });

      setSelectedCourses(new Set());
      mutate();
    } catch (err) {
      toast({
        title: 'Bulk delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedCourses.size === 0) return;

    try {
      setIsBulkArchiving(true);
      const updatePromises = Array.from(selectedCourses).map(courseId =>
        fetch(`/api/admin/courses/${courseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' }),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast({
        title: 'Bulk archive completed',
        description: `Successfully archived ${succeeded} course(s).${failed > 0 ? ` Failed: ${failed}` : ''}`,
        variant: failed > 0 ? 'destructive' : 'default',
      });

      setSelectedCourses(new Set());
      mutate();
    } catch (err) {
      toast({
        title: 'Bulk archive failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsBulkArchiving(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedCourses.size === 0) return;

    try {
      setIsBulkPublishing(true);
      const updatePromises = Array.from(selectedCourses).map(courseId =>
        fetch(`/api/admin/courses/${courseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast({
        title: 'Bulk publish completed',
        description: `Successfully published ${succeeded} course(s).${failed > 0 ? ` Failed: ${failed}` : ''}`,
        variant: failed > 0 ? 'destructive' : 'default',
      });

      setSelectedCourses(new Set());
      mutate();
    } catch (err) {
      toast({
        title: 'Bulk publish failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsBulkPublishing(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedCourses.size === 0) return;

    try {
      setIsBulkPublishing(true);
      const updatePromises = Array.from(selectedCourses).map(courseId =>
        fetch(`/api/admin/courses/${courseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'draft' }),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast({
        title: 'Bulk unpublish completed',
        description: `Successfully unpublished ${succeeded} course(s).${failed > 0 ? ` Failed: ${failed}` : ''}`,
        variant: failed > 0 ? 'destructive' : 'default',
      });

      setSelectedCourses(new Set());
      mutate();
    } catch (err) {
      toast({
        title: 'Bulk unpublish failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsBulkPublishing(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      toast({
        title: 'Course deleted',
        description: `"${courseTitle}" has been deleted successfully.`,
      });

      mutate();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateCourse = async (courseId: string, courseTitle: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      
      const originalCourse = await response.json();
      
      const newCourseData = {
        ...originalCourse,
        title: `${originalCourse.title} (Copy)`,
        slug: `${originalCourse.slug}-copy-${Date.now()}`,
        status: 'draft',
        isFeatured: false,
      };

      const createResponse = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourseData),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to duplicate course');
      }

      toast({
        title: 'Course duplicated',
        description: `Created a copy of "${courseTitle}".`,
      });

      mutate();
    } catch (err) {
      toast({
        title: 'Duplication failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Courses
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Manage course catalog, progress readiness, and linked flashcard
            decks.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Reset filters
          </Button>
          <Link href='/admin/courses/create'>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> New course
            </Button>
          </Link>
        </div>
      </div>

      <Tabs
        value={status}
        onValueChange={handleStatusChange}
        className='w-full'
      >
        <TabsList className='w-full overflow-x-auto justify-start'>
          {statusTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className='px-4'>
              {tab.label}
              {tab.value !== 'all' && data?.stats?.[tab.value] !== undefined ? (
                <span className='ml-2 text-xs text-gray-400'>
                  {data?.stats?.[tab.value] ?? 0}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={status} className='mt-4'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
            <form
              onSubmit={handleSearchSubmit}
              className='flex w-full md:w-auto gap-2'
            >
              <Input
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder='Search courses by title or slug'
                className='min-w-[220px]'
              />
              <Button type='submit'>Search</Button>
            </form>
            <div className='flex items-center gap-3'>
              <div className='text-sm text-gray-600 dark:text-gray-300'>Visibility</div>
              <Select value={visibility} onValueChange={v => handleVisibilityChange(v as any)}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='Visibility' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='public'>Public</SelectItem>
                  <SelectItem value='unlisted'>Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
            Showing page {data?.page ?? page} of {data?.pageSize && data?.total ? Math.max(1, Math.ceil((data.total) / (data.pageSize))) : 1} · {data?.total ?? 0} total
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedCourses.size > 0 && (
            <div className='mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30'>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                  {selectedCourses.size} course(s) selected
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setSelectedCourses(new Set())}
                >
                  Clear selection
                </Button>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleBulkPublish}
                  disabled={isBulkPublishing || isBulkArchiving || isBulkDeleting}
                >
                  {isBulkPublishing ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Eye className='mr-2 h-4 w-4' />
                  )}
                  Publish
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleBulkUnpublish}
                  disabled={isBulkPublishing || isBulkArchiving || isBulkDeleting}
                >
                  {isBulkPublishing ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <EyeOff className='mr-2 h-4 w-4' />
                  )}
                  Unpublish
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleBulkArchive}
                  disabled={isBulkArchiving || isBulkPublishing || isBulkDeleting}
                >
                  {isBulkArchiving ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Archive className='mr-2 h-4 w-4' />
                  )}
                  Archive
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting || isBulkArchiving || isBulkPublishing}
                >
                  {isBulkDeleting ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Trash2 className='mr-2 h-4 w-4' />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className='grid gap-4 md:grid-cols-2'>
              {[1, 2, 3, 4].map(key => (
                <Card
                  key={key}
                  className='border border-gray-200 dark:border-gray-800'
                >
                  <CardHeader>
                    <Skeleton className='h-6 w-2/3' />
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-4 w-full' />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className='flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'>
              <AlertCircle className='h-5 w-5' />
              <span>{error.message}</span>
            </div>
          ) : data && data.courses.length === 0 ? (
            <Card className='border border-dashed border-gray-300 dark:border-gray-700'>
              <CardContent className='py-12 text-center space-y-3'>
                <GraduationCap className='mx-auto h-10 w-10 text-gray-400 dark:text-gray-600' />
                <p className='text-gray-500 dark:text-gray-400'>
                  No courses found for these filters.
                </p>
                <Button variant='outline' onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
            {/* Select All Checkbox */}
            {data && data.courses.length > 0 && (
              <div className='mb-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800'>
                <Checkbox
                  checked={data.courses.length > 0 && selectedCourses.size === data.courses.length}
                  onCheckedChange={handleSelectAll}
                  id='select-all'
                />
                <Label htmlFor='select-all' className='cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Select all courses on this page
                </Label>
              </div>
            )}
            <div className='grid gap-4 md:grid-cols-2'>
              {data?.courses.map(course => (
                <Card
                  key={course.id}
                  className='border border-gray-200 dark:border-gray-800 shadow-sm'
                >
                  <CardHeader className='space-y-2'>
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div className='flex items-start gap-3 flex-1'>
                        <Checkbox
                          checked={selectedCourses.has(course.id)}
                          onCheckedChange={() => handleSelectCourse(course.id)}
                          id={`course-${course.id}`}
                          className='mt-1'
                        />
                        <div className='flex-1'>
                          <Label htmlFor={`course-${course.id}`} className='cursor-pointer'>
                            <CardTitle className='text-xl'>{course.title}</CardTitle>
                          </Label>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Link href={`/admin/courses/${course.id}`}>
                          <Button size='sm' variant='outline'>Manage</Button>
                        </Link>
                        <Badge
                          className={
                            statusColors[course.status] ??
                            'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }
                        >
                          {course.status}
                        </Badge>
                        <Badge
                          className={
                            difficultyColors[course.difficulty] ??
                            'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }
                        >
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400'>
                      <span className='flex items-center gap-1'>
                        <BookOpen className='h-4 w-4' /> {course.moduleCount}{' '}
                        module{course.moduleCount === 1 ? '' : 's'}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Layers className='h-4 w-4' /> {course.lessonCount}{' '}
                        lesson{course.lessonCount === 1 ? '' : 's'}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Timer className='h-4 w-4' />{' '}
                        {formatMinutes(course.estimatedDurationMinutes)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300 font-semibold'>
                        Flashcard decks
                      </div>
                      {course.flashcardDecks.length > 0 ? (
                        <div className='flex flex-wrap gap-2'>
                          {course.flashcardDecks.map(deck => (
                            <Badge
                              key={deck.id}
                              variant='secondary'
                              className='capitalize'
                            >
                              {deck.title}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className='text-sm text-gray-600 dark:text-gray-300 italic'>
                          No flashcard decks linked yet.
                        </p>
                      )}
                    </div>
                    <div className='flex items-center justify-between border-t border-dashed pt-3 text-sm text-gray-600 dark:text-gray-300'>
                      <span>
                        Last updated{' '}
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </span>
                      {course.status === 'published' ? (
                        <Link
                          href={`/courses/${course.slug}`}
                          target='_blank'
                          className='text-blue-600 dark:text-blue-400 hover:underline'
                        >
                          View public page
                        </Link>
                      ) : (
                        <span className='italic text-gray-500 dark:text-gray-400'>Public page available after publishing</span>
                      )}
                    </div>
                    {/* Quick Actions */}
                    <div className='flex items-center gap-2 border-t border-dashed pt-3'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDuplicateCourse(course.id, course.title)}
                        className='flex-1'
                      >
                        <Copy className='mr-2 h-3 w-3' />
                        Duplicate
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className='flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                      >
                        <Trash2 className='mr-2 h-3 w-3' />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className='mt-6 flex items-center justify-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                disabled={(data?.page ?? page) <= 1 || isLoading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className='text-sm text-gray-600 dark:text-gray-300'>
                Page {data?.page ?? page} of {data?.pageSize && data?.total ? Math.max(1, Math.ceil((data.total) / (data.pageSize))) : 1}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={isLoading || ((data?.page ?? page) >= (data?.pageSize && data?.total ? Math.ceil((data.total) / (data.pageSize)) : 1))}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Creation moved to dedicated page */}

      {/* Dialog-based manager deprecated in favor of dedicated page */}
    </div>
  );
};

export default CoursesManagement;
