'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Grid3x3,
  List,
  Tag,
  AlertCircle,
  Copy,
  GripVertical,
  Download,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  createdAt: string;
  updatedAt: string;
}

interface DeckDetail {
  id: string;
  title: string;
  slug: string;
  cardCount: number;
  status: string;
  visibility: string;
  cards?: FlashcardCard[];
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to load cards');
    return res.json();
  });

const cardTypeLabels: Record<string, string> = {
  basic: 'Basic',
  cloze: 'Cloze',
  qa: 'Q&A',
  image: 'Image',
};

const cardTypeColors: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  cloze: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
  qa: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
  image: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
};

// Sortable row component for drag and drop
function SortableRow({
  card,
  selectedCards,
  toggleSelectCard,
  handleDuplicateCard,
  handleDeleteCard,
  deckId,
  stripHtml,
}: {
  card: FlashcardCard;
  selectedCards: string[];
  toggleSelectCard: (id: string) => void;
  handleDuplicateCard: (id: string) => void;
  handleDeleteCard: (id: string) => void;
  deckId: string;
  stripHtml: (html: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className='w-[30px] cursor-grab active:cursor-grabbing' {...attributes} {...listeners}>
        <GripVertical className='h-4 w-4 text-gray-400' />
      </TableCell>
      <TableCell className='w-[40px]'>
        <input
          type='checkbox'
          checked={selectedCards.includes(card.id)}
          onChange={() => toggleSelectCard(card.id)}
        />
      </TableCell>
      <TableCell className='font-medium'>{card.order}</TableCell>
      <TableCell>
        <Badge className={cardTypeColors[card.type]}>
          {cardTypeLabels[card.type]}
        </Badge>
      </TableCell>
      <TableCell className='max-w-xs truncate'>
        {stripHtml(card.prompt.text || card.prompt.richText || '-')}
      </TableCell>
      <TableCell className='max-w-xs truncate'>
        {stripHtml(card.response.text || card.response.richText || '-')}
      </TableCell>
      <TableCell>
        <div className='flex flex-wrap gap-1'>
          {card.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant='secondary' className='text-xs'>
              {tag}
            </Badge>
          ))}
          {card.tags.length > 2 && (
            <Badge variant='secondary' className='text-xs'>
              +{card.tags.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className='text-right'>
        <div className='flex justify-end gap-2'>
          <Link href={`/admin/flashcards/${deckId}/cards/${card.id}`}>
            <Button variant='outline' size='sm'>
              <Edit className='h-4 w-4' />
            </Button>
          </Link>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleDuplicateCard(card.id)}
            title='Duplicate card'
          >
            <Copy className='h-4 w-4' />
          </Button>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => handleDeleteCard(card.id)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function CardListContent({ deckId }: { deckId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to strip HTML tags for display
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Fetch deck and cards
  const { data: deck, error, isLoading, mutate } = useSWR<DeckDetail>(
    `/api/admin/flashcards/${deckId}`,
    fetcher
  );

  // Filter and search cards
  const filteredCards = useMemo(() => {
    if (!deck?.cards) return [];
    
    let filtered = [...deck.cards];
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(card => card.type === typeFilter);
    }
    
    // Search in prompt and response
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(card => {
        const promptText = (card.prompt.text || card.prompt.richText || '').toLowerCase();
        const responseText = (card.response.text || card.response.richText || '').toLowerCase();
        return promptText.includes(search) || responseText.includes(search);
      });
    }
    
    // Sort by order
    return filtered.sort((a, b) => a.order - b.order);
  }, [deck?.cards, typeFilter, searchTerm]);

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!deck?.cards) return [];
    const tagSet = new Set<string>();
    deck.cards.forEach(card => {
      card.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [deck?.cards]);

  const handleDeleteCard = async (cardId: string) => {
    const confirmed = await confirm({
      title: 'Delete card?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/flashcards/${deckId}/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to delete card');
      }

      toast({
        title: 'Card deleted',
        description: 'The card has been removed.',
      });
      mutate();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete selected cards?',
      description: `This will permanently delete ${selectedCards.length} card(s).`,
      confirmText: 'Delete',
      destructive: true,
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/flashcards/${deckId}/cards/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCards }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to delete cards');
      }

      const result = await response.json();

      toast({
        title: 'Cards deleted',
        description: `${result.deleted} card(s) removed. ${result.remainingCards} card(s) remaining.`,
      });
      
      setSelectedCards([]);
      mutate();
    } catch (err) {
      toast({
        title: 'Bulk delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/admin/flashcards/${deckId}/cards/${cardId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to duplicate card');
      }

      toast({
        title: 'Card duplicated',
        description: 'A copy of the card has been created.',
      });
      mutate();
    } catch (err) {
      toast({
        title: 'Duplicate failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const toggleSelectCard = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const selectAllVisible = () => {
    setSelectedCards(filteredCards.map(card => card.id));
  };

  const deselectAll = () => {
    setSelectedCards([]);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredCards.findIndex(card => card.id === active.id);
    const newIndex = filteredCards.findIndex(card => card.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update the UI
    const newCards = arrayMove(filteredCards, oldIndex, newIndex);
    
    // Update the local state immediately for smooth UX
    mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          cards: newCards,
        };
      },
      false // Don't revalidate immediately
    );

    try {
      // Send the new order to the server
      const cardIds = newCards.map(card => card.id);
      const response = await fetch(`/api/admin/flashcards/${deckId}/cards/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to save new order');
      }

      toast({
        title: 'Order updated',
        description: 'Card order has been saved.',
      });

      // Revalidate to ensure consistency
      mutate();
    } catch (err) {
      toast({
        title: 'Reorder failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
      // Revert on error
      mutate();
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/flashcards/${deckId}/cards/export?format=${format}`);

      if (!response.ok) {
        throw new Error('Failed to export cards');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `cards.${format}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: `Cards exported as ${format.toUpperCase()}`,
      });
    } catch (err) {
      toast({
        title: 'Export failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

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
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {ConfirmDialog}

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Link href={`/admin/flashcards/${deckId}`}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Deck
            </Button>
          </Link>
        </div>
        
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              {deck?.title} - Cards
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Manage flashcard cards for this deck
            </p>
          </div>
          <Link href={`/admin/flashcards/${deckId}/cards/create`}>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Card
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search in prompt or response...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Card Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='basic'>Basic</SelectItem>
                <SelectItem value='cloze'>Cloze</SelectItem>
                <SelectItem value='qa'>Q&A</SelectItem>
                <SelectItem value='image'>Image</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className='flex gap-2'>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('table')}
              >
                <List className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className='h-4 w-4' />
              </Button>
            </div>

            {/* Export Buttons */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleExport('json')}
                title='Export as JSON'
              >
                <Download className='mr-2 h-4 w-4' />
                JSON
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleExport('csv')}
                title='Export as CSV'
              >
                <Download className='mr-2 h-4 w-4' />
                CSV
              </Button>
            </div>
          </div>

          {/* Active Filters Info */}
          <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-300'>
            <span>
              Showing {filteredCards.length} of {deck?.cards?.length || 0} cards
            </span>
            {(searchTerm || typeFilter !== 'all') && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCards.length > 0 && (
        <Card className='bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'>
          <CardContent className='pt-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                {selectedCards.length} card{selectedCards.length === 1 ? '' : 's'} selected
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm' onClick={selectAllVisible}>
                  Select visible
                </Button>
                <Button variant='outline' size='sm' onClick={deselectAll}>
                  Deselect all
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={handleBulkDelete}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Display */}
      {filteredCards.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center space-y-3'>
            <p className='text-gray-500 dark:text-gray-400'>
              {deck?.cards?.length === 0
                ? 'No cards yet. Click "Add Card" to create one.'
                : 'No cards match your filters.'}
            </p>
            <Link href={`/admin/flashcards/${deckId}/cards/create`}>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Card
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={() => setIsDragging(true)}
        >
          <Card>
            <Table>
              <TableCaption>
                {filteredCards.length} card{filteredCards.length === 1 ? '' : 's'}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[30px]'></TableHead>
                  <TableHead className='w-[40px]'>
                    <input
                      type='checkbox'
                      checked={
                        filteredCards.length > 0 &&
                        filteredCards.every(card => selectedCards.includes(card.id))
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          selectAllVisible();
                        } else {
                          deselectAll();
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={filteredCards.map(card => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredCards.map(card => (
                    <SortableRow
                      key={card.id}
                      card={card}
                      selectedCards={selectedCards}
                      toggleSelectCard={toggleSelectCard}
                      handleDuplicateCard={handleDuplicateCard}
                      handleDeleteCard={handleDeleteCard}
                      deckId={deckId}
                      stripHtml={stripHtml}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </Card>
        </DndContext>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredCards.map(card => (
            <Card key={card.id} className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <input
                    type='checkbox'
                    checked={selectedCards.includes(card.id)}
                    onChange={() => toggleSelectCard(card.id)}
                    className='mt-1'
                  />
                  <div className='flex gap-2'>
                    <Badge className={cardTypeColors[card.type]}>
                      {cardTypeLabels[card.type]}
                    </Badge>
                    <Badge variant='outline'>#{card.order}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>
                    Prompt
                  </p>
                  <div 
                    className='text-sm line-clamp-3 prose prose-sm dark:prose-invert max-w-none'
                    dangerouslySetInnerHTML={{ 
                      __html: card.prompt.text || card.prompt.richText || '-' 
                    }}
                  />
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>
                    Response
                  </p>
                  <div 
                    className='text-sm line-clamp-3 prose prose-sm dark:prose-invert max-w-none'
                    dangerouslySetInnerHTML={{ 
                      __html: card.response.text || card.response.richText || '-' 
                    }}
                  />
                </div>
                {card.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {card.tags.map(tag => (
                      <Badge key={tag} variant='secondary' className='text-xs'>
                        <Tag className='mr-1 h-3 w-3' />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className='flex gap-2 pt-2'>
                  <Link href={`/admin/flashcards/${deckId}/cards/${card.id}`} className='flex-1'>
                    <Button variant='outline' size='sm' className='w-full'>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDuplicateCard(card.id)}
                    title='Duplicate card'
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
