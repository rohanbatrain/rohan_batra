import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseModule from '@/models/CourseModule';
import CourseLesson from '@/models/CourseLesson';
import { formatMinutes } from '@/lib/courses/format';
import { generateCourseStructuredData } from '@/lib/seo-course';
import { auth } from '@clerk/nextjs/server';
import CourseEnrollment from '@/models/CourseEnrollment';
import CourseProgress from '@/models/CourseProgress';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export function buildOrderedOutline(modules: any[], lessons: any[]) {
  const lessonsByModule = new Map<string, any[]>();
  for (const m of modules as any[]) lessonsByModule.set(String(m._id), []);
  for (const l of lessons as any[]) {
    const key = String(l.moduleId);
    const arr = lessonsByModule.get(key);
    if (arr) arr.push(l);
  }
  return modules.map((m: any) => {
    const ordered = Array.isArray(m.lessonIds) && m.lessonIds.length
      ? (m.lessonIds as any[])
          .map((id: any) => (lessonsByModule.get(String(m._id)) || []).find(l => String(l._id) === String(id)))
          .filter(Boolean)
      : (lessonsByModule.get(String(m._id)) || []).sort((a: any, b: any) => a.title.localeCompare(b.title));
    return { ...m, lessons: ordered };
  });
}

export async function generateMetadata(ctx: PageProps) {
  const { slug } = await ctx.params;
  await connectToDatabase();
  const course = await Course.findOne({ slug }).lean();
  if (!course || course.status !== 'published' || course.visibility !== 'public') {
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
  if (course.status !== 'published' || course.visibility !== 'public') return notFound();

  // Fetch outline (modules + lessons)
  const modules = await CourseModule.find({ courseId: course._id })
    .select('title summary order estimatedDurationMinutes lessonIds')
    .sort({ order: 1 })
    .lean();

  const moduleIds = modules.map((m: any) => m._id);
  const lessons = await CourseLesson.find({ courseId: course._id, moduleId: { $in: moduleIds } })
    .select('moduleId title contentType blogSlug estimatedDurationMinutes isPreviewable')
    .lean();
  const outline = buildOrderedOutline(modules as any[], lessons as any[]);

  // Enrollment/progress for current user (if signed in)
  const { userId } = await auth();
  let enrollment: any = null;
  let progress: any = null;
  if (userId) {
    const userDoc = (await User.findOne({ clerkId: userId }).lean()) as
      | { _id: any }
      | null;
    if (userDoc && userDoc._id) {
      enrollment = await CourseEnrollment.findOne({ courseId: course._id, userId: userDoc._id }).lean();
      if (enrollment) {
        progress = await CourseProgress.findOne({ enrollmentId: enrollment._id }).lean();
      }
    }
  }

  return (
    <main className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      <script
        type='application/ld+json'
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateCourseStructuredData({
              title: course.title,
              summary: course.summary,
              slug: course.slug,
              image: course.heroImage,
              tags: course.tags,
            })
          ),
        }}
      />
      
      {/* Hero Section */}
      <div className='relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900'>
        <div className='absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),transparent)]' />
        <div className='container mx-auto max-w-6xl px-4 py-12 md:py-20 relative'>
          <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
            {/* Left: Text Content */}
            <div className='flex flex-col justify-center'>
              <div className='mb-4 flex flex-wrap items-center gap-2'>
                <span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-gray-900 dark:bg-blue-900/30 dark:text-blue-300'>
                  {course.difficulty === 'beginner' && '🌱 Beginner'}
                  {course.difficulty === 'intermediate' && '🚀 Intermediate'}
                  {course.difficulty === 'advanced' && '⚡ Advanced'}
                </span>
                {enrollment && (
                  <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-gray-900 dark:bg-green-900/30 dark:text-green-300'>
                    ✓ Enrolled
                  </span>
                )}
              </div>
              
              <h1 className='mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl'>
                {course.title}
              </h1>
              
              {course.subtitle && (
                <p className='mb-6 text-lg text-gray-600 dark:text-gray-300 md:text-xl'>
                  {course.subtitle}
                </p>
              )}
              
              <p className='mb-6 text-base text-gray-600 dark:text-gray-400 leading-relaxed'>
                {course.summary}
              </p>
              
              {/* Quick Stats */}
              <div className='mb-6 grid grid-cols-3 gap-4'>
                <div className='rounded-lg border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-800/60 p-3 backdrop-blur-sm'>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {course.lessonCount ?? 0}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>Lessons</div>
                </div>
                <div className='rounded-lg border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-800/60 p-3 backdrop-blur-sm'>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {course.estimatedDurationMinutes ? formatMinutes(course.estimatedDurationMinutes) : '—'}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>Duration</div>
                </div>
                <div className='rounded-lg border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-800/60 p-3 backdrop-blur-sm'>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {progress?.percentageComplete ?? 0}%
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>Complete</div>
                </div>
              </div>
              
              {/* CTA Section */}
              <div className='flex flex-wrap items-center gap-4'>
                {userId ? (
                  enrollment ? (
                    <>
                      <Link
                        href='#outline'
                        className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200'
                      >
                        Continue Learning
                      </Link>
                      <form action={`/api/courses/${course.slug}/unenroll`} method='POST'>
                        <button
                          type='submit'
                          className='inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200'
                        >
                          Unenroll
                        </button>
                      </form>
                    </>
                  ) : (
                    <form action={`/api/courses/${course.slug}/enroll`} method='POST'>
                      <button
                        type='submit'
                        className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200'
                      >
                        Enroll Now — Free
                      </button>
                    </form>
                  )
                ) : (
                  <Link
                    href='/sign-in'
                    className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200'
                  >
                    Sign In to Enroll
                  </Link>
                )}
              </div>
              
              {/* Progress Bar (if enrolled) */}
              {enrollment && progress && (
                <div className='mt-6'>
                  <div className='mb-2 flex items-center justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>Your Progress</span>
                    <span className='font-semibold text-gray-900 dark:text-white'>
                      {progress.percentageComplete ?? 0}%
                    </span>
                  </div>
                  <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                    <div
                      className='h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300'
                      style={{ width: `${progress.percentageComplete ?? 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right: Hero Image */}
            <div className='relative'>
              {course.heroImage ? (
                <div className='relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.heroImage}
                    alt={`${course.title} hero`}
                    className='h-full w-full object-cover'
                  />
                </div>
              ) : (
                <div className='relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center border border-gray-200 dark:border-gray-700'>
                  <div className='text-center'>
                    <div className='text-6xl mb-4'>📚</div>
                    <p className='text-gray-600 dark:text-gray-400'>Course Image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tags */}
          {Array.isArray(course.tags) && course.tags.length > 0 && (
            <div className='mt-8 flex flex-wrap gap-2'>
              {course.tags.map((t: string) => (
                <Link
                  key={t}
                  href={`/courses?tags=${encodeURIComponent(t)}`}
                  className='inline-flex items-center rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm hover:bg-white dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200'
                  aria-label={`Filter courses by tag ${t}`}
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Course Outline */}
      <div id='outline' className='container mx-auto max-w-6xl px-4 py-12'>
        <div className='mb-8'>
          <h2 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Course Curriculum
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            {outline.length} {outline.length === 1 ? 'module' : 'modules'} • {course.lessonCount ?? 0} {course.lessonCount === 1 ? 'lesson' : 'lessons'}
          </p>
        </div>
        
        {outline.length === 0 ? (
          <div className='rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50'>
            <div className='text-4xl mb-4'>📝</div>
            <p className='text-gray-600 dark:text-gray-400'>
              Course content coming soon. Check back later!
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {outline.map((m: any, i: number) => (
              <div
                key={String(m._id)}
                className='group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'
              >
                {/* Module Header */}
                <div className='border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-2'>
                        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white'>
                          {i + 1}
                        </span>
                        <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                          {m.title}
                        </h3>
                      </div>
                      {m.summary && (
                        <p className='ml-10 text-sm text-gray-600 dark:text-gray-400'>
                          {m.summary}
                        </p>
                      )}
                    </div>
                    <div className='flex flex-col items-end gap-1 text-right'>
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        {formatMinutes(m.estimatedDurationMinutes)}
                      </span>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        {m.lessons.length} {m.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Lessons List */}
                <ul className='divide-y divide-gray-100 dark:divide-gray-700'>
                  {m.lessons.map((l: any, idx: number) => (
                    <li
                      key={String(l._id)}
                      className='group/lesson flex items-center justify-between gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    >
                      <div className='flex flex-1 items-center gap-3'>
                        <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                          {idx + 1}
                        </span>
                        <div className='flex-1'>
                          <div className='font-medium text-gray-900 dark:text-white'>
                            {l.title}
                          </div>
                          <div className='mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                            <span className='capitalize'>{l.contentType}</span>
                            <span>•</span>
                            <span>{formatMinutes(l.estimatedDurationMinutes)}</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {l.isPreviewable && l.contentType === 'blog' && l.blogSlug ? (
                          <Link
                            href={`/blog/${l.blogSlug}`}
                            className='rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
                            aria-label={`Preview lesson: ${l.title}`}
                          >
                            Preview
                          </Link>
                        ) : l.isPreviewable ? (
                          <span className='rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400'>
                            Preview N/A
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
