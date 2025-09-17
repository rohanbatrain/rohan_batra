'use client';

import { useState } from 'react';
import { BlogPost } from '@/types/blog-post';

interface BlogEditorProps {
  post?: Partial<BlogPost>;
  onSave?: (post: Partial<BlogPost>) => void;
  onPreview?: (post: Partial<BlogPost>) => void;
  className?: string;
}

export default function BlogEditor({
  post,
  onSave,
  onPreview,
  className = '',
}: BlogEditorProps) {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    category: 'technology',
    tags: [],
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
    ...post,
  });

  const handleSave = () => {
    onSave?.(formData);
  };

  const handlePreview = () => {
    onPreview?.(formData);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      <div className='bg-white p-6 rounded-lg shadow border'>
        <h1 className='text-2xl font-bold mb-6'>
          {post && 'id' in post && post.id ? 'Edit Post' : 'New Post'}
        </h1>

        <div className='space-y-4'>
          <div>
            <label htmlFor='title' className='block text-sm font-medium mb-2'>
              Title
            </label>
            <input
              type='text'
              id='title'
              value={formData.title || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              className='w-full px-3 py-2 border rounded-md'
              placeholder='Enter post title...'
            />
          </div>

          <div>
            <label htmlFor='excerpt' className='block text-sm font-medium mb-2'>
              Excerpt
            </label>
            <textarea
              id='excerpt'
              value={formData.excerpt || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, excerpt: e.target.value }))
              }
              rows={3}
              className='w-full px-3 py-2 border rounded-md'
              placeholder='Brief description of the post...'
            />
          </div>

          <div>
            <label htmlFor='content' className='block text-sm font-medium mb-2'>
              Content
            </label>
            <textarea
              id='content'
              value={formData.content || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, content: e.target.value }))
              }
              rows={10}
              className='w-full px-3 py-2 border rounded-md'
              placeholder='Write your post content...'
            />
          </div>

          <div className='flex space-x-4'>
            <button
              type='button'
              onClick={handlePreview}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50'
            >
              Preview
            </button>
            <button
              type='button'
              onClick={handleSave}
              className='px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700'
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
