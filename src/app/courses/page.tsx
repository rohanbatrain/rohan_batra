import { Suspense } from 'react';
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
    <div className='text-center py-12'>
      <p className='text-lg text-muted-foreground mb-4'>No courses found.</p>
      <Link href='/courses' className='underline'>Clear filters</Link>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  return (
    <div className='rounded-lg border border-border/50 bg-card/30 p-4 hover:bg-card/50 transition'>
      {course.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.heroImage}
          alt={`${course.title} hero`}
          className='mb-3 h-40 w-full rounded object-cover'
        />
      ) : (
        <div className='mb-3 h-40 w-full rounded bg-muted' />
      )}
      <h3 className='text-xl font-semibold line-clamp-2'>{course.title}</h3>
      {course.subtitle ? (
        <p className='mt-1 text-sm text-muted-foreground line-clamp-2'>
          {truncate(course.subtitle, 120)}
        </p>
      ) : null}
      <div className='mt-3 flex items-center gap-3 text-xs text-muted-foreground'>
        <span className='capitalize'>{course.difficulty}</span>
        <span>•</span>
        <span>{course.lessonCount ?? 0} lessons</span>
        <span>•</span>
        <span>{formatMinutes(course.estimatedDurationMinutes)}</span>
      </div>
      {Array.isArray(course.tags) && course.tags.length > 0 ? (
        <div className='mt-3 flex flex-wrap gap-2'>
          {course.tags.slice(0, 3).map((t: string) => (
            <span
              key={t}
              className='rounded bg-muted px-2 py-0.5 text-xs text-foreground/80'
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
      <div className='mt-4'>
        <Link
          href={`/courses/${course.slug}`}
          className='inline-flex items-center rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90'
        >
          View course
        </Link>
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
    if (typeof v === 'string') sp.set(k, v);
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

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-10'>
      <div className='container mx-auto max-w-7xl px-4'>
        <header className='mb-8'>
          <h1 className='text-3xl font-bold'>Courses</h1>
          <p className='mt-2 text-muted-foreground'>
            Learn from curated, hands-on courses. {total} available.
          </p>
        </header>

        {/* Filters placeholder (optional future client component) */}
        {/* This keeps the server implementation minimal for now */}

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
