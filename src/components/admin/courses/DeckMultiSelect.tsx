'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DeckOption {
  id: string;
  title: string;
  status?: string;
  visibility?: string;
}

interface DeckMultiSelectProps {
  options: DeckOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export function DeckMultiSelect({
  options,
  value,
  onChange,
  placeholder,
  helperText,
  className,
}: DeckMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(() => {
    const lookup = new Map(options.map(option => [option.id, option]));
    return value
      .map(id => lookup.get(id))
      .filter(Boolean)
      .map(option => option as DeckOption);
  }, [options, value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const lower = query.toLowerCase();
    return options.filter(
      option =>
        option.title.toLowerCase().includes(lower) ||
        option.id.toLowerCase().includes(lower)
    );
  }, [options, query]);

  const toggle = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(existing => existing !== id)
        : [...value, id]
    );
  };

  const clearSelection = () => {
    onChange([]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className='flex flex-wrap gap-2'>
        {selected.length === 0 ? (
          <span className='text-sm text-muted-foreground'>
            {placeholder ?? 'No decks selected yet.'}
          </span>
        ) : (
          selected.map(option => (
            <Badge
              key={option.id}
              variant='secondary'
              className='flex items-center gap-1'
            >
              <span>{option.title}</span>
              <button
                type='button'
                className='rounded bg-transparent text-xs leading-none text-muted-foreground transition hover:text-destructive'
                onClick={() => toggle(option.id)}
                aria-label={`Remove ${option.title}`}
              >
                ✕
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setOpen(openState => !openState)}
        >
          {open ? 'Hide deck list' : 'Browse decks'}
        </Button>
        {value.length > 0 ? (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={clearSelection}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {open ? (
        <div className='space-y-3 rounded-md border border-dashed border-muted-foreground/30 p-3'>
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder='Search decks by title or id'
          />
          <div className='max-h-52 space-y-2 overflow-y-auto pr-1'>
            {filtered.length === 0 ? (
              <div className='text-sm text-muted-foreground'>
                No decks match this search.
              </div>
            ) : (
              filtered.map(option => {
                const checked = value.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted',
                      checked
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted'
                    )}
                  >
                    <span className='flex flex-col'>
                      <span className='font-medium'>{option.title}</span>
                      <span className='text-xs text-muted-foreground'>
                        {option.id}
                      </span>
                    </span>
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={() => toggle(option.id)}
                      className='h-4 w-4 accent-primary'
                    />
                  </label>
                );
              })
            )}
          </div>
          {helperText ? (
            <p className='text-xs text-muted-foreground'>{helperText}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
