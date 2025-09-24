'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Tag } from 'lucide-react';
import PostSummary from '@/components/blog/PostSummary';
import { BlogPostWithAuthor } from '@/types/blog-post';

interface BlogPageClientProps {
  initialPosts: BlogPostWithAuthor[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  initialTag?: string;
}

export default function BlogPageClient({
  initialPosts,
  initialPagination,
  initialTag,
}: BlogPageClientProps) {
  const [posts] = useState<BlogPostWithAuthor[]>(initialPosts);
  const [filteredPosts] = useState<BlogPostWithAuthor[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState(initialTag ?? 'All');

  // Provide default values to prevent undefined errors
  const pagination = initialPagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Get unique categories from posts
  const categories = useMemo(() => {
    const cats = posts.map(post => post.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [posts]);

  // Get unique tags from posts
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    const list = ['All', ...Array.from(tagSet)];
    if (initialTag && !list.includes(initialTag)) list.push(initialTag);
    return list;
  }, [posts]);

  // Filter posts based on search term, category, and tag
  const displayPosts = useMemo(() => {
    return filteredPosts.filter(post => {
      const matchesSearch =
        searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;

      const matchesTag =
        selectedTag === 'All' || post.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [filteredPosts, searchTerm, selectedCategory, selectedTag]);

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='text-center mb-12'
      >
        <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
          Blog & Insights
        </h1>
        <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
          Exploring the latest in web development, technology trends, and
          sharing knowledge from my journey as a developer.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className='mb-8'
      >
        <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
          {/* Search */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
            <input
              type='text'
              placeholder='Search articles...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            />
          </div>

          {/* Filters */}
          <div className='flex gap-4 items-center'>
            {/* Category Filter */}
            <div className='flex items-center gap-2'>
              <Filter className='h-5 w-5 text-gray-500' />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className='flex items-center gap-2'>
              <Tag className='h-5 w-5 text-gray-500' />
              <select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
              >
                {tags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className='mb-6'
      >
        <p className='text-gray-600 dark:text-gray-300'>
          {displayPosts.length} article{displayPosts.length !== 1 ? 's' : ''}{' '}
          found
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {selectedTag !== 'All' && ` tagged with ${selectedTag}`}
        </p>
      </motion.div>

      {/* Featured Posts */}
      {searchTerm === '' &&
        selectedCategory === 'All' &&
        selectedTag === 'All' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='mb-12'
          >
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
              <Calendar className='h-6 w-6' />
              Featured Posts
            </h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {posts
                .filter(post => post.featured)
                .slice(0, 2)
                .map(post => (
                  <PostSummary key={post._id} post={post} />
                ))}
            </div>
          </motion.div>
        )}

      {/* All Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
          {searchTerm === '' &&
          selectedCategory === 'All' &&
          selectedTag === 'All'
            ? 'Latest Posts'
            : 'Search Results'}
        </h2>

        {displayPosts.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {displayPosts.map(post => (
              <PostSummary key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <div className='text-gray-400 mb-4'>
              <Search className='h-16 w-16 mx-auto' />
            </div>
            <h3 className='text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2'>
              No articles found
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </motion.div>

      {/* Pagination (if needed) */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className='mt-12 flex justify-center'
        >
          <div className='flex gap-2'>
            {/* Add pagination controls here */}
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
        </motion.div>
      )}
    </>
  );
}
