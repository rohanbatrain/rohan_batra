'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import DatePickerInput from '@/components/ui/DatePickerInput';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';
import { InfoTip } from '@/components/ui/tooltip';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminJournalManager({ params }: { params: Promise<{ id: string; journalId: string }> }) {
  const router = useRouter();
  const [p, setP] = useState<{ id: string; journalId: string } | null>(null);
  useEffect(() => { (async () => setP(await params))(); }, [params]);
  const { data: vol, mutate: mutateVol } = useSWR(() => (p ? `/api/admin/journal-volumes/${p.journalId}` : null), fetcher);
  const { data: entries, mutate } = useSWR(() => (p ? `/api/admin/characters/${p.id}/journals?journalId=${p.journalId}` : null), fetcher);
  const { data: tzSetting } = useSWR('/api/admin/settings/site.timezone', fetcher);
  const { toast } = useToast();

  // Create entry
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  // simplified: no date/time inputs in header

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState<string>('');
  const [editPrivate, setEditPrivate] = useState(false);
  const [editStatus, setEditStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [saving, setSaving] = useState(false);

  // Volume edit modal state
  const [volEditOpen, setVolEditOpen] = useState(false);
  const [volTitle, setVolTitle] = useState('');
  const [volDescription, setVolDescription] = useState('');
  const [volPrivate, setVolPrivate] = useState(false);
  const [volStatus, setVolStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [volSaving, setVolSaving] = useState(false);

  useEffect(() => {
    if (vol?.journal) {
      setVolTitle(vol.journal.title || '');
      setVolDescription(vol.journal.description || '');
      setVolPrivate(!!vol.journal.isPrivate);
      setVolStatus(vol.journal.status || 'draft');
    }
  }, [vol]);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    const list: any[] = entries?.journals || [];
    for (const j of list) {
      const key = j.entryDate ? new Date(j.entryDate).toISOString().slice(0, 10) : 'No date';
      if (!map[key]) map[key] = [];
      map[key].push(j);
    }
    const keys = Object.keys(map).sort((a, b) => {
      if (a === 'No date') return 1;
      if (b === 'No date') return -1;
      return a < b ? 1 : a > b ? -1 : 0;
    });
    return { keys, map };
  }, [entries]);

  // utility retained for inline edit where date exists
  function toIsoFromDateTime(dateStr?: string, timeStr?: string) { /* ...existing code... */ return undefined as any; }

  async function createEntry() {
    if (!p || !newTitle) return;
    setCreating(true);
  const body: any = { title: newTitle, journalId: p.journalId };
    const res = await fetch(`/api/admin/characters/${p.id}/journals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setCreating(false);
    if (res.ok) {
      setNewTitle('');
  // no date/time header inputs to clear
      toast({ title: 'Created', description: 'Entry created' });
      mutate();
    } else {
      const err = await res.json().catch(() => null);
      toast({ title: 'Error', description: err?.error || 'Failed to create entry', variant: 'destructive' });
    }
  }

  async function createQuickNote() {
    if (!p) return;
    const now = new Date();
    const tz: string = tzSetting?.setting?.value || 'UTC';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const find = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';
    const yyyy = find('year');
    const mm = find('month').padStart(2, '0');
    const dd = find('day').padStart(2, '0');
    const hh = find('hour').padStart(2, '0');
    const mi = find('minute').padStart(2, '0');
    const ss = find('second').padStart(2, '0');
    const autoTitle = `${yyyy}-${mm}-${dd}-${hh}-${mi}-${ss}`;
    const iso = now.toISOString();
    const res = await fetch(`/api/admin/characters/${p.id}/journals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: autoTitle, journalId: p.journalId, entryDate: iso }) });
    if (res.ok) {
      toast({ title: 'Created', description: 'Quick note created' });
      mutate();
    } else {
      const err = await res.json().catch(() => null);
      toast({ title: 'Error', description: err?.error || 'Failed to create quick note', variant: 'destructive' });
    }
  }

  function openEdit(j: any) {
    setEditing(j);
    setEditOpen(true);
    setEditTitle(j.title || '');
    setEditContent(j.content || '');
    setEditDate(j.entryDate ? new Date(j.entryDate).toISOString().slice(0,10) : '');
    setEditPrivate(!!j.isPrivate);
    setEditStatus(j.status || 'draft');
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const payload: any = { title: editTitle || undefined, content: editContent, status: editStatus, entryDate: editDate ? editDate : null, isPrivate: editPrivate };
    const res = await fetch(`/api/admin/journals/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) { setEditOpen(false); setEditing(null); mutate(); toast({ title: 'Saved', description: 'Entry updated' }); } else { const err = await res.json().catch(() => null); toast({ title: 'Error', description: err?.error || 'Failed to update', variant: 'destructive' }); }
  }

  async function togglePublish(j: any) {
    const res = await fetch(`/api/admin/journals/${j.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: j.status === 'published' ? 'draft' : 'published' }) });
    if (res.ok) mutate(); else toast({ title: 'Error', description: 'Failed to update publish', variant: 'destructive' });
  }
  async function togglePrivate(j: any, next: boolean) {
    const res = await fetch(`/api/admin/journals/${j.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPrivate: next }) });
    if (res.ok) mutate(); else toast({ title: 'Error', description: 'Failed to update privacy', variant: 'destructive' });
  }
  async function trashEntry(entryId: string) {
    const ok = confirm('Move this entry to trash?'); if (!ok) return;
    const res = await fetch(`/api/admin/journals/${entryId}?trash=true`, { method: 'DELETE' });
    if (res.ok) { mutate(); toast({ title: 'Trashed', description: 'Moved to trash' }); } else { toast({ title: 'Error', description: 'Failed to trash', variant: 'destructive' }); }
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Manage Journal</h1>
        <div className='space-x-2'>
          <Button variant='outline' onClick={() => router.back()}>Back</Button>
          <Button onClick={() => setVolEditOpen(true)}>Edit Journal</Button>
        </div>
      </div>

      <Card className='p-4 space-y-3'>
        <h2 className='font-medium'>Journal Details</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Label>Title</Label>
            <Input value={vol?.journal?.title || ''} readOnly />
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>Description</Label>
            <Textarea value={vol?.journal?.description || ''} readOnly rows={3} />
          </div>
        </div>
      </Card>

      <Card className='p-0 overflow-hidden'>
        <div className='p-4 flex flex-row flex-wrap items-center gap-2'>
          <div className='flex-1 min-w-[260px]'>
            <Label className='sr-only'>New entry title</Label>
            <div className='flex items-center gap-1'>
              <Input placeholder='New entry title' value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <InfoTip label="Draft title for the new entry. You can edit details after creating.">
                <button aria-label='Title help' className='text-muted-foreground hover:text-foreground'>
                  <Info className='h-4 w-4' />
                </button>
              </InfoTip>
            </div>
          </div>
          <InfoTip label={`Instant entry with current ${tzSetting?.setting?.value || 'UTC'} time and auto title (yyyy-mm-dd-hh-mm-ss).`}>
            <Button variant='outline' onClick={createQuickNote}>Quick Note (Now)</Button>
          </InfoTip>
          <InfoTip label="Create a draft entry with the given title.">
            <Button onClick={createEntry} disabled={creating || !newTitle}>Create</Button>
          </InfoTip>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Private</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!entries?.journals?.length ? (
              <TableRow>
                <TableCell colSpan={5}>No entries yet</TableCell>
              </TableRow>
            ) : (
              grouped.keys.map((k) => (
                <Fragment key={`grp-${k}`}>
                  <TableRow>
                    <TableCell colSpan={5} className='bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground'>
                      {k === 'No date' ? 'No date' : new Date(k).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  {grouped.map[k].map((j: any) => (
                    <TableRow key={j.id}>
                      <TableCell className='font-medium'>{j.title}</TableCell>
                      <TableCell className='capitalize'>{j.status}</TableCell>
                      <TableCell>{j.publishedAt ? new Date(j.publishedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell>
                        <Switch checked={!!j.isPrivate} onChange={(e) => togglePrivate(j, e.currentTarget.checked)} />
                      </TableCell>
                      <TableCell className='space-x-2'>
                        <Button size='sm' variant='outline' onClick={() => openEdit(j)}>Edit</Button>
                        <Button size='sm' variant='outline' onClick={() => togglePublish(j)}>
                          {j.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button size='sm' variant='destructive' onClick={() => trashEntry(j.id)}>Trash</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Volume Edit Dialog */}
      <Dialog open={volEditOpen} onOpenChange={setVolEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Journal</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='space-y-2'>
              <Label>Title</Label>
              <Input value={volTitle} onChange={(e) => setVolTitle(e.target.value)} />
            </div>
            <div className='space-y-2'>
              <Label>Description</Label>
              <Textarea rows={4} value={volDescription} onChange={(e) => setVolDescription(e.target.value)} />
            </div>
            <div className='flex items-center gap-6 pt-1'>
              <div className='flex items-center gap-2'>
                <Switch checked={volStatus === 'published'} onChange={(e) => setVolStatus(e.currentTarget.checked ? 'published' : 'draft')} />
                <span className='text-sm'>Published</span>
              </div>
              <div className='flex items-center gap-2'>
                <Switch checked={volPrivate} onChange={(e) => setVolPrivate(e.currentTarget.checked)} />
                <span className='text-sm'>Private</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='ghost' onClick={() => setVolEditOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!p) return;
              setVolSaving(true);
              const payload: any = { title: volTitle || undefined, description: volDescription, isPrivate: volPrivate, status: volStatus };
              const res = await fetch(`/api/admin/journal-volumes/${p.journalId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              setVolSaving(false);
              if (res.ok) { setVolEditOpen(false); mutateVol(); toast({ title: 'Saved', description: 'Journal updated' }); } else { const err = await res.json().catch(() => null); toast({ title: 'Error', description: err?.error || 'Failed to update journal', variant: 'destructive' }); }
            }} disabled={volSaving}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <Label>Title</Label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Label>Date</Label>
            <DatePickerInput value={editDate} onChange={setEditDate} />
            <div className='flex items-center gap-3 pt-2'>
              <div className='flex items-center gap-2'>
                <Switch checked={editStatus === 'published'} onChange={(e) => setEditStatus(e.currentTarget.checked ? 'published' : 'draft')} />
                <span className='text-sm'>Published</span>
              </div>
              <div className='flex items-center gap-2'>
                <Switch checked={editPrivate} onChange={(e) => setEditPrivate(e.currentTarget.checked)} />
                <span className='text-sm'>Private</span>
              </div>
            </div>
            <Label>Content</Label>
            <Textarea rows={8} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant='ghost' onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
