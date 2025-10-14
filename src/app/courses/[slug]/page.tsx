import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseModule from '@/models/CourseModule';
import CourseLesson from '@/models/CourseLesson';
import FlashcardDeck from '@/models/FlashcardDeck';
import { formatMinutes } from '@/lib/courses/format';
import { generateCourseStructuredData } from '@/lib/seo-course';
import { auth } from '@clerk/nextjs/server';
import CourseEnrollment from '@/models/CourseEnrollment';
import CourseProgress from '@/models/CourseProgress';
import User from '@/models/User';
import { KnowledgeGraph } from '@/components/courses/KnowledgeGraph';
import { ViewModuleButton } from '@/components/courses/ViewModuleButton';
import { StudyButton } from '@/components/flashcards/StudyButton';
import { buildOrderedOutline } from '@/lib/courses/outline';
import { enrichModulesWithUnlockStatus, calculateProgressStats, getNextUnlockedLesson } from '@/lib/courses/unlock-logic';

export const dynamic = 'force-dynamic';

type PageProps = { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ message?: string; reason?: string }>;
};

export async function generateMetadata(ctx: PageProps) {
  const { slug } = await ctx.params;
  await connectToDatabase();
  const course = await Course.findOne({ slug }).lean();
  if (
    !course ||
    course.status !== 'published' ||
    course.visibility !== 'public'
  ) {
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
  const { message, reason } = await ctx.searchParams;
  
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error('Database connection unavailable. Please try again later.');
  }
  
  const course = await Course.findOne({ slug }).lean();

  if (!course) return notFound();
  // Allow preview of drafts in development via ?preview=1 (Next provides no searchParams here by default).
  // For simplicity, only published courses are visible; previews should be handled via a separate admin preview route.
  if (course.status !== 'published' || course.visibility !== 'public')
    return notFound();

  // Fetch outline (modules + lessons)
  const modules = await CourseModule.find({ courseId: course._id })
    .select('title summary order estimatedDurationMinutes lessonIds')
    .sort({ order: 1 })
    .lean();

  const moduleIds = modules.map((m: any) => m._id);
  const lessons = await CourseLesson.find({
    courseId: course._id,
    moduleId: { $in: moduleIds },
  })
    .select(
      'moduleId title contentType blogSlug estimatedDurationMinutes isPreviewable parentLessonId'
    )
    .lean();
  const outline = buildOrderedOutline(modules as any[], lessons as any[]);

  // Get course flashcard deck (if exists)
  let courseDeck: any = null;
  if (course.flashcardDeckIds && course.flashcardDeckIds.length > 0) {
    courseDeck = await FlashcardDeck.findOne({
      'linkTargets.scope': 'course',
      'linkTargets.courseId': course._id,
      parentDeckId: null,
    })
      .select('_id title cardCount')
      .lean();
  }

  // Enrollment/progress for current user (if signed in)
  const { userId } = await auth();
  let enrollment: any = null;
  let progress: any = null;
  let completedLessonIds: string[] = [];
  
  if (userId) {
    const userDoc = (await User.findOne({ clerkId: userId }).lean()) as {
      _id: any;
    } | null;
    if (userDoc && userDoc._id) {
      enrollment = await CourseEnrollment.findOne({
        courseId: course._id,
        userId: userDoc._id,
      }).lean();
      if (enrollment) {
        progress = await CourseProgress.findOne({
          enrollmentId: enrollment._id,
        }).lean();
        
        // Extract completed lesson IDs for unlock logic
        if (progress && progress.completedLessonIds) {
          completedLessonIds = progress.completedLessonIds.map((id: any) => String(id));
        }
      }
    }
  }

  // Enrich outline with unlock status (progressive unlock logic)
  const enrichedOutline = enrollment 
    ? enrichModulesWithUnlockStatus(outline, completedLessonIds)
    : outline; // Non-enrolled users see everything as preview-only
  
  // Get next unlocked lesson recommendation
  const nextLesson = enrollment ? getNextUnlockedLesson(enrichedOutline, completedLessonIds) : null;
  const progressStats = enrollment ? calculateProgressStats(enrichedOutline, completedLessonIds) : null;

  return (
    <main className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      <style>{`
        /* Hide the native disclosure marker so only our custom chevron appears */
        details > summary::-webkit-details-marker { display: none; }
        details > summary::marker { content: ''; }
      `}</style>
      <script
        type='application/ld+json'
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
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    Lessons
                  </div>
                </div>
                <div className='rounded-lg border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-800/60 p-3 backdrop-blur-sm'>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {course.estimatedDurationMinutes
                      ? formatMinutes(course.estimatedDurationMinutes)
                      : '—'}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    Duration
                  </div>
                </div>
                {enrollment && progress ? (
                  <div className='rounded-lg border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-800/60 p-3 backdrop-blur-sm'>
                    <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {progress?.percentageComplete ?? 0}%
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Complete
                    </div>
                  </div>
                ) : (
                  <div className='rounded-lg border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-800/60 p-3 backdrop-blur-sm'>
                    <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {course.difficulty
                        ? `${course.difficulty.charAt(0).toUpperCase()}${course.difficulty.slice(1)}`
                        : '—'}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Level
                    </div>
                  </div>
                )}
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
                      {courseDeck && courseDeck.cardCount > 0 && (
                        <StudyButton
                          scope='course'
                          courseId={String(course._id)}
                          cardCount={courseDeck.cardCount}
                          variant='outline'
                        />
                      )}
                      <form
                        action={`/api/courses/${course.slug}/unenroll`}
                        method='POST'
                      >
                        <button
                          type='submit'
                          className='inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200'
                        >
                          Unenroll
                        </button>
                      </form>
                    </>
                  ) : (
                    <form
                      action={`/api/courses/${course.slug}/enroll`}
                      method='POST'
                    >
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
                    <span className='text-gray-600 dark:text-gray-400'>
                      Your Progress
                    </span>
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
                  {}
                  <img
                    src={course.heroImage}
                    alt={`${course.title} cover`}
                    className='h-full w-full object-cover'
                  />
                </div>
              ) : (
                <div className='relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700'>
                  {}
                  <img
                    src='/course-hero-default.svg'
                    alt={`${course.title} cover`}
                    className='h-full w-full object-cover'
                  />
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
        {/* Show notification messages */}
        {message && (
          <div className={`mb-6 rounded-lg border-2 p-4 shadow-sm backdrop-blur-sm ${
            message === 'lesson-locked' || message === 'module-locked'
              ? 'border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/40'
              : message === 'enroll-required'
              ? 'border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/40'
              : 'border-border bg-muted/50'
          }`}>
            <div className='flex items-start gap-3'>
              <span className='text-2xl'>
                {message === 'lesson-locked' || message === 'module-locked' ? '🔒' : message === 'enroll-required' ? 'ℹ️' : '📢'}
              </span>
              <div className='flex-1'>
                <p className='font-semibold mb-1 text-foreground'>
                  {message === 'lesson-locked' && 'Lesson Locked'}
                  {message === 'module-locked' && 'Module Locked'}
                  {message === 'enroll-required' && 'Enrollment Required'}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {message === 'lesson-locked' && (reason || 'You need to complete previous lessons before accessing this one.')}
                  {message === 'module-locked' && (reason || 'You need to complete all lessons in the previous module before accessing this one.')}
                  {message === 'enroll-required' && 'Please enroll in this course to access the lessons.'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className='mb-8'>
          <h2 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Course Curriculum
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            {outline.length} {outline.length === 1 ? 'module' : 'modules'} •{' '}
            {course.lessonCount ?? 0}{' '}
            {course.lessonCount === 1 ? 'lesson' : 'lessons'}
          </p>
        </div>

        {/* Next Lesson Recommendation for Enrolled Users */}
        {enrollment && nextLesson && progressStats && progressStats.remainingLessons > 0 && (
          <div className='mb-6 rounded-xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 shadow-sm backdrop-blur-sm'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-2'>
                  <span className='text-2xl'>🎯</span>
                  <h3 className='text-lg font-semibold text-foreground'>
                    Continue Your Learning Journey
                  </h3>
                </div>
                <p className='text-sm text-muted-foreground mb-3'>
                  You've completed {progressStats.completedCount} of {progressStats.totalLessons} lessons ({progressStats.percentageComplete}%)
                </p>
                <p className='text-sm text-foreground'>
                  <strong>Next up:</strong> Module {nextLesson.moduleIndex + 1}, Lesson {nextLesson.lessonIndex + 1}
                </p>
              </div>
              <Link
                href={`/courses/${course.slug}/lesson/${nextLesson.lessonId}`}
                className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 whitespace-nowrap'
              >
                Start Next Lesson →
              </Link>
            </div>
            {/* Mini progress bar */}
            <div className='mt-4'>
              <div className='h-2 w-full overflow-hidden rounded-full bg-muted/50'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300'
                  style={{ width: `${progressStats.percentageComplete}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Course completed message */}
        {enrollment && progressStats && progressStats.remainingLessons === 0 && (
          <div className='mb-6 rounded-xl border-2 border-green-500/30 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 p-6 shadow-sm backdrop-blur-sm'>
            <div className='flex items-start gap-4'>
              <span className='text-4xl'>🎉</span>
              <div className='flex-1'>
                <h3 className='text-xl font-bold text-foreground mb-2'>
                  Congratulations! Course Completed!
                </h3>
                <p className='text-muted-foreground'>
                  You've successfully completed all {progressStats.totalLessons} lessons in this course. Great work!
                </p>
              </div>
            </div>
          </div>
        )}

        {outline.length === 0 ? (
          <div className='rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50'>
            <div className='text-4xl mb-4'>📝</div>
            <p className='text-gray-600 dark:text-gray-400'>
              Course content coming soon. Check back later!
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {enrichedOutline.map((m: any, i: number) => {
              // Calculate module progress
              const moduleLessonIds = m.lessons.flatMap((l: any) => {
                const ids = [String(l._id)];
                if (Array.isArray(l.subLessons)) {
                  ids.push(...l.subLessons.map((s: any) => String(s._id)));
                }
                return ids;
              });
              const moduleCompletedCount = moduleLessonIds.filter((id: string) => 
                completedLessonIds.includes(id)
              ).length;
              const moduleProgress = moduleLessonIds.length > 0 
                ? Math.round((moduleCompletedCount / moduleLessonIds.length) * 100)
                : 0;
              
              return (
                <details
                  key={String(m._id)}
                  open={i === 0}
                  className='group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 [&>summary::-webkit-details-marker]:hidden'
                >
                {/* Module Header (summary) */}
                <summary className='cursor-pointer border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6 list-none marker:content-none dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-3'>
                        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white'>
                          {i + 1}
                        </span>
                        <h3 className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
                          {m.title}
                          {m.isLocked && enrollment && (
                            <span className='inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                              🔒 Locked
                            </span>
                          )}
                        </h3>
                      </div>
                      {m.summary && (
                        <p className='ml-[2.75rem] text-sm text-gray-600 dark:text-gray-400'>
                          {m.summary}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-3'>
                      <ViewModuleButton
                        courseSlug={course.slug}
                        moduleId={String(m._id)}
                        moduleTitle={m.title}
                        isLocked={m.isLocked}
                        isEnrolled={!!enrollment}
                      />
                      <div className='flex flex-col items-end gap-1 text-right'>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>
                          {formatMinutes(m.estimatedDurationMinutes)}
                        </span>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {m.lessons.length}{' '}
                          {m.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                        {enrollment && moduleProgress > 0 && (
                          <span className='text-xs font-semibold text-blue-600 dark:text-blue-400'>
                            {moduleProgress}% complete
                          </span>
                        )}
                      </div>
                      {/* Single chevron toggle indicator on the right */}
                      <span
                        aria-hidden
                        className='ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-700/30 bg-white/0 text-gray-500 transition-all group-open:text-gray-200 dark:border-gray-500/30 dark:bg-gray-900/20 dark:text-gray-400'
                      >
                        <svg
                          className='h-5 w-5 flex-shrink-0 transition-transform duration-200 group-open:rotate-180'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M5.23 7.21a.75.75 0 011.06.02L10 11.186l3.71-3.955a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0l-4.24-4.52a.75.75 0 01.02-1.06z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </summary>

                {/* Lessons List */}
                <ul className='divide-y divide-gray-100 dark:divide-gray-700'>
                  {m.lessons.map((l: any, idx: number) => {
                    const isLessonLocked = enrollment && l.isLocked;
                    const isLessonCompleted = completedLessonIds.includes(String(l._id));
                    
                    return (
                      <li
                        id={`lesson-${String(l._id)}`}
                        key={String(l._id)}
                        className='group/lesson transition-colors'
                      >
                        {/* Parent Lesson */}
                        <div className={`flex items-center justify-between gap-4 p-4 ${isLessonLocked ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                          <div className='flex flex-1 items-center gap-3'>
                            <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                              {isLessonCompleted ? '✓' : idx + 1}
                            </span>
                            <div className='flex-1'>
                              <div className={`font-medium ${isLessonLocked ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'} flex items-center gap-2`}>
                                {l.title}
                                {isLessonLocked && (
                                  <span className='text-xs'>🔒</span>
                                )}
                              </div>
                              <div className='mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                                <span className='capitalize'>
                                  {l.contentType}
                                </span>
                                <span>•</span>
                                <span>
                                  {formatMinutes(l.estimatedDurationMinutes)}
                                </span>
                                {Array.isArray(l.subLessons) &&
                                  l.subLessons.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className='text-blue-600 dark:text-blue-400'>
                                        {l.subLessons.length} sub-lesson
                                        {l.subLessons.length !== 1 ? 's' : ''}
                                      </span>
                                    </>
                                  )}
                                {isLessonLocked && l.lockReason && (
                                  <>
                                    <span>•</span>
                                    <span className='text-amber-600 dark:text-amber-400 italic'>
                                      {l.lockReason}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            {/* Start button for enrolled users - disabled if locked */}
                            {enrollment ? (
                              isLessonLocked ? (
                                <button
                                  disabled
                                  className='rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500'
                                  aria-label='Lesson locked'
                                  title={l.lockReason || 'Complete previous lessons to unlock'}
                                >
                                  🔒 Locked
                                </button>
                              ) : (
                                <Link
                                  href={`/courses/${course.slug}/lesson/${String(l._id)}`}
                                  className='rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors'
                                  aria-label={`Start lesson: ${l.title}`}
                                >
                                  {isLessonCompleted ? 'Review' : 'Start'}
                                </Link>
                              )
                            ) : null}

                          {/* Preview button - only show for NON-enrolled users */}
                          {!enrollment && l.isPreviewable ? (
                            l.contentType === 'blog' && l.blogSlug ? (
                              <Link
                                href={`/blog/${l.blogSlug}`}
                                className='rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
                                aria-label={`Preview blog lesson: ${l.title}`}
                              >
                                Preview
                              </Link>
                            ) : (
                              <Link
                                href={`/courses/${course.slug}/lesson/${String(l._id)}`}
                                className='rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
                                aria-label={`Preview lesson: ${l.title}`}
                              >
                                Preview
                              </Link>
                            )
                          ) : !enrollment ? (
                            <span className='rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400'>
                              Preview N/A
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Sub-Lessons */}
                      {Array.isArray(l.subLessons) &&
                        l.subLessons.length > 0 && (
                          <div className='border-t border-gray-100 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:border-gray-700 dark:from-blue-950/10 dark:to-purple-950/10'>
                            <ul className='divide-y divide-gray-100 dark:divide-gray-700'>
                              {l.subLessons.map((s: any, sIdx: number) => {
                                const isSubLessonLocked = enrollment && s.isLocked;
                                const isSubLessonCompleted = completedLessonIds.includes(String(s._id));
                                
                                return (
                                  <li
                                    key={String(s._id)}
                                    id={`lesson-${String(s._id)}`}
                                    className={`group/sublesson flex items-center justify-between gap-3 p-4 pl-14 ${isSubLessonLocked ? 'opacity-60 bg-gray-50/30 dark:bg-gray-900/30' : 'hover:bg-white/60 dark:hover:bg-gray-800/40'} transition-colors`}
                                  >
                                    <div className='flex flex-1 items-center gap-3'>
                                      <span className='text-gray-400 dark:text-gray-600'>
                                        └─
                                      </span>
                                      <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-blue-100 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                                        {isSubLessonCompleted ? '✓' : `${idx + 1}.${sIdx + 1}`}
                                      </span>
                                      <div className='flex-1'>
                                        <div className={`text-sm font-medium ${isSubLessonLocked ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'} flex items-center gap-2`}>
                                          {s.title}
                                          {isSubLessonLocked && (
                                            <span className='text-xs'>🔒</span>
                                          )}
                                        </div>
                                        <div className='mt-0.5 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400'>
                                          <span className='capitalize'>
                                            {s.contentType}
                                          </span>
                                          <span>•</span>
                                          <span>
                                            {formatMinutes(
                                              s.estimatedDurationMinutes
                                            )}
                                          </span>
                                          {isSubLessonLocked && s.lockReason && (
                                            <>
                                              <span>•</span>
                                              <span className='text-amber-600 dark:text-amber-400 italic'>
                                                {s.lockReason}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                      {/* Start button for enrolled users */}
                                      {enrollment ? (
                                        isSubLessonLocked ? (
                                          <button
                                            disabled
                                            className='rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-400 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500'
                                            aria-label='Sub-lesson locked'
                                            title={s.lockReason || 'Complete previous sub-lessons to unlock'}
                                          >
                                            🔒
                                          </button>
                                        ) : (
                                          <Link
                                            href={`/courses/${course.slug}/lesson/${String(s._id)}`}
                                            className='rounded-md border border-blue-600 bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors'
                                            aria-label={`Start sub-lesson: ${s.title}`}
                                          >
                                            {isSubLessonCompleted ? 'Review' : 'Start'}
                                          </Link>
                                        )
                                      ) : null}

                                    {/* Preview button - only show for NON-enrolled users */}
                                    {!enrollment && s.isPreviewable ? (
                                      s.contentType === 'blog' && s.blogSlug ? (
                                        <Link
                                          href={`/blog/${s.blogSlug}`}
                                          className='rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
                                          aria-label={`Preview sub-lesson: ${s.title}`}
                                        >
                                          Preview
                                        </Link>
                                      ) : (
                                        <Link
                                          href={`/courses/${course.slug}/lesson/${String(s._id)}`}
                                          className='rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
                                          aria-label={`Preview sub-lesson: ${s.title}`}
                                        >
                                          Preview
                                        </Link>
                                      )
                                    ) : !enrollment ? (
                                      <span className='rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400'>
                                        Preview N/A
                                      </span>
                                    ) : null}
                                  </div>
                                </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                    </li>
                    );
                  })}
                </ul>
              </details>
              );
            })}
          </div>
        )}

        {/* T024: Knowledge Graph Visualization (conditionally rendered) */}
        {course.showKnowledgeGraph && outline && outline.length > 0 && (
          <div className='container mx-auto max-w-6xl px-4 py-12'>
            <KnowledgeGraph
              courseSlug={course.slug}
              includeProgress={!!enrollment}
            />
          </div>
        )}
      </div>
    </main>
  );
}
