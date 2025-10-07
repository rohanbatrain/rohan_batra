import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseLessonModel from '@/models/CourseLesson';
import CourseModuleModel from '@/models/CourseModule';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import UserModel from '@/models/User';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { MDXComponents, mdxProseBase } from '@/components/mdx/MDXComponents';
import { remarkStripTitleH1 } from '@/lib/mdx/plugins/remarkStripTitleH1';

// Helper function to convert external video URLs to embed URLs
function toEmbedUrl(provider?: string, url?: string) {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    switch (provider) {
      case 'youtube': {
        if (u.hostname.includes('youtu.be'))
          return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
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

// Helper function to render Novel.sh JSON to HTML
function renderNovelJsonToHtml(jsonStr: string): string {
  try {
    const doc = JSON.parse(jsonStr);
    const chunks: string[] = [];

    const escapeHtml = (s: string) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const escapeAttr = (s: string) =>
      String(s)
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const renderText = (node: any): string => {
      if (!node) return '';
      if (node.type === 'text') {
        let text = escapeHtml(node.text || '');
        if (node.marks) {
          for (const mark of node.marks) {
            if (mark.type === 'bold') text = `<strong>${text}</strong>`;
            if (mark.type === 'italic') text = `<em>${text}</em>`;
            if (mark.type === 'code') text = `<code>${text}</code>`;
            if (mark.type === 'strike') text = `<s>${text}</s>`;
            if (mark.type === 'underline') text = `<u>${text}</u>`;
            if (mark.type === 'link' && mark.attrs?.href) {
              const href = escapeAttr(String(mark.attrs.href));
              const rel = href.startsWith('/')
                ? ''
                : ' rel="nofollow noopener"';
              text = `<a href="${href}"${rel}>${text}</a>`;
            }
          }
        }
        return text;
      }
      if (Array.isArray(node.content)) {
        return node.content.map(renderText).join('');
      }
      return '';
    };

    const renderNode = (node: any) => {
      if (!node) return;
      switch (node.type) {
        case 'paragraph':
          chunks.push(`<p>${renderText(node)}</p>`);
          break;
        case 'heading': {
          const level = Math.min(
            Math.max(Number(node.attrs?.level || 1), 1),
            6
          );
          chunks.push(`<h${level}>${renderText(node)}</h${level}>`);
          break;
        }
        case 'bulletList':
        case 'bullet_list': {
          const items = (node.content || [])
            .map((li: any) => `<li>${renderText(li)}</li>`)
            .join('');
          chunks.push(`<ul>${items}</ul>`);
          break;
        }
        case 'orderedList':
        case 'ordered_list': {
          const start = Number(node.attrs?.start || 1);
          const items = (node.content || [])
            .map((li: any) => `<li>${renderText(li)}</li>`)
            .join('');
          chunks.push(`<ol start="${start}">${items}</ol>`);
          break;
        }
        case 'listItem':
        case 'list_item':
          chunks.push(`<li>${renderText(node)}</li>`);
          break;
        case 'blockquote':
          chunks.push(`<blockquote>${renderText(node)}</blockquote>`);
          break;
        case 'codeBlock':
        case 'code_block': {
          const language = node.attrs?.language
            ? ` class="language-${node.attrs.language}"`
            : '';
          const code = escapeHtml(renderText(node));
          chunks.push(`<pre><code${language}>${code}</code></pre>`);
          break;
        }
        case 'hardBreak':
        case 'hard_break':
          chunks.push('<br />');
          break;
        case 'image': {
          const src = node.attrs?.src;
          const alt = node.attrs?.alt || '';
          if (src)
            chunks.push(
              `<img src="${escapeAttr(src)}" alt="${escapeHtml(alt)}" />`
            );
          break;
        }
        default: {
          if (Array.isArray(node.content)) node.content.forEach(renderNode);
        }
      }
    };

    if (doc?.type === 'doc' && Array.isArray(doc.content)) {
      doc.content.forEach(renderNode);
    }
    return chunks.join('');
  } catch {
    return '';
  }
}

interface LessonPageProps {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, lessonId } = await params;
  
  await connectToDatabase();
  
  const course = await CourseModel.findOne({ slug }).lean();
  const lesson = await CourseLessonModel.findById(lessonId).lean();
  
  if (!course || !lesson) {
    return {
      title: 'Lesson Not Found',
    };
  }
  
  return {
    title: `${lesson.title} - ${course.title}`,
    description: `Learn ${lesson.title} in the ${course.title} course`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params;
  const { userId: clerkUserId } = await auth();
  
  await connectToDatabase();
  
  // Fetch course
  const course = await CourseModel.findOne({ slug }).lean();
  if (!course) {
    notFound();
  }
  
  // Fetch lesson
  const lesson = await CourseLessonModel.findById(lessonId).lean();
  if (!lesson) {
    notFound();
  }
  
  // Verify lesson belongs to this course
  if (lesson.courseId.toString() !== course._id.toString()) {
    notFound();
  }
  
  // Fetch module for breadcrumb
  const module = await CourseModuleModel.findById(lesson.moduleId).lean();
  if (!module) {
    notFound();
  }
  
  // Check enrollment and progress
  let enrollment = null;
  let progress = null;
  let user = null;
  
  if (clerkUserId) {
    const foundUser = await UserModel.findOne({ clerkId: clerkUserId }).lean();
    
    if (foundUser && !Array.isArray(foundUser)) {
      user = foundUser;
      enrollment = await CourseEnrollmentModel.findOne({
        courseId: course._id,
        userId: user._id,
      }).lean();
      
      if (enrollment) {
        progress = await CourseProgressModel.findOne({
          enrollmentId: enrollment._id,
        }).lean();
      }
    }
  }
  
  // Check authorization
  const isEnrolled = !!enrollment;
  const isPreviewable = lesson.isPreviewable;
  
  if (!isEnrolled && !isPreviewable) {
    redirect(`/courses/${slug}?message=enroll-required`);
  }
  
  // Check if lesson is completed
  const isCompleted = progress?.completedLessonIds?.some(
    (id: any) => id.toString() === lesson._id.toString()
  ) ?? false;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <a href={`/courses/${slug}`} className="hover:text-foreground">
            {course.title}
          </a>
          <span className="mx-2">›</span>
          <span>{module.title}</span>
          <span className="mx-2">›</span>
          <span className="text-foreground">{lesson.title}</span>
        </nav>
        
        {/* Lesson Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          
          {isCompleted && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Completed
            </div>
          )}
          
          {!isEnrolled && isPreviewable && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm ml-2">
              Preview Mode
            </div>
          )}
        </div>
        
        {/* Lesson Content */}
        <div className="mb-12">
          {lesson.contentType === 'blog' && lesson.blogSlug && (
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Blog Lesson</h3>
              <p className="text-muted-foreground mb-4">
                This lesson is linked to a blog post.
              </p>
              <a
                href={`/blog/${lesson.blogSlug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Read Blog Post
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}
          
          {lesson.contentType === 'standalone' && lesson.standaloneContent && (
            <article className={mdxProseBase}>
              {lesson.standaloneFormat === 'novelsh' ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderNovelJsonToHtml(lesson.standaloneContent as any),
                  }}
                />
              ) : lesson.standaloneFormat === 'mdx' ? (
                <MDXRemote
                  source={String(lesson.standaloneContent)}
                  components={MDXComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [
                        remarkGfm,
                        remarkStripTitleH1(String(lesson.title)),
                      ],
                      rehypePlugins: [
                        rehypeSlug,
                        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                        [
                          rehypePrettyCode,
                          {
                            theme: 'github-dark-dimmed',
                            keepBackground: false,
                          },
                        ],
                      ],
                    },
                  }}
                />
              ) : (
                <pre className='whitespace-pre-wrap break-words rounded-md bg-muted p-4'>
                  {lesson.standaloneContent}
                </pre>
              )}
            </article>
          )}
          
          {lesson.contentType === 'video' && lesson.externalResource?.url && (
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Video Lesson</h3>
              <div className='relative aspect-video overflow-hidden rounded-lg border'>
                <iframe
                  src={toEmbedUrl(
                    lesson.externalResource?.provider as any,
                    lesson.externalResource?.url as any
                  )}
                  title={lesson.title as any}
                  className='h-full w-full'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  allowFullScreen
                />
              </div>
            </div>
          )}
          
          {lesson.contentType === 'quiz' && (
            <div className="bg-card rounded-lg p-6 border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-200">Quiz Lesson</h3>
              <p className="text-amber-900 dark:text-amber-200">
                Quiz viewer coming soon. Quiz ID: {lesson.quizId?.toString()}
              </p>
            </div>
          )}
          
          {lesson.contentType === 'flashcards' && (
            <div className="bg-card rounded-lg p-6 border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
              <h3 className="text-lg font-semibold mb-4 text-emerald-900 dark:text-emerald-200">Flashcard Review</h3>
              <p className="text-emerald-900 dark:text-emerald-200 mb-4">
                This lesson focuses on flashcard review for spaced repetition learning.
              </p>
              {lesson.flashcardDeckIds && lesson.flashcardDeckIds.length > 0 ? (
                <div>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200">Flashcard decks: {lesson.flashcardDeckIds.length}</p>
                  <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    Start Review
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No flashcard decks linked yet.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Flashcard Section (if decks exist) */}
        {lesson.flashcardDeckIds && lesson.flashcardDeckIds.length > 0 && lesson.contentType !== 'flashcards' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Study Materials</h2>
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Flashcards Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Review {lesson.flashcardDeckIds.length} flashcard deck{lesson.flashcardDeckIds.length > 1 ? 's' : ''} to reinforce this lesson
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                  Review Now
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        {isEnrolled && (
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
              {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <a 
              href={`/courses/${slug}`}
              className="px-6 py-3 border rounded-lg hover:bg-accent font-medium"
            >
              Back to Course
            </a>
          </div>
        )}
        
        {!isEnrolled && (
          <a 
            href={`/courses/${slug}`}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Enroll to Access Full Lesson
          </a>
        )}
      </div>
    </div>
  );
}
