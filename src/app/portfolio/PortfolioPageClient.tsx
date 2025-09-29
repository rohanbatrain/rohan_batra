'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Calendar } from 'lucide-react';
import { formatTechLabel } from '@/lib/utils';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { ProjectWithAuthor } from '@/types/project';
// removed evidence-based chips to avoid redundant filters

interface PortfolioPageClientProps {
  initialProjects: ProjectWithAuthor[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  initialTag?: string;
  initialCategory?: string;
  initialTechnology?: string;
  initialSearch?: string;
  showCategoryModeToggle?: boolean;
  initialCategoryMode?: 'any' | 'primary' | 'secondary';
}

export default function PortfolioPageClient({
  initialProjects,
  initialPagination,
  initialTag,
  initialCategory,
  initialTechnology,
  initialSearch,
  showCategoryModeToggle = true,
  initialCategoryMode = 'any',
}: PortfolioPageClientProps) {
  const [projects, setProjects] =
    useState<ProjectWithAuthor[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || 'All'
  );
  const [selectedTechnology, setSelectedTechnology] = useState(
    initialTechnology || initialTag || 'All'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>(
    'newest'
  );
  const [page, setPage] = useState(initialPagination?.page || 1);
  const [hasNext, setHasNext] = useState(initialPagination?.hasNext || false);
  const [totalPages, setTotalPages] = useState(
    initialPagination?.totalPages || 1
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesMode, setCategoriesMode] = useState<'any' | 'all'>('any');
  const [categoryMode, setCategoryMode] = useState<
    'any' | 'primary' | 'secondary'
  >(initialCategoryMode);
  // selection removed from public page (admin only)

  // Enforce primary-only when the toggle is hidden
  useEffect(() => {
    if (!showCategoryModeToggle && categoryMode !== 'primary') {
      setCategoryMode('primary');
    }
  }, [showCategoryModeToggle]);

  // Provide default values to prevent undefined errors
  const pagination = initialPagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Router hooks for URL sync
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Get unique categories from projects
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All']);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/portfolio/meta', { cache: 'no-store' });
        const json = await res.json();
        const cats = ['All', ...((json?.data?.categories as string[]) || [])];
        if (initialCategory && !cats.includes(initialCategory))
          cats.push(initialCategory);
        setCategoryOptions(Array.from(new Set(cats)));
      } catch {}
    })();
  }, [initialCategory]);

  // Get unique technologies from projects
  const [technologyOptions, setTechnologyOptions] = useState<string[]>(['All']);
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All')
          params.set('category', selectedCategory);
        const res = await fetch(`/api/portfolio/meta?${params.toString()}`, {
          cache: 'no-store',
        });
        const json = await res.json();
        const rawTech = (json?.data?.technologies as string[]) || [];
        const rawTags = ((json?.data?.tags as string[]) || []).filter(
          (t: string) =>
            !['forked', 'original'].includes(String(t).toLowerCase())
        );
        const combined = new Set<string>([...rawTech, ...rawTags]);
        const list = ['All', ...Array.from(combined)];
        if (initialTag && !list.includes(initialTag)) list.push(initialTag);
        if (initialTechnology && !list.includes(initialTechnology))
          list.push(initialTechnology);
        setTechnologyOptions(Array.from(new Set(list)));
      } catch {}
    })();
  }, [initialTag, initialTechnology, selectedCategory]);

  // Sort projects (filtering handled server-side)
  const displayProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      const aForked = a.tags?.includes('forked');
      const bForked = b.tags?.includes('forked');
      if (aForked !== bForked) return aForked ? 1 : -1;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'popular':
          return b.viewCount - a.viewCount;
        default:
          return 0;
      }
    });
    return sorted;
  }, [projects, sortBy]);

  // Fetch a page (with current filters)
  async function fetchPage(n: number, { append }: { append: boolean }) {
    const params = new URLSearchParams();
    params.set('page', String(n));
    params.set('limit', String(initialPagination?.limit || 12));
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
      params.set('mode', categoriesMode);
    } else if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
      params.set(
        'categoryMode',
        showCategoryModeToggle ? categoryMode : 'primary'
      );
    }
    if (selectedTechnology && selectedTechnology !== 'All')
      params.set('technology', selectedTechnology);
    if (searchTerm) params.set('search', searchTerm);
    const res = await fetch(`/api/portfolio/projects?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return;
    const json = await res.json();
    const data = json?.data;
    if (!data) return;
    setProjects(prev => (append ? [...prev, ...data.projects] : data.projects));
    setPage(data.currentPage);
    setHasNext(data.currentPage < data.totalPages);
    setTotalPages(data.totalPages || 1);
  }

  // Sync filters and page to URL
  useEffect(() => {
    const params = new URLSearchParams(sp?.toString());
    if (selectedCategories.length > 0) {
      params.delete('category');
      params.set('categories', selectedCategories.join(','));
      params.set('mode', categoriesMode);
    } else {
      params.delete('categories');
      params.delete('mode');
      if (selectedCategory && selectedCategory !== 'All')
        params.set('category', selectedCategory);
      else params.delete('category');
      if (
        selectedCategory &&
        selectedCategory !== 'All' &&
        showCategoryModeToggle
      )
        params.set('categoryMode', categoryMode);
      else params.delete('categoryMode');
    }
    if (selectedTechnology && selectedTechnology !== 'All')
      params.set('technology', selectedTechnology);
    else params.delete('technology');
    if (searchTerm) params.set('search', searchTerm);
    else params.delete('search');
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedCategory, selectedTechnology, searchTerm, page]);

  // Refetch when filters change (reset to page 1)
  useEffect(() => {
    (async () => {
      await fetchPage(1, { append: false });
    })();
  }, [
    selectedCategory,
    selectedCategories,
    categoriesMode,
    categoryMode,
    selectedTechnology,
    searchTerm,
  ]);

  // Separate featured projects
  const featuredProjects = displayProjects.filter(project => project.featured);
  const regularProjects = displayProjects.filter(project => !project.featured);

  // public portfolio does not support bulk selection or deletion

  async function loadMore() {
    if (!hasNext) return;
    const params = new URLSearchParams();
    params.set('page', String(page + 1));
    params.set('limit', String(initialPagination?.limit || 12));
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
      params.set(
        'categoryMode',
        showCategoryModeToggle ? categoryMode : 'primary'
      );
    }
    if (selectedTechnology && selectedTechnology !== 'All')
      params.set('technology', selectedTechnology);
    if (searchTerm) params.set('search', searchTerm);
    const res = await fetch(`/api/portfolio/projects?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return;
    const json = await res.json();
    const data = json?.data;
    if (!data) return;
    setProjects(prev => [...prev, ...data.projects]);
    setPage(data.currentPage);
    setHasNext(data.currentPage < data.totalPages);
    // Removed setVisibleCount as we are switching to Prev/Next only.
  }

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
          Portfolio
        </h1>
        <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
          A showcase of my latest projects, experiments, and contributions to
          the development community. Each project represents a unique challenge
          and learning experience.
        </p>
        {/* quick chips removed to keep filters simple */}
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
              placeholder='Search projects...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            />
          </div>

          {/* Filters and View Controls */}
          <div className='flex gap-4 items-center'>
            {/* Category Filter */}
            <div className='flex items-center gap-2'>
              <Filter className='h-5 w-5 text-gray-500' />
              <span className='text-sm text-gray-600 dark:text-gray-300'>
                Category
              </span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                aria-label='Category filter'
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {formatTechLabel(category)}
                  </option>
                ))}
              </select>
              {/* Category match mode */}
              {selectedCategory !== 'All' && showCategoryModeToggle && (
                <select
                  value={categoryMode}
                  onChange={e =>
                    setCategoryMode(
                      e.target.value as 'any' | 'primary' | 'secondary'
                    )
                  }
                  aria-label='Category match mode'
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                >
                  <option value='any'>Primary or Secondary</option>
                  <option value='primary'>Primary Only</option>
                  <option value='secondary'>Secondary Only</option>
                </select>
              )}
            </div>

            {/* Feature Filter (tech/tags within category) */}
            <select
              value={selectedTechnology}
              onChange={e => setSelectedTechnology(e.target.value)}
              aria-label={`Feature in ${selectedCategory !== 'All' ? selectedCategory : 'All Categories'}`}
              className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
            >
              {technologyOptions.map(tech => (
                <option key={tech} value={tech}>
                  {formatTechLabel(tech)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')
              }
              className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
              <option value='popular'>Most Popular</option>
            </select>

            {/* View Mode Toggle */}
            <div className='flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1'>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Grid className='h-4 w-4' />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <List className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advanced category filters */}
      <div className='mb-4'>
        <details className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3'>
          <summary className='cursor-pointer text-sm text-gray-700 dark:text-gray-300'>
            Advanced: multi-category filter
          </summary>
          <div className='mt-3 flex flex-wrap gap-2'>
            {categoryOptions
              .filter(c => c !== 'All')
              .map(cat => {
                const checked = selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded border ${checked ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={e => {
                        setSelectedCategory('All');
                        setSelectedCategories(prev =>
                          e.target.checked
                            ? [...prev, cat]
                            : prev.filter(c => c !== cat)
                        );
                        setPage(1);
                      }}
                    />
                    <span>{formatTechLabel(cat)}</span>
                  </label>
                );
              })}
          </div>
          <div className='mt-3 flex items-center gap-2'>
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              Match
            </span>
            <select
              value={categoriesMode}
              onChange={e => setCategoriesMode(e.target.value as 'any' | 'all')}
              className='px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800'
            >
              <option value='any'>Any of selected</option>
              <option value='all'>All selected</option>
            </select>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setCategoriesMode('any');
                  setPage(1);
                }}
                className='ml-2 text-xs text-gray-600 dark:text-gray-300 underline'
              >
                Clear multi-category
              </button>
            )}
          </div>
        </details>
      </div>

      {/* Results Count */}
      {/* Bulk action bar */}
      {/* public UI: no bulk admin actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className='mb-6'
      >
        <p className='text-gray-600 dark:text-gray-300'>
          {displayProjects.length} project
          {displayProjects.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {selectedTechnology !== 'All' &&
            ` using ${formatTechLabel(selectedTechnology)}`}
        </p>
      </motion.div>

      {/* Featured Projects */}
      {featuredProjects.length > 0 &&
        searchTerm === '' &&
        selectedCategory === 'All' &&
        selectedTechnology === 'All' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='mb-12'
          >
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
              <Calendar className='h-6 w-6' />
              Featured Projects
            </h2>
            <div
              className={`grid gap-8 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 lg:grid-cols-2 auto-rows-fr'
                  : 'grid-cols-1'
              }`}
            >
              {featuredProjects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  activeCategory={
                    selectedCategory !== 'All' ? selectedCategory : undefined
                  }
                />
              ))}
            </div>
          </motion.div>
        )}

      {/* All Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
          {searchTerm === '' &&
          selectedCategory === 'All' &&
          selectedTechnology === 'All'
            ? 'All Projects'
            : 'Search Results'}
        </h2>

        {displayProjects.length > 0 ? (
          <div
            className={`grid gap-8 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr'
                : 'grid-cols-1'
            }`}
          >
            {(featuredProjects.length > 0 &&
            searchTerm === '' &&
            selectedCategory === 'All' &&
            selectedTechnology === 'All'
              ? regularProjects
              : displayProjects
            ).map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                activeCategory={
                  selectedCategory !== 'All' ? selectedCategory : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <div className='text-gray-400 mb-4'>
              <Search className='h-16 w-16 mx-auto' />
            </div>
            <h3 className='text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2'>
              No projects found
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </motion.div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className='mt-12 flex justify-center'
        >
          <div className='flex gap-2'>
            <button
              onClick={() =>
                fetchPage(Math.max(1, page - 1), { append: false })
              }
              disabled={page <= 1}
              className='px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50'
            >
              Prev
            </button>
            <span className='text-sm text-gray-500 dark:text-gray-400 px-2 py-1'>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() =>
                fetchPage(Math.min(totalPages, page + 1), { append: false })
              }
              disabled={page >= totalPages}
              className='px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
