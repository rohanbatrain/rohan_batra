'use client';

import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { DeckMultiSelect, type DeckOption } from '@/components/admin/courses/DeckMultiSelect';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/slug';

type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  moduleCount: number;
  lessonCount: number;
};

type LessonDetail = { id: string };

type ModuleDetail = {
  id: string;
  title: string;
  summary: string | null;
  order: number;
  estimatedDurationMinutes: number | null;
  flashcardDeckIds: string[];
  lessons: LessonDetail[];
  createdAt: string;
  updatedAt: string;
};

type CourseDetailResponse = {
  course: { id: string; title: string; slug: string };
  summary: CourseSummary;
  modules: ModuleDetail[];
  decks: DeckOption[];
};

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to load');
    return res.json();
  });

type LessonFormState = {
  title: string;
  slug: string;
  contentType: 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards';
  blogSlug: string;
  standaloneContent: string;
  standaloneFormat: 'mdx' | 'markdown' | 'html';
  externalResource: string;
  quizId: string;
  flashcardDeckIds: string[];
  estimatedDurationMinutes: string;
  isPreviewable: boolean;
  progressWeight: string;
  releaseAt: string;
};

const defaultLessonForm: LessonFormState = {
  title: '',
  slug: '',
  contentType: 'standalone',
  blogSlug: '',
  standaloneContent: '',
  standaloneFormat: 'mdx',
  externalResource: '',
  quizId: '',
  flashcardDeckIds: [],
  estimatedDurationMinutes: '15',
  isPreviewable: false,
  progressWeight: '1',
  releaseAt: '',
};

export default function NewLessonForm({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const { data, error, isLoading } = useSWR<CourseDetailResponse>(
    `/api/admin/courses/${courseId}`,
    fetcher,
    { keepPreviousData: true }
  );

  const module = useMemo(() => {
    return data?.modules?.find(m => m.id === moduleId) ?? null;
  }, [data?.modules, moduleId]);

  const deckOptions = useMemo(() => data?.decks ?? [], [data?.decks]);

  const [lessonForm, setLessonForm] = useState<LessonFormState>(defaultLessonForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLessonForm(prev => ({ ...prev, estimatedDurationMinutes: prev.estimatedDurationMinutes || '15' }));
  }, []);

  const handleField = <K extends keyof LessonFormState>(key: K, value: LessonFormState[K]) => {
    setLessonForm(prev => ({ ...prev, [key]: value }));
  };

  const handleTitle = (value: string) => {
    handleField('title', value);
    if (!slugEdited) {
      handleField('slug', slugify(value));
    }
  };

  const handleSlug = (value: string) => {
    setSlugEdited(true);
    handleField('slug', value);
  };

  const handleDecks = (ids: string[]) => handleField('flashcardDeckIds', ids);

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      title: lessonForm.title.trim(),
      contentType: lessonForm.contentType,
      flashcardDeckIds: lessonForm.flashcardDeckIds,
      estimatedDurationMinutes: Number(lessonForm.estimatedDurationMinutes) || 15,
      isPreviewable: lessonForm.isPreviewable,
      progressWeight: Number(lessonForm.progressWeight) || 1,
    };

    if (lessonForm.slug.trim()) payload.slug = lessonForm.slug.trim();
    if (lessonForm.blogSlug.trim()) payload.blogSlug = lessonForm.blogSlug.trim();
    if (lessonForm.standaloneContent.trim()) payload.standaloneContent = lessonForm.standaloneContent.trim();
    if (lessonForm.quizId.trim()) payload.quizId = lessonForm.quizId.trim();
    if (lessonForm.releaseAt) payload.releaseAt = new Date(lessonForm.releaseAt).toISOString();
    if (lessonForm.contentType === 'standalone') payload.standaloneFormat = lessonForm.standaloneFormat;
    if (lessonForm.contentType === 'video' && lessonForm.externalResource.trim()) payload.externalResource = lessonForm.externalResource.trim();
    return payload;
  };

  const validate = (): string | null => {
    if (!lessonForm.title.trim()) return 'Lesson title is required.';
    if (lessonForm.contentType === 'blog' && !lessonForm.blogSlug.trim()) return 'Blog lessons must reference a blog slug.';
    if (lessonForm.contentType === 'flashcards' && lessonForm.flashcardDeckIds.length === 0) return 'Flashcard lessons need at least one deck.';
    if (lessonForm.contentType === 'video' && !lessonForm.externalResource.trim()) return 'Provide a URL for the video lesson.';
    if (Number(lessonForm.estimatedDurationMinutes) <= 0) return 'Estimated duration must be greater than zero.';
    return null;
  };

  const save = async () => {
    const validation = validate();
    if (validation) {
      toast({ title: 'Fix validation errors', description: validation, variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to create lesson');
      }
      toast({ title: 'Lesson created', description: 'Lesson added to module.' });
      router.push(`/admin/courses/${courseId}`);
    } catch (err) {
      toast({
        title: 'Unable to save lesson',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => router.push(`/admin/courses/${courseId}`);

  return (
    <div className='space-y-6'>
      {/* Breadcrumbs */}
      <nav aria-label='Breadcrumb'>
        <ol className='flex flex-wrap items-center gap-1 text-sm text-muted-foreground'>
          <li>
            <Link href='/admin' className='hover:underline'>Admin</Link>
            <span className='mx-1'>/</span>
          </li>
          <li>
            <Link href='/admin/courses' className='hover:underline'>Courses</Link>
            <span className='mx-1'>/</span>
          </li>
          <li>
            <Link href={`/admin/courses/${courseId}`} className='hover:underline'>
              {data?.course?.title ?? 'Course'}
            </Link>
            <span className='mx-1'>/</span>
          </li>
          <li className='text-foreground'>
            {module?.title ? `${module.title}` : 'Module'}
            <span className='mx-1'>/</span>
          </li>
          <li className='text-foreground font-medium'>New lesson</li>
        </ol>
      </nav>

      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>Add lesson</h1>
          {data?.summary ? (
            <div className='text-sm text-muted-foreground'>
              {data.summary.title} • {data.summary.moduleCount} modules • {data.summary.lessonCount} lessons
            </div>
          ) : null}
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={cancel}>Cancel</Button>
          <Button onClick={save} disabled={saving || isLoading}>{saving ? 'Saving…' : 'Create lesson'}</Button>
        </div>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          <Skeleton className='h-8 w-40' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-[320px] w-full' />
        </div>
      ) : error ? (
        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200'>
          {(error as Error).message}
        </div>
      ) : (
        <section className='space-y-4'>
          <div>
            <Label htmlFor='lesson-title'>Title</Label>
            <Input id='lesson-title' value={lessonForm.title} onChange={e => handleTitle(e.target.value)} />
          </div>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <Label htmlFor='lesson-slug'>Slug</Label>
              <Input id='lesson-slug' value={lessonForm.slug} onChange={e => handleSlug(e.target.value)} placeholder='auto-generated-if-blank' />
            </div>
            <div>
              <Label>Content type</Label>
              <Select
                value={lessonForm.contentType}
                onValueChange={value => handleField('contentType', value as LessonFormState['contentType'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='standalone'>Standalone</SelectItem>
                  <SelectItem value='blog'>Blog</SelectItem>
                  <SelectItem value='quiz'>Quiz</SelectItem>
                  <SelectItem value='video'>Video</SelectItem>
                  <SelectItem value='flashcards'>Flashcards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {lessonForm.contentType === 'blog' ? (
            <div>
              <Label htmlFor='lesson-blog-slug'>Blog slug</Label>
              <Input id='lesson-blog-slug' value={lessonForm.blogSlug} onChange={e => handleField('blogSlug', e.target.value)} placeholder='my-blog-post' />
            </div>
          ) : null}

          {lessonForm.contentType === 'standalone' ? (
            <div className='space-y-3'>
              <div>
                <Label htmlFor='lesson-standalone-format'>Content format</Label>
                <Select
                  value={lessonForm.standaloneFormat}
                  onValueChange={value => handleField('standaloneFormat', value as LessonFormState['standaloneFormat'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select format' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='mdx'>MDX</SelectItem>
                    <SelectItem value='markdown'>Markdown</SelectItem>
                    <SelectItem value='html'>HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='lesson-standalone-content'>Standalone content (supports shortcodes)</Label>
                <Textarea id='lesson-standalone-content' rows={6} value={lessonForm.standaloneContent} onChange={e => handleField('standaloneContent', e.target.value)} />
              </div>
            </div>
          ) : null}

          {lessonForm.contentType === 'video' ? (
            <div>
              <Label htmlFor='lesson-video-url'>Video URL</Label>
              <Input id='lesson-video-url' value={lessonForm.externalResource} onChange={e => handleField('externalResource', e.target.value)} placeholder='https://…' />
            </div>
          ) : null}

          {lessonForm.contentType === 'quiz' ? (
            <div>
              <Label htmlFor='lesson-quiz-id'>Quiz ID</Label>
              <Input id='lesson-quiz-id' value={lessonForm.quizId} onChange={e => handleField('quizId', e.target.value)} />
            </div>
          ) : null}

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <Label htmlFor='lesson-duration'>Estimated minutes</Label>
              <Input id='lesson-duration' type='number' min={1} value={lessonForm.estimatedDurationMinutes} onChange={e => handleField('estimatedDurationMinutes', e.target.value)} />
            </div>
            <div>
              <Label htmlFor='lesson-progress-weight'>Progress weight</Label>
              <Input id='lesson-progress-weight' type='number' min={0} value={lessonForm.progressWeight} onChange={e => handleField('progressWeight', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Flashcard decks</Label>
            <DeckMultiSelect options={deckOptions} value={lessonForm.flashcardDeckIds} onChange={ids => handleDecks(ids)} placeholder='No decks linked to this lesson yet.' helperText='Flashcard lessons require at least one deck.' />
          </div>

          <div className='flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 dark:border-gray-700'>
            <div>
              <Label className='text-sm font-medium'>Previewable</Label>
              <p className='text-xs text-muted-foreground'>Allow learners to preview this lesson without enrolling.</p>
            </div>
            <Switch checked={lessonForm.isPreviewable} onCheckedChange={checked => handleField('isPreviewable', checked)} />
          </div>

          <div>
            <Label htmlFor='lesson-release-at'>Release at</Label>
            <Input id='lesson-release-at' type='datetime-local' value={lessonForm.releaseAt} onChange={e => handleField('releaseAt', e.target.value)} />
          </div>
        </section>
      )}
    </div>
  );
}
