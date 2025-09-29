'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function BookChaptersManage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [book, setBook] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const p = await params;
      setBookId(p.id);
    })();
  }, [params]);

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        setLoading(true);
        const [bRes, cRes] = await Promise.all([
          fetch(`/api/admin/books/${bookId}`),
          fetch(`/api/admin/books/${bookId}/chapters`),
        ]);
        if (bRes.ok) setBook(await bRes.json());
        if (cRes.ok) {
          const c = await cRes.json();
          setChapters(c?.chapters || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber),
    [chapters]
  );

  async function updateChapter(id: string, patch: any) {
    if (!bookId) return;
    const res = await fetch(`/api/admin/books/${bookId}/chapters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok)
      return toast({
        title: 'Update failed',
        description: 'Could not update chapter',
        variant: 'destructive' as any,
      });
    const data = await res.json();
    setChapters(prev => prev.map(c => (c._id === id ? data.chapter : c)));
    toast({ title: 'Chapter updated', description: data.chapter.title });
  }

  async function deleteChapter(id: string) {
    if (!bookId) return;
    if (!confirm('Delete this chapter?')) return;
    const res = await fetch(`/api/admin/books/${bookId}/chapters/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok)
      return toast({
        title: 'Delete failed',
        description: 'Could not delete chapter',
        variant: 'destructive' as any,
      });
    setChapters(prev => prev.filter(c => c._id !== id));
    toast({ title: 'Chapter deleted' });
  }

  async function persistOrder(ordered: any[]) {
    if (!bookId) return;
    const order = ordered.map((c, idx) => ({
      chapterId: c._id,
      chapterNumber: idx + 1,
    }));
    const res = await fetch(`/api/admin/books/${bookId}/chapters/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    if (!res.ok)
      return toast({
        title: 'Reorder failed',
        description: 'Could not save order',
        variant: 'destructive' as any,
      });
    toast({ title: 'Order saved' });
  }

  function SortableItem({ item }: { item: any }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item._id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;
    return (
      <li
        ref={setNodeRef}
        style={style}
        className='border rounded p-3 grid gap-2'
        {...attributes}
        {...listeners}
      >
        <div className='flex items-center justify-between'>
          <div className='font-medium'>
            #{item.chapterNumber} — {item.title}
          </div>
          <div className='flex gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Published</span>
              <Switch
                checked={!!item.isPublished}
                onCheckedChange={v =>
                  updateChapter(item._id, { isPublished: v })
                }
              />
            </div>
            <Link
              href={`/admin/books/${bookId}/chapters/${item._id}`}
              className='px-3 py-2 border rounded'
            >
              Edit
            </Link>
            <Button
              variant='destructive'
              onClick={() => deleteChapter(item._id)}
            >
              Delete
            </Button>
          </div>
        </div>
        <div className='text-sm text-muted-foreground'>
          Words: {item.wordCount || 0}
        </div>
      </li>
    );
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedChapters.findIndex(c => c._id === active.id);
    const newIndex = sortedChapters.findIndex(c => c._id === over.id);
    const newOrder = arrayMove(sortedChapters, oldIndex, newIndex).map(
      (c, idx) => ({ ...c, chapterNumber: idx + 1 })
    );
    setChapters(newOrder);
    await persistOrder(newOrder);
  };

  if (loading) return <div className='p-6'>Loading...</div>;
  if (!book) return <div className='p-6'>Not Found</div>;

  return (
    <div className='p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-sm text-muted-foreground space-x-1'>
            <Link href={`/admin/books/${bookId}`} className='hover:underline'>
              Book
            </Link>
            <span>/</span>
            <span>Chapters</span>
          </div>
          <h1 className='text-2xl font-semibold'>Manage Chapters</h1>
          <p className='text-sm text-muted-foreground'>{book.title}</p>
        </div>
        <div className='space-x-2'>
          <Link
            href={`/admin/books/${bookId}`}
            className='px-3 py-2 border rounded'
          >
            Back
          </Link>
          <Link
            href={`/admin/books/${bookId}/chapters/new`}
            className='px-3 py-2 border rounded bg-primary text-primary-foreground'
          >
            New Chapter
          </Link>
        </div>
      </div>

      <Card className='p-4'>
        {sortedChapters.length === 0 ? (
          <div className='text-sm text-muted-foreground'>No chapters yet.</div>
        ) : (
          <DndContext onDragEnd={onDragEnd}>
            <SortableContext
              items={sortedChapters.map(c => c._id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className='space-y-3'>
                {sortedChapters.map(c => (
                  <SortableItem key={c._id} item={c} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </div>
  );
}
