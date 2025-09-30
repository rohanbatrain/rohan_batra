'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function DeckCreateContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    coverImage: '',
    status: 'draft',
    visibility: 'public',
    tags: '',
    categories: '',
    estimatedReviewMinutes: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const create = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title required', description: 'Please provide a deck title.', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      const payload: Record<string, any> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        description: form.description.trim() || undefined,
        coverImage: form.coverImage.trim() || undefined,
        status: form.status,
        visibility: form.visibility,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        categories: form.categories ? form.categories.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (form.estimatedReviewMinutes.trim()) {
        const m = Number(form.estimatedReviewMinutes);
        if (!Number.isNaN(m) && m >= 0) payload.estimatedReviewMinutes = m;
      }
      const res = await fetch('/api/admin/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create deck');
      }
      const created: { id: string } = await res.json();
      toast({ title: 'Deck created', description: 'Redirecting…' });
      router.push(`/admin/flashcards/${created.id}`);
    } catch (err) {
      toast({ title: 'Unable to create deck', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Create flashcard deck</h1>
          <p className='text-sm text-muted-foreground'>After creating, you can add cards and link content.</p>
        </div>
      </div>
      <div className='rounded-lg border p-4 dark:border-gray-800 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input id='title' value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='subtitle'>Subtitle</Label>
            <Input id='subtitle' value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
          </div>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea id='description' rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
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
            <Select value={form.visibility} onValueChange={v => set('visibility', v)}>
              <SelectTrigger>
                <SelectValue placeholder='Select visibility' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='public'>Public</SelectItem>
                <SelectItem value='unlisted'>Unlisted</SelectItem>
                <SelectItem value='private'>Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='tags'>Tags</Label>
            <Input id='tags' value={form.tags} onChange={e => set('tags', e.target.value)} placeholder='Comma separated' />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='categories'>Categories</Label>
            <Input id='categories' value={form.categories} onChange={e => set('categories', e.target.value)} placeholder='Comma separated' />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='minutes'>Est. minutes</Label>
            <Input id='minutes' type='number' min={0} value={form.estimatedReviewMinutes} onChange={e => set('estimatedReviewMinutes', e.target.value)} />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='cover'>Cover image URL</Label>
            <Input id='cover' value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder='https://' />
          </div>
        </div>
        <div className='flex items-center justify-end gap-2'>
          <Button variant='outline' onClick={() => router.push('/admin/flashcards')}>Cancel</Button>
          <Button onClick={create} disabled={creating}>{creating ? 'Creating…' : 'Create deck'}</Button>
        </div>
      </div>
    </div>
  );
}
