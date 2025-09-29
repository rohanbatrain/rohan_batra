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

export default function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    title: '',
    summary: '',
    content: '',
    chapterNumber: 1,
    isPublished: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const p = await params;
      setBookId(p.id);
      setChapterId(p.chapterId);
    })();
  }, [params]);

  useEffect(() => {
    if (!chapterId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/chapters/${chapterId}`);
        if (res.ok) {
          const json = await res.json();
          const ch = json.chapter || json;
          setForm({
            title: ch.title || '',
            summary: ch.summary || '',
            content: ch.content || '',
            chapterNumber: ch.chapterNumber || 1,
            isPublished: !!ch.isPublished,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [chapterId]);

  async function save() {
    if (!chapterId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Saved', description: 'Chapter updated' });
    } catch (e) {
      toast({
        title: 'Save failed',
        description: 'Could not save chapter',
        variant: 'destructive' as any,
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!chapterId) return;
    if (!confirm('Delete this chapter?')) return;
    const res = await fetch(`/api/admin/chapters/${chapterId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast({ title: 'Deleted', description: 'Chapter removed' });
      router.push(`/admin/books/${bookId}/chapters`);
    } else {
      toast({
        title: 'Delete failed',
        description: 'Could not delete chapter',
        variant: 'destructive' as any,
      });
    }
  }

  if (loading) return <div className='p-6'>Loading...</div>;

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
            <span>Edit</span>
          </div>
          <h1 className='text-2xl font-semibold'>Edit Chapter</h1>
        </div>
        <div className='space-x-2'>
          <Link
            href={`/admin/books/${bookId}/chapters`}
            className='px-3 py-2 border rounded'
          >
            Back
          </Link>
          <Button variant='destructive' onClick={remove}>
            Delete
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card className='p-4 grid gap-3'>
        <div className='grid gap-2'>
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={e =>
              setForm((f: any) => ({ ...f, title: e.target.value }))
            }
          />
        </div>
        <div className='grid gap-2'>
          <Label>Summary</Label>
          <Textarea
            value={form.summary}
            onChange={e =>
              setForm((f: any) => ({ ...f, summary: e.target.value }))
            }
          />
        </div>
        <div className='grid gap-2'>
          <Label>Content (HTML allowed)</Label>
          <Textarea
            rows={10}
            value={form.content}
            onChange={e =>
              setForm((f: any) => ({ ...f, content: e.target.value }))
            }
          />
        </div>
        <div className='grid grid-cols-2 gap-3 items-center'>
          <div className='grid gap-2'>
            <Label>Chapter #</Label>
            <Input
              type='number'
              value={form.chapterNumber}
              onChange={e =>
                setForm((f: any) => ({
                  ...f,
                  chapterNumber: parseInt(e.target.value || '1'),
                }))
              }
            />
          </div>
          <div className='flex items-center gap-2 pt-6'>
            <Switch
              checked={form.isPublished}
              onCheckedChange={v =>
                setForm((f: any) => ({ ...f, isPublished: v }))
              }
            />
            <span className='text-sm'>Published</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
