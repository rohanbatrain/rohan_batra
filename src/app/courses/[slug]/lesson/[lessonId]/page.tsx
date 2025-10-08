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
import MarkCompleteButton from '@/components/courses/MarkCompleteButton';
import { KnowledgeGraph } from '@/components/courses/KnowledgeGraph';

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
  
  // Fetch sub-lessons if this is a parent lesson
  const subLessons = await CourseLessonModel.find({
    parentLessonId: lesson._id,
  })
    .sort({ order: 1 })
    .lean();
  
  // Check if all sub-lessons are completed
  const allSubLessonsCompleted =
    subLessons.length === 0 ||
    subLessons.every((subLesson: any) =>
      progress?.completedLessonIds?.some(
        (id: any) => id.toString() === subLesson._id.toString()
      )
    );
  
  // Get all lessons in module for navigation
  const allModuleLessons = await CourseLessonModel.find({
    moduleId: module._id,
    parentLessonId: null, // Only parent lessons
  })
    .sort({ order: 1 })
    .lean();
  
  // Find current lesson index
  const currentLessonIndex = allModuleLessons.findIndex(
    (l: any) => l._id.toString() === lesson._id.toString()
  );
  
  // Get previous and next lessons
  const previousLesson = currentLessonIndex > 0 ? allModuleLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allModuleLessons.length - 1 ? allModuleLessons[currentLessonIndex + 1] : null;
  
  // Format duration helper
  const formatMinutes = (mins?: number) => {
    if (!mins) return 'N/A';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
          <a href={`/courses/${slug}`} className="hover:text-foreground hover:underline transition-colors">
            {course.title}
          </a>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="hover:text-foreground hover:underline cursor-pointer transition-colors">{module.title}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-foreground font-medium">{lesson.title}</span>
        </nav>
        
        {/* Main Layout: Sidebar Left + Content Right */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[500px_1fr] gap-6">
          {/* Left Sidebar - Overview & TOC */}
          <div className="space-y-6">
            {/* Course Overview & Knowledge Graph - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Course Overview Card */}
              <div className="bg-card rounded-xl border shadow-sm p-5">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Course Overview</h3>
                <a href={`/courses/${slug}`} className="block mb-3 hover:opacity-80 transition-opacity">
                  <h4 className="font-semibold text-base mb-1 line-clamp-2">{course.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{module.title}</p>
                </a>
                
                {progress && (
                  <div className="mb-3 pb-3 border-b">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.percentageComplete ?? 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress.percentageComplete ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <a 
                  href={`/courses/${slug}`}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 border rounded-lg hover:bg-accent transition-colors text-xs font-medium"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Course
                </a>
              </div>
              
              {/* Knowledge Graph */}
              <div>
                <KnowledgeGraph
                  courseSlug={slug}
                  lessonSlug={String(lesson._id)}
                  includeProgress={!!progress}
                />
              </div>
            </div>
            
            {/* Sub-Lessons Card (TOC) */}
            {subLessons.length > 0 && (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Sub-Lessons ({subLessons.length})
                  </h3>
                </div>
                <div className="divide-y">
                  {subLessons.map((subLesson: any, idx: number) => {
                    const isSubCompleted = progress?.completedLessonIds?.some(
                      (id: any) => id.toString() === subLesson._id.toString()
                    ) ?? false;
                    
                    return (
                      <a
                        key={String(subLesson._id)}
                        href={`/courses/${slug}/lesson/${String(subLesson._id)}`}
                        className="block p-4 hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          {isSubCompleted ? (
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <span className="text-xs font-medium text-muted-foreground">{idx + 1}</span>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {subLesson.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{subLesson.contentType}</span>
                              <span>•</span>
                              <span>{formatMinutes(subLesson.estimatedDurationMinutes)}</span>
                            </div>
                          </div>
                          
                          {String(subLesson._id) === lessonId && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                                Current
                              </span>
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Content Area - Takes all remaining space */}
          <div className="space-y-6">
            {/* Combined Lesson Card */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              {/* Lesson Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3 leading-tight">{lesson.title}</h1>
                    
                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium capitalize">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        {lesson.contentType}
                      </span>
                      
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatMinutes(lesson.estimatedDurationMinutes)}
                      </span>
                      
                      {subLessons.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                          {subLessons.length} sub-lesson{subLessons.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </span>
                      )}
                      
                      {!isEnrolled && isPreviewable && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview Mode
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Enroll Button (if not enrolled) */}
                {!isEnrolled && (
                  <div className="pt-4">
                    <a 
                      href={`/courses/${slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Enroll to Access Full Content
                    </a>
                  </div>
                )}
              </div>
              
              {/* Lesson Content */}
              {lesson.contentType === 'blog' && lesson.blogSlug && (
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Blog Lesson</h3>
                      <p className="text-muted-foreground">
                        This lesson is linked to a blog post with detailed content and examples.
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/blog/${lesson.blogSlug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Read Full Blog Post
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              )}
              
              {lesson.contentType === 'standalone' && lesson.standaloneContent && (
                <article className={`p-8 ${mdxProseBase}`}>
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
                <div className="p-8">
                  <div className='relative aspect-video overflow-hidden rounded-lg border-2'>
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
                <div className="p-8 bg-amber-50 dark:bg-amber-900/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-amber-900 dark:text-amber-200">Quiz Lesson</h3>
                      <p className="text-amber-900 dark:text-amber-200 mb-4">
                        Interactive quiz viewer coming soon. Quiz ID: {lesson.quizId?.toString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {lesson.contentType === 'flashcards' && (
                <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-emerald-900 dark:text-emerald-200">Flashcard Review</h3>
                      <p className="text-emerald-900 dark:text-emerald-200 mb-4">
                        This lesson focuses on flashcard review for spaced repetition learning.
                      </p>
                      {lesson.flashcardDeckIds && lesson.flashcardDeckIds.length > 0 ? (
                        <div>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                            <strong>{lesson.flashcardDeckIds.length}</strong> flashcard deck{lesson.flashcardDeckIds.length !== 1 ? 's' : ''} available
                          </p>
                          <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
                            Start Review Session
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No flashcard decks linked yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mark as Complete Button - At the end */}
              {isEnrolled && (
                <div className="p-6 border-t bg-muted/30">
                  <MarkCompleteButton
                    courseSlug={slug}
                    courseId={String(course._id)}
                    lessonId={String(lesson._id)}
                    isCompleted={isCompleted}
                    hasSubLessons={subLessons.length > 0}
                    allSubLessonsCompleted={allSubLessonsCompleted}
                  />
                </div>
              )}
            </div>
            
            {/* Flashcard Section (if decks exist) */}
            {lesson.flashcardDeckIds && lesson.flashcardDeckIds.length > 0 && lesson.contentType !== 'flashcards' && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Study Materials Available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Review <strong>{lesson.flashcardDeckIds.length}</strong> flashcard deck{lesson.flashcardDeckIds.length > 1 ? 's' : ''} to reinforce this lesson
                    </p>
                  </div>
                  <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shrink-0">
                    Review Now
                  </button>
                </div>
              </div>
            )}
            
            {/* Navigation - Previous/Next */}
            <div className="flex items-center justify-between gap-4">
              {previousLesson ? (
                <a
                  href={`/courses/${slug}/lesson/${String(previousLesson._id)}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">Previous</div>
                    <div className="text-sm font-medium">{previousLesson.title}</div>
                  </div>
                </a>
              ) : (
                <div></div>
              )}
              
              {nextLesson ? (
                <a
                  href={`/courses/${slug}/lesson/${String(nextLesson._id)}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors group ml-auto"
                >
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="text-sm font-medium">{nextLesson.title}</div>
                  </div>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
