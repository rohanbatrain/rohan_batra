import connectToDatabase from '@/lib/mongodb';
import CourseLesson from '@/models/CourseLesson';
import Course from '@/models/Course';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { MDXComponents, mdxProseBase } from '@/components/mdx/MDXComponents';
import { remarkStripTitleH1 } from '@/lib/mdx/plugins/remarkStripTitleH1';

export const dynamic = 'force-dynamic';

export default async function LessonPreviewPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  await connectToDatabase();
  const lesson = await CourseLesson.findById(lessonId).lean();
  if (!lesson || !lesson.isPreviewable) return notFound();
  const course = await Course.findById(lesson.courseId).select('slug title').lean();

  function toEmbedUrl(provider?: string, url?: string) {
    if (!url) return undefined;
    try {
      const u = new URL(url);
      switch (provider) {
        case 'youtube': {
          // Handle youtu.be or youtube.com/watch?v=ID
          if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
          const id = u.searchParams.get('v');
          return id ? `https://www.youtube.com/embed/${id}` : url;
        }
        case 'vimeo': {
          const id = u.pathname.replace('/', '');
          return id ? `https://player.vimeo.com/video/${id}` : url;
        }
        case 'loom': {
          // Loom share -> embed
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
                const rel = href.startsWith('/') ? '' : ' rel="nofollow noopener"';
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
            const level = Math.min(Math.max(Number(node.attrs?.level || 1), 1), 6);
            chunks.push(`<h${level}>${renderText(node)}</h${level}>`);
            break;
          }
          case 'bulletList':
          case 'bullet_list': {
            const items = (node.content || []).map((li: any) => `<li>${renderText(li)}</li>`).join('');
            chunks.push(`<ul>${items}</ul>`);
            break;
          }
          case 'orderedList':
          case 'ordered_list': {
            const start = Number(node.attrs?.start || 1);
            const items = (node.content || []).map((li: any) => `<li>${renderText(li)}</li>`).join('');
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
            const language = node.attrs?.language ? ` class="language-${node.attrs.language}"` : '';
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
            if (src) chunks.push(`<img src="${escapeAttr(src)}" alt="${escapeHtml(alt)}" />`);
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

  return (
    <main className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      <div className='container mx-auto max-w-3xl px-4 py-10'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>{lesson.title}</h1>
          {course?.slug ? (
            <Link href={`/courses/${course.slug}#lesson-${String(lesson._id)}`} className='text-sm underline'>Back to course</Link>
          ) : (
            <Link href='/courses' className='text-sm underline'>Back to courses</Link>
          )}
        </div>
        {lesson.contentType === 'blog' && lesson.blogSlug ? (
          <div className='rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              This lesson is a blog post. Open the full article:
            </p>
            <Link href={`/blog/${lesson.blogSlug}`} className='mt-2 inline-block rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700'>
              Read blog post
            </Link>
          </div>
        ) : null}
        {lesson.contentType === 'standalone' && lesson.standaloneContent ? (
          <article className={mdxProseBase}>
            {lesson.standaloneFormat === 'novelsh' ? (
              <div
                dangerouslySetInnerHTML={{ __html: renderNovelJsonToHtml(lesson.standaloneContent as any) }}
              />
            ) : lesson.standaloneFormat === 'mdx' ? (
              // Render MDX content
              <MDXRemote
                source={String(lesson.standaloneContent)}
                components={MDXComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm, remarkStripTitleH1(String(lesson.title))],
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
              // Fallback plain rendering
              <pre className='whitespace-pre-wrap break-words rounded-md bg-gray-50 p-4 dark:bg-gray-900'>
                {lesson.standaloneContent}
              </pre>
            )}
          </article>
        ) : null}
        {lesson.contentType === 'video' && lesson.externalResource?.url ? (
          <div className='relative aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'>
            <iframe
              src={toEmbedUrl(lesson.externalResource?.provider as any, lesson.externalResource?.url as any)}
              title={lesson.title as any}
              className='h-full w-full'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
            />
          </div>
        ) : null}
        {lesson.contentType === 'quiz' ? (
          <div className='rounded border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200'>
            Quiz preview coming soon.
          </div>
        ) : null}
        {lesson.contentType === 'flashcards' ? (
          <div className='rounded border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'>
            Flashcards preview coming soon.
          </div>
        ) : null}
      </div>
    </main>
  );
}
