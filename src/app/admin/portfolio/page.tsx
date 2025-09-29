'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';

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
    featured: '',
    technology: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const { toast } = useToast();
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

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

  const handleMoveToTrash = async (projectId: string) => {
    const ok = await confirm({
      title: 'Move to Trash',
      description:
        'Move this project to trash? You can permanently delete it later from Trash.',
      confirmText: 'Move to Trash',
      cancelText: 'Cancel',
      destructive: true,
    });
    if (!ok) return;

    try {
      setProcessingIds(prev => Array.from(new Set([...prev, projectId])));
      const response = await fetch(
        `/api/admin/portfolio/${projectId}?trash=true`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to move project to trash');
      }

      toast({ title: 'Moved to Trash', description: 'Project moved to Trash' });
      fetchProjects();
    } catch (err) {
      toast({
        title: 'Error',
        description:
          'Failed to move project to trash: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
        variant: 'destructive',
      });
    }
    setProcessingIds(prev => prev.filter(id => id !== projectId));
  };

  const toggleSelect = (projectId: string, checked?: boolean) => {
    setSelectedIds(prev => {
      const exists = prev.includes(projectId);
      if (typeof checked === 'boolean') {
        if (checked && !exists) return [...prev, projectId];
        if (!checked && exists) return prev.filter(p => p !== projectId);
        return prev;
      }
      return exists ? prev.filter(p => p !== projectId) : [...prev, projectId];
    });
  };

  const selectVisible = () => {
    setSelectedIds(projects.map(p => p._id));
  };

  const bulkMoveToTrash = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: 'Move to Trash',
      description: `Move ${selectedIds.length} project(s) to trash?`,
      confirmText: 'Move',
      cancelText: 'Cancel',
      destructive: true,
    });
    if (!ok) return;

    try {
      setIsBulkProcessing(true);
      const res = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', projectIds: selectedIds }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error || 'Bulk move to trash failed');
      // Refresh list
      setSelectedIds([]);
      toast({
        title: 'Moved to Trash',
        description: `${selectedIds.length} project(s) moved to Trash`,
      });
      await fetchProjects();
    } catch (err) {
      toast({
        title: 'Error',
        description:
          'Bulk move to trash failed: ' +
          (err instanceof Error ? err.message : String(err)),
        variant: 'destructive',
      });
    }
    setIsBulkProcessing(false);
  };

  const bulkDeletePermanent = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: 'Delete Permanently',
      description: `Permanently delete ${selectedIds.length} project(s)? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });
    if (!ok) return;
    try {
      setIsBulkProcessing(true);
      const res = await fetch('/api/admin/portfolio/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, permanent: true }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error || 'Bulk permanent delete failed');
      setSelectedIds([]);
      toast({
        title: 'Deleted',
        description: `${selectedIds.length} project(s) permanently deleted`,
      });
      await fetchProjects();
    } catch (err) {
      toast({
        title: 'Error',
        description:
          'Bulk permanent delete failed: ' +
          (err instanceof Error ? err.message : String(err)),
        variant: 'destructive',
      });
    }
    setIsBulkProcessing(false);
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
      {ConfirmDialog}
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
          <>
            {/* Bulk action bar */}
            {selectedIds.length > 0 && (
              <div className='p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between'>
                <div className='text-sm text-gray-700 dark:text-gray-300'>
                  {selectedIds.length} selected
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={selectVisible}
                    className='px-3 py-1 text-sm bg-gray-100 rounded'
                    disabled={isBulkProcessing}
                  >
                    Select visible
                  </button>
                  <button
                    onClick={bulkMoveToTrash}
                    className='px-3 py-1 text-sm text-red-600 rounded border flex items-center gap-2'
                    disabled={isBulkProcessing}
                  >
                    {isBulkProcessing ? (
                      <svg
                        className='animate-spin h-3 w-3 text-red-600'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                          strokeDasharray='31.4 31.4'
                          fill='none'
                        ></circle>
                      </svg>
                    ) : null}
                    Move to Trash
                  </button>
                  <button
                    onClick={bulkDeletePermanent}
                    className='px-3 py-1 text-sm bg-red-600 text-white rounded flex items-center gap-2'
                    disabled={isBulkProcessing}
                  >
                    {isBulkProcessing ? (
                      <svg
                        className='animate-spin h-3 w-3 text-white'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                          strokeDasharray='31.4 31.4'
                          fill='none'
                        ></circle>
                      </svg>
                    ) : null}
                    Delete Permanently
                  </button>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
              {projects.map(project => (
                <div
                  key={project._id}
                  className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-start gap-3'>
                      <label className='inline-flex items-center'>
                        <input
                          type='checkbox'
                          checked={selectedIds.includes(project._id)}
                          onChange={e =>
                            toggleSelect(project._id, e.target.checked)
                          }
                          className='h-4 w-4 text-blue-600'
                        />
                      </label>
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
                          {project.title}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                          {project.description
                            ? project.description.substring(0, 100) + '...'
                            : 'No description available'}
                        </p>
                      </div>
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
                      {project.status
                        ? project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)
                        : 'Unknown'}
                    </span>
                  </div>

                  <div className='mb-3'>
                    <div className='flex flex-wrap gap-1'>
                      {project.technologies &&
                        project.technologies.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className='inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded'
                          >
                            {tech}
                          </span>
                        ))}
                      {project.technologies &&
                        project.technologies.length > 3 && (
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
                      disabled={
                        processingIds.includes(project._id) || isBulkProcessing
                      }
                    >
                      {project.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/admin/portfolio/edit/${project._id}`)
                      }
                      className='text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                      disabled={
                        processingIds.includes(project._id) || isBulkProcessing
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleMoveToTrash(project._id)}
                      className='text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2'
                      disabled={
                        processingIds.includes(project._id) || isBulkProcessing
                      }
                    >
                      {processingIds.includes(project._id) ? (
                        <svg
                          className='animate-spin h-3 w-3 text-red-600'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                            strokeDasharray='31.4 31.4'
                            fill='none'
                          ></circle>
                        </svg>
                      ) : null}
                      Move to Trash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className='px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
            <span>Items per page</span>
            <select
              value={pagination.itemsPerPage}
              onChange={event =>
                setPagination(prev => ({
                  ...prev,
                  currentPage: 1,
                  itemsPerPage: Number(event.target.value),
                }))
              }
              className='px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            >
              {[10, 25, 50, 100].map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className='text-sm text-gray-700 dark:text-gray-300'>
            Showing page {pagination.currentPage} of{' '}
            {Math.max(pagination.totalPages, 1)} ({pagination.totalItems} total)
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
      </div>
    </div>
  );
}
