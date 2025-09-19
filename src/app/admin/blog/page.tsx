'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags: string[];
  analytics: {
    readTime: number;
    views: number;
    likes: number;
    comments: number;
  };
  author?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface BlogPostsResponse {
  success: boolean;
  posts: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function BlogManagementPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState({
    search: '',
    published: '',
    category: '',
  });

  useEffect(() => {
    fetchPosts();
  }, [pagination.currentPage, filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.published && {
          status: filters.published === 'true' ? 'published' : 'draft',
        }),
        ...(filters.category && { category: filters.category }),
      });

      const response = await fetch(`/api/admin/blog-posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data: BlogPostsResponse = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog-posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      // Refresh the list
      fetchPosts();
    } catch (err) {
      alert(
        'Failed to delete blog post: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    }
  };

  const handleStatusToggle = async (postId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const response = await fetch(`/api/admin/blog-posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update blog post status');
      }

      // Refresh the list
      fetchPosts();
    } catch (err) {
      alert(
        'Failed to update blog post: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Blog Management
          </h1>
        </div>
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <p className='text-red-600 dark:text-red-400'>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Blog Management
        </h1>
        <button 
          onClick={() => router.push('/admin/blog/create')}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium'
        >
          Create New Post
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Search
            </label>
            <input
              type='text'
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              placeholder='Search posts...'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Status
            </label>
            <select
              value={filters.published}
              onChange={e =>
                setFilters({ ...filters, published: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            >
              <option value=''>All Posts</option>
              <option value='true'>Published</option>
              <option value='false'>Draft</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Category
            </label>
            <input
              type='text'
              value={filters.category}
              onChange={e =>
                setFilters({ ...filters, category: e.target.value })
              }
              placeholder='Filter by category...'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            />
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Blog Posts ({pagination.totalItems})
          </h2>
        </div>

        {loading ? (
          <div className='p-6'>
            <div className='animate-pulse space-y-4'>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className='h-16 bg-gray-200 dark:bg-gray-700 rounded'
                ></div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className='p-6 text-center'>
            <p className='text-gray-500 dark:text-gray-400'>
              No blog posts found
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-900'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Title
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Categories
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Created
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {posts.map(post => (
                  <tr
                    key={post._id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>
                          {post.title}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                          /{post.slug}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : post.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900 dark:text-white'>
                        {post.category || 'No category'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {formatDate(post.createdAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                      <button
                        onClick={() =>
                          handleStatusToggle(post._id, post.status)
                        }
                        className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button 
                        onClick={() => router.push(`/admin/blog/edit/${post._id}`)}
                        className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className='px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between'>
            <div className='text-sm text-gray-700 dark:text-gray-300'>
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalItems} total)
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage - 1,
                  })
                }
                disabled={!pagination.hasPreviousPage}
                className='px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage + 1,
                  })
                }
                disabled={!pagination.hasNextPage}
                className='px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
