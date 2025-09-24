import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSkillBySlug } from '@/data/skills';
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

interface Props { params: Promise<{ slug: string }> }

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return notFound();

  const blogQuery = encodeURIComponent(skill.blogTags[0] || skill.title);
  const projectQuery = encodeURIComponent(skill.projectTags[0] || skill.title);

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900'>
      {/* Hero */}
      <section className='border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-gray-900/40 backdrop-blur'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='flex items-start justify-between gap-6'>
            <div>
              <div className='flex items-center gap-3 mb-3'>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-gray-800 ${''}`}>
                  <skill.Icon className={`h-6 w-6 ${skill.color}`} />
                </div>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>{skill.title}</h1>
              </div>
              <p className='text-gray-600 dark:text-gray-300 max-w-2xl'>
                {skill.description}
              </p>
              {/* Trust badge removed as requested */}
            </div>

            <div className='hidden md:flex flex-col gap-3'>
              <Link href={`/blog?tag=${blogQuery}`} className='inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-white hover:opacity-90'>
                View Blog Posts
              </Link>
              <Link href={`/portfolio?tag=${projectQuery}`} className='inline-flex items-center justify-center h-10 px-4 rounded-md bg-secondary text-secondary-foreground hover:opacity-90'>
                View Projects
              </Link>
            </div>
          </div>
          <div className='mt-6 md:hidden flex gap-3'>
            <Link href={`/blog?tag=${blogQuery}`} className='flex-1 inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-white hover:opacity-90'>
              View Blog Posts
            </Link>
            <Link href={`/portfolio?tag=${projectQuery}`} className='flex-1 inline-flex items-center justify-center h-10 px-4 rounded-md bg-secondary text-secondary-foreground hover:opacity-90'>
              View Projects
            </Link>
          </div>
        </div>
      </section>

      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        {/* Cybersecurity-specific sections removed as requested */}

        {/* Tags */}
        <div className='rounded-xl bg-white dark:bg-gray-900 p-6 border border-slate-200 dark:border-slate-800'>
          <h2 className='text-xl font-semibold mb-3 text-gray-900 dark:text-white'>Tags</h2>
          <div className='flex flex-wrap gap-2'>
            {Array.from(new Set([...skill.blogTags, ...skill.projectTags])).map(tag => (
              <span key={tag} className='text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
