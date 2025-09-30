import { notFound } from 'next/navigation';
import { BlogPostWithAuthor } from '@/types/blog-post';
import {
  generateBlogPostMetadata,
  generateBlogPostStructuredData,
} from '@/lib/seo';
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/blog-service';
import BlogPostClient from './BlogPostClient';
import { getPublishedProjects } from '@/lib/portfolio-service';
import RelatedContentRail from '@/components/shared/RelatedContentRail';
import SkillChips from '@/components/shared/SkillChips';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Server-side data fetching
async function getBlogPost(slug: string): Promise<BlogPostWithAuthor | null> {
  return getBlogPostBySlug(slug);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const structuredData = generateBlogPostStructuredData({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: `${post.author.firstName} ${post.author.lastName}`,
    featuredImage: post.featuredImage,
  });

  // Related projects by shared tags (take top 3)
  const allProjects = await getPublishedProjects(100);
  const postTags = (post.tags || []).map(t => String(t));
  const relatedProjects = allProjects
    .filter(p => Array.isArray(p.tags) && p.tags.some(t => postTags.includes(String(t))))
    .slice(0, 3);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostClient post={post} />

      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Skills derived from tags */}
        <div className='mt-10'>
          <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3'>Skills</h3>
          <SkillChips tags={postTags} />
        </div>

        {/* Explore more by primary tag */}
        {postTags.length > 0 && (
          <div className='mt-6 text-sm text-slate-600 dark:text-slate-400'>
            Explore more: {' '}
            <a className='text-blue-600 dark:text-blue-400 hover:underline' href={`/blog?tag=${encodeURIComponent(postTags[0])}`}>Blog</a>
            {' '}·{' '}
            <a className='text-blue-600 dark:text-blue-400 hover:underline' href={`/portfolio?tag=${encodeURIComponent(postTags[0])}`}>Projects</a>
          </div>
        )}

        {/* Related Projects */}
        <RelatedContentRail title='Related Projects' type='projects' items={relatedProjects} viewAllHref={postTags[0] ? `/portfolio?tag=${encodeURIComponent(postTags[0])}` : undefined} />
      </div>
    </>
  );
}

// Generate static params for build time (optional)
export async function generateStaticParams() {
  try {
    const posts = await getPublishedBlogPosts(100);
    return posts.map(post => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return generateBlogPostMetadata({
    title: post.seoTitle || post.title,
    excerpt: post.seoDescription || post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: `${post.author.firstName} ${post.author.lastName}`,
    tags: post.tags,
    featuredImage: post.featuredImage,
  });
}
