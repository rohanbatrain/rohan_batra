import connectToDatabase from '@/lib/mongodb';
import BlogPostModel from '@/models/BlogPost';
import { BlogPostWithAuthor } from '@/types/blog-post';

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostWithAuthor | null> {
  try {
    await connectToDatabase();

    // Find the blog post by slug and populate author
    const post = await BlogPostModel.findOne({
      slug,
      status: 'published', // Only return published posts
    }).populate('authorId', 'name email avatar role');

    if (!post) {
      return null;
    }

    // Transform to include author info
    const postWithAuthor: BlogPostWithAuthor = {
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      contentType: post.contentType || 'html',
      featuredImage: post.featuredImage,
      images: post.images,
      attachedAssets: post.attachedAssets || [],
      category: post.category,
      tags: post.tags,
      status: post.status,
      featured: post.featured,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      readingTime: post.readingTime,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      authorId: post.author._id.toString(),
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author._id.toString(),
        firstName: post.author.name.split(' ')[0] || '',
        lastName: post.author.name.split(' ').slice(1).join(' ') || '',
        avatar: post.author.avatar,
      },
    };

    return postWithAuthor;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function getPublishedBlogPosts(
  limit: number = 100
): Promise<BlogPostWithAuthor[]> {
  try {
    await connectToDatabase();

    const posts = await BlogPostModel.find({
      status: 'published',
    })
      .populate('authorId', 'name email avatar role')
      .sort({ publishedAt: -1 })
      .limit(limit);

    const postsWithAuthor = posts.map(post => ({
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      contentType: post.contentType || 'html',
      featuredImage: post.featuredImage,
      images: post.images,
      attachedAssets: post.attachedAssets || [],
      category: post.category,
      tags: post.tags,
      status: post.status,
      featured: post.featured,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      readingTime: post.readingTime,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      authorId: post.authorId._id.toString(),
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.authorId._id.toString(),
        firstName: post.authorId.name.split(' ')[0] || '',
        lastName: post.authorId.name.split(' ').slice(1).join(' ') || '',
        avatar: post.authorId.avatar,
      },
    }));

    return postsWithAuthor;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPostsWithPagination(params: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  status?: string;
  search?: string;
}): Promise<{
  posts: BlogPostWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const {
    page = 1,
    limit = 10,
    category,
    tag,
    author,
    status = 'published',
    search,
  } = params;

  try {
    await connectToDatabase();

    // Build query
    const query: Record<string, unknown> = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await BlogPostModel.countDocuments(query);

    // Get posts with author population
    const posts = await BlogPostModel.find(query)
      .populate('author', 'name email avatar role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform to include author info
    const postsWithAuthor: BlogPostWithAuthor[] = posts.map(post => ({
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      contentType: post.contentType || 'html',
      featuredImage: post.featuredImage,
      images: post.images || [],
      attachedAssets: post.attachedAssets || [],
      category: post.category,
      tags: post.tags,
      status: post.status,
      featured: post.featured,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      readingTime: post.readingTime,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      authorId: post.author._id.toString(),
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author._id.toString(),
        firstName: post.author.name.split(' ')[0] || '',
        lastName: post.author.name.split(' ').slice(1).join(' ') || '',
        avatar: post.author.avatar,
      },
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      posts: postsWithAuthor,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    console.error('Error fetching blog posts with pagination:', error);
    return {
      posts: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

export async function incrementBlogPostViewCount(slug: string): Promise<void> {
  try {
    await connectToDatabase();
    await BlogPostModel.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Silently fail - view count increment is not critical
  }
}
