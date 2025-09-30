import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSkillBySlug } from '@/data/skills';
import TryHackMeSection from '@/components/home/TryHackMeSection';
import { getPublishedBlogPosts } from '@/lib/blog-service';
import { getPublishedProjects } from '@/lib/portfolio-service';
import PostSummary from '@/components/blog/PostSummary';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { Tag, FileText as FileTextIcon, FolderOpen, ArrowRight } from 'lucide-react';
import { skillsData } from '@/data/skills';
import { getBooleanSetting, SettingKeys } from '@/lib/settings';
import {
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  Fingerprint,
  GlobeLock,
  Bug,
  KeySquare,
  Activity,
} from 'lucide-react';

interface Props {
  params: { slug: string };
}

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = params;
  const skill = getSkillBySlug(slug);
  if (!skill) return notFound();

  // Feature toggle: show/hide Tags panel (default hidden)
  const showTagsPanel = await getBooleanSetting(SettingKeys.skillsTagsPanel, false);

  const blogQuery = encodeURIComponent(skill.blogTags[0] || skill.title);
  const projectQuery = encodeURIComponent(skill.projectTags[0] || skill.title);

  // Fetch content and filter by tags for this skill
  const [allPosts, allProjects] = await Promise.all([
    getPublishedBlogPosts(100),
    getPublishedProjects(100),
  ]);

  const blogTagSet = new Set((skill.blogTags || []).map(t => t.toLowerCase()));
  const projectTagSet = new Set((skill.projectTags || []).map(t => t.toLowerCase()));

  const matchedPosts = allPosts.filter(p =>
    Array.isArray(p.tags) && p.tags.some(t => blogTagSet.has(String(t).toLowerCase()))
  ).slice(0, 3);

  const matchedProjects = allProjects.filter(pr =>
    Array.isArray(pr.tags) && pr.tags.some(t => projectTagSet.has(String(t).toLowerCase()))
  ).slice(0, 3);

  // Related skills from same category (exclude current)
  const relatedSkills = skillsData
    .filter(s => s.category === skill.category && s.slug !== skill.slug)
    .slice(0, 4);

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900'>
      {/* Hero */}
      <section className='border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='flex items-start justify-between gap-6'>
            <div>
              <div className='flex items-center gap-3 mb-3'>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-gray-800 ${''}`}>
                  <skill.Icon className={`h-6 w-6 ${skill.color}`} />
                </div>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {skill.title}
                </h1>
              </div>
              <p className='text-gray-600 dark:text-gray-300 max-w-2xl'>
                {skill.description}
              </p>
              {/* Trust badge removed as requested */}
            </div>

            <div className='hidden md:flex flex-col gap-3'>
              <Link
                href={`/blog?tag=${blogQuery}`}
                className='inline-flex items-center justify-center h-10 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-400 shadow-sm'
              >
                View Blog Posts
              </Link>
              <Link
                href={`/portfolio?tag=${projectQuery}`}
                className='inline-flex items-center justify-center h-10 px-4 rounded-md border border-slate-300 text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-400 shadow-sm'
              >
                View Projects
              </Link>
            </div>
          </div>
          <div className='mt-6 md:hidden flex gap-3'>
            <Link
              href={`/blog?tag=${blogQuery}`}
              className='flex-1 inline-flex items-center justify-center h-10 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-400 shadow-sm'
            >
              View Blog Posts
            </Link>
            <Link
              href={`/portfolio?tag=${projectQuery}`}
              className='flex-1 inline-flex items-center justify-center h-10 px-4 rounded-md border border-slate-300 text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-400 shadow-sm'
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        {/* Intro sentence removed per request */}
        {/* Cybersecurity-specific sections removed as requested */}

  {/* Tags */}
  {showTagsPanel && (
  <div className='rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-6 md:p-8 border border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between mb-4 flex-wrap gap-2'>
            <div className='inline-flex items-center gap-2'>
              <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800'>
                <Tag className='h-4 w-4 text-slate-600 dark:text-slate-300' />
              </span>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Tags</h2>
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400'>Quick filters</div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0'>
            <div className='min-w-0'>
              <div className='mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300'>
                <FileTextIcon className='h-4 w-4' /> Blog tags
              </div>
              <div className='flex flex-wrap gap-2 min-w-0'>
                {skill.blogTags.length === 0 && (
                  <span className='text-xs text-slate-500 dark:text-slate-400'>No tags yet</span>
                )}
                {skill.blogTags.map(tag => (
                  <Link
                    key={`blog-${tag}`}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    aria-label={`Filter blog posts by tag ${tag}`}
                    className='inline-flex items-center gap-2 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors max-w-[180px] truncate'
                  >
                    <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                    {tag}
                  </Link>
                ))}

              </div>
            </div>
            <div className='min-w-0'>
              <div className='mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300'>
                <FolderOpen className='h-4 w-4' /> Project tags
              </div>
              <div className='flex flex-wrap gap-2 min-w-0'>
                {skill.projectTags.length === 0 && (
                  <span className='text-xs text-slate-500 dark:text-slate-400'>No tags yet</span>
                )}
                {skill.projectTags.map(tag => (
                  <Link
                    key={`proj-${tag}`}
                    href={`/portfolio?tag=${encodeURIComponent(tag)}`}
                    aria-label={`Filter projects by tag ${tag}`}
                    className='inline-flex items-center gap-2 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors max-w-[180px] truncate'
                  >
                    <span className='h-1.5 w-1.5 rounded-full bg-purple-500' />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
  </div>
  )}

        {/* Related Skills moved to the end of the page */}

        {/* Practice hub removed for competitive programming as requested */}

        {/* Top Projects matching skill tags */}
        <section className='mt-10'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>Top Projects</h2>
            <Link
              href={`/portfolio?tag=${projectQuery}`}
              className='inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline'
            >
              View all <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
          <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>Curated projects related to this skill.</p>
          {matchedProjects.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {matchedProjects.map((project, index) => (
                <ProjectCard key={project._id} project={project} index={index} />
              ))}
            </div>
          ) : (
            <div className='text-center py-16'>
              <div className='mx-auto max-w-md'>
                <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center'>
                  <svg className='w-8 h-8 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7h18M3 12h18M3 17h18' />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Projects Coming Soon</h3>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>I’m curating relevant projects for this skill. Check back soon!</p>
                <Link
                  href={`/portfolio?tag=${projectQuery}`}
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800'
                >
                  Explore Projects <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Top Articles matching skill tags */}
        <section className='mt-10'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>Top Articles</h2>
            <Link
              href={`/blog?tag=${blogQuery}`}
              className='inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline'
            >
              View all <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
          <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>Recent posts connected to this skill.</p>
          {matchedPosts.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {matchedPosts.map((post, index) => (
                <PostSummary key={post._id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className='text-center py-16'>
              <div className='mx-auto max-w-md'>
                <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center'>
                  <svg className='w-8 h-8 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Articles Coming Soon</h3>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>I’m crafting articles relevant to this skill. Stay tuned!</p>
                <Link
                  href={`/blog?tag=${blogQuery}`}
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800'
                >
                  Explore Articles <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* TryHackMe summary only for cybersecurity-related page (single placement) */}
      {skill.slug === 'cybersecurity-engineer' && (
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <TryHackMeSection />
        </div>
      )}

      {/* Related Skills (final section at the bottom) */}
      {relatedSkills.length > 0 && (
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <section>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-6'>Related Skills</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
              {relatedSkills.map(s => {
                const bq = encodeURIComponent((s.blogTags?.[0] ?? s.title) as string);
                const pq = encodeURIComponent((s.projectTags?.[0] ?? s.title) as string);
                return (
                  <div
                    key={s.slug}
                    className='rounded-xl bg-white dark:bg-gray-800 shadow ring-1 ring-slate-200 dark:ring-slate-800 p-6 sm:p-8 transition-shadow hover:shadow-lg'
                  >
                    <div className='flex flex-col items-center text-center'>
                      <div className='mb-4 h-12 w-12 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center ring-1 ring-slate-200 dark:ring-gray-600'>
                        <s.Icon className={`h-6 w-6 ${s.color}`} />
                      </div>
                      <Link
                        href={`/skills/${s.slug}`}
                        className='text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded'
                        aria-label={`Navigate to ${s.title}`}
                      >
                        {s.title}
                      </Link>
                      <p className='mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2'>
                        {s.description}
                      </p>
                      <div className='mt-4 flex items-center gap-3 text-sm'>
                        <Link
                          href={`/blog?tag=${bq}`}
                          className='text-slate-600 dark:text-slate-300 underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400'
                        >
                          Blog
                        </Link>
                        <span className='text-slate-400'>•</span>
                        <Link
                          href={`/portfolio?tag=${pq}`}
                          className='text-slate-600 dark:text-slate-300 underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400'
                        >
                          Projects
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
