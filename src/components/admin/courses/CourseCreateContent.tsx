'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/slug';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type Status = 'draft' | 'published' | 'archived';
type Visibility = 'public' | 'unlisted';

interface CreateCourseForm {
  title: string;
  subtitle: string;
  summary: string;
  heroImage: string;
  heroLottieId: string;
  difficulty: Difficulty;
  status: Status;
  visibility: Visibility;
  categories: string;
  tags: string;
  estimatedDurationMinutes: string;
  prerequisiteCourseIds: string;
  prerequisiteBlogSlugs: string;
  recommendedBlogSlugs: string;
  recommendedBookIds: string;
  isFeatured: boolean;
  slug: string;
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
  slug: '',
};

export default function CourseCreateContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CreateCourseForm>(defaultForm);
  const [isCreating, setIsCreating] = useState(false);

  // slug validation
  const [slugEdited, setSlugEdited] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isSlugFormatValid, setIsSlugFormatValid] = useState(true);
  const slugPattern = useMemo(() => /^[a-z0-9]+(?:-[a-z0-9]+)*$/, []);

  useEffect(() => {
    const value = (form.slug || slugify(form.title)).trim();
    if (!value) {
      setIsSlugFormatValid(true);
      setIsSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }
    const valid = slugPattern.test(value);
    setIsSlugFormatValid(valid);
    if (!valid) {
      setIsSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }
    let cancelled = false;
    setIsCheckingSlug(true);
    fetch(`/api/admin/courses/check-slug?slug=${encodeURIComponent(value)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('Failed'))))
      .then((data: { isAvailable: boolean }) => {
        if (!cancelled) setIsSlugAvailable(data.isAvailable);
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
  }, [form.title, form.slug, slugPattern]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value } as CreateCourseForm;
      if (name === 'title' && !slugEdited) {
        next.slug = slugify(value);
      }
      if (name === 'slug') setSlugEdited(true);
      return next;
    });
  };

  const createCourse = async () => {
    const title = form.title.trim();
    if (!title) {
      toast({ title: 'Title required', description: 'Please provide a course title.', variant: 'destructive' });
      return;
    }
    if (form.summary.trim().length < 50) {
      toast({ title: 'Summary too short', description: 'Course summary must be at least 50 characters.', variant: 'destructive' });
      return;
    }
    const slugVal = (form.slug || slugify(form.title)).trim();
    if (!slugVal || !slugPattern.test(slugVal) || isSlugAvailable === false) {
      toast({ title: 'Invalid or taken slug', description: 'Please fix the slug before creating the course.', variant: 'destructive' });
      return;
    }

    try {
      setIsCreating(true);
      const payload: Record<string, any> = {
        title,
        slug: slugVal,
        summary: form.summary.trim(),
        difficulty: form.difficulty,
        status: form.status === 'published' ? 'draft' : form.status, // enforce guard in UI
        visibility: form.visibility,
        isFeatured: form.isFeatured,
        flashcardDeckIds: [],
      };
      if (form.subtitle.trim()) payload.subtitle = form.subtitle.trim();
      if (form.categories.trim()) payload.categories = form.categories.split(',').map(s => s.trim()).filter(Boolean);
      if (form.tags.trim()) payload.tags = form.tags.split(',').map(s => s.trim());
      if (form.estimatedDurationMinutes.trim()) {
        const m = Number(form.estimatedDurationMinutes);
        if (!Number.isNaN(m) && m >= 0) payload.estimatedDurationMinutes = m;
      }
      if (form.prerequisiteCourseIds.trim()) payload.prerequisiteCourseIds = form.prerequisiteCourseIds.split(',').map(s => s.trim()).filter(Boolean);
      if (form.prerequisiteBlogSlugs.trim()) payload.prerequisiteBlogSlugs = form.prerequisiteBlogSlugs.split(',').map(s => s.trim()).filter(Boolean);
      if (form.recommendedBlogSlugs.trim()) payload.recommendedBlogSlugs = form.recommendedBlogSlugs.split(',').map(s => s.trim()).filter(Boolean);
      if (form.recommendedBookIds.trim()) payload.recommendedBookIds = form.recommendedBookIds.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create course');
      }
      const created: { id: string; slug: string } = await res.json();
      toast({ title: 'Course created', description: 'Redirecting to manager…' });
      router.push(`/admin/courses/${created.id}`);
    } catch (err) {
      toast({ title: 'Unable to create course', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Create course</h1>
          <p className='text-sm text-muted-foreground'>Add a new course, then manage modules and lessons.</p>
        </div>
      </div>

      <div className='rounded-lg border p-4 dark:border-gray-800'>
        <div className='mb-4 text-sm text-muted-foreground'>Step {step} of 4</div>

        {step === 1 && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Title</Label>
                <Input id='title' name='title' value={form.title} onChange={handleInput} placeholder='e.g. Introduction to Next.js' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='slug'>Slug</Label>
                <Input id='slug' name='slug' value={form.slug} onChange={handleInput} placeholder='e.g. nextjs-intro' />
                <div className='flex items-center gap-2 text-xs pt-1 min-h-[20px]'>
                  {!form.slug ? (
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
              <Input id='subtitle' name='subtitle' value={form.subtitle} onChange={handleInput} placeholder='A brief, catchy subtitle' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='summary'>Summary</Label>
              <Textarea id='summary' name='summary' value={form.summary} onChange={handleInput} placeholder='A short summary of the course content.' rows={4} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={value => setForm(prev => ({ ...prev, difficulty: value as Difficulty }))}>
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
                <Select value={form.status} onValueChange={value => setForm(prev => ({ ...prev, status: value as Status }))}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='published' disabled>
                      Published (add lessons first)
                    </SelectItem>
                    <SelectItem value='archived'>Archived</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>You can publish only after adding at least one lesson.</p>
              </div>
              <div className='space-y-2'>
                <Label>Visibility</Label>
                <Select value={form.visibility} onValueChange={value => setForm(prev => ({ ...prev, visibility: value as Visibility }))}>
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
                <Label htmlFor='estimatedDurationMinutes'>Estimated minutes</Label>
                <Input id='estimatedDurationMinutes' name='estimatedDurationMinutes' value={form.estimatedDurationMinutes} onChange={handleInput} placeholder='e.g. 120' />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='categories'>Categories</Label>
                <Input id='categories' name='categories' value={form.categories} onChange={handleInput} placeholder='Comma separated (e.g. web,apis,backend)' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='tags'>Tags</Label>
                <Input id='tags' name='tags' value={form.tags} onChange={handleInput} placeholder='Comma separated tags' />
              </div>
            </div>
            <div className='flex items-center justify-between rounded-md border p-4'>
              <div>
                <Label htmlFor='isFeatured'>Feature this course</Label>
                <p className='text-sm text-muted-foreground'>Featured courses are highlighted in marketing sections.</p>
              </div>
              <input id='isFeatured' type='checkbox' checked={form.isFeatured} onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='heroImage'>Hero image URL or shortcode</Label>
                <Input id='heroImage' name='heroImage' value={form.heroImage} onChange={handleInput} placeholder='https:// or asset://' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='heroLottieId'>Hero lottie asset ID</Label>
                <Input id='heroLottieId' name='heroLottieId' value={form.heroLottieId} onChange={handleInput} placeholder='Optional ObjectId for animated hero' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='prerequisiteCourseIds'>Prerequisite course IDs</Label>
                <Input id='prerequisiteCourseIds' name='prerequisiteCourseIds' value={form.prerequisiteCourseIds} onChange={handleInput} placeholder='Comma separated ObjectIds' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='prerequisiteBlogSlugs'>Prerequisite blog slugs</Label>
                <Input id='prerequisiteBlogSlugs' name='prerequisiteBlogSlugs' value={form.prerequisiteBlogSlugs} onChange={handleInput} placeholder='Comma separated slugs' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='recommendedBlogSlugs'>Recommended blog slugs</Label>
                <Input id='recommendedBlogSlugs' name='recommendedBlogSlugs' value={form.recommendedBlogSlugs} onChange={handleInput} placeholder='Comma separated slugs' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='recommendedBookIds'>Recommended book IDs</Label>
                <Input id='recommendedBookIds' name='recommendedBookIds' value={form.recommendedBookIds} onChange={handleInput} placeholder='Comma separated ObjectIds' />
              </div>
            </div>
          </div>
        )}

        <div className='mt-6 flex items-center justify-between'>
          <Button variant='outline' onClick={() => router.push('/admin/courses')}>
            Cancel
          </Button>
          <div className='flex gap-2'>
            {step > 1 && (
              <Button variant='outline' onClick={() => setStep(s => s - 1)}>Back</Button>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)}>Next</Button>
            ) : (
              <Button onClick={createCourse} disabled={isCreating || form.status === 'published'}>
                {isCreating ? 'Creating…' : 'Create course'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
