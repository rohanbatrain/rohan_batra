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
import { CourseManagerDialog } from './CourseManagerDialog';
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
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
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
    if (activeSearch) {
      params.set('search', activeSearch);
    }
    const qs = params.toString();
    return `/api/admin/courses${qs ? `?${qs}` : ''}`;
  }, [status, activeSearch]);

  const { data, error, isLoading, mutate } = useSWR<CoursesResponse>(
    query,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleStatusChange = (value: string) => {
    setStatus(value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setStatus('all');
    setSearchInput('');
    setActiveSearch('');
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
          <Button onClick={() => setIsNewCourseDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> New course
          </Button>
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
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              Showing {data?.total ?? 0} course
              {(data?.total ?? 0) === 1 ? '' : 's'}
            </div>
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
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={isNewCourseDialogOpen}
        onOpenChange={open => {
          if (!open) {
            setStep(1); // Reset step when dialog closes
          }
          setIsNewCourseDialogOpen(open);
        }}
      >
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create a new course (Step {step} of 4)</DialogTitle>
            <DialogDescription>
              Enter the details of the new course. You can add modules and lessons
              after creation.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {step === 1 && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Title</Label>
                    <Input
                      id='title'
                      name='title'
                      value={newCourse.title}
                      onChange={handleInputChange}
                      placeholder='e.g. Introduction to Next.js'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='slug'>Slug</Label>
                    <Input
                      id='slug'
                      name='slug'
                      value={newCourse.slug}
                      onChange={handleInputChange}
                      placeholder='e.g. nextjs-intro'
                    />
                    <div className='flex items-center gap-2 text-xs pt-1 min-h-[20px]'>
                      {!newCourse.slug ? (
                        <span className='text-muted-foreground'>Auto-generated from title</span>
                      ) : isCheckingSlug ? (
                        <span className='flex items-center gap-1 text-muted-foreground'>
                          <Loader2 className='h-3 w-3 animate-spin' /> Checking availability…
                        </span>
                      ) : !isSlugFormatValid ? (
                        <span className='flex items-center gap-1 text-red-600 dark:text-red-400'>
                          <XCircle className='h-3 w-3' /> Invalid format
                        </span>
                      ) : isSlugAvailable === false ? (
                        <span className='flex items-center gap-1 text-red-600 dark:text-red-400'>
                          <XCircle className='h-3 w-3' /> Slug is taken
                        </span>
                      ) : isSlugAvailable === true ? (
                        <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'>
                          <CheckCircle2 className='h-3 w-3' /> Available
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='subtitle'>Subtitle</Label>
                  <Input
                    id='subtitle'
                    name='subtitle'
                    value={newCourse.subtitle}
                    onChange={handleInputChange}
                    placeholder='A brief, catchy subtitle'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='summary'>Summary</Label>
                  <Textarea
                    id='summary'
                    name='summary'
                    value={newCourse.summary}
                    onChange={handleInputChange}
                    placeholder='A short summary of the course content.'
                    rows={4}
                  />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>Difficulty</Label>
                    <Select
                      name='difficulty'
                      value={newCourse.difficulty}
                      onValueChange={value =>
                        setNewCourse(prev => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select difficulty' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='beginner'>Beginner</SelectItem>
                        <SelectItem value='intermediate'>Intermediate</SelectItem>
                        <SelectItem value='advanced'>Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Status</Label>
                    <Select
                      name='status'
                      value={newCourse.status}
                      onValueChange={value =>
                        setNewCourse(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='draft'>Draft</SelectItem>
                        <SelectItem value='published'>Published</SelectItem>
                        <SelectItem value='archived'>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Visibility</Label>
                    <Select
                      name='visibility'
                      value={newCourse.visibility}
                      onValueChange={value =>
                        setNewCourse(prev => ({ ...prev, visibility: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select visibility' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='public'>Public</SelectItem>
                        <SelectItem value='unlisted'>Unlisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='estimatedDurationMinutes'>
                      Estimated minutes
                    </Label>
                    <Input
                      id='estimatedDurationMinutes'
                      name='estimatedDurationMinutes'
                      value={newCourse.estimatedDurationMinutes}
                      onChange={handleInputChange}
                      placeholder='e.g. 120'
                    />
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='categories'>Categories</Label>
                    <Input
                      id='categories'
                      name='categories'
                      value={newCourse.categories}
                      onChange={handleInputChange}
                      placeholder='Comma separated (e.g. web,apis,backend)'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='tags'>Tags</Label>
                    <Input
                      id='tags'
                      name='tags'
                      value={newCourse.tags}
                      onChange={handleInputChange}
                      placeholder='Comma separated tags'
                    />
                  </div>
                </div>
                <div className='flex items-center justify-between rounded-md border p-4'>
                  <div>
                    <Label htmlFor='isFeatured'>Feature this course</Label>
                    <p className='text-sm text-muted-foreground'>
                      Featured courses are highlighted in marketing sections.
                    </p>
                  </div>
                  <Switch
                    id='isFeatured'
                    checked={newCourse.isFeatured}
                    onCheckedChange={checked =>
                      setNewCourse(prev => ({ ...prev, isFeatured: checked }))
                    }
                  />
                </div>
              </div>
            )}
            {step === 4 && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='heroImage'>Hero image URL or shortcode</Label>
                    <Input
                      id='heroImage'
                      name='heroImage'
                      value={newCourse.heroImage}
                      onChange={handleInputChange}
                      placeholder='https:// or asset://'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='heroLottieId'>Hero lottie asset ID</Label>
                    <Input
                      id='heroLottieId'
                      name='heroLottieId'
                      value={newCourse.heroLottieId}
                      onChange={handleInputChange}
                      placeholder='Optional ObjectId for animated hero'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='prerequisiteCourseIds'>
                      Prerequisite course IDs
                    </Label>
                    <Input
                      id='prerequisiteCourseIds'
                      name='prerequisiteCourseIds'
                      value={newCourse.prerequisiteCourseIds}
                      onChange={handleInputChange}
                      placeholder='Comma separated ObjectIds'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='prerequisiteBlogSlugs'>
                      Prerequisite blog slugs
                    </Label>
                    <Input
                      id='prerequisiteBlogSlugs'
                      name='prerequisiteBlogSlugs'
                      value={newCourse.prerequisiteBlogSlugs}
                      onChange={handleInputChange}
                      placeholder='Comma separated slugs'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='recommendedBlogSlugs'>
                      Recommended blog slugs
                    </Label>
                    <Input
                      id='recommendedBlogSlugs'
                      name='recommendedBlogSlugs'
                      value={newCourse.recommendedBlogSlugs}
                      onChange={handleInputChange}
                      placeholder='Comma separated slugs'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='recommendedBookIds'>
                      Recommended book IDs
                    </Label>
                    <Input
                      id='recommendedBookIds'
                      name='recommendedBookIds'
                      value={newCourse.recommendedBookIds}
                      onChange={handleInputChange}
                      placeholder='Comma separated ObjectIds'
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <div className='flex w-full justify-between'>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <div className='flex gap-2'>
                {step > 1 && (
                  <Button variant='outline' onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button onClick={() => setStep(step + 1)}>Next</Button>
                ) : (
                  <Button
                    onClick={handleCreateCourse}
                    disabled={isCreating}
                    className='sm:w-auto'
                  >
                    {isCreating ? 'Creating...' : 'Create Course'}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog-based manager deprecated in favor of dedicated page */}
    </div>
  );
};

export default CoursesManagement;
