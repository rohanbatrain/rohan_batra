import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface ContentRendererProps {
  content: string;
  format?: 'rich-html' | 'mdx';
  className?: string;
}

/**
 * Universal content renderer that supports both Rich HTML and MDX formats.
 * 
 * Automatically detects format and renders appropriately:
 * - Rich HTML: Renders using dangerouslySetInnerHTML
 * - MDX: Renders using next-mdx-remote with full MDX support
 * 
 * If format is not specified, defaults to Rich HTML for backward compatibility.
 */
export default async function ContentRenderer({
  content,
  format = 'rich-html',
  className = 'prose dark:prose-invert',
}: ContentRendererProps) {
  if (!content || content.trim() === '') {
    return null;
  }

  if (format === 'mdx') {
    return (
      <div className={className}>
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              ],
            },
          }}
        />
      </div>
    );
  }

  // Default: Rich HTML
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
