import { Suspense } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/portfolio/ProjectCard';
import PostSummary from '@/components/blog/PostSummary';
import { getPublishedBlogPosts } from '@/lib/blog-service';
import { getPublishedProjects } from '@/lib/portfolio-service';
import HeroSection from '@/components/home/HeroSection';
import SkillsSection from '@/components/home/SkillsSection';

async function getFeaturedBlogPosts() {
  try {
    const posts = await getPublishedBlogPosts(3);
    // Filter for featured posts first, then take the most recent
    const featuredPosts = posts.filter(post => post.featured);
    if (featuredPosts.length >= 3) {
      return featuredPosts.slice(0, 3);
    }
    // If not enough featured posts, fill with recent posts
    return posts.slice(0, 3);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

async function getFeaturedProjects() {
  try {
    const projects = await getPublishedProjects(3);
    // The service already sorts by featured first, then by creation date
    return projects.slice(0, 3);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function Home() {
  const [blogPosts, projects] = await Promise.all([
    getFeaturedBlogPosts(),
    getFeaturedProjects(),
  ]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
      <HeroSection />
      <SkillsSection />

      {/* Featured Projects */}
      <section className='py-16 px-6 lg:px-8 bg-white dark:bg-gray-800'>
        <div className='mx-auto max-w-6xl'>
          <div className='flex items-center justify-between mb-12'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
                Featured Projects
              </h2>
              <p className='text-gray-600 dark:text-gray-300'>
                A selection of my recent work and personal projects.
              </p>
            </div>
            <Link
              href='/portfolio'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors'
            >
              View All Projects →
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Suspense fallback={<div>Loading projects...</div>}>
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                  />
                ))
              ) : (
                <div className='col-span-full text-center py-16'>
                  <div className='mx-auto max-w-md'>
                    <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center'>
                      <svg className='w-8 h-8 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                      </svg>
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                      Projects Coming Soon
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      I'm working on some exciting new projects. Check back soon to see what I'm building!
                    </p>
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className='py-16 px-6 lg:px-8'>
        <div className='mx-auto max-w-6xl'>
          <div className='flex items-center justify-between mb-12'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
                Latest Articles
              </h2>
              <p className='text-gray-600 dark:text-gray-300'>
                Thoughts on web development, design, and technology trends.
              </p>
            </div>
            <Link
              href='/blog'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors'
            >
              View All Posts →
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Suspense fallback={<div>Loading posts...</div>}>
              {blogPosts.length > 0 ? (
                blogPosts.map((post, index) => (
                  <PostSummary key={post._id} post={post} index={index} />
                ))
              ) : (
                <div className='col-span-full text-center py-16'>
                  <div className='mx-auto max-w-md'>
                    <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center'>
                      <svg className='w-8 h-8 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                      </svg>
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                      Articles Coming Soon
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      I&apos;m crafting some insightful articles about web development and technology. Stay tuned!
                    </p>
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
