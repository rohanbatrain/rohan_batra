import { Suspense } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/portfolio/ProjectCard';
import PostSummary from '@/components/blog/PostSummary';
import { getPublishedBlogPosts } from '@/lib/blog-service';
import {
  getFeaturedProjectsOnly,
  getPublishedProjects,
} from '@/lib/portfolio-service';
import connectToDatabase from '@/lib/mongodb';
import SiteSetting from '@/models/SiteSetting';
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
    const projects = await getFeaturedProjectsOnly(3);
    return projects;
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
  // Read admin toggle for trending fallback (defaults to true)
  await connectToDatabase();
  const trendingToggle = (await SiteSetting.findOne({
    key: 'features.home.trendingfallback',
  }).lean()) as any;
  const allowTrendingFallback =
    typeof trendingToggle?.value === 'boolean'
      ? Boolean((trendingToggle as any).value)
      : true;

  const trending =
    projects.length === 0 && allowTrendingFallback
      ? (await getPublishedProjects(9))
          .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
          .slice(0, 3)
      : [];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
      <HeroSection />
    <SkillsSection />

      {/* Featured Projects */}
      {projects.length > 0 && (
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
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                  />
                ))}
              </Suspense>
            </div>
          </div>
        </section>
      )}

      {/* Trending CTA when no featured */}
      {projects.length === 0 &&
        allowTrendingFallback &&
        trending.length > 0 && (
          <section className='py-12 px-6 lg:px-8 bg-white dark:bg-gray-800'>
            <div className='mx-auto max-w-6xl'>
              <div className='flex items-center justify-between mb-8'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                    Trending Projects
                  </h2>
                  <p className='text-gray-600 dark:text-gray-300 text-sm'>
                    Popular picks based on views and recency.
                  </p>
                </div>
                <Link
                  href='/portfolio'
                  className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors'
                >
                  Explore Portfolio →
                </Link>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {trending.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

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
                      <svg
                        className='w-8 h-8 text-green-600 dark:text-green-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                      Articles Coming Soon
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      I&apos;m crafting some insightful articles about web
                      development and technology. Stay tuned!
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
