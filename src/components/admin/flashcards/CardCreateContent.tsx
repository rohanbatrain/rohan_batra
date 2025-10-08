'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import CardForm from './CardForm';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cardTemplates, type CardTemplate } from '@/lib/flashcards/card-templates';

interface DeckDetail {
  id: string;
  title: string;
  cardCount: number;
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to load deck');
    return res.json();
  });

export default function CardCreateContent({ deckId }: { deckId: string }) {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  const { data: deck, error, isLoading } = useSWR<DeckDetail>(
    `/api/admin/flashcards/${deckId}`,
    fetcher
  );

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

  // Calculate next order number
  const nextOrder = (deck?.cardCount || 0) + 1;

  const handleTemplateSelect = (template: CardTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  // Show template picker first time
  if (showTemplates && !selectedTemplate) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              Choose a Template
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Start with a template or create a blank card
            </p>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {cardTemplates.map((template) => (
            <Card
              key={template.id}
              className='cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-500 dark:hover:border-blue-400'
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      {template.id === 'blank' ? (
                        <Lightbulb className='h-5 w-5' />
                      ) : (
                        <Lightbulb className='h-5 w-5 text-yellow-500' />
                      )}
                      {template.name}
                    </CardTitle>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {template.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  {template.description}
                </p>
                {template.suggestedTags && template.suggestedTags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mt-3'>
                    {template.suggestedTags.map((tag) => (
                      <Badge key={tag} variant='secondary' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const template = selectedTemplate || cardTemplates[0]; // blank template

  return (
    <div>
      {selectedTemplate && selectedTemplate.id !== 'blank' && (
        <div className='p-4 mb-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Lightbulb className='h-5 w-5 text-yellow-500' />
              <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                Using template: {selectedTemplate.name}
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSelectedTemplate(null);
                setShowTemplates(true);
              }}
            >
              Change template
            </Button>
          </div>
        </div>
      )}
      <CardForm
        deckId={deckId}
        mode='create'
        deckTitle={deck?.title}
        template={template}
        initialData={{
          type: template.type,
          promptText: template.promptPlaceholder,
          responseText: template.responsePlaceholder,
          hint: template.hintPlaceholder || '',
          explanation: template.explanationPlaceholder || '',
          tags: template.suggestedTags?.join(', ') || '',
          order: nextOrder.toString(),
        }}
      />
    </div>
  );
}
