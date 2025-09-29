'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useConfirm } from '@/components/ui/confirm-dialog';

type Character = {
  id: string;
  name: string;
  fullName?: string;
  slug: string;
  visibility: 'private' | 'public';
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  significance: 'major' | 'minor' | 'background';
  age?: number;
  tags?: string[];
  bookId?: string | null;
  bookTitle?: string | null;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminCharactersPage() {
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>(
    'all'
  );
  const { confirm, ConfirmDialog } = useConfirm();
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (visibility !== 'all') params.set('visibility', visibility);
    return `/api/admin/characters?${params.toString()}`;
  }, [search, visibility]);

  const { data, isLoading, mutate } = useSWR(query, fetcher);

  async function createQuick() {
    const name = prompt('Character name');
    if (!name) return;
    const role = 'supporting';
    const payload = {
      name,
      role,
      description: '<p></p>',
      personality: '<p></p>',
      background: '<p></p>',
    };
    const res = await fetch('/api/admin/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) mutate();
  }

  async function moveToTrash(id: string) {
    const ok = await confirm({
      title: 'Move to trash?',
      description: 'You can permanently delete it later from Trash.',
      confirmText: 'Move to Trash',
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/characters/${id}?trash=true`, {
      method: 'DELETE',
    });
    if (res.ok) mutate();
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Characters</h1>
        <div className='space-x-2'>
          <Link href='/admin/characters/new'>
            <Button>New Character</Button>
          </Link>
        </div>
      </div>

      <Card className='p-4'>
        <div className='flex gap-3 items-center'>
          <Input
            placeholder='Search name, tags'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='max-w-sm'
          />
          <Select
            value={visibility}
            onValueChange={v => setVisibility(v as any)}
          >
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Visibility' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='public'>Public</SelectItem>
              <SelectItem value='private'>Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Separator />

      <Card className='p-0 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : !data?.characters?.length ? (
              <TableRow>
                <TableCell colSpan={6}>No characters found</TableCell>
              </TableRow>
            ) : (
              data.characters.map((c: Character) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className='flex flex-col'>
                      <Link
                        href={`/admin/characters/${c.id}`}
                        className='font-medium text-blue-600 hover:underline'
                      >
                        {c.name}
                      </Link>
                      <span className='text-xs text-muted-foreground'>
                        {c.slug}
                        {c.bookTitle ? ` • Attached to ${c.bookTitle}` : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='capitalize'>{c.role}</TableCell>
                  <TableCell className='capitalize'>{c.visibility}</TableCell>
                  <TableCell>
                    {c.bookId ? (
                      <Link
                        href={`/admin/books/${c.bookId}`}
                        className='text-blue-600 hover:underline'
                      >
                        {c.bookTitle || 'View book'}
                      </Link>
                    ) : (
                      <span className='text-muted-foreground'>—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='space-x-2'>
                    <Link href={`/admin/characters/${c.id}`}>
                      <Button size='sm' variant='outline'>
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => moveToTrash(c.id)}
                    >
                      Move to Trash
                    </Button>
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
