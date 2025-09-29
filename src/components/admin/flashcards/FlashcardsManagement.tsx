'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Layers,
  Plus,
  Tag,
  AlertCircle,
  Sparkles,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface FlashcardDeck {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  status: string;
  visibility: string;
  isFeatured: boolean;
  tags: string[];
  categories: string[];
  cardCount: number;
  estimatedReviewMinutes?: number | null;
  analytics?: {
    reviewCount: number;
    uniqueLearners: number;
    averageRating?: number | null;
    lastReviewedAt?: string | null;
  } | null;
  linkTargets: Array<{
    scope: string;
    courseId?: string | null;
    moduleId?: string | null;
    lessonId?: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

interface FlashcardsResponse {
  decks: FlashcardDeck[];
  stats: Record<string, number>;
  total: number;
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) {
      throw new Error('Failed to load flashcard decks');
    }
    return res.json();
  });

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const statusColors: Record<string, string> = {
  draft:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  published:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  archived:
    'bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200',
};

const visibilityColors: Record<string, string> = {
  public: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  unlisted: 'bg-gray-200 text-gray-700 dark:bg-gray-800/40 dark:text-gray-200',
  private: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200',
};

interface CreateDeckForm {
  title: string;
  subtitle: string;
  description: string;
  tags: string;
  categories: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'unlisted' | 'private';
  estimatedReviewMinutes: string;
  coverImage: string;
}

const defaultForm: CreateDeckForm = {
  title: '',
  subtitle: '',
  description: '',
  tags: '',
  categories: '',
  status: 'draft',
  visibility: 'public',
  estimatedReviewMinutes: '',
  coverImage: '',
};

export default function FlashcardsManagement() {
  const router = useRouter();
  const [status, setStatus] = useState('all');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'unlisted' | 'private'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateDeckForm>(defaultForm);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  // deprecated: dialog-based manager replaced by dedicated page
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== 'all') {
      params.set('status', status);
    }
    if (visibility !== 'all') {
      params.set('visibility', visibility);
    }
    if (activeSearch) {
      params.set('search', activeSearch);
    }
    const qs = params.toString();
    return `/api/admin/flashcards${qs ? `?${qs}` : ''}`;
  }, [status, visibility, activeSearch]);

  const { data, error, isLoading, mutate } = useSWR<FlashcardsResponse>(
    query,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleStatusChange = (value: string) => setStatus(value);
  const handleVisibilityChange = (value: 'all' | 'public' | 'unlisted' | 'private') => setVisibility(value);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setStatus('all');
    setVisibility('all');
    setSearchInput('');
    setActiveSearch('');
    mutate();
  };

  const handleFormChange = (key: keyof CreateDeckForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateDeck = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for the deck.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          description: form.description.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          tags: form.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean),
          categories: form.categories
            .split(',')
            .map(category => category.trim())
            .filter(Boolean),
          status: form.status,
          visibility: form.visibility,
          estimatedReviewMinutes: form.estimatedReviewMinutes
            ? Number(form.estimatedReviewMinutes)
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to create deck');
      }

      toast({
        title: 'Deck created',
        description: 'Flashcard deck saved successfully.',
      });
      setCreateOpen(false);
      setForm(defaultForm);
      const created = await response.json().catch(() => null);
      mutate();
      if (created?.id) {
        router.push(`/admin/flashcards/${created.id}`);
      }
    } catch (err) {
      toast({
        title: 'Unable to create deck',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // manage handled by Link buttons below

  const handleDeleteDeck = async (deckId: string) => {
    const confirmed = await confirm({
      title: 'Delete deck?',
      description: 'This will delete the deck and all cards inside it.',
      confirmText: 'Delete deck',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/flashcards/${deckId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to delete deck');
      }

      toast({ title: 'Deck deleted', description: 'Flashcard deck removed.' });
      mutate();
    } catch (err) {
      toast({
        title: 'Unable to delete deck',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const toggleSelect = (deckId: string, checked?: boolean) => {
    setSelectedIds(prev => {
      const exists = prev.includes(deckId);
      if (typeof checked === 'boolean') {
        if (checked && !exists) return [...prev, deckId];
        if (!checked && exists) return prev.filter(id => id !== deckId);
        return prev;
      }
      return exists ? prev.filter(id => id !== deckId) : [...prev, deckId];
    });
  };

  const selectVisible = () => {
    if (data?.decks) setSelectedIds(data.decks.map(d => d.id));
  };

  const bulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: 'Delete selected?',
      description: `Permanently delete ${selectedIds.length} deck(s)? This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      setIsBulkProcessing(true);
      await Promise.all(
        selectedIds.map(id => fetch(`/api/admin/flashcards/${id}`, { method: 'DELETE' }))
      );
      toast({ title: 'Deleted', description: `${selectedIds.length} deck(s) deleted` });
      setSelectedIds([]);
      mutate();
    } catch (err) {
      toast({
        title: 'Bulk delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
    setIsBulkProcessing(false);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Flashcard Decks
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Curate study decks, attach them to courses, and monitor learner
            engagement.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Reset filters
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> New deck
          </Button>
        </div>
      </div>

      <Tabs
        value={status}
        onValueChange={handleStatusChange}
        className='w-full'
      >
        <TabsList className='w-full overflow-x-auto justify-start'>
          {statusTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className='px-4'>
              {tab.label}
              {tab.value !== 'all' && data?.stats?.[tab.value] !== undefined ? (
                <span className='ml-2 text-xs text-gray-400'>
                  {data?.stats?.[tab.value] ?? 0}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={status} className='mt-4'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
            <form
              onSubmit={handleSearchSubmit}
              className='flex w-full md:w-auto gap-2'
            >
              <Input
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder='Search decks by title or slug'
                className='min-w-[220px]'
              />
              <Button type='submit'>Search</Button>
            </form>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-600 dark:text-gray-300'>Visibility</span>
                <Select value={visibility} onValueChange={v => handleVisibilityChange(v as any)}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Visibility' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='public'>Public</SelectItem>
                    <SelectItem value='unlisted'>Unlisted</SelectItem>
                    <SelectItem value='private'>Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Showing {data?.total ?? 0} deck{(data?.total ?? 0) === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className='grid gap-4 md:grid-cols-2'>
              {[1, 2, 3, 4].map(key => (
                <Card
                  key={key}
                  className='border border-gray-200 dark:border-gray-800'
                >
                  <CardHeader>
                    <Skeleton className='h-6 w-2/3' />
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-4 w-full' />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className='flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'>
              <AlertCircle className='h-5 w-5' />
              <span>{error.message}</span>
            </div>
          ) : data && data.decks.length === 0 ? (
            <Card className='border border-dashed border-gray-300 dark:border-gray-700'>
              <CardContent className='py-12 text-center space-y-3'>
                <Sparkles className='mx-auto h-10 w-10 text-gray-400 dark:text-gray-600' />
                <p className='text-gray-500 dark:text-gray-400'>
                  No flashcard decks found. Create one to get started.
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' /> Create deck
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
            {selectedIds.length > 0 ? (
              <div className='p-4 mb-4 border rounded-md flex items-center justify-between bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
                <div className='text-sm text-gray-700 dark:text-gray-300'>
                  {selectedIds.length} selected
                </div>
                <div className='flex items-center gap-2'>
                  <Button variant='outline' size='sm' onClick={selectVisible} disabled={isBulkProcessing}>
                    Select visible
                  </Button>
                  <Button variant='destructive' size='sm' onClick={bulkDeleteSelected} disabled={isBulkProcessing}>
                    {isBulkProcessing ? 'Deleting…' : 'Delete selected'}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className='grid gap-4 md:grid-cols-2'>
              {data?.decks.map(deck => (
                <Card
                  key={deck.id}
                  className='border border-gray-200 dark:border-gray-800 shadow-sm'
                >
                  <CardHeader className='space-y-2'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-start gap-2'>
                        <input
                          type='checkbox'
                          className='mt-1.5 h-4 w-4'
                          checked={selectedIds.includes(deck.id)}
                          onChange={e => toggleSelect(deck.id, e.target.checked)}
                        />
                        <CardTitle className='text-xl'>{deck.title}</CardTitle>
                      </div>
                      <div className='flex gap-2'>
                        <Badge
                          className={
                            statusColors[deck.status] ??
                            'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }
                        >
                          {deck.status}
                        </Badge>
                        <Badge
                          className={
                            visibilityColors[deck.visibility] ??
                            'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }
                        >
                          {deck.visibility}
                        </Badge>
                      </div>
                    </div>
                    {deck.subtitle ? (
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {deck.subtitle}
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {deck.description ? (
                      <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-3'>
                        {deck.description}
                      </p>
                    ) : (
                      <p className='text-sm text-gray-500 dark:text-gray-500 italic'>
                        No description provided.
                      </p>
                    )}
                    <div className='flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400'>
                      <span className='flex items-center gap-1'>
                        <Layers className='h-4 w-4' /> {deck.cardCount} card
                        {deck.cardCount === 1 ? '' : 's'}
                      </span>
                      {deck.estimatedReviewMinutes ? (
                        <span>{deck.estimatedReviewMinutes} min review</span>
                      ) : null}
                      {deck.analytics?.reviewCount ? (
                        <span>{deck.analytics.reviewCount} total reviews</span>
                      ) : null}
                    </div>
                    {deck.tags.length > 0 ? (
                      <div className='space-y-1'>
                        <div className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                          Tags
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {deck.tags.map(tag => (
                            <Badge key={tag} variant='secondary'>
                              <Tag className='mr-1 h-3 w-3' />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {deck.categories.length > 0 ? (
                      <div className='space-y-1'>
                        <div className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                          Categories
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {deck.categories.map(category => (
                            <Badge key={category} variant='outline'>
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {deck.linkTargets.length > 0 ? (
                      <div className='space-y-1'>
                        <div className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                          Linked content
                        </div>
                        <div className='flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300'>
                          {deck.linkTargets.map((target, index) => (
                            <Badge
                              key={`${deck.id}-target-${index}`}
                              variant='outline'
                              className='capitalize'
                            >
                              {target.scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className='flex items-center justify-between border-t border-dashed pt-3 text-sm text-gray-500 dark:text-gray-400'>
                      <span>
                        Updated {new Date(deck.updatedAt).toLocaleDateString()}
                      </span>
                      <div className='flex items-center gap-2'>
                        {deck.publishedAt ? (
                          <span>
                            Published{' '}
                            {new Date(deck.publishedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>Not yet published</span>
                        )}
                        <Link href={`/admin/flashcards/${deck.id}`}>
                          <Button size='sm' variant='outline'>
                            <Settings className='mr-1 h-4 w-4' /> Manage
                          </Button>
                        </Link>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => handleDeleteDeck(deck.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Create flashcard deck</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                Title
              </label>
              <Input
                value={form.title}
                onChange={event =>
                  handleFormChange('title', event.target.value)
                }
                placeholder='e.g. REST API Fundamentals'
                required
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                Subtitle
              </label>
              <Input
                value={form.subtitle}
                onChange={event =>
                  handleFormChange('subtitle', event.target.value)
                }
                placeholder='Optional tagline displayed on cards'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={event =>
                  handleFormChange('description', event.target.value)
                }
                placeholder='Summarize what learners will review.'
                rows={4}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Status
                </label>
                <Select
                  value={form.status}
                  onValueChange={value => handleFormChange('status', value)}
                >
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
                <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Visibility
                </label>
                <Select
                  value={form.visibility}
                  onValueChange={value => handleFormChange('visibility', value)}
                >
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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Tags
                </label>
                <Input
                  value={form.tags}
                  onChange={event =>
                    handleFormChange('tags', event.target.value)
                  }
                  placeholder='Comma separated (e.g. api,rest,json)'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Categories
                </label>
                <Input
                  value={form.categories}
                  onChange={event =>
                    handleFormChange('categories', event.target.value)
                  }
                  placeholder='Comma separated categories'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Est. minutes
                </label>
                <Input
                  type='number'
                  min={0}
                  value={form.estimatedReviewMinutes}
                  onChange={event =>
                    handleFormChange(
                      'estimatedReviewMinutes',
                      event.target.value
                    )
                  }
                  placeholder='e.g. 15'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Cover image URL
                </label>
                <Input
                  value={form.coverImage}
                  onChange={event =>
                    handleFormChange('coverImage', event.target.value)
                  }
                  placeholder='https://'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeck}>
              <Plus className='mr-2 h-4 w-4' /> Create deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog-based manager removed in favor of dedicated page */}

      {ConfirmDialog}
    </div>
  );
}
