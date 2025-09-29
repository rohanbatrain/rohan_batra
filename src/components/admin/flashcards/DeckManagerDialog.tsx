'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface DeckDetail {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'unlisted' | 'private';
  isFeatured: boolean;
  tags: string[];
  categories: string[];
  cardCount: number;
  estimatedReviewMinutes?: number | null;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  linkTargets?: Array<{
    scope: string;
    courseId?: string | null;
    moduleId?: string | null;
    lessonId?: string | null;
  }>;
  cards?: FlashcardCard[];
}

interface FlashcardCard {
  id: string;
  deckId: string;
  type: 'basic' | 'cloze' | 'qa' | 'image';
  prompt: {
    text?: string | null;
    richText?: string | null;
  };
  response: {
    text?: string | null;
    richText?: string | null;
  };
  hint?: string | null;
  explanation?: string | null;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface DeckManagerDialogProps {
  deckId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

interface DeckFormState {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'unlisted' | 'private';
  isFeatured: boolean;
  tags: string;
  categories: string;
  estimatedReviewMinutes: string;
  coverImage: string;
}

const defaultDeckForm: DeckFormState = {
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  status: 'draft',
  visibility: 'public',
  isFeatured: false,
  tags: '',
  categories: '',
  estimatedReviewMinutes: '',
  coverImage: '',
};

interface CardFormState {
  type: 'basic' | 'cloze' | 'qa' | 'image';
  prompt: string;
  response: string;
  hint: string;
  explanation: string;
  tags: string;
  order: string;
}

const defaultCardForm: CardFormState = {
  type: 'basic',
  prompt: '',
  response: '',
  hint: '',
  explanation: '',
  tags: '',
  order: '',
};

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) {
      throw new Error('Failed to load deck');
    }
    return res.json();
  });

export function DeckManagerDialog({
  deckId,
  open,
  onOpenChange,
  onChanged,
}: DeckManagerDialogProps) {
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [deckForm, setDeckForm] = useState<DeckFormState>(defaultDeckForm);
  const [cardForm, setCardForm] = useState<CardFormState>(defaultCardForm);
  const [editingCard, setEditingCard] = useState<FlashcardCard | null>(null);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [savingDeck, setSavingDeck] = useState(false);
  const [savingCard, setSavingCard] = useState(false);

  const deckDetailQuery = useMemo(() => {
    if (!open || !deckId) return null;
    return `/api/admin/flashcards/${deckId}?includeCards=true`;
  }, [deckId, open]);

  const { data, error, isLoading, mutate } = useSWR<
    { id: string } & DeckDetail
  >(deckDetailQuery, fetcher, {
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!open) {
      setDeckForm(defaultDeckForm);
      setCardForm(defaultCardForm);
      setEditingCard(null);
      setCardDialogOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (data?.id) {
      setDeckForm({
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle ?? '',
        description: data.description ?? '',
        status: data.status,
        visibility: data.visibility,
        isFeatured: data.isFeatured,
        tags: data.tags.join(', '),
        categories: data.categories.join(', '),
        estimatedReviewMinutes: data.estimatedReviewMinutes?.toString() ?? '',
        coverImage: data.coverImage ?? '',
      });
    }
  }, [data?.id]);

  const parseCommaSeparated = (value: string) =>
    value
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean);

  const handleDeckFieldChange = <K extends keyof DeckFormState>(
    key: K,
    value: DeckFormState[K]
  ) => {
    setDeckForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCardFieldChange = <K extends keyof CardFormState>(
    key: K,
    value: CardFormState[K]
  ) => {
    setCardForm(prev => ({ ...prev, [key]: value }));
  };

  const saveDeck = async () => {
    if (!deckId) return;
    if (!deckForm.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a deck title.',
        variant: 'destructive',
      });
      return;
    }
    if (!deckForm.slug.trim()) {
      toast({
        title: 'Slug required',
        description: 'Decks require a slug identifier.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingDeck(true);
      const payload: Record<string, unknown> = {
        title: deckForm.title.trim(),
        slug: deckForm.slug.trim(),
        subtitle: deckForm.subtitle.trim() || undefined,
        description: deckForm.description.trim() || undefined,
        status: deckForm.status,
        visibility: deckForm.visibility,
        isFeatured: deckForm.isFeatured,
        tags: parseCommaSeparated(deckForm.tags),
        categories: parseCommaSeparated(deckForm.categories),
      };

      if (deckForm.estimatedReviewMinutes.trim()) {
        const minutes = Number(deckForm.estimatedReviewMinutes.trim());
        if (!Number.isNaN(minutes) && minutes >= 0) {
          payload.estimatedReviewMinutes = minutes;
        }
      } else {
        payload.estimatedReviewMinutes = null;
      }

      payload.coverImage = deckForm.coverImage.trim() || undefined;

      const response = await fetch(`/api/admin/flashcards/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to update deck');
      }

      toast({
        title: 'Deck updated',
        description: 'Flashcard deck saved successfully.',
      });
      await mutate();
      onChanged?.();
    } catch (err) {
      toast({
        title: 'Unable to update deck',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSavingDeck(false);
    }
  };

  const deleteDeck = async () => {
    if (!deckId) return;
    const confirmed = await confirm({
      title: 'Delete deck?',
      description:
        'This will remove the deck and all cards. This action cannot be undone.',
      confirmText: 'Delete deck',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/flashcards/${deckId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to delete deck');
      }

      toast({ title: 'Deck deleted', description: 'Flashcard deck removed.' });
      onChanged?.();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Unable to delete deck',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const openCreateCard = () => {
    setEditingCard(null);
    setCardForm(defaultCardForm);
    setCardDialogOpen(true);
  };

  const openEditCard = (card: FlashcardCard) => {
    setEditingCard(card);
    setCardForm({
      type: card.type,
      prompt: card.prompt.text ?? card.prompt.richText ?? '',
      response: card.response.text ?? card.response.richText ?? '',
      hint: card.hint ?? '',
      explanation: card.explanation ?? '',
      tags: card.tags.join(', '),
      order: card.order.toString(),
    });
    setCardDialogOpen(true);
  };

  const saveCard = async () => {
    if (!deckId) return;
    if (!cardForm.prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Enter prompt text.',
        variant: 'destructive',
      });
      return;
    }
    if (!cardForm.response.trim()) {
      toast({
        title: 'Response required',
        description: 'Enter response text.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingCard(true);
      const payload: Record<string, unknown> = {
        type: cardForm.type,
        prompt: { text: cardForm.prompt.trim() },
        response: { text: cardForm.response.trim() },
        hint: cardForm.hint.trim() || undefined,
        explanation: cardForm.explanation.trim() || undefined,
        tags: parseCommaSeparated(cardForm.tags),
      };

      if (cardForm.order.trim()) {
        const order = Number(cardForm.order);
        if (!Number.isNaN(order) && order >= 0) {
          payload.order = order;
        }
      }

      const endpoint = editingCard
        ? `/api/admin/flashcards/${deckId}/cards/${editingCard.id}`
        : `/api/admin/flashcards/${deckId}/cards`;

      const method = editingCard ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to save card');
      }

      toast({
        title: editingCard ? 'Card updated' : 'Card created',
        description: editingCard
          ? 'Flashcard updated successfully.'
          : 'New flashcard added to deck.',
      });
      await mutate();
      setCardDialogOpen(false);
      setEditingCard(null);
      setCardForm(defaultCardForm);
    } catch (err) {
      toast({
        title: 'Unable to save card',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSavingCard(false);
    }
  };

  const deleteCard = async (card: FlashcardCard) => {
    if (!deckId) return;
    const confirmed = await confirm({
      title: 'Delete flashcard?',
      description: 'This flashcard will be removed from the deck.',
      confirmText: 'Delete card',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/flashcards/${deckId}/cards/${card.id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to delete card');
      }

      toast({
        title: 'Card deleted',
        description: 'Flashcard removed from deck.',
      });
      await mutate();
    } catch (err) {
      toast({
        title: 'Unable to delete card',
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Manage flashcard deck</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-64 w-full' />
            </div>
          ) : error ? (
            <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200'>
              {(error as Error).message}
            </div>
          ) : data ? (
            <div className='flex flex-col gap-6'>
              <section className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-3'>
                  <div>
                    <Label htmlFor='deck-title'>Title</Label>
                    <Input
                      id='deck-title'
                      value={deckForm.title}
                      onChange={event =>
                        handleDeckFieldChange('title', event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='deck-slug'>Slug</Label>
                    <Input
                      id='deck-slug'
                      value={deckForm.slug}
                      onChange={event =>
                        handleDeckFieldChange('slug', event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='deck-subtitle'>Subtitle</Label>
                    <Input
                      id='deck-subtitle'
                      value={deckForm.subtitle}
                      onChange={event =>
                        handleDeckFieldChange('subtitle', event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='deck-description'>Description</Label>
                    <Textarea
                      id='deck-description'
                      value={deckForm.description}
                      onChange={event =>
                        handleDeckFieldChange('description', event.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={deckForm.status}
                        onValueChange={value =>
                          handleDeckFieldChange(
                            'status',
                            value as DeckFormState['status']
                          )
                        }
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
                    <div>
                      <Label>Visibility</Label>
                      <Select
                        value={deckForm.visibility}
                        onValueChange={value =>
                          handleDeckFieldChange(
                            'visibility',
                            value as DeckFormState['visibility']
                          )
                        }
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
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <Label htmlFor='deck-tags'>Tags</Label>
                      <Input
                        id='deck-tags'
                        placeholder='Comma separated'
                        value={deckForm.tags}
                        onChange={event =>
                          handleDeckFieldChange('tags', event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='deck-categories'>Categories</Label>
                      <Input
                        id='deck-categories'
                        placeholder='Comma separated'
                        value={deckForm.categories}
                        onChange={event =>
                          handleDeckFieldChange(
                            'categories',
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <Label htmlFor='deck-estimated'>Estimated minutes</Label>
                      <Input
                        id='deck-estimated'
                        type='number'
                        min={0}
                        value={deckForm.estimatedReviewMinutes}
                        onChange={event =>
                          handleDeckFieldChange(
                            'estimatedReviewMinutes',
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='deck-cover'>
                        Cover image URL or shortcode
                      </Label>
                      <Input
                        id='deck-cover'
                        value={deckForm.coverImage}
                        onChange={event =>
                          handleDeckFieldChange(
                            'coverImage',
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className='flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 dark:border-gray-700'>
                    <div>
                      <Label className='text-sm font-medium'>
                        Feature this deck
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        Featured decks can be spotlighted in landing sections.
                      </p>
                    </div>
                    <Switch
                      checked={deckForm.isFeatured}
                      onCheckedChange={checked =>
                        handleDeckFieldChange('isFeatured', checked)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Flashcards</h3>
                  <Button size='sm' onClick={openCreateCard}>
                    Add card
                  </Button>
                </div>
                {data.cards && data.cards.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[120px]'>Type</TableHead>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className='w-[90px] text-right'>
                          Order
                        </TableHead>
                        <TableHead className='w-[160px] text-right'>
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.cards.map(card => (
                        <TableRow key={card.id}>
                          <TableCell className='capitalize'>
                            {card.type}
                          </TableCell>
                          <TableCell className='max-w-xs truncate'>
                            {card.prompt.text ?? card.prompt.richText ?? '—'}
                          </TableCell>
                          <TableCell className='max-w-xs truncate'>
                            {card.response.text ??
                              card.response.richText ??
                              '—'}
                          </TableCell>
                          <TableCell className='space-x-2'>
                            {card.tags.map(tag => (
                              <Badge
                                key={`${card.id}-${tag}`}
                                variant='secondary'
                              >
                                {tag}
                              </Badge>
                            ))}
                            {card.tags.length === 0 ? (
                              <span className='text-xs text-muted-foreground'>
                                —
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className='text-right'>
                            {card.order}
                          </TableCell>
                          <TableCell className='space-x-2 text-right'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => openEditCard(card)}
                            >
                              Edit
                            </Button>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => deleteCard(card)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableCaption>
                      {data.cards.length} card
                      {data.cards.length === 1 ? '' : 's'} in this deck.
                    </TableCaption>
                  </Table>
                ) : (
                  <div className='rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-muted-foreground dark:border-gray-700'>
                    No cards yet. Use the “Add card” button to create one.
                  </div>
                )}
              </section>
            </div>
          ) : null}

          <DialogFooter className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <Button variant='destructive' onClick={deleteDeck} disabled={!data}>
              Delete deck
            </Button>
            <div className='flex items-center gap-2'>
              <DialogClose asChild>
                <Button variant='outline'>Close</Button>
              </DialogClose>
              <Button onClick={saveDeck} disabled={savingDeck || !data}>
                {savingDeck ? 'Saving…' : 'Save deck'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit flashcard' : 'Create flashcard'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <Label>Type</Label>
              <Select
                value={cardForm.type}
                onValueChange={value =>
                  handleCardFieldChange('type', value as CardFormState['type'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='basic'>Basic</SelectItem>
                  <SelectItem value='qa'>Q&A</SelectItem>
                  <SelectItem value='cloze'>Cloze</SelectItem>
                  <SelectItem value='image'>Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='card-prompt'>Prompt</Label>
              <Textarea
                id='card-prompt'
                rows={3}
                value={cardForm.prompt}
                onChange={event =>
                  handleCardFieldChange('prompt', event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor='card-response'>Response</Label>
              <Textarea
                id='card-response'
                rows={3}
                value={cardForm.response}
                onChange={event =>
                  handleCardFieldChange('response', event.target.value)
                }
              />
            </div>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div>
                <Label htmlFor='card-hint'>Hint</Label>
                <Input
                  id='card-hint'
                  value={cardForm.hint}
                  onChange={event =>
                    handleCardFieldChange('hint', event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor='card-order'>Order</Label>
                <Input
                  id='card-order'
                  type='number'
                  min={0}
                  value={cardForm.order}
                  onChange={event =>
                    handleCardFieldChange('order', event.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor='card-explanation'>Explanation</Label>
              <Textarea
                id='card-explanation'
                rows={3}
                value={cardForm.explanation}
                onChange={event =>
                  handleCardFieldChange('explanation', event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor='card-tags'>Tags</Label>
              <Input
                id='card-tags'
                placeholder='Comma separated tags'
                value={cardForm.tags}
                onChange={event =>
                  handleCardFieldChange('tags', event.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter className='mt-6'>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button onClick={saveCard} disabled={savingCard}>
              {savingCard
                ? 'Saving…'
                : editingCard
                  ? 'Save changes'
                  : 'Create card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {ConfirmDialog}
    </>
  );
}
