'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import CardForm from './CardForm';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface FlashcardCard {
  id: string;
  deckId: string;
  type: 'basic' | 'cloze' | 'qa' | 'image';
  prompt: { text?: string | null; richText?: string | null };
  response: { text?: string | null; richText?: string | null };
  hint?: string | null;
  explanation?: string | null;
  tags: string[];
  order: number;
}

interface DeckDetail {
  id: string;
  title: string;
  cards?: FlashcardCard[];
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to load data');
    return res.json();
  });

export default function CardEditContent({
  deckId,
  cardId,
}: {
  deckId: string;
  cardId: string;
}) {
  const { data: deck, error, isLoading } = useSWR<DeckDetail>(
    `/api/admin/flashcards/${deckId}`,
    fetcher
  );

  // Find the card in the deck
  const card = deck?.cards?.find(c => c.id === cardId);

  if (error) {
    return (
      <div className='p-6'>
        <div className='flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'>
          <AlertCircle className='h-5 w-5' />
          <span>{error.message}</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!card) {
    return (
      <div className='p-6'>
        <div className='flex items-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-600 dark:border-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-200'>
          <AlertCircle className='h-5 w-5' />
          <span>Card not found</span>
        </div>
      </div>
    );
  }

  return (
    <CardForm
      deckId={deckId}
      cardId={cardId}
      mode='edit'
      deckTitle={deck?.title}
      initialData={{
        type: card.type,
        promptText: card.prompt.text || card.prompt.richText || '',
        responseText: card.response.text || card.response.richText || '',
        hint: card.hint || '',
        explanation: card.explanation || '',
        tags: card.tags.join(', '),
        order: card.order.toString(),
      }}
    />
  );
}
