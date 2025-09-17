'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  overview: {
    totalPosts: number;
    totalProjects: number;
    totalComments: number;
    totalUsers: number;
    totalBooks: number;
    totalChapters: number;
    totalCharacters: number;
  };
  activity: {
    recentPosts: Array<{
      id: string;
      title: string;
      createdAt: string;
    }>;
    recentComments: Array<{
      id: string;
      content: string;
      authorName: string;
      createdAt: string;
    }>;
    recentBooks: Array<{
      id: string;
      title: string;
      wordCount: number;
      status: string;
      createdAt: string;
    }>;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderActivityFeed = () => {
    if (!stats) return null;

    const allActivity = [
      ...stats.activity.recentPosts.map(post => ({
        type: 'blog',
        title: `Blog post "${post.title}" created`,
        date: post.createdAt,
        icon: (
          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
          </svg>
        ),
      })),
      ...stats.activity.recentComments.map(comment => ({
        type: 'comment',
        title: `New comment by ${comment.authorName}`,
        date: comment.createdAt,
        icon: (
          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
          </svg>
        ),
      })),
      ...stats.activity.recentBooks.map(book => ({
        type: 'book',
        title: `Book "${book.title}" updated (${book.wordCount} words)`,
        date: book.createdAt,
        icon: (
          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
          </svg>
        ),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allActivity.slice(0, 5).map((activity, index) => (
      <div key={index} className='flex items-start space-x-3 py-3'>
        <div className='flex-shrink-0'>
          <div className='p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400'>
            {activity.icon}
          </div>
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-gray-900 dark:text-white'>
            {activity.title}
          </p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {formatDate(activity.date)}
          </p>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Dashboard
          </h1>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse'>
              <div className='h-20'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Dashboard
          </h1>
        </div>
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <p className='text-red-600 dark:text-red-400'>Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Dashboard
        </h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Stats Cards */}
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <svg
                className='h-6 w-6 text-blue-600 dark:text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Blog Posts
              </p>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {stats?.overview.totalPosts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
              <svg
                className='h-6 w-6 text-green-600 dark:text-green-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Projects
              </p>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {stats?.overview.totalProjects || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-lg'>
              <svg
                className='h-6 w-6 text-purple-600 dark:text-purple-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Comments
              </p>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {stats?.overview.totalComments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-orange-100 dark:bg-orange-900 rounded-lg'>
              <svg
                className='h-6 w-6 text-orange-600 dark:text-orange-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Users
              </p>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {stats?.overview.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Books Stats Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg'>
              <svg
                className='h-6 w-6 text-indigo-600 dark:text-indigo-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Books
              </p>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {stats?.overview.totalBooks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg'>
              <svg
                className='h-6 w-6 text-yellow-600 dark:text-yellow-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total Chapters
              </p>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {stats?.overview.totalChapters || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-pink-100 dark:bg-pink-900 rounded-lg'>
              <svg
                className='h-6 w-6 text-pink-600 dark:text-pink-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Characters
              </p>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {stats?.overview.totalCharacters || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Recent Activity
          </h2>
        </div>
        <div className='p-6'>
          {stats && (stats.activity.recentPosts.length > 0 || stats.activity.recentComments.length > 0 || stats.activity.recentBooks.length > 0) ? (
            <div className='space-y-1'>
              {renderActivityFeed()}
            </div>
          ) : (
            <p className='text-gray-500 dark:text-gray-400 text-center py-8'>
              No recent activity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
