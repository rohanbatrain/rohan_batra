'use client';

import { useEffect, useMemo, useState } from 'react';
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
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  moduleCount: number;
  lessonCount: number;
};

type LessonDetail = {
  id: string;
  title: string;
  slug: string | null;
  contentType: 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards';
  blogSlug: string | null;
  standaloneContent: string | null;
  standaloneFormat: 'mdx' | 'markdown' | 'html';
  externalResource: string | null;
  quizId: string | null;
  flashcardDeckIds: string[];
  estimatedDurationMinutes: number;
  isPreviewable: boolean;
  progressWeight: number;
  releaseAt: string | null;
  updatedAt?: string;
  parentLessonId?: string | null;
};

type ModuleDetail = {
  id: string;
  title: string;
  summary: string | null;
  order: number;
  estimatedDurationMinutes: number | null;
  flashcardDeckIds: string[];
  lessons: { id: string }[];
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
  fetch(url, { cache: 'no-store' }).then(res => {
    if (!res.ok) throw new Error('Failed to load');
    return res.json();
  });

type LessonFormState = {
  title: string;
  slug: string;
  contentType: 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards';
  blogSlug: string;
  standaloneContent: string;
  standaloneFormat: 'mdx' | 'novelsh';
  externalResource: string;
  quizId: string;
  flashcardDeckIds: string[];
  estimatedDurationMinutes: string;
  isPreviewable: boolean;
  progressWeight: string;
  releaseAt: string;
  parentLessonId: string; // empty string means none
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
  parentLessonId: '',
};

export default function LessonForm({
  courseId,
  moduleId,
  mode,
  lessonId,
}: {
  courseId: string;
  moduleId: string;
  mode: 'create' | 'edit';
  lessonId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const { data, error, isLoading } = useSWR<CourseDetailResponse>(
    `/api/admin/courses/${courseId}`,
    fetcher,
    { keepPreviousData: true }
  );

  const { data: lessonData } = useSWR<LessonDetail | undefined>(
    mode === 'edit' && lessonId
      ? `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
      : null,
    fetcher
  );

  const deckOptions = useMemo(() => data?.decks ?? [], [data?.decks]);
  const [form, setForm] = useState<LessonFormState>(defaultLessonForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>(moduleId);

  type LessonListItem = { id: string; title: string; parentLessonId?: string | null };
  const { data: moduleLessons } = useSWR<{ lessons: LessonListItem[] }>(
    `/api/admin/courses/${courseId}/modules/${targetModuleId}/lessons`,
    fetcher
  );

  useEffect(() => {
    // Prefill on edit
    if (mode === 'edit' && lessonData) {
      const incomingFormat = (lessonData.standaloneFormat as any) ?? 'mdx';
      const normalizedFormat: 'mdx' | 'novelsh' =
        incomingFormat === 'novelsh' ? 'novelsh' : 'mdx';
      setForm({
        title: lessonData.title,
        slug: lessonData.slug ?? '',
        contentType: lessonData.contentType,
        blogSlug: lessonData.blogSlug ?? '',
        standaloneContent: lessonData.standaloneContent ?? '',
        standaloneFormat: normalizedFormat,
        externalResource: lessonData.externalResource ?? '',
        quizId: lessonData.quizId ?? '',
        flashcardDeckIds: lessonData.flashcardDeckIds ?? [],
        estimatedDurationMinutes: String(
          lessonData.estimatedDurationMinutes ?? 15
        ),
        isPreviewable: Boolean(lessonData.isPreviewable),
        progressWeight: String(lessonData.progressWeight ?? 1),
        releaseAt: lessonData.releaseAt
          ? new Date(lessonData.releaseAt).toISOString().slice(0, 16)
          : '',
        parentLessonId: lessonData.parentLessonId ?? '',
      });
      setSlugEdited(Boolean(lessonData.slug));
      setTargetModuleId(moduleId);
    }
  }, [lessonData, mode, moduleId]);

  const handleField = <K extends keyof LessonFormState>(key: K, value: LessonFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleTitle = (value: string) => {
    handleField('title', value);
    if (!slugEdited) handleField('slug', slugify(value));
  };
  const handleSlug = (value: string) => {
    setSlugEdited(true);
    handleField('slug', value);
  };

  const handleDecks = (ids: string[]) => handleField('flashcardDeckIds', ids);

  const validate = (): string | null => {
    const title = form.title.trim();
    if (!title) return 'Lesson title is required.';
    if (title.length < 3) return 'Title must be at least 3 characters.';
    if (title.length > 200) return 'Title must be 200 characters or fewer.';
    if (form.slug.trim() && !slugRegex.test(form.slug.trim())) return 'Slug must be lowercase letters, numbers, and dashes only.';
    if (form.contentType === 'blog' && !form.blogSlug.trim()) return 'Blog lessons must reference a blog slug.';
    if (form.contentType === 'standalone' && !form.standaloneContent.trim()) return 'Standalone lessons require content.';
    if (form.contentType === 'flashcards' && form.flashcardDeckIds.length === 0) return 'Flashcard lessons need at least one deck.';
    if (form.contentType === 'video' && !form.externalResource.trim()) return 'Provide a URL for the video lesson.';
    if (Number(form.estimatedDurationMinutes) <= 0) return 'Estimated duration must be greater than zero.';
    return null;
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      contentType: form.contentType,
      flashcardDeckIds: form.flashcardDeckIds,
      estimatedDurationMinutes: Number(form.estimatedDurationMinutes) || 15,
      isPreviewable: form.isPreviewable,
      progressWeight: Number(form.progressWeight) || 1,
    };
  if (form.slug.trim()) payload.slug = slugify(form.slug.trim());
    if (form.blogSlug.trim()) payload.blogSlug = form.blogSlug.trim();
    if (form.standaloneContent.trim()) payload.standaloneContent = form.standaloneContent.trim();
    if (form.quizId.trim()) payload.quizId = form.quizId.trim();
    if (form.releaseAt) payload.releaseAt = new Date(form.releaseAt).toISOString();
    if (form.contentType === 'standalone') payload.standaloneFormat = form.standaloneFormat;
    if (form.contentType === 'video' && form.externalResource.trim()) {
      payload.externalResource = { provider: 'custom', url: form.externalResource.trim() };
    }
    // Include parentLessonId explicitly: empty string means clear parent
    payload.parentLessonId = form.parentLessonId ? form.parentLessonId : null;
    // Allow moving lesson between modules on edit
    if (mode === 'edit' && targetModuleId && targetModuleId !== moduleId) {
      payload.moduleId = targetModuleId;
    }
    return payload;
  };

  const onSave = async () => {
    const validation = validate();
    if (validation) {
      toast({ title: 'Fix validation errors', description: validation, variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      if (mode === 'create') {
        const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          const details = Array.isArray(payload.details)
            ? payload.details.map((d: any) => d.message).join('\n')
            : undefined;
          throw new Error(details || payload.error || 'Failed to create lesson');
        }
        toast({ title: 'Lesson created', description: 'Lesson added to module.' });
      } else {
        const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          const details = Array.isArray(payload.details)
            ? payload.details.map((d: any) => d.message).join('\n')
            : undefined;
          throw new Error(details || payload.error || 'Failed to update lesson');
        }
        toast({ title: 'Lesson updated', description: 'Changes saved.' });
      }
      router.push(`/admin/courses/${courseId}`);
    } catch (err) {
      toast({
        title: mode === 'create' ? 'Unable to save lesson' : 'Unable to update lesson',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => router.push(`/admin/courses/${courseId}`);

  const moduleTitle = useMemo(() => {
    return data?.modules?.find(m => m.id === moduleId)?.title ?? 'Module';
  }, [data?.modules, moduleId]);

  // When changing target module, clear parent selection to avoid cross-module parent
  useEffect(() => {
    setForm(prev => ({ ...prev, parentLessonId: '' }));
  }, [targetModuleId]);

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
            {moduleTitle}
            <span className='mx-1'>/</span>
          </li>
          <li className='text-foreground font-medium'>{mode === 'edit' ? 'Edit lesson' : 'New lesson'}</li>
        </ol>
      </nav>

      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>{mode === 'edit' ? 'Edit lesson' : 'Add lesson'}</h1>
          {data?.summary ? (
            <div className='text-sm text-muted-foreground'>
              {data.summary.title} • {data.summary.moduleCount} modules • {data.summary.lessonCount} lessons
            </div>
          ) : null}
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={cancel}>Cancel</Button>
          <Button onClick={onSave} disabled={saving || isLoading}>
            {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create lesson'}
          </Button>
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
          {mode === 'edit' ? (
            <div>
              <Label>Module</Label>
              <Select value={targetModuleId} onValueChange={v => setTargetModuleId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select module' />
                </SelectTrigger>
                <SelectContent>
                  {(data?.modules ?? []).map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div>
            <Label htmlFor='lesson-title'>Title</Label>
            <Input id='lesson-title' value={form.title} onChange={e => handleTitle(e.target.value)} />
          </div>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <Label htmlFor='parent-lesson'>Parent lesson</Label>
              <Select
                value={form.parentLessonId}
                onValueChange={v => handleField('parentLessonId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='None (top-level lesson)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>None</SelectItem>
                  {(moduleLessons?.lessons ?? [])
                    .filter(l => l.id !== lessonId && !l.parentLessonId) // only top-level lessons; cannot parent to self
                    .map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <Label htmlFor='lesson-slug'>Slug</Label>
              <Input id='lesson-slug' value={form.slug} onChange={e => handleSlug(e.target.value)} placeholder='auto-generated-if-blank' />
            </div>
            <div>
              <Label>Content type</Label>
              <Select
                value={form.contentType}
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

          {form.contentType === 'blog' ? (
            <div>
              <Label htmlFor='lesson-blog-slug'>Blog slug</Label>
              <Input id='lesson-blog-slug' value={form.blogSlug} onChange={e => handleField('blogSlug', e.target.value)} placeholder='my-blog-post' />
            </div>
          ) : null}

          {form.contentType === 'standalone' ? (
            <div className='space-y-3'>
              <div>
                <Label htmlFor='lesson-standalone-format'>Content format</Label>
                <Select
                  value={form.standaloneFormat}
                  onValueChange={value => handleField('standaloneFormat', value as LessonFormState['standaloneFormat'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select format' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='mdx'>MDX</SelectItem>
                    <SelectItem value='novelsh'>Novel (sh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='lesson-standalone-content'>Standalone content (supports shortcodes)</Label>
                <Textarea id='lesson-standalone-content' rows={6} value={form.standaloneContent} onChange={e => handleField('standaloneContent', e.target.value)} />
              </div>
            </div>
          ) : null}

          {form.contentType === 'video' ? (
            <div>
              <Label htmlFor='lesson-video-url'>Video URL</Label>
              <Input id='lesson-video-url' value={form.externalResource} onChange={e => handleField('externalResource', e.target.value)} placeholder='https://…' />
            </div>
          ) : null}

          {form.contentType === 'quiz' ? (
            <div>
              <Label htmlFor='lesson-quiz-id'>Quiz ID</Label>
              <Input id='lesson-quiz-id' value={form.quizId} onChange={e => handleField('quizId', e.target.value)} />
            </div>
          ) : null}

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <Label htmlFor='lesson-duration'>Estimated minutes</Label>
              <Input id='lesson-duration' type='number' min={1} value={form.estimatedDurationMinutes} onChange={e => handleField('estimatedDurationMinutes', e.target.value)} />
            </div>
            <div>
              <Label htmlFor='lesson-progress-weight'>Progress weight</Label>
              <Input id='lesson-progress-weight' type='number' min={0} value={form.progressWeight} onChange={e => handleField('progressWeight', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Flashcard decks</Label>
            <DeckMultiSelect options={deckOptions} value={form.flashcardDeckIds} onChange={ids => handleDecks(ids)} placeholder='No decks linked to this lesson yet.' helperText='Flashcard lessons require at least one deck.' />
          </div>

          <div className='flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 dark:border-gray-700'>
            <div>
              <Label className='text-sm font-medium'>Previewable</Label>
              <p className='text-xs text-muted-foreground'>Allow learners to preview this lesson without enrolling.</p>
            </div>
            <Switch checked={form.isPreviewable} onCheckedChange={checked => handleField('isPreviewable', checked)} />
          </div>

          <div>
            <Label htmlFor='lesson-release-at'>Release at</Label>
            <Input id='lesson-release-at' type='datetime-local' value={form.releaseAt} onChange={e => handleField('releaseAt', e.target.value)} />
          </div>
        </section>
      )}
    </div>
  );
}
