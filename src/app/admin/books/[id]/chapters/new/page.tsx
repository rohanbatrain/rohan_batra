'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function NewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    summary: string;
    content: string;
    chapterNumber?: number;
    isPublished: boolean;
  }>({
    title: '',
    summary: '',
    content: '',
    chapterNumber: undefined,
    isPublished: false,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const p = await params;
      setBookId(p.id);
    })();
  }, [params]);

  // Load chapters to compute next index
  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/books/${bookId}/chapters`);
        if (res.ok) {
          const json = await res.json();
          const chapters: any[] = json?.chapters || [];
          const next = chapters.length
            ? Math.max(
                ...chapters.map((c: any) => Number(c.chapterNumber) || 0)
              ) + 1
            : 1;
          setForm(f => ({ ...f, chapterNumber: next }));
        }
      } catch {}
    })();
  }, [bookId]);

  async function create() {
    if (!bookId) return;
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        summary: form.summary,
        content: form.content,
        isPublished: form.isPublished,
      };
      if (
        typeof form.chapterNumber === 'number' &&
        Number.isFinite(form.chapterNumber)
      ) {
        payload.chapterNumber = form.chapterNumber;
      }
      const res = await fetch(`/api/admin/books/${bookId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast({
        title: 'Chapter created',
        description: data.chapter?.title || '',
      });
      router.push(`/admin/books/${bookId}/chapters/${data.chapter._id}`);
    } catch (e) {
      toast({
        title: 'Create failed',
        description: 'Could not create chapter',
        variant: 'destructive' as any,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-sm text-muted-foreground space-x-1'>
            <Link href={`/admin/books/${bookId}`} className='hover:underline'>
              Book
            </Link>
            <span>/</span>
            <Link
              href={`/admin/books/${bookId}/chapters`}
              className='hover:underline'
            >
              Chapters
            </Link>
            <span>/</span>
            <span>New</span>
          </div>
          <h1 className='text-2xl font-semibold'>New Chapter</h1>
        </div>
        <div className='space-x-2'>
          <Link
            href={`/admin/books/${bookId}/chapters`}
            className='px-3 py-2 border rounded'
          >
            Back
          </Link>
        </div>
      </div>

      <Card className='p-4 grid gap-3'>
        <div className='grid gap-2'>
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className='grid gap-2'>
          <Label>Summary</Label>
          <Textarea
            value={form.summary}
            onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          />
        </div>
        <div className='grid gap-2'>
          <Label>Content (HTML allowed)</Label>
          <Textarea
            rows={10}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
        </div>
        <div className='grid grid-cols-2 gap-3 items-center'>
          <div className='grid gap-2'>
            <Label>Chapter #</Label>
            <Input
              type='number'
              value={
                typeof form.chapterNumber === 'number' ? form.chapterNumber : ''
              }
              onChange={e => {
                const v = e.target.value;
                setForm(f => ({
                  ...f,
                  chapterNumber: v === '' ? undefined : parseInt(v, 10),
                }));
              }}
            />
          </div>
          <div className='flex items-center gap-2 pt-6'>
            <Switch
              checked={form.isPublished}
              onCheckedChange={v => setForm(f => ({ ...f, isPublished: v }))}
            />
            <span className='text-sm'>Published</span>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button onClick={create} disabled={saving || !form.title}>
            {saving ? 'Creating...' : 'Create'}
          </Button>
          <Link
            href={`/admin/books/${bookId}/chapters`}
            className='px-3 py-2 border rounded'
          >
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
