import { notFound } from 'next/navigation';
import { BlogPostWithAuthor } from '@/types/blog-post';
import {
  generateBlogPostMetadata,
  generateBlogPostStructuredData,
} from '@/lib/seo';
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/blog-service';
import BlogPostClient from './BlogPostClient';

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

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostClient post={post} />
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
