'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Trash2, RefreshCw, Server, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheInfo {
  connected: boolean;
  version?: string;
  uptime?: string;
  clients?: string;
  memory?: {
    used: string;
    peak: string;
    rss: string;
  };
  keyspace?: string;
  stats?: {
    connections: string;
    commands: string;
    hits: string;
    misses: string;
  };
  error?: string;
}

interface CacheKey {
  key: string;
  type: string;
  ttl: number;
  size: number;
  length: number;
  value: unknown;
  expired: boolean;
  error?: string;
}

export default function CachePage() {
  const [info, setInfo] = useState<CacheInfo | null>(null);
  const [keys, setKeys] = useState<CacheKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [pattern, setPattern] = useState('*');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTtl, setNewTtl] = useState('3600');
  const { toast } = useToast();

  const fetchCacheInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/cache/info', {
        credentials: 'include',
      });
      if (!response.ok) {
        let message = 'Failed to fetch cache info';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      setInfo(result.data);
    } catch (e) {
      toast({
        title: 'Error',
        description:
          e instanceof Error ? e.message : 'Failed to fetch cache information',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchKeys = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/cache/keys?pattern=${pattern}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        let message = 'Failed to fetch cache keys';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      setKeys(result.data.keys || []);
    } catch (e) {
      toast({
        title: 'Error',
        description:
          e instanceof Error ? e.message : 'Failed to fetch cache keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pattern, toast]);

  useEffect(() => {
    fetchCacheInfo();
    fetchKeys();
  }, [fetchCacheInfo, fetchKeys]);

  const clearCache = async (
    type: 'all' | 'pattern',
    targetPattern?: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to clear ${type === 'all' ? 'all cache' : `keys matching "${targetPattern}"`}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'all' ? 'flush_all' : 'flush_pattern',
          pattern: targetPattern,
        }),
      });

      if (!response.ok) throw new Error('Failed to clear cache');

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      fetchKeys();
      fetchCacheInfo();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to clear cache',
        variant: 'destructive',
      });
    }
  };

  const deleteKey = async (key: string) => {
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_key',
          key,
        }),
      });

      if (!response.ok) throw new Error('Failed to delete key');

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      fetchKeys();
      fetchCacheInfo();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete key',
        variant: 'destructive',
      });
    }
  };

  const setKey = async () => {
    if (!newKey || !newValue) {
      toast({
        title: 'Error',
        description: 'Key and value are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_key',
          key: newKey,
          value: newValue,
          ttl: parseInt(newTtl) || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to set key');

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      setNewKey('');
      setNewValue('');
      setNewTtl('3600');
      fetchKeys();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to set key',
        variant: 'destructive',
      });
    }
  };

  const formatTtl = (ttl: number) => {
    if (ttl === -1) return 'No expiration';
    if (ttl === 0) return 'Expired';
    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m`;
    if (ttl < 86400) return `${Math.floor(ttl / 3600)}h`;
    return `${Math.floor(ttl / 86400)}d`;
  };

  const renderValue = (value: unknown, type: string) => {
    if (type === 'string') {
      return <span className='font-mono text-sm'>{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      return <span className='font-mono text-sm'>[{value.join(', ')}]</span>;
    }
    if (typeof value === 'object') {
      return <span className='font-mono text-sm'>{JSON.stringify(value)}</span>;
    }
    return <span className='font-mono text-sm'>{String(value)}</span>;
  };

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Database className='h-8 w-8' />
            Cache Management
          </h1>
          <p className='text-gray-600 mt-2'>Monitor and manage Redis cache</p>
        </div>

        <div className='flex gap-2'>
          <Button onClick={() => fetchCacheInfo()} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>

          <Button onClick={() => clearCache('all')} variant='destructive'>
            <Trash2 className='h-4 w-4 mr-2' />
            Clear All
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Server className='h-5 w-5' />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {info ? (
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <div
                  className={`w-3 h-3 rounded-full ${info.connected ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className='font-medium'>
                  {info.connected ? 'Connected' : 'Disconnected'}
                </span>
                {info.version && (
                  <Badge variant='outline'>v{info.version}</Badge>
                )}
              </div>

              {info.connected && info.memory && (
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>{info.memory.used}</p>
                    <p className='text-sm text-gray-600'>Memory Used</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>{info.memory.peak}</p>
                    <p className='text-sm text-gray-600'>Peak Memory</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>{info.clients || '0'}</p>
                    <p className='text-sm text-gray-600'>Connected Clients</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>{info.uptime || 'N/A'}</p>
                    <p className='text-sm text-gray-600'>Uptime (seconds)</p>
                  </div>
                </div>
              )}

              {info.error && (
                <div className='text-red-600 bg-red-50 p-3 rounded'>
                  {info.error}
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-4'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto'></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue='keys' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='keys'>Keys</TabsTrigger>
          <TabsTrigger value='manage'>Manage</TabsTrigger>
        </TabsList>

        <TabsContent value='keys' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Key className='h-5 w-5' />
                Cache Keys
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  placeholder='Search pattern (e.g., user:*, blog:*)'
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                />
                <Button onClick={() => fetchKeys()}>Search</Button>
                <Button
                  variant='outline'
                  onClick={() => clearCache('pattern', pattern)}
                  disabled={pattern === '*'}
                >
                  Clear Pattern
                </Button>
              </div>

              {loading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto'></div>
                </div>
              ) : (
                <div className='space-y-2'>
                  {keys.map(keyData => (
                    <div
                      key={keyData.key}
                      className='border rounded p-4 space-y-2'
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-mono text-sm font-medium truncate'>
                              {keyData.key}
                            </span>
                            <Badge variant='outline'>{keyData.type}</Badge>
                            <Badge variant='secondary'>
                              {formatTtl(keyData.ttl)}
                            </Badge>
                          </div>

                          {keyData.error ? (
                            <div className='text-red-600 text-sm'>
                              {keyData.error}
                            </div>
                          ) : (
                            <div className='text-sm text-gray-600 truncate'>
                              {renderValue(keyData.value, keyData.type)}
                            </div>
                          )}

                          <div className='text-xs text-gray-500 mt-1'>
                            Size: {keyData.size || 0} bytes, Length:{' '}
                            {keyData.length || 0}
                          </div>
                        </div>

                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteKey(keyData.key)}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {keys.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      No keys found matching pattern &quot;{pattern}&quot;
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='manage' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Set Cache Key</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='new-key'>Key</Label>
                <Input
                  id='new-key'
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder='e.g., user:123, blog:post:456'
                />
              </div>

              <div>
                <Label htmlFor='new-value'>Value</Label>
                <Input
                  id='new-value'
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder='Cache value'
                />
              </div>

              <div>
                <Label htmlFor='new-ttl'>TTL (seconds)</Label>
                <Input
                  id='new-ttl'
                  type='number'
                  value={newTtl}
                  onChange={e => setNewTtl(e.target.value)}
                  placeholder='3600'
                />
              </div>

              <Button onClick={setKey}>Set Key</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
