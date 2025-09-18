'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  _id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  technologies?: string[];
  featured: boolean;
  status?: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  links?: {
    live?: string;
    github?: string;
    demo?: string;
    documentation?: string;
  };
}

interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function PortfolioManagementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
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
    status: '',
    search: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, [pagination.currentPage, filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.featured && { featured: filters.featured }),
        ...(filters.status && { status: filters.status }),
        ...(filters.technology && { technology: filters.technology }),
      });

      const response = await fetch(`/api/admin/portfolio?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ProjectsResponse = await response.json();
      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/portfolio/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      fetchProjects();
    } catch (err) {
      alert(
        'Failed to delete project: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    }
  };

  const handleFeaturedToggle = async (
    projectId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/portfolio/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      fetchProjects();
    } catch (err) {
      alert(
        'Failed to update project: ' +
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
            Portfolio Management
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
          Portfolio Management
        </h1>
        <button 
          onClick={() => router.push('/admin/portfolio/create')}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium'
        >
          Create New Project
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Search
            </label>
            <input
              type='text'
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              placeholder='Search projects...'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Featured
            </label>
            <select
              value={filters.featured}
              onChange={e =>
                setFilters({ ...filters, featured: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            >
              <option value=''>All Projects</option>
              <option value='true'>Featured</option>
              <option value='false'>Not Featured</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Status
            </label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            >
              <option value=''>All Statuses</option>
              <option value='completed'>Completed</option>
              <option value='in-progress'>In Progress</option>
              <option value='planned'>Planned</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Technology
            </label>
            <input
              type='text'
              value={filters.technology}
              onChange={e =>
                setFilters({ ...filters, technology: e.target.value })
              }
              placeholder='Filter by technology...'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Projects ({pagination.totalItems})
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
        ) : projects.length === 0 ? (
          <div className='p-6 text-center'>
            <p className='text-gray-500 dark:text-gray-400'>
              No projects found
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
            {projects.map(project => (
              <div
                key={project._id}
                className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
                      {project.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                      {project.description ? project.description.substring(0, 100) + '...' : 'No description available'}
                    </p>
                  </div>
                  {project.featured && (
                    <span className='ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
                      Featured
                    </span>
                  )}
                </div>

                <div className='mb-3'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : project.status === 'draft'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
                  </span>
                </div>

                <div className='mb-3'>
                  <div className='flex flex-wrap gap-1'>
                    {project.technologies && project.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className='inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded'
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies && project.technologies.length > 3 && (
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className='text-xs text-gray-500 dark:text-gray-400 mb-3'>
                  Created: {formatDate(project.createdAt)}
                </div>

                <div className='flex space-x-2'>
                  <button
                    onClick={() =>
                      handleFeaturedToggle(project._id, project.featured)
                    }
                    className='text-xs text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    {project.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button 
                    onClick={() => router.push(`/admin/portfolio/edit/${project._id}`)}
                    className='text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className='text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
