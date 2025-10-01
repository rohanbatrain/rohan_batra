import { parseCourseIndexQuery, listPublicCourses } from '@/lib/courses/query';
import { formatMinutes, truncate } from '@/lib/courses/format';
import Link from 'next/link';
import { generateMetadata as genMeta } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata() {
  return genMeta({
    title: 'Courses',
    description: 'Browse free, public courses to learn by doing.',
    url: '/courses',
    type: 'website',
  });
}

function EmptyState() {
  return (
    <div className='text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/40 dark:bg-gray-800/30'>
      <p className='text-lg text-muted-foreground mb-2'>No courses matched your filters.</p>
      <p className='text-sm text-muted-foreground mb-6'>Try adjusting search, difficulty, or tags.</p>
      <Link href='/courses' className='inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800'>
        Reset filters
      </Link>
    </div>
  );
}

const diffColors: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
  intermediate: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100',
  advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100',
};

function CourseCard({ course }: { course: any }) {
  return (
    <div className='group rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
      <div className='relative'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.heroImage || '/course-hero-default.svg'}
          alt={`${course.title} cover`}
          className='h-44 w-full object-cover'
        />
        <div className='absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md border border-white/40 dark:border-white/10'
          style={{
            // Use color tokens from table above; fallback soft badge
            background: 'rgba(255,255,255,0.8)'
          }}
        >
          <span className={`${diffColors[course.difficulty] ?? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'} rounded-full px-2 py-0.5`}>{course.difficulty}</span>
        </div>
      </div>
      <div className='p-4'>
        <h3 className='text-lg font-semibold line-clamp-2 text-gray-900 dark:text-white'>{course.title}</h3>
        {course.subtitle ? (
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
            {truncate(course.subtitle, 140)}
          </p>
        ) : null}
        <div className='mt-3 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400'>
          <span>{course.lessonCount ?? 0} lessons</span>
          <span>•</span>
          <span>{formatMinutes(course.estimatedDurationMinutes)}</span>
          {course.publishedAt ? (
            <>
              <span>•</span>
              <span>Updated {new Date(course.updatedAt || course.publishedAt).toLocaleDateString()}</span>
            </>
          ) : null}
        </div>
        {Array.isArray(course.tags) && course.tags.length > 0 ? (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {course.tags.slice(0, 4).map((t: string) => (
              <span
                key={t}
                className='rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 px-2 py-0.5 text-[11px] text-gray-700 dark:text-gray-300'
              >
                #{t}
              </span>
            ))}
          </div>
        ) : null}
        <div className='mt-4 flex'>
          <Link
            href={`/courses/${course.slug}`}
            className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-purple-700 transition-colors'
            aria-label={`View course ${course.title}`}
          >
            View course
          </Link>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === 'string') {
      sp.set(k, v);
    } else if (Array.isArray(v)) {
      for (const val of v) sp.append(k, val);
    }
  }
  const prev = page > 1 ? page - 1 : 1;
  const next = page < totalPages ? page + 1 : totalPages;
  const prevQs = new URLSearchParams(sp);
  prevQs.set('page', String(prev));
  const nextQs = new URLSearchParams(sp);
  nextQs.set('page', String(next));
  return (
    <div className='mt-8 flex items-center justify-center gap-4'>
      <Link
        href={`/courses?${prevQs.toString()}`}
        aria-label='Previous page'
        className='underline disabled:opacity-50'
      >
        Prev
      </Link>
      <span className='text-sm text-muted-foreground'>
        Page {page} of {totalPages}
      </span>
      <Link
        href={`/courses?${nextQs.toString()}`}
        aria-label='Next page'
        className='underline disabled:opacity-50'
      >
        Next
      </Link>
    </div>
  );
}

export default async function CoursesIndex({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const parsed = parseCourseIndexQuery(sp);
  const { items, total, page, totalPages } = await listPublicCourses(parsed);
  const selectedDiff = new Set(
    Array.isArray(parsed.difficulty) ? (parsed.difficulty as string[]) : []
  );
  const tagsCsv = Array.isArray(parsed.tags)
    ? (parsed.tags as string[]).join(', ')
    : '';

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-10'>
      <div className='container mx-auto max-w-7xl px-4'>
        <header className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Courses</h1>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Learn from curated, hands-on courses. <span className='font-medium text-gray-900 dark:text-gray-100'>{total}</span> available.
          </p>
        </header>

        {/* Filters (pure server-side GET form, no client JS) */}
        <form action='/courses' method='GET' className='mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 p-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div className='md:col-span-2'>
              <label htmlFor='q' className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'>Search</label>
              <input
                id='q'
                name='q'
                defaultValue={parsed.q || ''}
                placeholder='Search by title, summary, or subtitle'
                className='w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <span className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'>Difficulty</span>
              <div className='flex flex-wrap gap-2'>
                {(['beginner','intermediate','advanced'] as const).map(d => (
                  <label key={d} className='inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-xs'>
                    <input type='checkbox' name='difficulty' value={d} defaultChecked={selectedDiff.has(d)} className='accent-blue-600' />
                    <span className='capitalize'>{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor='tags' className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'>Tags (comma separated)</label>
              <input
                id='tags'
                name='tags'
                defaultValue={tagsCsv}
                placeholder='e.g. cryptography, networks'
                className='w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <label htmlFor='sort' className='text-xs font-medium text-gray-700 dark:text-gray-300'>Sort</label>
              <select
                id='sort'
                name='sort'
                defaultValue={parsed.sort || 'newest'}
                className='rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-sm'
              >
                <option value='newest'>Newest</option>
                <option value='az'>A → Z</option>
              </select>
            </div>
            <div className='flex items-center gap-2'>
              <Link href='/courses' className='text-sm underline text-gray-600 dark:text-gray-400'>Clear</Link>
              <button type='submit' className='inline-flex items-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-3.5 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700'>Apply</button>
            </div>
          </div>
        </form>

        {items.length === 0 ? (
          <EmptyState />)
         : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {items.map((c: any) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} searchParams={sp} />
      </div>
    </div>
  );
}
