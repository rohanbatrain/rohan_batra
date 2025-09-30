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
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { slugify } from '@/lib/slug';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

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
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  published:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  archived:
    'bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200',
  intermediate:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200',
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
            <div className='grid gap-4 md:grid-cols-2'>
              {data?.courses.map(course => (
                <Card
                  key={course.id}
                  className='border border-gray-200 dark:border-gray-800 shadow-sm'
                >
                  <CardHeader className='space-y-2'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <CardTitle className='text-xl'>{course.title}</CardTitle>
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
                      <div className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>
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
                        <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                          No flashcard decks linked yet.
                        </p>
                      )}
                    </div>
                    <div className='flex items-center justify-between border-t border-dashed pt-3 text-sm text-gray-500 dark:text-gray-400'>
                      <span>
                        Last updated{' '}
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </span>
                      {course.status === 'published' ? (
                        <Link
                          href={`/courses/${course.slug}`}
                          target='_blank'
                          className='text-blue-600 dark:text-blue-300 hover:underline'
                        >
                          View public page
                        </Link>
                      ) : (
                        <span className='italic text-muted-foreground'>Public page available after publishing</span>
                      )}
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
