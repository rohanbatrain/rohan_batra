"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RemoteLinkPicker, { AssetLinkItem } from '@/components/ui/RemoteLinkPicker';

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'General', // Provide default value since it's required
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      router.push('/admin/blog');
    } catch (error) {
      alert('Failed to create blog post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='space-y-6'>
      <RemoteLinkPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(link: AssetLinkItem) => {
          setFormData(prev => ({ ...prev, featuredImage: link.url }));
          setPickerOpen(false);
        }}
        type='image'
        title='Select Featured Image'
      />
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Create New Blog Post
        </h1>
        <button
          onClick={() => router.back()}
          className='text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        >
          Back
        </button>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Title *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={e => handleTitleChange(e.target.value)}
              required
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='Enter blog post title'
            />
          </div>

          {/* Slug */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Slug *
            </label>
            <input
              type='text'
              value={formData.slug}
              onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='blog-post-slug'
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='Brief description of the blog post'
            />
          </div>

          {/* Content */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={12}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='Write your blog post content here...'
            />
          </div>

          {/* Category and Tags */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Category
              </label>
              <input
                type='text'
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                placeholder='e.g., Technology, Travel, etc.'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Tags
              </label>
              <input
                type='text'
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                placeholder='tag1, tag2, tag3'
              />
            </div>
          </div>

          {/* Status and Featured */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as typeof formData.status }))}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value='draft'>Draft</option>
                <option value='published'>Published</option>
                <option value='archived'>Archived</option>
              </select>
            </div>

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='featured'
                checked={formData.featured}
                onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className='mr-2'
              />
              <label htmlFor='featured' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Featured Post
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Featured Image URL
            </label>
            <input
              type='url'
              value={formData.featuredImage}
              onChange={e => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='https://example.com/image.jpg'
            />
            <div className='mt-2 flex items-center gap-2'>
              <button type='button' className='text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                onClick={() => setPickerOpen(true)}>
                Pick from Remote Links
              </button>
              {formData.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.featuredImage} alt='Preview' className='h-14 w-14 rounded object-cover border' />
              )}
            </div>
          </div>

          {/* SEO Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                SEO Title
              </label>
              <input
                type='text'
                value={formData.seoTitle}
                onChange={e => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                placeholder='SEO optimized title'
                maxLength={60}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                SEO Description
              </label>
              <input
                type='text'
                value={formData.seoDescription}
                onChange={e => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                placeholder='SEO meta description'
                maxLength={160}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className='flex space-x-4'>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium'
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type='button'
              onClick={() => router.back()}
              className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}