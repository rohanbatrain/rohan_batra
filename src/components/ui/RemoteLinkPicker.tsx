'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type LinkType = 'image' | 'video' | 'other';

export interface AssetLinkItem {
  id: string;
  type: LinkType;
  name: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
  mimeType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RemoteLinkPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (link: AssetLinkItem) => void;
  type?: LinkType | 'any';
  title?: string;
}

export default function RemoteLinkPicker({
  open,
  onClose,
  onSelect,
  type = 'image',
  title = 'Select Remote Link',
}: RemoteLinkPickerProps) {
  const [q, setQ] = useState('');
  const [activeType, setActiveType] = useState<LinkType | 'any'>(type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<AssetLinkItem[]>([]);

  const fetchLinks = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (activeType !== 'any') params.set('type', activeType);
      const res = await fetch(`/api/admin/assets/links?${params.toString()}`, {
        credentials: 'include',
        signal,
      });
      if (!res.ok) throw new Error('Failed to load links');
      const body = await res.json();
      setLinks(body?.data?.links || []);
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return;
      setError((e as Error).message || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    const t = setTimeout(() => fetchLinks(ac.signal), 250);
    return () => {
      ac.abort();
      clearTimeout(t);
    };
  }, [open, q, activeType]);

  const content = useMemo(() => {
    if (!open) return null;
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
        <div className='absolute inset-0 bg-black/40' onClick={onClose} />
        <Card className='relative z-10 w-[90vw] max-w-3xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-lg font-semibold'>{title}</h2>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
          </div>

          <div className='flex items-center gap-2 mb-3'>
            <Input
              placeholder='Search...'
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>

          <Tabs
            value={activeType}
            onValueChange={v => setActiveType(v as any)}
            className='w-full'
          >
            <TabsList className='mb-3'>
              <TabsTrigger value='any'>All</TabsTrigger>
              <TabsTrigger value='image'>Images</TabsTrigger>
              <TabsTrigger value='video'>Videos</TabsTrigger>
              <TabsTrigger value='other'>Other</TabsTrigger>
            </TabsList>
            <TabsContent value={activeType} className='m-0'>
              {error && (
                <div className='text-sm text-red-600 mb-2'>{error}</div>
              )}
              {loading ? (
                <div className='py-10 text-center text-sm opacity-70'>
                  Loading...
                </div>
              ) : !links.length ? (
                <div className='py-10 text-center text-sm opacity-70'>
                  No links found
                </div>
              ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-auto pr-1'>
                  {links.map(link => (
                    <button
                      key={link.id}
                      type='button'
                      onClick={() => onSelect(link)}
                      className='group border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 hover:border-blue-500 focus:border-blue-500 focus:outline-none'
                      title={link.name}
                    >
                      <div className='aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden'>
                        {link.type === 'image' ? (
                          <img
                            src={link.thumbnailUrl || link.url}
                            alt={link.name}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='text-xs opacity-70 p-2 text-center'>
                            {link.type.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className='p-2 text-left'>
                        <div
                          className='text-xs font-medium truncate'
                          title={link.name}
                        >
                          {link.name}
                        </div>
                        {link.mimeType && (
                          <div className='text-[10px] text-gray-500 truncate'>
                            {link.mimeType}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }, [open, q, activeType, loading, error, links]);

  return content;
}
