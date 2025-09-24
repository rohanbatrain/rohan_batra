'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Book {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  genre: string;
  status: 'planning' | 'drafting' | 'editing' | 'completed' | 'published';
  visibility: 'private' | 'public' | 'shared';
  currentWordCount: number;
  targetWordCount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface BooksData {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: Record<string, { count: number; totalWords: number }>;
}

interface BooksManagementProps {
  userRole: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function BooksManagement(_: BooksManagementProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [booksData, setBooksData] = useState<BooksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for create
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    status: 'planning' as const,
    visibility: 'private' as const,
    targetWordCount: '',
  });

  const fetchBooks = useCallback(async () => {
    // Don't fetch if authentication isn't loaded or user isn't signed in
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/books?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to fetch books';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const data = await response.json();
      setBooksData(data?.books ? data : { books: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }, stats: {} });
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, searchTerm, statusFilter]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetWordCount: formData.targetWordCount
            ? parseInt(formData.targetWordCount)
            : undefined,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to create book';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      alert('Book created successfully');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        genre: '',
        status: 'planning',
        visibility: 'private',
        targetWordCount: '',
      });
      fetchBooks();
    } catch (error) {
      console.error('Error creating book:', error);
      alert('Failed to create book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Move this book to trash? You can permanently delete it later from Trash.')) return;

    try {
      const response = await fetch(`/api/admin/books/${bookId}?trash=true`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to delete book';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      alert('Book moved to trash');
      fetchBooks();
    } catch (error) {
      console.error('Error trashing book:', error);
      alert('Failed to move book to trash');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-200 text-gray-800';
      case 'drafting':
        return 'bg-blue-200 text-blue-800';
      case 'editing':
        return 'bg-yellow-200 text-yellow-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'published':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const calculateProgress = (current: number, target?: number) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (!isLoaded) {
    return <div className='text-center py-8'>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div className='text-center py-8'>Please sign in to continue.</div>;
  }

  if (loading) {
    return <div className='text-center py-8'>Loading books...</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      {booksData?.stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Object.entries(booksData.stats).map(([status, data]) => (
            <div
              key={status}
              className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'
            >
              <h3 className='text-sm font-medium capitalize mb-2'>
                {status.replace('-', ' ')} Books
              </h3>
              <div className='text-2xl font-bold'>{data.count}</div>
              <p className='text-xs text-gray-500'>
                {data.totalWords.toLocaleString()} words
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
        <div className='flex gap-4'>
          <input
            type='text'
            placeholder='Search books...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>All Statuses</option>
            <option value='planning'>Planning</option>
            <option value='drafting'>Drafting</option>
            <option value='editing'>Editing</option>
            <option value='completed'>Completed</option>
            <option value='published'>Published</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Create Book
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
          <h2 className='text-lg font-semibold mb-4'>Create New Book</h2>
          <form onSubmit={handleCreateBook} className='grid gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Title</label>
              <input
                type='text'
                required
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Genre</label>
                <input
                  type='text'
                  required
                  value={formData.genre}
                  onChange={e =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Target Word Count
                </label>
                <input
                  type='number'
                  value={formData.targetWordCount}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      targetWordCount: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                Create Book
              </button>
              <button
                type='button'
                onClick={() => setShowCreateForm(false)}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-lg font-semibold'>Books</h2>
          <p className='text-sm text-gray-500'>
            Manage your book projects and track progress.
          </p>
        </div>
        <div className='p-6'>
          {booksData?.books.length === 0 ? (
            <div className='text-center py-8'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No books found
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-4'>
                Start your writing journey by creating your first book.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                Create Your First Book
              </button>
            </div>
          ) : (
            <div className='grid gap-4'>
              {booksData?.books.map(book => {
                const progress = calculateProgress(
                  book.currentWordCount,
                  book.targetWordCount
                );
                return (
                  <div
                    key={book._id}
                    className='border border-gray-200 dark:border-gray-600 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-lg'>{book.title}</h3>
                        {book.subtitle && (
                          <p className='text-gray-600 dark:text-gray-400'>
                            {book.subtitle}
                          </p>
                        )}
                        <p className='text-sm text-gray-500 mt-1'>
                          {book.description}
                        </p>
                      </div>
                      <div className='flex gap-2 ml-4'>
                        <a
                          href={`/admin/books/${book._id}`}
                          className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
                        >
                          Manage
                        </a>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className='flex items-center gap-4 text-sm'>
                      <span className='text-gray-600'>{book.genre}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          book.status
                        )}`}
                      >
                        {book.status}
                      </span>
                      <span className='text-gray-600'>
                        {book.currentWordCount.toLocaleString()} words
                      </span>
                      {book.targetWordCount && (
                        <span className='text-gray-600'>
                          {progress.toFixed(1)}% complete
                        </span>
                      )}
                      <span className='text-gray-500'>
                        Updated {new Date(book.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {book.targetWordCount && (
                      <div className='mt-3'>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full'
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
