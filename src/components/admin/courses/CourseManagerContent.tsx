'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import useSWR from 'swr';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { DeckMultiSelect, type DeckOption } from './DeckMultiSelect';
import { slugify } from '@/lib/slug';
import { GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CourseDetailResponse {
  course: CourseDetail;
  summary: CourseSummary;
  modules: ModuleDetail[];
  decks: DeckOption[];
}

interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  moduleCount: number;
  lessonCount: number;
  status: string;
  visibility: string;
  updatedAt: string;
}

interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  heroImage: string | null;
  heroLottieId: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  tags: string[];
  estimatedDurationMinutes: number | null;
  lessonCount: number;
  prerequisiteCourseIds: string[];
  prerequisiteBlogSlugs: string[];
  recommendedBlogSlugs: string[];
  recommendedBookIds: string[];
  flashcardDeckIds: string[];
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'unlisted';
  isFeatured: boolean;
  seo: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
  } | null;
  releaseSchedule: {
    publishAt: string;
    timezone?: string;
  } | null;
}

interface ModuleDetail {
  id: string;
  title: string;
  summary: string | null;
  order: number;
  estimatedDurationMinutes: number | null;
  flashcardDeckIds: string[];
  lessons: LessonDetail[];
  createdAt: string;
  updatedAt: string;
}

interface LessonDetail {
  id: string;
  title: string;
  slug: string | null;
  contentType: 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards';
  blogSlug: string | null;
  standaloneContent: string | null;
  standaloneFormat: string;
  externalResource: string | null;
  quizId: string | null;
  flashcardDeckIds: string[];
  estimatedDurationMinutes: number;
  isPreviewable: boolean;
  progressWeight: number;
  releaseAt: string | null;
  updatedAt: string;
}

export interface CourseManagerContentProps {
  courseId: string;
  onChanged?: () => void;
}

interface CourseFormState {
  title: string;
  slug: string;
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
  flashcardDeckIds: string[];
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  releaseAt: string;
  releaseTimezone: string;
}

const defaultCourseForm: CourseFormState = {
  title: '',
  slug: '',
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
  flashcardDeckIds: [],
  isFeatured: false,
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
  releaseAt: '',
  releaseTimezone: '',
};

interface ModuleFormState {
  title: string;
  summary: string;
  order: string;
  estimatedDurationMinutes: string;
  flashcardDeckIds: string[];
}

interface ModuleFormErrors {
  title?: string;
  summary?: string;
  order?: string;
  estimatedDurationMinutes?: string;
}

const defaultModuleForm: ModuleFormState = {
  title: '',
  summary: '',
  order: '',
  estimatedDurationMinutes: '',
  flashcardDeckIds: [],
};

interface LessonFormState {
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
}

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

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then(res => {
    if (!res.ok) {
      throw new Error('Failed to load course');
    }
    return res.json();
  });

function deckTitle(id: string, lookup: Map<string, DeckOption>) {
  return lookup.get(id)?.title ?? `Deck ${id}`;
}

interface SortableModuleCardProps {
  module: ModuleDetail;
  deckLookup: Map<string, DeckOption>;
  onEdit: (module: ModuleDetail) => void;
  onDelete: (module: ModuleDetail) => void;
  onCreateLesson: (moduleId: string) => void;
  onEditLesson: (moduleId: string, lesson: LessonDetail) => void;
  onDeleteLesson: (moduleId: string, lesson: LessonDetail) => void;
  onLessonReorder: (
    moduleId: string,
    activeId: string,
    overId?: string
  ) => void;
}

function SortableModuleCard({
  module,
  deckLookup,
  onEdit,
  onDelete,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
  onLessonReorder,
}: SortableModuleCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onLessonReorder(module.id, String(active.id), String(over.id));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='rounded-lg border border-gray-200 p-4 dark:border-gray-800'
    >
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div className='flex items-start gap-3'>
          <button
            type='button'
            className='mt-1 rounded-md border border-dashed border-transparent p-1 text-muted-foreground transition hover:border-border hover:text-foreground'
            {...attributes}
            {...listeners}
            aria-label='Drag to reorder module'
          >
            <GripVertical className='h-4 w-4' />
          </button>
          <div>
            <h3 className='text-lg font-semibold'>
              #{module.order} — {module.title}
            </h3>
            {module.summary ? (
              <p className='text-sm text-muted-foreground'>{module.summary}</p>
            ) : null}
            <div className='mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground'>
              <span>
                Duration:{' '}
                {module.estimatedDurationMinutes
                  ? `${module.estimatedDurationMinutes} min`
                  : '—'}
              </span>
              <span>
                {module.lessons.length} lesson
                {module.lessons.length === 1 ? '' : 's'}
              </span>
            </div>
            {module.flashcardDeckIds.length > 0 ? (
              <div className='mt-2 flex flex-wrap gap-2'>
                {module.flashcardDeckIds.map(deckId => (
                  <Badge
                    key={`${module.id}-deck-${deckId}`}
                    variant='secondary'
                  >
                    {deckTitle(deckId, deckLookup)}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline' onClick={() => onEdit(module)}>
            Edit
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onCreateLesson(module.id)}
          >
            Add lesson
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={() => onDelete(module)}
          >
            Delete
          </Button>
        </div>
      </div>

      {module.lessons.length > 0 ? (
        <div className='mt-4 space-y-2'>
          <DndContext onDragEnd={handleLessonDragEnd}>
            <SortableContext
              items={module.lessons.map(lesson => lesson.id)}
              strategy={verticalListSortingStrategy}
            >
              {module.lessons.map(lesson => (
                <SortableLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  deckLookup={deckLookup}
                  onEdit={() => onEditLesson(module.id, lesson)}
                  onDelete={() => onDeleteLesson(module.id, lesson)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className='mt-3 rounded-md border border-dashed border-gray-300 p-4 text-sm text-muted-foreground dark:border-gray-700'>
          No lessons in this module yet.
        </div>
      )}
    </div>
  );
}

interface SortableLessonRowProps {
  lesson: LessonDetail;
  deckLookup: Map<string, DeckOption>;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableLessonRow({
  lesson,
  deckLookup,
  onEdit,
  onDelete,
}: SortableLessonRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lesson.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex flex-col gap-3 rounded-md border border-muted bg-background p-3 shadow-sm transition hover:border-primary/50 dark:border-muted/40 dark:bg-muted/20'
    >
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-start gap-3'>
          <button
            type='button'
            className='mt-1 rounded-md border border-dashed border-transparent p-1 text-muted-foreground transition hover:border-border hover:text-foreground'
            {...attributes}
            {...listeners}
            aria-label='Drag to reorder lesson'
          >
            <GripVertical className='h-4 w-4' />
          </button>
          <div>
            <div className='font-medium'>{lesson.title}</div>
            <div className='text-xs text-muted-foreground'>
              {lesson.slug ?? '—'} • {lesson.contentType} •{' '}
              {lesson.estimatedDurationMinutes} min
            </div>
            {lesson.flashcardDeckIds.length > 0 ? (
              <div className='mt-2 flex flex-wrap gap-2'>
                {lesson.flashcardDeckIds.map(deckId => (
                  <Badge key={`${lesson.id}-deck-${deckId}`} variant='outline'>
                    {deckTitle(deckId, deckLookup)}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline' onClick={onEdit}>
            Edit
          </Button>
          <Button size='sm' variant='destructive' onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CourseManagerContent({
  courseId,
  onChanged,
}: CourseManagerContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [courseForm, setCourseForm] =
    useState<CourseFormState>(defaultCourseForm);
  const [moduleForm, setModuleForm] =
    useState<ModuleFormState>(defaultModuleForm);
  const [moduleErrors, setModuleErrors] = useState<ModuleFormErrors>({});
  const [lessonForm, setLessonForm] =
    useState<LessonFormState>(defaultLessonForm);
  const [moduleList, setModuleList] = useState<ModuleDetail[]>([]);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [activeTab, setActiveTab] = useState('course');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonSlugEdited, setLessonSlugEdited] = useState(false);

  const query = useMemo(() => {
    if (!courseId) {
      return null;
    }
    return `/api/admin/courses/${courseId}`;
  }, [courseId]);

  const { data, error, isLoading, mutate } = useSWR<CourseDetailResponse>(
    query,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const deckOptions = useMemo(() => data?.decks ?? [], [data?.decks]);
  const deckLookup = useMemo(
    () => new Map(deckOptions.map(deck => [deck.id, deck])),
    [deckOptions]
  );

  useEffect(() => {
    if (!data?.course) {
      return;
    }
    const detail = data.course;
    setCourseForm({
      title: detail.title,
      slug: detail.slug,
      subtitle: detail.subtitle ?? '',
      summary: detail.summary,
      heroImage: detail.heroImage ?? '',
      heroLottieId: detail.heroLottieId ?? '',
      difficulty: detail.difficulty,
      status: detail.status,
      visibility: detail.visibility,
      categories: detail.categories.join(', '),
      tags: detail.tags.join(', '),
      estimatedDurationMinutes:
        detail.estimatedDurationMinutes?.toString() ?? '',
      prerequisiteCourseIds: detail.prerequisiteCourseIds.join(', '),
      prerequisiteBlogSlugs: detail.prerequisiteBlogSlugs.join(', '),
      recommendedBlogSlugs: detail.recommendedBlogSlugs.join(', '),
      recommendedBookIds: detail.recommendedBookIds.join(', '),
      flashcardDeckIds: detail.flashcardDeckIds ?? [],
      isFeatured: detail.isFeatured,
      seoTitle: detail.seo?.title ?? '',
      seoDescription: detail.seo?.description ?? '',
      seoImage: detail.seo?.image ?? '',
      releaseAt: detail.releaseSchedule?.publishAt
        ? new Date(detail.releaseSchedule.publishAt).toISOString().slice(0, 16)
        : '',
      releaseTimezone: detail.releaseSchedule?.timezone ?? '',
    });
  }, [data?.course]);

  useEffect(() => {
    if (data?.modules) {
      setModuleList(data.modules);
    }
  }, [data?.modules]);

  const handleCourseFieldChange = <K extends keyof CourseFormState>(
    key: K,
    value: CourseFormState[K]
  ) => {
    setCourseForm(prev => ({ ...prev, [key]: value }));
  };

  const handleModuleFieldChange = <K extends keyof ModuleFormState>(
    key: K,
    value: ModuleFormState[K]
  ) => {
    setModuleForm(prev => ({ ...prev, [key]: value }));
  };

  const handleLessonFieldChange = <K extends keyof LessonFormState>(
    key: K,
    value: LessonFormState[K]
  ) => {
    setLessonForm(prev => ({ ...prev, [key]: value }));
  };

  const handleLessonTitleChange = (value: string) => {
    handleLessonFieldChange('title', value);
    if (!lessonSlugEdited) {
      handleLessonFieldChange('slug', slugify(value));
    }
  };

  const handleLessonSlugChange = (value: string) => {
    setLessonSlugEdited(true);
    handleLessonFieldChange('slug', value);
  };

  const handleCourseDeckChange = (deckIds: string[]) => {
    setCourseForm(prev => ({ ...prev, flashcardDeckIds: deckIds }));
  };

  const handleModuleDeckChange = (deckIds: string[]) => {
    setModuleForm(prev => ({ ...prev, flashcardDeckIds: deckIds }));
  };

  const handleLessonDeckChange = (deckIds: string[]) => {
    handleLessonFieldChange('flashcardDeckIds', deckIds);
  };

  const parseCommaSeparated = (value: string) =>
    value
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean);

  const saveCourse = async () => {
    if (!courseId) return;
    if (!courseForm.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Course title is required.',
        variant: 'destructive',
      });
      return;
    }
    if (!courseForm.slug.trim()) {
      toast({
        title: 'Slug required',
        description: 'Slug is required for the course.',
        variant: 'destructive',
      });
      return;
    }
    if (courseForm.summary.trim().length < 50) {
      toast({
        title: 'Summary too short',
        description: 'Summary must be at least 50 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingCourse(true);
      const payload: Record<string, unknown> = {
        title: courseForm.title.trim(),
        slug: courseForm.slug.trim(),
        subtitle: courseForm.subtitle.trim() || undefined,
        summary: courseForm.summary.trim(),
        difficulty: courseForm.difficulty,
        status: courseForm.status,
        visibility: courseForm.visibility,
        isFeatured: courseForm.isFeatured,
        categories: parseCommaSeparated(courseForm.categories),
        tags: parseCommaSeparated(courseForm.tags),
        prerequisiteCourseIds: parseCommaSeparated(
          courseForm.prerequisiteCourseIds
        ),
        prerequisiteBlogSlugs: parseCommaSeparated(
          courseForm.prerequisiteBlogSlugs
        ),
        recommendedBlogSlugs: parseCommaSeparated(
          courseForm.recommendedBlogSlugs
        ),
        recommendedBookIds: parseCommaSeparated(courseForm.recommendedBookIds),
        flashcardDeckIds: courseForm.flashcardDeckIds,
      };

      if (courseForm.heroImage.trim()) {
        payload.heroImage = courseForm.heroImage.trim();
      } else {
        payload.heroImage = '';
      }

      if (courseForm.heroLottieId.trim()) {
        payload.heroLottieId = courseForm.heroLottieId.trim();
      } else {
        payload.heroLottieId = '';
      }

      if (courseForm.estimatedDurationMinutes.trim()) {
        const minutes = Number(courseForm.estimatedDurationMinutes.trim());
        if (!Number.isNaN(minutes) && minutes >= 0) {
          payload.estimatedDurationMinutes = minutes;
        }
      } else {
        payload.estimatedDurationMinutes = null;
      }

      if (
        courseForm.seoTitle.trim() ||
        courseForm.seoDescription.trim() ||
        courseForm.seoImage.trim()
      ) {
        payload.seo = {
          title: courseForm.seoTitle.trim() || undefined,
          description: courseForm.seoDescription.trim() || undefined,
          image: courseForm.seoImage.trim() || undefined,
        };
      }

      if (courseForm.releaseAt) {
        payload.releaseSchedule = {
          publishAt: new Date(courseForm.releaseAt).toISOString(),
          timezone: courseForm.releaseTimezone || undefined,
        };
      }

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to update course');
      }

      toast({
        title: 'Course updated',
        description: 'Course details saved successfully.',
      });
      await mutate();
      onChanged?.();
    } catch (err) {
      toast({
        title: 'Unable to update course',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSavingCourse(false);
    }
  };

  const deleteCourse = async () => {
    if (!courseId) return;
    const confirmed = await confirm({
      title: 'Delete course?',
      description:
        'This will remove the course, modules, and lessons. This action cannot be undone.',
      confirmText: 'Delete course',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to delete course');
      }

      toast({
        title: 'Course deleted',
        description: 'Course removed from catalog.',
      });
      onChanged?.();
    } catch (err) {
      toast({
        title: 'Unable to delete course',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const openCreateModule = () => {
    setEditingModuleId(null);
    setModuleForm(defaultModuleForm);
    setModuleErrors({});
    setModuleDialogOpen(true);
  };

  const openEditModule = (module: ModuleDetail) => {
    setEditingModuleId(module.id);
    setModuleForm({
      title: module.title,
      summary: module.summary ?? '',
      order: module.order.toString(),
      estimatedDurationMinutes:
        module.estimatedDurationMinutes?.toString() ?? '',
      flashcardDeckIds: module.flashcardDeckIds ?? [],
    });
    setModuleErrors({});
    setModuleDialogOpen(true);
  };

  const isNonNegativeInteger = (v: string) => {
    if (v.trim() === '') return true; // empty means let backend default/ignore
    if (!/^\d+$/.test(v.trim())) return false;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0;
  };

  const validateModuleForm = (form: ModuleFormState): ModuleFormErrors => {
    const errs: ModuleFormErrors = {};
    const t = form.title.trim();
    if (!t) {
      errs.title = 'Title is required';
    } else if (t.length < 3) {
      errs.title = 'Title must be at least 3 characters';
    } else if (t.length > 150) {
      errs.title = 'Title must be 150 characters or fewer';
    }

    const s = form.summary.trim();
    if (s && s.length > 300) {
      errs.summary = 'Summary must be 300 characters or fewer';
    }

    if (!isNonNegativeInteger(form.order)) {
      errs.order = 'Order must be a whole number ≥ 0';
    }

    if (!isNonNegativeInteger(form.estimatedDurationMinutes)) {
      errs.estimatedDurationMinutes = 'Estimated minutes must be a whole number ≥ 0';
    }

    return errs;
  };

  // Re-validate as user types when dialog is open
  useEffect(() => {
    if (!moduleDialogOpen) return;
    setModuleErrors(validateModuleForm(moduleForm));
  }, [moduleForm, moduleDialogOpen]);

  const saveModule = async () => {
    if (!courseId) return;
    const errors = validateModuleForm(moduleForm);
    setModuleErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Fix validation errors',
        description: 'Please correct the highlighted fields and try again.',
        variant: 'destructive',
      });
      return;
    }

    const title = moduleForm.title.trim();

    try {
      setSavingModule(true);
      const payload: Record<string, unknown> = {
        title,
        summary: moduleForm.summary.trim() || undefined,
        flashcardDeckIds: moduleForm.flashcardDeckIds,
      };

      if (moduleForm.order.trim()) {
        const order = Number(moduleForm.order.trim());
        if (!Number.isNaN(order) && order >= 0) {
          payload.order = order;
        }
      }

      if (moduleForm.estimatedDurationMinutes.trim()) {
        const minutes = Number(moduleForm.estimatedDurationMinutes.trim());
        if (!Number.isNaN(minutes) && minutes >= 0) {
          payload.estimatedDurationMinutes = minutes;
        }
      } else if (editingModuleId) {
        payload.estimatedDurationMinutes = null;
      }

      const endpoint = editingModuleId
        ? `/api/admin/courses/${courseId}/modules/${editingModuleId}`
        : `/api/admin/courses/${courseId}/modules`;
      const method = editingModuleId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to save module');
      }

      toast({
        title: editingModuleId ? 'Module updated' : 'Module created',
        description: editingModuleId
          ? 'Module changes saved.'
          : 'Module added to course.',
      });
      await mutate();
      onChanged?.();
      setModuleDialogOpen(false);
      setEditingModuleId(null);
      setModuleForm(defaultModuleForm);
      setModuleErrors({});
    } catch (err) {
      toast({
        title: 'Unable to save module',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSavingModule(false);
    }
  };

  const deleteModule = async (module: ModuleDetail) => {
    if (!courseId) return;
    const confirmed = await confirm({
      title: 'Delete module?',
      description: `This will delete “${module.title}” and its lessons.`,
      confirmText: 'Delete module',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${module.id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to delete module');
      }

      toast({
        title: 'Module deleted',
        description: 'Module removed from course.',
      });
      setModuleList(prev => prev.filter(item => item.id !== module.id));
      await mutate();
      onChanged?.();
    } catch (err) {
      toast({
        title: 'Unable to delete module',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const openCreateLesson = (moduleId: string) => {
    // Navigate to the dedicated page for creating a lesson
    router.push(`/admin/courses/${courseId}/modules/${moduleId}/lessons/new`);
  };

  const openEditLesson = (moduleId: string, lesson: LessonDetail) => {
    router.push(
      `/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`
    );
  };

  const buildLessonPayload = () => {
    const payload: Record<string, unknown> = {
      title: lessonForm.title.trim(),
      contentType: lessonForm.contentType,
      flashcardDeckIds: lessonForm.flashcardDeckIds,
      estimatedDurationMinutes:
        Number(lessonForm.estimatedDurationMinutes) || 15,
      isPreviewable: lessonForm.isPreviewable,
      progressWeight: Number(lessonForm.progressWeight) || 1,
    };

    if (lessonForm.slug.trim()) {
      payload.slug = lessonForm.slug.trim();
    }

    if (lessonForm.blogSlug.trim()) {
      payload.blogSlug = lessonForm.blogSlug.trim();
    }

    if (lessonForm.standaloneContent.trim()) {
      payload.standaloneContent = lessonForm.standaloneContent.trim();
    }

    if (lessonForm.quizId.trim()) {
      payload.quizId = lessonForm.quizId.trim();
    }

    if (lessonForm.releaseAt) {
      payload.releaseAt = new Date(lessonForm.releaseAt).toISOString();
    }

    if (lessonForm.contentType === 'standalone') {
      payload.standaloneFormat = lessonForm.standaloneFormat;
    }

    if (
      lessonForm.contentType === 'video' &&
      lessonForm.externalResource.trim()
    ) {
      payload.externalResource = {
        provider: 'custom',
        url: lessonForm.externalResource.trim(),
      } as any;
    }

    return payload;
  };

  const saveLesson = async () => {
    if (!courseId || !lessonModuleId) return;
    if (!lessonForm.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Lesson title is required.',
        variant: 'destructive',
      });
      return;
    }

    if (lessonForm.contentType === 'blog' && !lessonForm.blogSlug.trim()) {
      toast({
        title: 'Blog slug required',
        description: 'Blog lessons must reference a blog slug.',
        variant: 'destructive',
      });
      return;
    }

    if (
      lessonForm.contentType === 'flashcards' &&
      lessonForm.flashcardDeckIds.length === 0
    ) {
      toast({
        title: 'Deck selection required',
        description: 'Flashcard lessons need at least one deck.',
        variant: 'destructive',
      });
      return;
    }

    if (
      lessonForm.contentType === 'video' &&
      !lessonForm.externalResource.trim()
    ) {
      toast({
        title: 'Video URL required',
        description: 'Provide a URL for the video lesson.',
        variant: 'destructive',
      });
      return;
    }

    if (Number(lessonForm.estimatedDurationMinutes) <= 0) {
      toast({
        title: 'Invalid duration',
        description: 'Estimated duration must be greater than zero.',
        variant: 'destructive',
      });
      return;
    }

    const payload = buildLessonPayload();

    try {
      setSavingLesson(true);
      const endpoint = editingLessonId
        ? `/api/admin/courses/${courseId}/modules/${lessonModuleId}/lessons/${editingLessonId}`
        : `/api/admin/courses/${courseId}/modules/${lessonModuleId}/lessons`;
      const method = editingLessonId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to save lesson');
      }

      toast({
        title: editingLessonId ? 'Lesson updated' : 'Lesson created',
        description: editingLessonId
          ? 'Lesson changes saved.'
          : 'Lesson added to module.',
      });
      await mutate();
      onChanged?.();
      setLessonDialogOpen(false);
      setLessonModuleId(null);
      setEditingLessonId(null);
      setLessonForm(defaultLessonForm);
    } catch (err) {
      toast({
        title: 'Unable to save lesson',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSavingLesson(false);
    }
  };

  const deleteLesson = async (moduleId: string, lesson: LessonDetail) => {
    if (!courseId) return;
    const confirmed = await confirm({
      title: 'Delete lesson?',
      description: `This will delete “${lesson.title}”.`,
      confirmText: 'Delete lesson',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to delete lesson');
      }

      toast({
        title: 'Lesson deleted',
        description: 'Lesson removed from module.',
      });
      setModuleList(prev =>
        prev.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.filter(item => item.id !== lesson.id),
              }
            : module
        )
      );
      await mutate();
      onChanged?.();
    } catch (err) {
      toast({
        title: 'Unable to delete lesson',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const persistModuleOrder = async (orderedModules: ModuleDetail[]) => {
    if (!courseId) return;
    try {
      const updates = orderedModules
        .map((module, index) => ({ module, desiredOrder: index + 1 }))
        .filter(item => item.module.order !== item.desiredOrder)
        .map(item =>
          fetch(`/api/admin/courses/${courseId}/modules/${item.module.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: item.desiredOrder }),
          })
        );

      if (updates.length > 0) {
        await Promise.all(updates);
        toast({ title: 'Module order saved' });
      }
      await mutate();
      onChanged?.();
    } catch (err) {
      toast({
        title: 'Unable to reorder modules',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      await mutate();
    }
  };

  const persistLessonOrder = async (
    moduleId: string,
    lessons: LessonDetail[]
  ) => {
    if (!courseId) return;
    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonIds: lessons.map(lesson => lesson.id) }),
        }
      );
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to save lesson order');
      }
      toast({ title: 'Lesson order saved' });
      await mutate();
      onChanged?.();
    } catch (err) {
      toast({
        title: 'Unable to reorder lessons',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      await mutate();
    }
  };

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = moduleList.findIndex(module => module.id === active.id);
    const newIndex = moduleList.findIndex(module => module.id === over.id);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(moduleList, oldIndex, newIndex).map(
      (module, index) => ({
        ...module,
        order: index + 1,
      })
    );
    setModuleList(reordered);
    await persistModuleOrder(reordered);
  };

  const handleLessonReorder = async (
    moduleId: string,
    activeId: string,
    overId?: string
  ) => {
    if (!overId || activeId === overId) return;
    const currentModule = moduleList.find(item => item.id === moduleId);
    if (!currentModule) return;
    const oldIndex = currentModule.lessons.findIndex(
      lesson => lesson.id === activeId
    );
    const newIndex = currentModule.lessons.findIndex(
      lesson => lesson.id === overId
    );
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reorderedLessons = arrayMove(
      currentModule.lessons,
      oldIndex,
      newIndex
    );
    setModuleList(prev =>
      prev.map(item =>
        item.id === moduleId ? { ...item, lessons: reorderedLessons } : item
      )
    );
    await persistLessonOrder(moduleId, reorderedLessons);
  };

  const renderModules = () => {
    if (!moduleList.length) {
      return (
        <div className='rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-muted-foreground dark:border-gray-700'>
          No modules yet. Use the “Add module” button to create one.
        </div>
      );
    }

    return (
      <DndContext onDragEnd={handleModuleDragEnd}>
        <SortableContext
          items={moduleList.map(module => module.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='space-y-4'>
            {moduleList.map(module => (
              <SortableModuleCard
                key={module.id}
                module={module}
                deckLookup={deckLookup}
                onEdit={openEditModule}
                onDelete={deleteModule}
                onCreateLesson={openCreateLesson}
                onEditLesson={openEditLesson}
                onDeleteLesson={deleteLesson}
                onLessonReorder={handleLessonReorder}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>Manage course</h1>
          {data?.summary ? (
            <div className='text-sm text-muted-foreground'>
              {data.summary.title} • {data.summary.moduleCount} modules •{' '}
              {data.summary.lessonCount} lessons
            </div>
          ) : null}
        </div>
        <div className='flex items-center gap-2'>
          <Link
            className='text-sm text-muted-foreground hover:underline'
            href='/admin/courses'
          >
            Back to courses
          </Link>
          <Button variant='destructive' onClick={deleteCourse} disabled={!data}>
            Delete course
          </Button>
          <Button onClick={saveCourse} disabled={savingCourse || !data}>
            {savingCourse ? 'Saving…' : 'Save course'}
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
      ) : data ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList>
            <TabsTrigger value='course'>Course details</TabsTrigger>
            <TabsTrigger value='modules'>Modules & lessons</TabsTrigger>
          </TabsList>

          <TabsContent value='course' className='space-y-6'>
            <section className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-3'>
                <div>
                  <Label htmlFor='course-title'>Title</Label>
                  <Input
                    id='course-title'
                    value={courseForm.title}
                    onChange={event =>
                      handleCourseFieldChange('title', event.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='course-slug'>Slug</Label>
                  <Input
                    id='course-slug'
                    value={courseForm.slug}
                    onChange={event =>
                      handleCourseFieldChange('slug', event.target.value)
                    }
                    placeholder='unique-course-slug'
                  />
                </div>
                <div>
                  <Label htmlFor='course-subtitle'>Subtitle</Label>
                  <Input
                    id='course-subtitle'
                    value={courseForm.subtitle}
                    onChange={event =>
                      handleCourseFieldChange('subtitle', event.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='course-summary'>Summary</Label>
                  <Textarea
                    id='course-summary'
                    rows={5}
                    value={courseForm.summary}
                    onChange={event =>
                      handleCourseFieldChange('summary', event.target.value)
                    }
                  />
                </div>
              </div>
              <div className='space-y-3'>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={courseForm.difficulty}
                      onValueChange={value =>
                        handleCourseFieldChange(
                          'difficulty',
                          value as CourseFormState['difficulty']
                        )
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
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={courseForm.status}
                      onValueChange={value =>
                        handleCourseFieldChange(
                          'status',
                          value as CourseFormState['status']
                        )
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
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <Label>Visibility</Label>
                    <Select
                      value={courseForm.visibility}
                      onValueChange={value =>
                        handleCourseFieldChange(
                          'visibility',
                          value as CourseFormState['visibility']
                        )
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
                  <div>
                    <Label htmlFor='course-estimated'>Estimated minutes</Label>
                    <Input
                      id='course-estimated'
                      type='number'
                      min={0}
                      value={courseForm.estimatedDurationMinutes}
                      onChange={event =>
                        handleCourseFieldChange(
                          'estimatedDurationMinutes',
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <Label htmlFor='course-categories'>Categories</Label>
                    <Input
                      id='course-categories'
                      placeholder='Comma separated'
                      value={courseForm.categories}
                      onChange={event =>
                        handleCourseFieldChange('categories', event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='course-tags'>Tags</Label>
                    <Input
                      id='course-tags'
                      placeholder='Comma separated'
                      value={courseForm.tags}
                      onChange={event =>
                        handleCourseFieldChange('tags', event.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='course-hero-image'>Hero image URL or shortcode</Label>
                  <Input
                    id='course-hero-image'
                    value={courseForm.heroImage}
                    onChange={event =>
                      handleCourseFieldChange('heroImage', event.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='course-hero-lottie'>Hero lottie asset ID</Label>
                  <Input
                    id='course-hero-lottie'
                    value={courseForm.heroLottieId}
                    onChange={event =>
                      handleCourseFieldChange('heroLottieId', event.target.value)
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 dark:border-gray-700'>
                  <div>
                    <Label className='text-sm font-medium'>Feature this course</Label>
                    <p className='text-xs text-muted-foreground'>
                      Featured courses appear in promoted sections.
                    </p>
                  </div>
                  <Switch
                    checked={courseForm.isFeatured}
                    onCheckedChange={checked =>
                      handleCourseFieldChange('isFeatured', checked)
                    }
                  />
                </div>
              </div>
            </section>

            <section className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-3'>
                <div>
                  <Label htmlFor='course-prereq-ids'>Prerequisite course IDs</Label>
                  <Input
                    id='course-prereq-ids'
                    placeholder='Comma separated ObjectIds'
                    value={courseForm.prerequisiteCourseIds}
                    onChange={event =>
                      handleCourseFieldChange(
                        'prerequisiteCourseIds',
                        event.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='course-prereq-blogs'>Prerequisite blog slugs</Label>
                  <Input
                    id='course-prereq-blogs'
                    placeholder='Comma separated slugs'
                    value={courseForm.prerequisiteBlogSlugs}
                    onChange={event =>
                      handleCourseFieldChange(
                        'prerequisiteBlogSlugs',
                        event.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Course flashcard decks</Label>
                  <DeckMultiSelect
                    options={deckOptions}
                    value={courseForm.flashcardDeckIds}
                    onChange={handleCourseDeckChange}
                    placeholder='No decks linked yet.'
                    helperText='Selected decks will appear on the course overview.'
                  />
                </div>
              </div>
              <div className='space-y-3'>
                <div>
                  <Label htmlFor='course-recommended-blogs'>Recommended blog slugs</Label>
                  <Input
                    id='course-recommended-blogs'
                    placeholder='Comma separated slugs'
                    value={courseForm.recommendedBlogSlugs}
                    onChange={event =>
                      handleCourseFieldChange(
                        'recommendedBlogSlugs',
                        event.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='course-recommended-books'>Recommended book IDs</Label>
                  <Input
                    id='course-recommended-books'
                    placeholder='Comma separated ObjectIds'
                    value={courseForm.recommendedBookIds}
                    onChange={event =>
                      handleCourseFieldChange(
                        'recommendedBookIds',
                        event.target.value
                      )
                    }
                  />
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <Label htmlFor='course-release-at'>Release schedule</Label>
                    <Input
                      id='course-release-at'
                      type='datetime-local'
                      value={courseForm.releaseAt}
                      onChange={event =>
                        handleCourseFieldChange('releaseAt', event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='course-release-timezone'>Timezone</Label>
                    <Input
                      id='course-release-timezone'
                      placeholder='e.g. America/New_York'
                      value={courseForm.releaseTimezone}
                      onChange={event =>
                        handleCourseFieldChange(
                          'releaseTimezone',
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className='space-y-3'>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
                SEO
              </h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                <div>
                  <Label htmlFor='seo-title'>SEO title</Label>
                  <Input
                    id='seo-title'
                    value={courseForm.seoTitle}
                    onChange={event =>
                      handleCourseFieldChange('seoTitle', event.target.value)
                    }
                  />
                </div>
                <div className='md:col-span-2'>
                  <Label htmlFor='seo-description'>SEO description</Label>
                  <Input
                    id='seo-description'
                    value={courseForm.seoDescription}
                    onChange={event =>
                      handleCourseFieldChange(
                        'seoDescription',
                        event.target.value
                      )
                    }
                  />
                </div>
                <div className='md:col-span-3'>
                  <Label htmlFor='seo-image'>SEO image URL or shortcode</Label>
                  <Input
                    id='seo-image'
                    value={courseForm.seoImage}
                    onChange={event =>
                      handleCourseFieldChange('seoImage', event.target.value)
                    }
                  />
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value='modules' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Modules</h2>
              <Button size='sm' onClick={openCreateModule}>
                Add module
              </Button>
            </div>

            {renderModules()}
          </TabsContent>
        </Tabs>
      ) : null}

  {ConfirmDialog}

      {/* Module dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingModuleId ? 'Edit module' : 'Create module'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className='space-y-3'>
              <div>
                <Label htmlFor='module-title'>Title</Label>
                <Input
                  id='module-title'
                  required
                  minLength={3}
                  maxLength={150}
                  aria-invalid={Boolean(moduleErrors.title) || undefined}
                  value={moduleForm.title}
                  onChange={event =>
                    handleModuleFieldChange('title', event.target.value)
                  }
                />
                {moduleErrors.title ? (
                  <p className='mt-1 text-xs text-red-600'>{moduleErrors.title}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor='module-summary'>Summary</Label>
                <Textarea
                  id='module-summary'
                  rows={3}
                  maxLength={300}
                  aria-invalid={Boolean(moduleErrors.summary) || undefined}
                  value={moduleForm.summary}
                  onChange={event =>
                    handleModuleFieldChange('summary', event.target.value)
                  }
                />
                {moduleErrors.summary ? (
                  <p className='mt-1 text-xs text-red-600'>{moduleErrors.summary}</p>
                ) : null}
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <Label htmlFor='module-order'>Order</Label>
                  <Input
                    id='module-order'
                    type='number'
                    min={0}
                    step={1}
                    inputMode='numeric'
                    aria-invalid={Boolean(moduleErrors.order) || undefined}
                    value={moduleForm.order}
                    onChange={event =>
                      handleModuleFieldChange('order', event.target.value)
                    }
                  />
                  {moduleErrors.order ? (
                    <p className='mt-1 text-xs text-red-600'>{moduleErrors.order}</p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor='module-duration'>Estimated minutes</Label>
                  <Input
                    id='module-duration'
                    type='number'
                    min={0}
                    step={1}
                    inputMode='numeric'
                    aria-invalid={
                      Boolean(moduleErrors.estimatedDurationMinutes) || undefined
                    }
                    value={moduleForm.estimatedDurationMinutes}
                    onChange={event =>
                      handleModuleFieldChange(
                        'estimatedDurationMinutes',
                        event.target.value
                      )
                    }
                  />
                  {moduleErrors.estimatedDurationMinutes ? (
                    <p className='mt-1 text-xs text-red-600'>{moduleErrors.estimatedDurationMinutes}</p>
                  ) : null}
                </div>
              </div>
              <div>
                <Label>Flashcard decks</Label>
                <DeckMultiSelect
                  options={deckOptions}
                  value={moduleForm.flashcardDeckIds}
                  onChange={handleModuleDeckChange}
                  placeholder='No decks linked to this module yet.'
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button
              onClick={saveModule}
              disabled={savingModule || Object.keys(moduleErrors).length > 0}
            >
              {savingModule
                ? 'Saving…'
                : editingModuleId
                  ? 'Save changes'
                  : 'Create module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {editingLessonId ? 'Edit lesson' : 'Create lesson'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className='space-y-3'>
              <div>
                <Label htmlFor='lesson-title'>Title</Label>
                <Input
                  id='lesson-title'
                  value={lessonForm.title}
                  onChange={event => handleLessonTitleChange(event.target.value)}
                />
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <Label htmlFor='lesson-slug'>Slug</Label>
                  <Input
                    id='lesson-slug'
                    value={lessonForm.slug}
                    onChange={event => handleLessonSlugChange(event.target.value)}
                    placeholder='auto-generated-if-blank'
                  />
                </div>
                <div>
                  <Label>Content type</Label>
                  <Select
                    value={lessonForm.contentType}
                    onValueChange={value =>
                      handleLessonFieldChange(
                        'contentType',
                        value as LessonFormState['contentType']
                      )
                    }
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
                  <Input
                    id='lesson-blog-slug'
                    value={lessonForm.blogSlug}
                    onChange={event =>
                      handleLessonFieldChange('blogSlug', event.target.value)
                    }
                    placeholder='my-blog-post'
                  />
                </div>
              ) : null}
              {lessonForm.contentType === 'standalone' ? (
                <div className='space-y-3'>
                  <div>
                    <Label htmlFor='lesson-standalone-format'>Content format</Label>
                    <Select
                      value={lessonForm.standaloneFormat}
                      onValueChange={value =>
                        handleLessonFieldChange(
                          'standaloneFormat',
                          value as LessonFormState['standaloneFormat']
                        )
                      }
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
                    <Label htmlFor='lesson-standalone-content'>
                      Standalone content (supports shortcodes)
                    </Label>
                    <Textarea
                      id='lesson-standalone-content'
                      rows={4}
                      value={lessonForm.standaloneContent}
                      onChange={event =>
                        handleLessonFieldChange(
                          'standaloneContent',
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ) : null}
              {lessonForm.contentType === 'video' ? (
                <div>
                  <Label htmlFor='lesson-video-url'>Video URL</Label>
                  <Input
                    id='lesson-video-url'
                    value={lessonForm.externalResource}
                    onChange={event =>
                      handleLessonFieldChange('externalResource', event.target.value)
                    }
                    placeholder='https://...'
                  />
                </div>
              ) : null}
              {lessonForm.contentType === 'quiz' ? (
                <div>
                  <Label htmlFor='lesson-quiz-id'>Quiz ID</Label>
                  <Input
                    id='lesson-quiz-id'
                    value={lessonForm.quizId}
                    onChange={event =>
                      handleLessonFieldChange('quizId', event.target.value)
                    }
                  />
                </div>
              ) : null}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <Label htmlFor='lesson-duration'>Estimated minutes</Label>
                  <Input
                    id='lesson-duration'
                    type='number'
                    min={1}
                    value={lessonForm.estimatedDurationMinutes}
                    onChange={event =>
                      handleLessonFieldChange(
                        'estimatedDurationMinutes',
                        event.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='lesson-progress-weight'>Progress weight</Label>
                  <Input
                    id='lesson-progress-weight'
                    type='number'
                    min={0}
                    value={lessonForm.progressWeight}
                    onChange={event =>
                      handleLessonFieldChange('progressWeight', event.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Flashcard decks</Label>
                <DeckMultiSelect
                  options={deckOptions}
                  value={lessonForm.flashcardDeckIds}
                  onChange={handleLessonDeckChange}
                  placeholder='No decks linked to this lesson yet.'
                  helperText='Flashcard lessons require at least one deck.'
                />
              </div>
              <div className='flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 dark:border-gray-700'>
                <div>
                  <Label className='text-sm font-medium'>Previewable</Label>
                  <p className='text-xs text-muted-foreground'>
                    Allow learners to preview this lesson without enrolling.
                  </p>
                </div>
                <Switch
                  checked={lessonForm.isPreviewable}
                  onCheckedChange={checked =>
                    handleLessonFieldChange('isPreviewable', checked)
                  }
                />
              </div>
              <div>
                <Label htmlFor='lesson-release-at'>Release at</Label>
                <Input
                  id='lesson-release-at'
                  type='datetime-local'
                  value={lessonForm.releaseAt}
                  onChange={event =>
                    handleLessonFieldChange('releaseAt', event.target.value)
                  }
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button onClick={saveLesson} disabled={savingLesson}>
              {savingLesson
                ? 'Saving…'
                : editingLessonId
                  ? 'Save changes'
                  : 'Create lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
