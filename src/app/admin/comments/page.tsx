'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Check, X, Eye, EyeOff, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/nextjs';

interface Comment {
  id: string;
  content: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  postTitle?: string;
  postSlug?: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  createdAt: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
}

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();

  const fetchComments = async () => {
    if (!isLoaded || !isSignedIn) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/comments/moderate?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const result = await response.json();
      setComments(result.data.comments || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter, isLoaded, isSignedIn]);

  const moderateComment = async (
    commentId: string,
    action: 'approve' | 'reject' | 'spam'
  ) => {
    try {
      const response = await fetch(`/api/admin/comments/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to moderate comment');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      fetchComments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to moderate comment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      approved: 'default',
      rejected: 'destructive',
      spam: 'destructive',
    } as const;

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      spam: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredComments = comments.filter(
    comment =>
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      comment.author.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (comment.postTitle &&
        comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isLoaded || !isSignedIn) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <MessageSquare className='h-8 w-8' />
            Comments Management
          </h1>
          <p className='text-gray-600 mt-2'>
            Moderate and manage user comments
          </p>
        </div>

        <Button onClick={fetchComments} variant='outline'>
          <Search className='h-4 w-4 mr-2' />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {['pending', 'approved', 'rejected', 'spam'].map(status => {
          const count = comments.filter(c => c.status === status).length;
          return (
            <Card key={status}>
              <CardContent className='p-4 text-center'>
                <p className='text-2xl font-bold'>{count}</p>
                <p className='text-sm text-gray-600 capitalize'>{status}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className='space-y-6'
      >
        <div className='flex justify-between items-center'>
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='pending'>Pending</TabsTrigger>
            <TabsTrigger value='approved'>Approved</TabsTrigger>
            <TabsTrigger value='rejected'>Rejected</TabsTrigger>
            <TabsTrigger value='spam'>Spam</TabsTrigger>
          </TabsList>

          <div className='flex gap-2'>
            <Input
              placeholder='Search comments...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-64'
            />
          </div>
        </div>

        <TabsContent value={statusFilter} className='space-y-4'>
          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto'></div>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredComments.map(comment => (
                <Card key={comment.id}>
                  <CardContent className='p-6'>
                    <div className='flex justify-between items-start mb-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='font-medium'>
                            {comment.author.firstName} {comment.author.lastName}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {comment.author.email}
                          </span>
                          {getStatusBadge(comment.status)}
                        </div>
                        {comment.postTitle && (
                          <p className='text-sm text-gray-600 mb-2'>
                            On:{' '}
                            <span className='font-medium'>
                              {comment.postTitle}
                            </span>
                          </p>
                        )}
                        <p className='text-sm text-gray-500'>
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {comment.status === 'pending' && (
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() =>
                              moderateComment(comment.id, 'approve')
                            }
                            className='bg-green-600 hover:bg-green-700'
                          >
                            <Check className='h-4 w-4 mr-1' />
                            Approve
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() =>
                              moderateComment(comment.id, 'reject')
                            }
                          >
                            <X className='h-4 w-4 mr-1' />
                            Reject
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => moderateComment(comment.id, 'spam')}
                          >
                            <EyeOff className='h-4 w-4 mr-1' />
                            Spam
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
                      <p className='text-sm'>{comment.content}</p>
                    </div>

                    {comment.metadata && (
                      <div className='mt-3 text-xs text-gray-500'>
                        {comment.metadata.ip && (
                          <span className='mr-4'>
                            IP: {comment.metadata.ip}
                          </span>
                        )}
                        {comment.metadata.userAgent && (
                          <span>User Agent: {comment.metadata.userAgent}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredComments.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  {comments.length === 0
                    ? 'No comments found'
                    : 'No comments match your search criteria'}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
