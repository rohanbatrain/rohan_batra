'use client';

import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RemoteLinkPicker, { AssetLinkItem } from '@/components/ui/RemoteLinkPicker';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminCharacterDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR(`/api/admin/characters/${params.id}`, fetcher);
  const { data: journals, mutate: mutateJournals } = useSWR(`/api/admin/characters/${params.id}/journals`, fetcher);
  const [form, setForm] = useState<any>({});
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (data?.character) setForm({ ...data.character });
  }, [data]);

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
    const res = await fetch(`/api/admin/characters/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) mutate();
  }

  async function moveToTrash() {
    const ok = confirm('Move this character to trash?');
    if (!ok) return;
    const res = await fetch(`/api/admin/characters/${params.id}?trash=true`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/characters');
  }

  async function createJournal() {
    if (!newTitle) return;
    setCreating(true);
    const payload = { title: newTitle, content: '<p></p>', status: 'draft' };
    const res = await fetch(`/api/admin/characters/${params.id}/journals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setCreating(false);
    if (res.ok) {
      setNewTitle('');
      mutateJournals();
    }
  }

  async function deleteJournal(id: string) {
    const ok = confirm('Move this journal to trash?');
    if (!ok) return;
    const res = await fetch(`/api/admin/journals/${id}?trash=true`, { method: 'DELETE' });
    if (res.ok) mutateJournals();
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
          <Button variant='outline' onClick={() => router.push('/admin/characters')}>Back</Button>
          <Button variant='destructive' onClick={moveToTrash}>Move to Trash</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='p-4 space-y-3'>
          <h2 className='font-medium'>Basics</h2>
          <div className='flex items-center gap-3'>
            {form.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatar} alt='Avatar' className='h-16 w-16 rounded object-cover border' />
            ) : (
              <div className='h-16 w-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500'>No Avatar</div>
            )}
            <Button variant='outline' onClick={() => setPickerOpen(true)}>Pick Avatar</Button>
          </div>
          <Input placeholder='Name' value={form.name || ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
          <Input placeholder='Full Name' value={form.fullName || ''} onChange={e => setForm((f: any) => ({ ...f, fullName: e.target.value }))} />
          <Input placeholder='Slug' value={form.slug || ''} onChange={e => setForm((f: any) => ({ ...f, slug: e.target.value }))} />
          <div className='flex gap-3'>
            <Select value={form.visibility} onValueChange={v => setForm((f: any) => ({ ...f, visibility: v }))}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Visibility' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='private'>Private</SelectItem>
                <SelectItem value='public'>Public</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.role} onValueChange={v => setForm((f: any) => ({ ...f, role: v }))}>
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
          <Select value={form.significance} onValueChange={v => setForm((f: any) => ({ ...f, significance: v }))}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Significance' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='major'>Major</SelectItem>
              <SelectItem value='minor'>Minor</SelectItem>
              <SelectItem value='background'>Background</SelectItem>
            </SelectContent>
          </Select>
          <Input type='number' placeholder='Age' value={form.age ?? ''} onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))} />
        </Card>

        <Card className='p-4 space-y-3'>
          <h2 className='font-medium'>Details</h2>
          <Textarea placeholder='Description (Rich HTML)' rows={5} value={form.description || ''} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} />
          <Textarea placeholder='Personality (Rich HTML)' rows={5} value={form.personality || ''} onChange={e => setForm((f: any) => ({ ...f, personality: e.target.value }))} />
          <Textarea placeholder='Background (Rich HTML)' rows={5} value={form.background || ''} onChange={e => setForm((f: any) => ({ ...f, background: e.target.value }))} />
        </Card>
      </div>

      <Card className='p-0 overflow-hidden'>
        <div className='p-4 flex items-center justify-between'>
          <div>
            <h2 className='font-medium'>Journals</h2>
            <p className='text-sm text-muted-foreground'>Create drafts and manage published entries.</p>
          </div>
          <div className='flex gap-2 items-center'>
            <Input placeholder='New journal title' value={newTitle} onChange={e => setNewTitle(e.target.value)} className='w-64' />
            <Button onClick={createJournal} disabled={creating || !newTitle}>Create</Button>
          </div>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!journals?.journals?.length ? (
              <TableRow>
                <TableCell colSpan={4}>No journals yet</TableCell>
              </TableRow>
            ) : (
              journals.journals.map((j: any) => (
                <TableRow key={j.id}>
                  <TableCell className='font-medium'>{j.title}</TableCell>
                  <TableCell className='capitalize'>{j.status}</TableCell>
                  <TableCell>{j.publishedAt ? new Date(j.publishedAt).toLocaleString() : '-'}</TableCell>
                  <TableCell className='space-x-2'>
                    <Button size='sm' variant='destructive' onClick={() => deleteJournal(j.id)}>Trash</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
