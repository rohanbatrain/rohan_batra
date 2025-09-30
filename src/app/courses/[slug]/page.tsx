import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata(ctx: PageProps) {
  const { slug } = await ctx.params;
  await connectToDatabase();
  const course = await Course.findOne({ slug }).lean();
  if (!course || course.status !== 'published') {
    return { title: 'Course not found' };
  }
  const title = course.seo?.title || course.title;
  const description = course.seo?.description || course.summary?.slice(0, 150);
  const images = course.seo?.image ? [course.seo.image] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  } as any;
}

export default async function CoursePublicPage(ctx: PageProps) {
  const { slug } = await ctx.params;
  await connectToDatabase();
  const course = await Course.findOne({ slug }).lean();

  if (!course) return notFound();
  // Allow preview of drafts in development via ?preview=1 (Next provides no searchParams here by default).
  // For simplicity, only published courses are visible; previews should be handled via a separate admin preview route.
  if (course.status !== 'published') return notFound();

  return (
    <main className='container mx-auto max-w-5xl px-4 py-10'>
      <header className='mb-8'>
        <h1 className='text-4xl font-bold'>{course.title}</h1>
        {course.subtitle ? (
          <p className='mt-2 text-lg text-muted-foreground'>{course.subtitle}</p>
        ) : null}
      </header>

      {course.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.heroImage}
          alt={`${course.title} hero`}
          className='mb-8 h-64 w-full rounded-md object-cover'
        />
      ) : null}

      <section className='prose prose-invert max-w-none'>
        <h2>About this course</h2>
        <p>{course.summary}</p>
        <ul className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3'>
          {course.estimatedDurationMinutes ? (
            <li>
              <span className='text-sm text-muted-foreground'>Estimated time</span>
              <div className='font-medium'>
                {Math.floor(course.estimatedDurationMinutes / 60) || 0}h{' '}
                {course.estimatedDurationMinutes % 60}m
              </div>
            </li>
          ) : null}
          <li>
            <span className='text-sm text-muted-foreground'>Difficulty</span>
            <div className='font-medium capitalize'>{course.difficulty}</div>
          </li>
          <li>
            <span className='text-sm text-muted-foreground'>Lessons</span>
            <div className='font-medium'>{course.lessonCount ?? 0}</div>
          </li>
        </ul>
      </section>
    </main>
  );
}
