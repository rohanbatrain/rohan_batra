'use client';

import { BlogPostWithAuthor } from '@/types/blog-post';
import Image from 'next/image';
import { resolveAssetUrl } from '@/lib/assets';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Heart, MessageCircle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface PostSummaryProps {
  post: BlogPostWithAuthor;
  index?: number;
}

export function PostSummary({ post, index = 0 }: PostSummaryProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className='group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700'
    >
      {/* Featured Image */}
      {post.featuredImage && (
        <div className='relative h-48 overflow-hidden'>
          <Image
            src={resolveAssetUrl(post.featuredImage) as string}
            alt={post.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          {post.featured && (
            <div className='absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium'>
              Featured
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className='p-6'>
        {/* Category and Date */}
        <div className='flex items-center justify-between mb-3'>
          <span className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium'>
            {post.category}
          </span>
          <div className='flex items-center text-xs text-gray-500 dark:text-gray-400'>
            <Calendar className='w-3 h-3 mr-1' />
            {formatDate(post.publishedAt || post.createdAt)}
          </div>
        </div>

        {/* Title */}
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2'>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        {/* Excerpt */}
        <p className='text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3'>
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {post.tags.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full'
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full'>
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400'>
            {post.readingTime && (
              <div className='flex items-center'>
                <Clock className='w-3 h-3 mr-1' />
                {post.readingTime} min read
              </div>
            )}
            <div className='flex items-center'>
              <Eye className='w-3 h-3 mr-1' />
              {post.viewCount || 0}
            </div>
            <div className='flex items-center'>
              <Heart className='w-3 h-3 mr-1' />
              {post.likeCount || 0}
            </div>
            <div className='flex items-center'>
              <MessageCircle className='w-3 h-3 mr-1' />
              {post.commentCount || 0}
            </div>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors'
          >
            Read More →
          </Link>
        </div>

        {/* Author */}
        {post.author && (
          <div className='flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
            {post.author.avatar && (
              <div className='relative w-8 h-8 rounded-full overflow-hidden mr-3'>
                <Image
                  src={resolveAssetUrl(post.author.avatar) as string}
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div>
              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                {post.author.firstName} {post.author.lastName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
    </motion.article>
  );
}

export default PostSummary;
