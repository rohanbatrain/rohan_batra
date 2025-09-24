'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RemoteLinkPicker, { AssetLinkItem } from '@/components/ui/RemoteLinkPicker';

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  technologies: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  featuredImage?: string;
  priority: number;
  links?: {
    live?: string;
    github?: string;
    demo?: string;
    documentation?: string;
  };
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    category: '',
    technologies: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    featuredImage: '',
    priority: 1,
    links: {
      live: '',
      github: '',
      demo: '',
      documentation: '',
    },
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/admin/portfolio/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const { data: project }: { data: Project } = await response.json();
      setFormData({
        title: project.title,
        slug: project.slug,
        description: project.description,
        longDescription: project.longDescription || '',
        category: project.category,
        technologies: project.technologies.join(', '),
        status: project.status,
        featured: project.featured,
        featuredImage: project.featuredImage || '',
        priority: project.priority,
        links: {
          live: project.links?.live || '',
          github: project.links?.github || '',
          demo: project.links?.demo || '',
          documentation: project.links?.documentation || '',
        },
      });
    } catch (error) {
      alert('Failed to fetch project: ' + (error instanceof Error ? error.message : 'Unknown error'));
      router.push('/admin/portfolio');
    } finally {
      setFetching(false);
    }
  };

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
      const response = await fetch(`/api/admin/portfolio/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(Boolean),
          links: Object.fromEntries(
            Object.entries(formData.links).filter(([, value]) => value.trim() !== '')
          ),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      router.push('/admin/portfolio');
    } catch (error) {
      alert('Failed to update project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Edit Project
          </h1>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
          <div className='animate-pulse space-y-4'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4'></div>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4'></div>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4'></div>
            <div className='h-32 bg-gray-200 dark:bg-gray-700 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

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
          Edit Project
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
              placeholder='Enter project title'
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
              placeholder='project-slug'
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Short Description *
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='Brief description of the project'
            />
          </div>

          {/* Long Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Detailed Description
            </label>
            <textarea
              value={formData.longDescription}
              onChange={e => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
              rows={8}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='Detailed description of the project, features, challenges, etc.'
            />
          </div>

          {/* Category and Technologies */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Category *
              </label>
              <input
                type='text'
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                placeholder='e.g., Web Development, Mobile App, etc.'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Technologies
              </label>
              <input
                type='text'
                value={formData.technologies}
                onChange={e => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                placeholder='React, Node.js, MongoDB, etc.'
              />
            </div>
          </div>

          {/* Status, Featured, and Priority */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Priority
              </label>
              <input
                type='number'
                min='1'
                max='10'
                value={formData.priority}
                onChange={e => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              />
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
                Featured Project
              </label>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              Homepage shows up to 3 featured projects.
            </p>
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

          {/* Links */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Project Links
            </label>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  Live Demo URL
                </label>
                <input
                  type='url'
                  value={formData.links.live}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    links: { ...prev.links, live: e.target.value }
                  }))}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='https://project-demo.com'
                />
              </div>

              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  GitHub Repository
                </label>
                <input
                  type='url'
                  value={formData.links.github}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    links: { ...prev.links, github: e.target.value }
                  }))}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='https://github.com/username/repo'
                />
              </div>

              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  Demo Video/Images
                </label>
                <input
                  type='url'
                  value={formData.links.demo}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    links: { ...prev.links, demo: e.target.value }
                  }))}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='https://demo-media.com'
                />
              </div>

              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  Documentation
                </label>
                <input
                  type='url'
                  value={formData.links.documentation}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    links: { ...prev.links, documentation: e.target.value }
                  }))}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='https://docs.project.com'
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className='flex space-x-4'>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium'
            >
              {loading ? 'Updating...' : 'Update Project'}
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