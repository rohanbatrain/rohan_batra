import connectToDatabase from '@/lib/mongodb';
import BlogPostModel from '@/models/BlogPost';
import UserModel from '@/models/User';
import { BlogPostWithAuthor } from '@/types/blog-post';

export async function getPublishedBlogPosts(
  limit: number = 100
): Promise<BlogPostWithAuthor[]> {
  try {
    await connectToDatabase();

    // Ensure UserModel is loaded for populate to work
    await UserModel.countDocuments().limit(1).exec();

    const posts = await BlogPostModel.find({
      status: 'published',
    })
      .populate('authorId', 'firstName lastName email role')
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
        firstName: post.authorId.firstName,
        lastName: post.authorId.lastName,
        avatar: '', // User model doesn't have avatar field
      },
    }));

    return postsWithAuthor;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostWithAuthor | null> {
  try {
    await connectToDatabase();

    // Ensure UserModel is loaded for populate to work
    await UserModel.countDocuments().limit(1).exec();

    const post = await BlogPostModel.findOne({
      slug,
      status: 'published',
    }).populate('authorId', 'firstName lastName email role');

    if (!post) {
      return null;
    }

    return {
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
        firstName: post.authorId.firstName,
        lastName: post.authorId.lastName,
        avatar: '', // User model doesn't have avatar field
      },
    };
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
}

export async function getBlogPostsWithPagination(
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<{
  posts: BlogPostWithAuthor[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    await connectToDatabase();

    // Ensure UserModel is loaded for populate to work
    await UserModel.countDocuments().limit(1).exec();

    const query: any = { status: 'published' };
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      BlogPostModel.find(query)
        .populate('authorId', 'firstName lastName email role')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      BlogPostModel.countDocuments(query),
    ]);

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
        firstName: post.authorId.firstName,
        lastName: post.authorId.lastName,
        avatar: '', // User model doesn't have avatar field
      },
    }));

    return {
      posts: postsWithAuthor,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching blog posts with pagination:', error);
    return {
      posts: [],
      totalPosts: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}
