'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Calendar } from 'lucide-react';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { ProjectWithAuthor } from '@/types/project';

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
}

export default function PortfolioPageClient({
  initialProjects,
  initialPagination,
}: PortfolioPageClientProps) {
  const [projects] = useState<ProjectWithAuthor[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTechnology, setSelectedTechnology] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>(
    'newest'
  );

  // Get unique categories from projects
  const categories = useMemo(() => {
    const cats = projects.map(project => project.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [projects]);

  // Get unique technologies from projects
  const technologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      project.technologies.forEach(tech => techSet.add(tech));
    });
    return ['All', ...Array.from(techSet)];
  }, [projects]);

  // Filter and sort projects
  const displayProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const matchesSearch =
        searchTerm === '' ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech =>
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory;

      const matchesTechnology =
        selectedTechnology === 'All' ||
        project.technologies.includes(selectedTechnology);

      return matchesSearch && matchesCategory && matchesTechnology;
    });

    // Sort projects
    filtered.sort((a, b) => {
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

    return filtered;
  }, [projects, searchTerm, selectedCategory, selectedTechnology, sortBy]);

  // Separate featured projects
  const featuredProjects = displayProjects.filter(project => project.featured);
  const regularProjects = displayProjects.filter(project => !project.featured);

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

            {/* Technology Filter */}
            <select
              value={selectedTechnology}
              onChange={e => setSelectedTechnology(e.target.value)}
              className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
            >
              {technologies.map(tech => (
                <option key={tech} value={tech}>
                  {tech}
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

      {/* Results Count */}
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
          {selectedTechnology !== 'All' && ` using ${selectedTechnology}`}
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
                  ? 'grid-cols-1 lg:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {featuredProjects.map(project => (
                <ProjectCard key={project._id} project={project} />
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
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
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
              <ProjectCard key={project._id} project={project} />
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

      {/* Pagination (if needed) */}
      {initialPagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className='mt-12 flex justify-center'
        >
          <div className='flex gap-2'>
            {/* Add pagination controls here */}
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Page {initialPagination.page} of {initialPagination.totalPages}
            </span>
          </div>
        </motion.div>
      )}
    </>
  );
}
