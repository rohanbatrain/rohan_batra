import connectToDatabase from '@/lib/mongodb';
import CourseLesson from '@/models/CourseLesson';
import Course from '@/models/Course';
import CourseEnrollment from '@/models/CourseEnrollment';
import User from '@/models/User';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { MDXComponents, mdxProseBase } from '@/components/mdx/MDXComponents';
import { remarkStripTitleH1 } from '@/lib/mdx/plugins/remarkStripTitleH1';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export default async function LessonViewerPage({ 
  params 
}: { 
  params: Promise<{ slug: string; lessonId: string }> 
}) {
  const { slug, lessonId } = await params;
  
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  
  await connectToDatabase();
  
  // Fetch lesson
  const lesson = await CourseLesson.findById(lessonId).lean();
  if (!lesson) return notFound();
  
  // Fetch course
  const course = await Course.findOne({ slug }).lean();
  if (!course || course._id.toString() !== lesson.courseId.toString()) {
    return notFound();
  }
  
  // Check enrollment
  const userDoc = (await User.findOne({ clerkId: userId }).lean()) as { _id: any } | null;
  if (!userDoc || !userDoc._id) {
    redirect('/sign-in');
  }
  
  const enrollment = await CourseEnrollment.findOne({
    courseId: course._id,
    userId: userDoc._id
  }).lean();
  
  if (!enrollment) {
    // Not enrolled - redirect to course page to enroll
    redirect(`/courses/${course.slug}`);
  }

  function toEmbedUrl(provider?: string, url?: string) {
    if (!url) return undefined;
    try {
      const u = new URL(url);
      switch (provider) {
        case 'youtube': {
          if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
          const id = u.searchParams.get('v');
          return id ? `https://www.youtube.com/embed/${id}` : url;
        }
        case 'vimeo': {
          const id = u.pathname.replace('/', '');
          return id ? `https://player.vimeo.com/video/${id}` : url;
        }
        case 'loom': {
          if (u.hostname.includes('loom.com')) {
            const parts = u.pathname.split('/');
            const id = parts[parts.length - 1];
            return `https://www.loom.com/embed/${id}`;
          }
          return url;
        }
        default:
          return url;
      }
    } catch {
      return url;
    }
  }

  const contentType = lesson.contentType;
  const embedUrl =
    contentType === 'video' && lesson.externalResource
      ? toEmbedUrl(
          (lesson.externalResource as any)?.provider,
          (lesson.externalResource as any)?.url
        )
      : undefined;

  return (
    <main className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Header */}
      <div className='border-b border-border/40 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50'>
        <div className='container mx-auto max-w-5xl px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href={`/courses/${course.slug}`}
              className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
            >
              <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
              Back to {course.title}
            </Link>
            
            <div className='flex items-center gap-2'>
              <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                ✓ Enrolled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className='container mx-auto max-w-5xl px-4 py-8'>
        <article className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
          {/* Lesson Title */}
          <header className='mb-6 border-b border-gray-200 pb-6 dark:border-gray-800'>
            <h1 className='mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl'>
              {lesson.title}
            </h1>
            <div className='flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400'>
              <span className='capitalize'>{lesson.contentType}</span>
              <span>•</span>
              <span>{lesson.estimatedDurationMinutes} min</span>
              {lesson.slug && (
                <>
                  <span>•</span>
                  <span className='font-mono text-xs'>{lesson.slug}</span>
                </>
              )}
            </div>
          </header>

          {/* Video Embed */}
          {contentType === 'video' && embedUrl && (
            <div className='mb-8'>
              <div className='relative aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'>
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                  className='absolute inset-0 h-full w-full'
                />
              </div>
            </div>
          )}

          {/* Blog Content Link */}
          {contentType === 'blog' && lesson.blogSlug && (
            <div className='mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-950/20'>
              <p className='mb-4 text-sm text-blue-900 dark:text-blue-200'>
                This lesson is based on a blog post. Read the full article:
              </p>
              <Link
                href={`/blog/${lesson.blogSlug}`}
                className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
              >
                Read Blog Post
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
                </svg>
              </Link>
            </div>
          )}

          {/* Standalone Content (MDX) */}
          {contentType === 'standalone' && lesson.standaloneContent && (
            <div className={`${mdxProseBase} prose-custom`}>
              <MDXRemote
                source={lesson.standaloneContent}
                components={MDXComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm, remarkStripTitleH1],
                    rehypePlugins: [
                      rehypeSlug,
                      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                      [
                        rehypePrettyCode,
                        {
                          theme: {
                            dark: 'github-dark',
                            light: 'github-light',
                          },
                        },
                      ],
                    ],
                  },
                }}
              />
            </div>
          )}

          {/* Quiz Placeholder */}
          {contentType === 'quiz' && (
            <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50'>
              <div className='text-4xl mb-4'>📝</div>
              <p className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Quiz Coming Soon
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Interactive quiz content will be available here.
              </p>
            </div>
          )}

          {/* Flashcards Placeholder */}
          {contentType === 'flashcards' && (
            <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50'>
              <div className='text-4xl mb-4'>🎴</div>
              <p className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Flashcards Coming Soon
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Interactive flashcard review will be available here.
              </p>
            </div>
          )}
        </article>

        {/* Navigation Footer */}
        <div className='mt-8 flex items-center justify-between'>
          <Link
            href={`/courses/${course.slug}`}
            className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
          >
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Back to Course
          </Link>

          <button
            className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
            disabled
          >
            Mark as Complete
          </button>
        </div>
      </div>
    </main>
  );
}
