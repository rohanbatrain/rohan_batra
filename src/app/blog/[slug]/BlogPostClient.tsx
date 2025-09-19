'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { resolveAssetUrl } from '@/lib/assets';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Tag,
  User,
} from 'lucide-react';
import { BlogPostWithAuthor } from '@/types/blog-post';
import RichEditor from '@/components/admin/RichEditor';

interface BlogPostClientProps {
  post: BlogPostWithAuthor;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const isJsonContent = useMemo(() => {
    if (!post?.content) return false;
    const trimmed = post.content.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return false;
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }, [post?.content]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Back Navigation */}
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          <Link
            href='/blog'
            className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Blog
          </Link>
        </div>
      </div>

      <article className='max-w-4xl mx-auto px-6 py-16'>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-12'
        >
          {/* Category Badge */}
          <div className='mb-4'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
              <Tag className='h-3 w-3 mr-1' />
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight'>
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className='text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed'>
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className='flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8'>
            {/* Author */}
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              <span>
                {post.author.firstName} {post.author.lastName}
              </span>
            </div>

            {/* Published Date */}
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Draft'}
              </span>
            </div>

            {/* Reading Time */}
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              <span>{post.readingTime} min read</span>
            </div>

            {/* View Count */}
            <div className='flex items-center gap-2'>
              <Eye className='h-4 w-4' />
              <span>{post.viewCount.toLocaleString()} views</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-8'>
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className='px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex items-center gap-4'>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={handleShare}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
            >
              <Share2 className='h-4 w-4' />
              Share
            </button>

            <div className='flex items-center gap-2 text-gray-500'>
              <MessageCircle className='h-4 w-4' />
              <span>{post.commentCount} comments</span>
            </div>
          </div>
        </motion.header>

        {/* Featured Image */}
        {post.featuredImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mb-12'
          >
            <div className='relative aspect-video rounded-xl overflow-hidden'>
              <Image
                src={resolveAssetUrl(post.featuredImage) as string}
                alt={post.title}
                fill
                className='object-cover'
                priority
              />
            </div>
          </motion.div>
        )}

        {/* Content */}
        {isJsonContent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='prose prose-lg dark:prose-invert max-w-none'
          >
            <RichEditor content={post.content} editable={false} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='prose prose-lg dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, '<br>'),
            }}
          />
        )}

        {/* Author Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className='mt-16 p-8 bg-gray-50 dark:bg-gray-800 rounded-xl'
        >
          <div className='flex items-start gap-4'>
            <div className='flex-shrink-0'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl'>
                {post.author.firstName[0]}
                {post.author.lastName[0]}
              </div>
            </div>
            <div className='flex-1'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                {post.author.firstName} {post.author.lastName}
              </h3>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                Full-stack developer passionate about creating amazing web
                experiences with modern technologies. Sharing knowledge and
                insights from years of development experience.
              </p>
              <div className='flex gap-4'>
                <Link
                  href='/blog'
                  className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'
                >
                  More posts →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Posts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className='mt-16'
        >
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-8'>
            Related Posts
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Placeholder for related posts */}
            <div className='p-6 bg-gray-50 dark:bg-gray-800 rounded-xl'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                More posts coming soon...
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Check back later for more insights and tutorials.
              </p>
            </div>
          </div>
        </motion.section>
      </article>
    </div>
  );
}
