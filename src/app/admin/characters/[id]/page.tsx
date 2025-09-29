'use client';

import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RemoteLinkPicker, {
  AssetLinkItem,
} from '@/components/ui/RemoteLinkPicker';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Switch } from '@/components/ui/switch';
import DatePickerInput from '@/components/ui/DatePickerInput';
import { Info } from 'lucide-react';
import { InfoTip } from '@/components/ui/tooltip';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminCharacterDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const p = await params;
        setId(p.id);
      } catch {}
    })();
  }, [params]);
  const { data, isLoading, mutate } = useSWR(
    () => (id ? `/api/admin/characters/${id}` : null),
    fetcher
  );
  // Legacy per-character entries removed in favor of per-journal manager
  const { data: journalVolumes, mutate: mutateJournalVolumes } = useSWR(
    () => (id ? `/api/admin/characters/${id}/journal-volumes` : null),
    fetcher
  );
  const { data: rels, mutate: mutateRels } = useSWR(
    () => (id ? `/api/admin/characters/${id}/relationships` : null),
    fetcher
  );
  const [relForm, setRelForm] = useState<any>({
    target: '',
    search: '',
    relationshipType: '',
    description: '',
    strength: 5,
    direction: 'mutual',
    inverseType: '',
    reciprocal: true,
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editingRelId, setEditingRelId] = useState<string | null>(null);
  const [editingRel, setEditingRel] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  // Removed per-character entry creation
  const [pickerOpen, setPickerOpen] = useState(false);
  const { toast } = useToast();
  const [volForm, setVolForm] = useState<any>({ title: '' });

  // Journal editing state
  const [editOpen, setEditOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState<string>('');
  const [editPrivate, setEditPrivate] = useState(false);
  const [editStatus, setEditStatus] = useState<
    'draft' | 'published' | 'archived'
  >('draft');
  const [savingEdit, setSavingEdit] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (data?.character) setForm({ ...data.character });
  }, [data]);

  // Attach/detach to a book
  const [books, setBooks] = useState<any[]>([]);
  const [attachedBookTitle, setAttachedBookTitle] = useState<string | null>(
    null
  );
  const [attachBookId, setAttachBookId] = useState<string>('');
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/books?limit=100`);
        if (res.ok) {
          const json = await res.json();
          setBooks(json.books || []);
        }
      } catch {}
    })();
  }, []);

  // When character has a bookId, ensure we have its title
  useEffect(() => {
    const bid = form?.bookId;
    if (!bid) {
      setAttachedBookTitle(null);
      return;
    }
    const found = books.find((b: any) => (b._id || b.id) === bid);
    if (found?.title) {
      setAttachedBookTitle(found.title);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/admin/books/${bid}`);
        if (res.ok) {
          const b = await res.json();
          setAttachedBookTitle(b?.title || null);
        }
      } catch {}
    })();
  }, [form?.bookId, books]);

  async function attachToBook() {
    if (!id || !attachBookId) return;
    const res = await fetch(`/api/admin/characters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: attachBookId }),
    });
    if (res.ok) {
      toast({ title: 'Attached', description: 'Character attached to book' });
      mutate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to attach',
        variant: 'destructive',
      });
    }
  }

  async function detachFromBook() {
    if (!id) return;
    const ok = await confirm({
      title: 'Detach character?',
      description:
        'This will remove the link between the character and the book. You can reattach later.',
      confirmText: 'Detach',
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/characters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: null }),
    });
    if (res.ok) {
      toast({ title: 'Detached', description: 'Character detached from book' });
      mutate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to detach',
        variant: 'destructive',
      });
    }
  }

  async function save() {
    const payload = {
      name: form.name,
      fullName: form.fullName,
      slug: form.slug,
      visibility: form.visibility,
      role: form.role,
      significance: form.significance,
      age: form.age ? Number(form.age) : undefined,
      tags: form.tags,
      description: form.description,
      personality: form.personality,
      background: form.background,
    };
    if (!id) return;
    const res = await fetch(`/api/admin/characters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast({ title: 'Saved', description: 'Character updated' });
      mutate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save character',
        variant: 'destructive',
      });
    }
  }

  async function moveToTrash() {
    const ok = await confirm({
      title: 'Move to trash?',
      description: 'You can permanently delete it later from Trash.',
      confirmText: 'Move to Trash',
      destructive: true,
    });
    if (!ok) return;
    if (!id) return;
    const res = await fetch(`/api/admin/characters/${id}?trash=true`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast({ title: 'Trashed', description: 'Moved to trash' });
      router.push('/admin/characters');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to move to trash',
        variant: 'destructive',
      });
    }
  }

  // Entries creation handled within journal manager

  function openEdit(j: any) {
    setEditingJournal(j);
    setEditOpen(true);
    setEditTitle(j.title || '');
    setEditContent(j.content || '');
    setEditDate(
      j.entryDate ? new Date(j.entryDate).toISOString().slice(0, 10) : ''
    );
    setEditPrivate(!!j.isPrivate);
    setEditStatus(j.status || 'draft');
  }

  async function saveEdit() {
    if (!editingJournal) return;
    setSavingEdit(true);
    const payload: any = {
      title: editTitle || undefined,
      content: editContent,
      status: editStatus,
      entryDate: editDate ? editDate : null,
      isPrivate: editPrivate,
    };
    const res = await fetch(`/api/admin/journals/${editingJournal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSavingEdit(false);
    if (res.ok) {
      toast({ title: 'Saved', description: 'Journal updated' });
      setEditOpen(false);
      setEditingJournal(null);
      // entries list handled in journal manager
    } else {
      const err = await res.json().catch(() => null);
      toast({
        title: 'Error',
        description: err?.error || 'Failed to update journal',
        variant: 'destructive',
      });
    }
  }

  async function togglePublish(j: any) {
    const nextStatus = j.status === 'published' ? 'draft' : 'published';
    const payload: any = { status: nextStatus };
    const res = await fetch(`/api/admin/journals/${j.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      // entries list handled in journal manager
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update publish status',
        variant: 'destructive',
      });
    }
  }

  async function togglePrivate(j: any, next: boolean) {
    const res = await fetch(`/api/admin/journals/${j.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPrivate: next }),
    });
    if (res.ok) {
      // entries list handled in journal manager
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update privacy',
        variant: 'destructive',
      });
    }
  }

  // Removed grouped entries state

  // Entry deletion happens in the journal manager page

  async function createVolume() {
    if (!id) return;
    if (!volForm.title) return;
    const payload: any = {
      title: volForm.title,
    };
    const res = await fetch(`/api/admin/characters/${id}/journal-volumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setVolForm({ title: '' });
      toast({
        title: 'Journal created',
        description: 'New journal volume created',
      });
      mutateJournalVolumes();
    } else {
      const err = await res.json().catch(() => null);
      toast({
        title: 'Error',
        description: err?.error || 'Failed to create journal volume',
        variant: 'destructive',
      });
    }
  }

  async function searchCharacters(q: string) {
    setRelForm((f: any) => ({ ...f, search: q }));
    const params = new URLSearchParams({ search: q, limit: '8' });
    const res = await fetch(`/api/admin/characters?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      setSearchResults(json.characters || []);
    }
  }

  async function addRelationship() {
    if (!id) return;
    if (!relForm.target || !relForm.relationshipType) return;
    const payload = {
      targetId: relForm.target,
      relationshipType: relForm.relationshipType,
      description: relForm.description || undefined,
      strength: Number(relForm.strength) || 5,
      direction: relForm.direction,
      inverseType: relForm.inverseType || undefined,
      reciprocal: !!relForm.reciprocal,
    };
    const res = await fetch(`/api/admin/characters/${id}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setRelForm({
        target: '',
        search: '',
        relationshipType: '',
        description: '',
        strength: 5,
        direction: 'mutual',
        inverseType: '',
        reciprocal: true,
      });
      setSearchResults([]);
      toast({ title: 'Linked', description: 'Relationship added' });
      mutateRels();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add relationship',
        variant: 'destructive',
      });
    }
  }

  async function deleteRelationship(relId: string) {
    if (!id) return;
    const ok = await confirm({
      title: 'Remove relationship?',
      confirmText: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(
      `/api/admin/characters/${id}/relationships/${relId}?reciprocal=true`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      toast({ title: 'Unlinked', description: 'Relationship removed' });
      mutateRels();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to remove relationship',
        variant: 'destructive',
      });
    }
  }

  async function startEditRel(r: any) {
    setEditingRelId(r.id);
    setEditingRel({
      relationshipType: r.relationshipType || '',
      strength: r.strength ?? 5,
      direction: r.direction || 'mutual',
      inverseType: r.inverseType || '',
      description: r.description || '',
    });
  }

  function cancelEditRel() {
    setEditingRelId(null);
    setEditingRel(null);
  }

  async function saveEditRel(relId: string) {
    if (!id) return;
    const payload: any = {
      relationshipType: editingRel.relationshipType || undefined,
      strength: Number(editingRel.strength) || 5,
      direction: editingRel.direction,
      inverseType: editingRel.inverseType || undefined,
      description: editingRel.description || undefined,
    };
    const res = await fetch(
      `/api/admin/characters/${id}/relationships/${relId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      cancelEditRel();
      toast({ title: 'Updated', description: 'Relationship updated' });
      mutateRels();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update relationship',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) return <div className='p-6'>Loading...</div>;
  if (!data?.character) return <div className='p-6'>Not found</div>;

  return (
    <div className='p-6 space-y-6'>
      <RemoteLinkPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(link: AssetLinkItem) => {
          setForm((f: any) => ({ ...f, avatar: link.url }));
          setPickerOpen(false);
        }}
        type='image'
        title='Select Avatar Image'
      />
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Edit Character</h1>
        <div className='space-x-2'>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/characters')}
          >
            Back
          </Button>
          <Button variant='destructive' onClick={moveToTrash}>
            Move to Trash
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='p-4 space-y-3'>
          <h2 className='font-medium'>Basics</h2>
          <div className='flex items-center gap-3'>
            {form.avatar ? (
              <img
                src={form.avatar}
                alt='Avatar'
                className='h-16 w-16 rounded object-cover border'
              />
            ) : (
              <div className='h-16 w-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500'>
                No Avatar
              </div>
            )}
            <Button variant='outline' onClick={() => setPickerOpen(true)}>
              Pick Avatar
            </Button>
          </div>
          <Input
            placeholder='Name'
            value={form.name || ''}
            onChange={e =>
              setForm((f: any) => ({ ...f, name: e.target.value }))
            }
          />
          <Input
            placeholder='Full Name'
            value={form.fullName || ''}
            onChange={e =>
              setForm((f: any) => ({ ...f, fullName: e.target.value }))
            }
          />
          <Input
            placeholder='Slug'
            value={form.slug || ''}
            onChange={e =>
              setForm((f: any) => ({ ...f, slug: e.target.value }))
            }
          />
          <div className='flex gap-3'>
            <Select
              value={form.visibility}
              onValueChange={v =>
                setForm((f: any) => ({ ...f, visibility: v }))
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Visibility' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='private'>Private</SelectItem>
                <SelectItem value='public'>Public</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.role}
              onValueChange={v => setForm((f: any) => ({ ...f, role: v }))}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='protagonist'>Protagonist</SelectItem>
                <SelectItem value='antagonist'>Antagonist</SelectItem>
                <SelectItem value='supporting'>Supporting</SelectItem>
                <SelectItem value='minor'>Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select
            value={form.significance}
            onValueChange={v =>
              setForm((f: any) => ({ ...f, significance: v }))
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Significance' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='major'>Major</SelectItem>
              <SelectItem value='minor'>Minor</SelectItem>
              <SelectItem value='background'>Background</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type='number'
            placeholder='Age'
            value={form.age ?? ''}
            onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))}
          />
        </Card>

        <Card className='p-4 space-y-3'>
          <h2 className='font-medium'>Details</h2>
          <Textarea
            placeholder='Description (Rich HTML)'
            rows={5}
            value={form.description || ''}
            onChange={e =>
              setForm((f: any) => ({ ...f, description: e.target.value }))
            }
          />
          <Textarea
            placeholder='Personality (Rich HTML)'
            rows={5}
            value={form.personality || ''}
            onChange={e =>
              setForm((f: any) => ({ ...f, personality: e.target.value }))
            }
          />
          <Textarea
            placeholder='Background (Rich HTML)'
            rows={5}
            value={form.background || ''}
            onChange={e =>
              setForm((f: any) => ({ ...f, background: e.target.value }))
            }
          />
        </Card>
      </div>

      <Card className='p-4 space-y-3'>
        <h2 className='font-medium'>Attached Book</h2>
        {form.bookId ? (
          (() => {
            return (
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-muted-foreground'>
                    This character is attached to
                  </div>
                  <Link
                    href={`/admin/books/${form.bookId}`}
                    className='text-blue-600 hover:underline'
                  >
                    {attachedBookTitle || 'View Book'}
                  </Link>
                </div>
                <Button variant='outline' onClick={detachFromBook}>
                  Detach
                </Button>
              </div>
            );
          })()
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 items-end'>
            <div className='md:col-span-2'>
              <Label>Select a book</Label>
              <select
                className='border rounded px-2 py-2 w-full'
                value={attachBookId}
                onChange={e => setAttachBookId(e.target.value)}
              >
                <option value=''>— Choose —</option>
                {books.map((b: any) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={attachToBook} disabled={!attachBookId}>
              Attach
            </Button>
          </div>
        )}
        {!form.bookId && (
          <div className='text-sm text-muted-foreground'>
            No book attached. This is an independent character.
          </div>
        )}
      </Card>

      {/* Journal Volumes */}
      <Card className='p-0 overflow-hidden'>
        <div className='p-4 flex items-center justify-between gap-3'>
          <div>
            <h2 className='font-medium'>Journals</h2>
            <p className='text-sm text-muted-foreground'>
              Create journals (title only). Manage posts inside each journal.
            </p>
          </div>
          <div className='flex gap-2 items-center'>
            <div className='relative flex items-center gap-1'>
              <Input
                placeholder='New journal title'
                value={volForm.title}
                onChange={e =>
                  setVolForm((f: any) => ({ ...f, title: e.target.value }))
                }
                className='w-72'
              />
              <InfoTip label="Give the journal a short, clear title. Only the title is required; you'll add entries inside.">
                <button
                  aria-label='Title help'
                  className='text-muted-foreground hover:text-foreground'
                >
                  <Info className='h-4 w-4' />
                </button>
              </InfoTip>
            </div>
            <InfoTip label='Creates a new empty journal volume for this character.'>
              <Button onClick={createVolume} disabled={!volForm.title}>
                Create Journal
              </Button>
            </InfoTip>
          </div>
        </div>

        <Separator />
        <div className='p-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
          {!journalVolumes?.journals?.length ? (
            <div className='text-sm text-muted-foreground'>No journals yet</div>
          ) : (
            journalVolumes.journals.map((j: any) => (
              <div key={j.id} className='border rounded-md p-3 space-y-2'>
                <div className='font-medium'>{j.title}</div>
                <div className='text-xs text-muted-foreground'>
                  Status: {j.status}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      router.push(`/admin/characters/${id}/journals/${j.id}`)
                    }
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Multistep UX: First create a journal (volume), then add entries inside it on the Manage page. */}

      {/* Edit Journal Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Journal</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <Label>Title</Label>
            <Input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
            <Label>Date</Label>
            <DatePickerInput value={editDate} onChange={setEditDate} />
            <div className='flex items-center gap-3 pt-2'>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={editStatus === 'published'}
                  onChange={e =>
                    setEditStatus(
                      e.currentTarget.checked ? 'published' : 'draft'
                    )
                  }
                />
                <span className='text-sm'>Published</span>
              </div>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={editPrivate}
                  onChange={e => setEditPrivate(e.currentTarget.checked)}
                />
                <span className='text-sm'>Private</span>
              </div>
            </div>
            <Label>Content</Label>
            <Textarea
              rows={8}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant='ghost' onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className='p-0 overflow-hidden'>
        <div className='p-4 flex items-center justify-between'>
          <div>
            <h2 className='font-medium'>Relationships</h2>
            <p className='text-sm text-muted-foreground'>
              Link this character to others with relationship type and metadata.
            </p>
          </div>
        </div>
        <Separator />
        <div className='p-4 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Search character</Label>
              <Input
                placeholder='Search by name'
                value={relForm.search}
                onChange={e => searchCharacters(e.target.value)}
              />
              {!!searchResults.length && (
                <div className='border rounded max-h-48 overflow-auto'>
                  {searchResults.map((c: any) => (
                    <button
                      key={c.id}
                      className={`w-full text-left px-3 py-2 hover:bg-accent ${relForm.target === c.id ? 'bg-accent' : ''}`}
                      onClick={() =>
                        setRelForm((f: any) => ({ ...f, target: c.id }))
                      }
                    >
                      <div className='font-medium'>{c.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {c.slug}
                        {c.bookTitle ? ` • in ${c.bookTitle}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Relationship type</Label>
              <Input
                placeholder='e.g., friend, sibling, mentor'
                value={relForm.relationshipType}
                onChange={e =>
                  setRelForm((f: any) => ({
                    ...f,
                    relationshipType: e.target.value,
                  }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Direction</Label>
              <Select
                value={relForm.direction}
                onValueChange={v =>
                  setRelForm((f: any) => ({ ...f, direction: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Direction' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='mutual'>Mutual</SelectItem>
                  <SelectItem value='one-way'>One-way</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Inverse Type (optional)</Label>
              <Input
                placeholder='e.g., mentee, child'
                value={relForm.inverseType}
                onChange={e =>
                  setRelForm((f: any) => ({
                    ...f,
                    inverseType: e.target.value,
                  }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Strength (1-10)</Label>
              <Input
                type='number'
                min={0}
                max={10}
                value={relForm.strength}
                onChange={e =>
                  setRelForm((f: any) => ({ ...f, strength: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder='Notes about this relationship'
                value={relForm.description}
                onChange={e =>
                  setRelForm((f: any) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className='flex justify-end'>
            <Button
              onClick={addRelationship}
              disabled={!relForm.target || !relForm.relationshipType}
            >
              Add Relationship
            </Button>
          </div>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Character</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rels?.relationships?.length ? (
              <TableRow>
                <TableCell colSpan={5}>No relationships yet</TableCell>
              </TableRow>
            ) : (
              rels.relationships.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className='font-medium'>
                      {r.characterName || r.characterId}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {r.characterSlug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingRelId === r.id ? (
                      <Input
                        value={editingRel.relationshipType}
                        onChange={e =>
                          setEditingRel((f: any) => ({
                            ...f,
                            relationshipType: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      r.relationshipType
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRelId === r.id ? (
                      <Input
                        type='number'
                        min={0}
                        max={10}
                        value={editingRel.strength}
                        onChange={e =>
                          setEditingRel((f: any) => ({
                            ...f,
                            strength: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      (r.strength ?? '-')
                    )}
                  </TableCell>
                  <TableCell className='capitalize'>
                    {editingRelId === r.id ? (
                      <Select
                        value={editingRel.direction}
                        onValueChange={v =>
                          setEditingRel((f: any) => ({ ...f, direction: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='mutual'>Mutual</SelectItem>
                          <SelectItem value='one-way'>One-way</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      r.direction
                    )}
                  </TableCell>
                  <TableCell className='space-x-2'>
                    {editingRelId === r.id ? (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => saveEditRel(r.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={cancelEditRel}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => startEditRel(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => deleteRelationship(r.id)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      {ConfirmDialog}
    </div>
  );
}
