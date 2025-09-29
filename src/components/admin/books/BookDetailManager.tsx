'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
// dnd-kit is used on the dedicated chapters manage page, not here
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface BookDetailManagerProps {
  bookId: string;
  userRole: string;
}

export default function BookDetailManager({ bookId }: BookDetailManagerProps) {
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('overview');
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  // Form state for book
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    genre: '',
    status: 'planning',
    visibility: 'private',
    targetWordCount: '' as any,
    coverImage: '',
    tags: '' as any,
  });

  // Chapters summary state (list only for counts)
  const [chapters, setChapters] = useState<any[]>([]);
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber),
    [chapters]
  );

  // Characters state
  const [characters, setCharacters] = useState<any[]>([]);
  const [charDraft, setCharDraft] = useState({
    name: '',
    role: 'supporting',
    description: '',
  });
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachSearch, setAttachSearch] = useState('');
  const [attachResults, setAttachResults] = useState<any[]>([]);
  const [attachLoading, setAttachLoading] = useState(false);
  const [attachSelected, setAttachSelected] = useState<string | null>(null);
  const [onlyIndependent, setOnlyIndependent] = useState(true);
  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [bRes, cRes, chRes] = await Promise.all([
          fetch(`/api/admin/books/${bookId}`, { credentials: 'include' }),
          fetch(`/api/admin/books/${bookId}/chapters`, {
            credentials: 'include',
          }),
          fetch(`/api/admin/books/${bookId}/characters`, {
            credentials: 'include',
          }),
        ]);
        if (bRes.ok) {
          const b = await bRes.json();
          setBook(b);
          setForm({
            title: b.title || '',
            subtitle: b.subtitle || '',
            description: b.description || '',
            genre: b.genre || '',
            status: b.status || 'planning',
            visibility: b.visibility || 'private',
            targetWordCount: b.targetWordCount || '',
            coverImage: b.coverImage || '',
            tags: (b.tags || []).join(', '),
          });
        }
        if (cRes.ok) {
          const c = await cRes.json();
          setChapters(c?.chapters || []);
        }
        if (chRes.ok) {
          const ch = await chRes.json();
          setCharacters(ch?.characters || []);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [bookId]);

  const saveBook = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || undefined,
          description: form.description,
          genre: form.genre,
          status: form.status,
          visibility: form.visibility,
          targetWordCount: form.targetWordCount
            ? parseInt(String(form.targetWordCount))
            : undefined,
          coverImage: form.coverImage || undefined,
          tags: (form.tags || '')
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const updated = await res.json();
      setBook(updated);
      toast({
        title: 'Book saved',
        description: 'Your changes have been updated.',
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Save failed',
        description: 'Could not save book',
        variant: 'destructive' as any,
      });
    } finally {
      setSaving(false);
    }
  };

  // In this view, we only display a quick summary and link out to full chapters management

  const createCharacter = async () => {
    const res = await fetch(`/api/admin/books/${bookId}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(charDraft),
    });
    if (!res.ok)
      return toast({
        title: 'Create failed',
        description: 'Could not create character',
        variant: 'destructive' as any,
      });
    const created = await res.json();
    setCharacters(prev => [created, ...prev]);
    setCharDraft({ name: '', role: 'supporting', description: '' });
    toast({ title: 'Character created', description: created?.name || '' });
  };

  const detachCharacter = async (characterId: string) => {
    const ok = await confirm({
      title: 'Detach character?',
      description:
        'This will remove the link between the character and this book. You can reattach later.',
      destructive: true,
      confirmText: 'Detach',
    });
    if (!ok) return;
    const res = await fetch(
      `/api/admin/books/${bookId}/characters?characterId=${characterId}`,
      { method: 'DELETE', credentials: 'include' }
    );
    if (!res.ok)
      return toast({
        title: 'Detach failed',
        description: 'Could not detach character',
        variant: 'destructive' as any,
      });
    setCharacters(prev => prev.filter(c => c._id !== characterId));
    toast({ title: 'Character detached' });
  };

  const searchCharacters = async () => {
    try {
      setAttachLoading(true);
      const res = await fetch(
        `/api/admin/characters?search=${encodeURIComponent(attachSearch)}&limit=20`,
        { credentials: 'include' }
      );
      const data = await res.json();
      const all = (data?.characters || []) as any[];
      // Optionally exclude characters already attached to this book
      const filtered = (
        onlyIndependent ? all.filter(c => !c.bookId) : all
      ).filter(c => c.bookId !== bookId);
      setAttachResults(filtered);
    } catch {
      setAttachResults([]);
    } finally {
      setAttachLoading(false);
    }
  };

  useEffect(() => {
    if (!attachOpen) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchCharacters();
    }, 350);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [attachSearch, onlyIndependent, attachOpen]);

  const attachCharacter = async () => {
    if (!attachSelected) return;
    const res = await fetch(`/api/admin/books/${bookId}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ characterId: attachSelected }),
    });
    if (!res.ok)
      return toast({
        title: 'Attach failed',
        description: 'Could not attach character',
        variant: 'destructive' as any,
      });
    const attached = await res.json();
    setCharacters(prev => [attached, ...prev]);
    setAttachOpen(false);
    setAttachSelected(null);
    setAttachResults([]);
    setAttachSearch('');
    toast({ title: 'Character attached', description: attached?.name || '' });
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Not Found</div>;

  return (
    <Tabs value={tab} onValueChange={setTab} className='space-y-4'>
      <TabsList>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger
          value='chapters'
          className='inline-flex items-center gap-2'
        >
          <span>Chapters</span>
          <span className='ml-1 inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 text-[10px] leading-none rounded-full bg-muted text-muted-foreground'>
            {sortedChapters.length}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value='characters'
          className='inline-flex items-center gap-2'
        >
          <span>Characters</span>
          <span className='ml-1 inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 text-[10px] leading-none rounded-full bg-muted text-muted-foreground'>
            {characters.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='overview'>
        <Card className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Chapters: {sortedChapters.length}
            </div>
            {sortedChapters.length > 0 && (
              <div className='text-sm'>
                Latest updated:{' '}
                {new Date(
                  Math.max(
                    ...sortedChapters.map((c: any) =>
                      new Date(
                        c.updatedAt || c.createdAt || Date.now()
                      ).getTime()
                    )
                  )
                ).toLocaleString()}
              </div>
            )}
          </div>
          <div className='grid gap-2'>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Subtitle</Label>
            <Input
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={e =>
                setForm(f => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>Genre</Label>
              <Input
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Target Word Count</Label>
              <Input
                type='number'
                value={form.targetWordCount}
                onChange={e =>
                  setForm(f => ({ ...f, targetWordCount: e.target.value }))
                }
              />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={v => setForm(f => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='planning'>Planning</SelectItem>
                  <SelectItem value='drafting'>Drafting</SelectItem>
                  <SelectItem value='editing'>Editing</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='published'>Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={v => setForm(f => ({ ...f, visibility: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select visibility' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='private'>Private</SelectItem>
                  <SelectItem value='public'>Public</SelectItem>
                  <SelectItem value='shared'>Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>Tags (comma separated)</Label>
            <Input
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <div className='flex gap-2'>
            <Button onClick={saveBook} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Link className='px-3 py-2 border rounded' href='/admin/books'>
              Back
            </Link>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value='chapters'>
        <Card className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='font-medium'>Chapters</div>
              <div className='text-sm text-muted-foreground'>
                Total: {sortedChapters.length}
              </div>
            </div>
            <div className='space-x-2'>
              <Link
                href={`/admin/books/${bookId}/chapters`}
                className='px-3 py-2 border rounded'
              >
                Manage
              </Link>
              <Link
                href={`/admin/books/${bookId}/chapters/new`}
                className='px-3 py-2 border rounded bg-primary text-primary-foreground'
              >
                New Chapter
              </Link>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value='characters'>
        <Card className='p-4 grid gap-4'>
          <div className='grid gap-2'>
            <Label>New Character</Label>
            <div className='grid gap-2'>
              <Input
                placeholder='Name'
                value={charDraft.name}
                onChange={e =>
                  setCharDraft(d => ({ ...d, name: e.target.value }))
                }
              />
              <select
                className='border rounded px-2 py-2'
                value={charDraft.role}
                onChange={e =>
                  setCharDraft(d => ({ ...d, role: e.target.value }))
                }
              >
                <option value='protagonist'>Protagonist</option>
                <option value='antagonist'>Antagonist</option>
                <option value='supporting'>Supporting</option>
                <option value='minor'>Minor</option>
              </select>
              <Textarea
                placeholder='Description'
                value={charDraft.description}
                onChange={e =>
                  setCharDraft(d => ({ ...d, description: e.target.value }))
                }
              />
              <Button onClick={createCharacter}>Add Character</Button>
            </div>
          </div>

          <div className='border-t pt-4'>
            {characters.length === 0 ? (
              <div className='text-sm text-gray-500'>No characters yet.</div>
            ) : (
              <ul className='space-y-3'>
                {characters.map(ch => (
                  <li key={ch._id} className='border rounded p-3 grid gap-2'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>{ch.name}</div>
                      <div className='flex gap-2'>
                        <Button
                          variant='destructive'
                          onClick={() => detachCharacter(ch._id)}
                        >
                          Detach
                        </Button>
                      </div>
                    </div>
                    <div className='text-sm text-gray-500'>Role: {ch.role}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className='pt-4'>
            <Button variant='secondary' onClick={() => setAttachOpen(true)}>
              Attach Existing Character
            </Button>
          </div>
        </Card>

        <Dialog
          open={attachOpen}
          onOpenChange={open => {
            setAttachOpen(open);
            if (!open) {
              setAttachResults([]);
              setAttachSelected(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attach Character</DialogTitle>
            </DialogHeader>
            <div className='grid gap-3'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
                <div className='flex-1'>
                  <Input
                    placeholder='Search characters by name or tag'
                    value={attachSearch}
                    onChange={e => setAttachSearch(e.target.value)}
                  />
                </div>
                <label className='inline-flex items-center gap-2 text-sm'>
                  <Switch
                    checked={onlyIndependent}
                    onCheckedChange={setOnlyIndependent}
                  />
                  <span>Only independent</span>
                </label>
                <Button onClick={searchCharacters} disabled={attachLoading}>
                  {attachLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <div className='max-h-64 overflow-auto border rounded'>
                {attachResults.length === 0 ? (
                  <div className='p-3 text-sm text-gray-500'>No results</div>
                ) : (
                  <ul>
                    {attachResults.map((r: any) => (
                      <li
                        key={r.id}
                        className={`px-3 py-2 cursor-pointer ${attachSelected === r.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setAttachSelected(r.id)}
                      >
                        <div className='font-medium'>{r.name}</div>
                        <div className='text-xs text-gray-500'>
                          {r.slug} • {r.role}
                          {r.bookTitle ? ` • in ${r.bookTitle}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant='secondary' onClick={() => setAttachOpen(false)}>
                Cancel
              </Button>
              <Button onClick={attachCharacter} disabled={!attachSelected}>
                Attach
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {ConfirmDialog}
      </TabsContent>
    </Tabs>
  );
}
