'use client';

/**
 * Braindump Admin Page
 * Complete braindump management interface
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BraindumpQuickCapture } from '@/components/admin/braindump/BraindumpQuickCapture';
import { BraindumpCard } from '@/components/admin/braindump/BraindumpCard';
import { BraindumpBacklinks } from '@/components/admin/braindump/BraindumpBacklinks';
import {
  Brain,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Braindump {
  _id: string;
  content: string;
  tags: string[];
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  associations?: any[];
  linkedTo?: string[];
  linkedFrom?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalCaptured: number;
  totalProcessed: number;
  totalArchived: number;
  urgentCount: number;
  highCount: number;
}

export default function BraindumpAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams?.get('id') || null;
  
  const [braindumps, setBraindumps] = useState<Braindump[]>([]);
  const [selectedBraindump, setSelectedBraindump] = useState<Braindump | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('captured');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingBraindump, setEditingBraindump] = useState<Braindump | null>(null);
  const { toast } = useToast();

  // Fetch specific braindump if ID in URL
  useEffect(() => {
    if (selectedId) {
      const fetchBraindump = async () => {
        try {
          const response = await fetch(`/api/admin/braindump/${selectedId}`);
          if (response.ok) {
            const data = await response.json();
            setSelectedBraindump(data);
          } else {
            toast({
              title: 'Error',
              description: 'Braindump not found',
              variant: 'destructive',
            });
            router.push('/admin/braindump');
          }
        } catch (error) {
          console.error('Error fetching braindump:', error);
        }
      };
      fetchBraindump();
    } else {
      setSelectedBraindump(null);
    }
  }, [selectedId, router, toast]);

  const fetchBraindumps = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/braindump?${params}`);
      
      if (!response.ok) {
        // Log more details for debugging
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch braindumps: ${response.status}`);
      }

      const data = await response.json();
      setBraindumps(data.braindumps);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching braindumps:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load braindumps',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery, toast]);

  useEffect(() => {
    fetchBraindumps();
  }, [fetchBraindumps]);

  return (
        <div className='container mx-auto py-8 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Brain className='h-8 w-8' />
        <h1 className='text-3xl font-bold'>Brain Dump</h1>
      </div>

      {/* Show detail view if braindump selected */}
      {selectedBraindump ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/braindump')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>

          <BraindumpCard
            braindump={selectedBraindump}
            onUpdate={() => {
              // Refresh braindump
              window.location.reload();
            }}
            onEdit={setEditingBraindump}
          />

          <BraindumpBacklinks braindumpId={selectedBraindump._id} />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='text-2xl font-bold text-purple-600'>
                  {stats?.totalCaptured || 0}
                </div>
                <div className='text-sm text-muted-foreground'>Captured</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='text-2xl font-bold text-green-600'>
                  {stats?.totalProcessed || 0}
                </div>
                <div className='text-sm text-muted-foreground'>Processed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='text-2xl font-bold text-gray-600'>
                  {stats?.totalArchived || 0}
                </div>
                <div className='text-sm text-muted-foreground'>Archived</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='text-2xl font-bold text-red-600'>
                  {stats?.urgentCount || 0}
                </div>
                <div className='text-sm text-muted-foreground'>Urgent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='text-2xl font-bold text-orange-600'>
                  {stats?.highCount || 0}
                </div>
                <div className='text-sm text-muted-foreground'>High Priority</div>
              </CardContent>
            </Card>
          </div>

      {/* Quick Capture */}
      <BraindumpQuickCapture onSuccess={fetchBraindumps} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='captured'>Captured</SelectItem>
                  <SelectItem value='processed'>Processed</SelectItem>
                  <SelectItem value='archived'>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block'>Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='urgent'>Urgent</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='low'>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block'>Search</label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search content, tags, category...'
                  className='pl-10'
                />
              </div>
            </div>
          </div>

          {(statusFilter !== 'captured' || priorityFilter !== 'all' || searchQuery) && (
            <div className='flex gap-2'>
              <Badge variant='outline'>
                {statusFilter !== 'all' ? `Status: ${statusFilter}` : ''}
              </Badge>
              {priorityFilter !== 'all' && (
                <Badge variant='outline'>Priority: {priorityFilter}</Badge>
              )}
              {searchQuery && (
                <Badge variant='outline'>Search: {searchQuery}</Badge>
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setStatusFilter('captured');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Braindumps List */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>
          {isLoading ? 'Loading...' : `${braindumps.length} Items`}
        </h2>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : braindumps.length === 0 ? (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              No braindumps found. {statusFilter === 'captured' ? 'Start capturing your ideas!' : 'Try adjusting your filters.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className='grid grid-cols-1 gap-4'>
            {braindumps.map((braindump) => (
              <BraindumpCard
                key={braindump._id}
                braindump={braindump}
                onUpdate={fetchBraindumps}
                onEdit={setEditingBraindump}
              />
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

