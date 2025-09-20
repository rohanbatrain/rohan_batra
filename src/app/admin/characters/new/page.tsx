"use client";

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { DatePickerInput } from '@/components/ui/DatePickerInput';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  fullName: z.string().max(200, 'Max 200 characters').optional().or(z.literal('')),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers, and dashes').optional().or(z.literal('')),
  visibility: z.enum(['private', 'public']),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']),
  significance: z.enum(['major', 'minor', 'background']),
  birthdate: z.string().optional().or(z.literal('')),
  age: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(0, 'Age must be 0 or greater').optional()),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  personality: z.string().optional(),
  background: z.string().optional(),
  physicalDescription: z.string().optional(),
  goals: z.string().optional(),
  conflicts: z.string().optional(),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bookId: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof FormSchema>;

function computeAgeFromBirthdate(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return Math.max(0, age);
}

function formatDateOnly(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewCharacterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [manualAge, setManualAge] = useState(false);
  const [slugStatus, setSlugStatus] = useState<null | 'checking' | 'available' | 'unavailable'>(null);
  const [books, setBooks] = useState<Array<{ id: string; title: string }>>([]);
  const leaveGuardAttached = useRef(false);

  const today = useMemo(() => formatDateOnly(new Date()), []);
  const minDate = '1900-01-01';

  const { register, handleSubmit, setValue, watch, formState, reset, trigger, getValues, getFieldState } = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      name: '',
      fullName: '',
      slug: '',
      visibility: 'private',
      role: 'supporting',
      significance: 'minor',
      birthdate: '',
      age: undefined,
      tags: [],
      description: '<p></p>',
      personality: '<p></p>',
      background: '<p></p>',
      physicalDescription: '',
      goals: '',
      conflicts: '',
      avatar: '',
      bookId: '',
    },
    mode: 'onChange',
  });
  const { errors, isDirty, isValid } = formState;

  // Fetch books for picker
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/books');
        if (!res.ok) return;
        const json = await res.json();
        const list: Array<{ id: string; title: string } > = (json?.books || json?.items || []).map((b: any) => ({ id: b.id || b._id || b._doc?._id, title: b.title || b.name || 'Untitled' }));
        if (mounted) setBooks(list);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-slug from name when enabled
  const name = watch('name');
  const slug = watch('slug');
  useEffect(() => {
    if (!autoSlug) return;
    const generated = name ? generateSlug(name) : '';
    setValue('slug', generated, { shouldDirty: false, shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, autoSlug]);

  // Debounced slug uniqueness check
  useEffect(() => {
    if (!slug) { setSlugStatus(null); return; }
    let canceled = false;
    setSlugStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/characters/slug/exists?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!canceled) setSlugStatus(json?.exists ? 'unavailable' : 'available');
      } catch {
        if (!canceled) setSlugStatus(null);
      }
    }, 400);
    return () => { canceled = true; clearTimeout(t); };
  }, [slug]);

  // Birthdate -> Age auto compute unless manual
  const birthdate = watch('birthdate');
  useEffect(() => {
    if (!manualAge) {
      const derived = computeAgeFromBirthdate(birthdate || undefined);
      setValue('age', derived, { shouldDirty: true, shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthdate, manualAge]);

  // Unsaved changes guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    if (isDirty && !leaveGuardAttached.current) {
      window.addEventListener('beforeunload', handler);
      leaveGuardAttached.current = true;
    }
    return () => {
      if (leaveGuardAttached.current) {
        window.removeEventListener('beforeunload', handler);
        leaveGuardAttached.current = false;
      }
    };
  }, [isDirty]);

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        void onSubmit(getValues());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [getValues]);

  // Tags as chips helpers
  const tags = watch('tags') || [];
  const addTag = useCallback((t: string) => {
    const v = t.trim().toLowerCase();
    if (!v) return;
    if (tags.includes(v)) return;
    setValue('tags', [...tags, v], { shouldDirty: true, shouldValidate: false });
  }, [tags, setValue]);
  const removeTag = useCallback((t: string) => {
    setValue('tags', tags.filter(x => x !== t), { shouldDirty: true, shouldValidate: false });
  }, [tags, setValue]);
  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag((e.target as HTMLInputElement).value);
      (e.target as HTMLInputElement).value = '';
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (slugStatus === 'unavailable') {
      toast({ title: 'Slug in use', description: 'Please choose another slug', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      name: values.name.trim(),
      fullName: values.fullName || undefined,
      slug: values.slug || undefined,
      visibility: values.visibility,
      role: values.role,
      significance: values.significance,
      birthdate: values.birthdate || undefined,
      age: values.age,
      tags: values.tags?.length ? values.tags : undefined,
      description: values.description,
      personality: values.personality,
      background: values.background,
      physicalDescription: values.physicalDescription || undefined,
      goals: values.goals || undefined,
      conflicts: values.conflicts || undefined,
      avatar: values.avatar || undefined,
      bookId: values.bookId || undefined,
    };
    const res = await fetch('/api/admin/characters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSubmitting(false);
    if (res.ok) {
      toast({ title: 'Created', description: 'Character created successfully' });
      const json = await res.json();
      const id = json?.character?.id || json?.character?._id || json?.character?._doc?._id;
      router.push(`/admin/characters/${id}`);
    } else {
      let message = 'Failed to create character';
      try {
        const err = await res.json();
        message = err?.error || err?.details?.[0]?.message || message;
      } catch {}
      toast({ title: 'Error', description: message || 'Fix highlighted fields', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Character</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push('/admin/characters')}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={submitting || !isValid}>Create</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-3">
          <h2 className="font-medium">Basics</h2>
          <div className="space-y-1">
            <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Name</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input {...register('fullName')} />
            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Slug (optional)</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Auto</span>
                <Switch checked={autoSlug} onCheckedChange={setAutoSlug} />
              </div>
            </div>
            <Input {...register('slug', { onChange: (e) => { setAutoSlug(false); } })} />
            <div className="text-xs text-muted-foreground">
              {slugStatus === 'checking' && 'Checking…'}
              {slugStatus === 'available' && <span className="text-green-600">Available</span>}
              {slugStatus === 'unavailable' && <span className="text-red-600">Already in use</span>}
            </div>
            {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
          </div>
          <div className="flex gap-3">
            <div className="w-full space-y-1">
              <Label>Visibility</Label>
              <Select value={watch('visibility')} onValueChange={v => setValue('visibility', v as any, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div className="w-full space-y-1">
              <Label>Role</Label>
              <Select value={watch('role')} onValueChange={v => setValue('role', v as any, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protagonist">Protagonist</SelectItem>
                <SelectItem value="antagonist">Antagonist</SelectItem>
                <SelectItem value="supporting">Supporting</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Significance</Label>
            <Select value={watch('significance')} onValueChange={v => setValue('significance', v as any, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Significance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="background">Background</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Book (optional)</Label>
            <Select
              value={watch('bookId') || undefined}
              onValueChange={v => {
                if (v === 'none') setValue('bookId', '', { shouldDirty: true, shouldValidate: false });
                else setValue('bookId', v, { shouldDirty: true, shouldValidate: false });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select book" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {books.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Birthdate</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <DatePickerInput value={watch('birthdate') || ''} min={minDate} max={today} onChange={(v) => setValue('birthdate', v, { shouldDirty: true, shouldValidate: true })} />
              </div>
              {typeof watch('age') === 'number' && !manualAge ? <Badge variant="secondary">{String(watch('age'))} yrs</Badge> : null}
            </div>
            <p className="text-xs text-muted-foreground">Age is derived from birthdate unless you enable manual age.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Age</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Manual</span>
                <Switch checked={manualAge} onCheckedChange={setManualAge} />
              </div>
            </div>
            <Input type="number" disabled={!manualAge} value={watch('age') ?? ''} onChange={e => setValue('age', e.target.value === '' ? undefined : Number(e.target.value), { shouldDirty: true, shouldValidate: true })} />
            {errors.age && <p className="text-sm text-red-600">{errors.age.message as string}</p>}
          </div>
          <div className="space-y-1">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button type="button" className="ml-1" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input placeholder="Type a tag and press Enter" onKeyDown={onTagKey} />
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-medium">Details</h2>
          <div className="space-y-1">
            <Label>Description (Rich HTML)</Label>
            <Textarea rows={5} {...register('description')} />
          </div>
          <div className="space-y-1">
            <Label>Personality (Rich HTML)</Label>
            <Textarea rows={5} {...register('personality')} />
          </div>
          <div className="space-y-1">
            <Label>Background (Rich HTML)</Label>
            <Textarea rows={5} {...register('background')} />
          </div>
          <div className="space-y-1">
            <Label>Physical Description</Label>
            <Textarea rows={3} {...register('physicalDescription')} />
          </div>
          <div className="space-y-1">
            <Label>Goals</Label>
            <Textarea rows={3} {...register('goals')} />
          </div>
          <div className="space-y-1">
            <Label>Conflicts</Label>
            <Textarea rows={3} {...register('conflicts')} />
          </div>
          <div className="space-y-1">
            <Label>Avatar URL</Label>
            <Input {...register('avatar')} />
            {errors.avatar && <p className="text-sm text-red-600">{errors.avatar.message as string}</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
