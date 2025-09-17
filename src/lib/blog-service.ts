import connectToDatabase from '@/lib/mongodb';
import BlogPostModel from '@/models/BlogPost';
import { BlogPostWithAuthor } from '@/types/blog-post';

// Mock data for development when database is not available
const mockBlogPost: BlogPostWithAuthor = {
  _id: '1',
  title: 'Building Modern Web Applications with Next.js 14',
  slug: 'building-modern-web-apps-nextjs-14',
  excerpt:
    'Learn how to leverage the latest features in Next.js 14 to build fast, modern web applications with React Server Components.',
  contentType: 'html',
  content: `# Building Modern Web Applications with Next.js 14

Next.js 14 represents a significant leap forward in the React ecosystem, introducing powerful features that enable developers to build faster, more efficient web applications. In this comprehensive guide, we'll explore the key features and best practices for leveraging Next.js 14 in your projects.

## What's New in Next.js 14

### App Router Stability
The App Router, introduced as an experimental feature in Next.js 13, is now stable and production-ready. This new routing system provides:

- **Improved Performance**: Better code splitting and loading strategies
- **Enhanced Developer Experience**: More intuitive file-based routing
- **React Server Components**: Server-side rendering with component-level granularity

### Turbopack Integration
Next.js 14 includes significant improvements to Turbopack, Vercel's Rust-based bundler:

- **70% faster local server startup**
- **Up to 94% faster code updates with Fast Refresh**
- **Better memory usage and stability**

## Server Components Deep Dive

React Server Components represent a paradigm shift in how we think about React applications. They allow us to render components on the server, reducing the JavaScript bundle size and improving initial page load times.

### Benefits of Server Components

1. **Reduced Bundle Size**: Server components don't ship to the client
2. **Better Performance**: Initial page loads are faster
3. **Improved SEO**: Content is rendered on the server
4. **Enhanced Security**: Sensitive data operations stay on the server

## Getting Started

To create a new Next.js 14 project with the App Router:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Best Practices

1. **Use Server Components by Default**: Only opt into Client Components when needed
2. **Optimize Images**: Leverage Next.js Image component for automatic optimization
3. **Implement Proper Loading States**: Use Suspense boundaries for better UX
4. **Follow the Data Fetching Patterns**: Use the new async/await patterns in Server Components

## Conclusion

Next.js 14 provides powerful tools for building modern web applications. By understanding and leveraging these features, you can create faster, more efficient applications that provide excellent user experiences.`,
  featuredImage: '/placeholder-blog.jpg',
  images: [],
  category: 'Web Development',
  tags: ['Next.js', 'React', 'Web Development'],
  status: 'published' as const,
  featured: true,
  readingTime: 8,
  viewCount: 1250,
  likeCount: 42,
  commentCount: 15,
  authorId: '1',
  publishedAt: new Date('2024-01-15'),
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  author: {
    id: '1',
    firstName: 'Rohan',
    lastName: 'Batra',
    avatar: '/placeholder-avatar.jpg',
  },
};

const mockBlogPosts: BlogPostWithAuthor[] = [
  mockBlogPost,
  {
    ...mockBlogPost,
    _id: '2',
    title: 'Mastering TypeScript for React Development',
    slug: 'mastering-typescript-react-development',
    excerpt:
      'Deep dive into TypeScript patterns and best practices for React applications.',
    publishedAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    ...mockBlogPost,
    _id: '3',
    title: 'Understanding React Server Components',
    slug: 'understanding-react-server-components',
    excerpt:
      'A comprehensive guide to React Server Components and their benefits.',
    status: 'draft' as const,
    publishedAt: undefined,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostWithAuthor | null> {
  try {
    await connectToDatabase();

    // Find the blog post by slug and populate author
    const post = await BlogPostModel.findOne({
      slug,
      status: 'published', // Only return published posts
    }).populate('author', 'name email avatar role');

    if (!post) {
      // Return mock data for development
      const mockPost = mockBlogPosts.find(
        p => p.slug === slug && p.status === 'published'
      );
      return mockPost || null;
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
    // Return mock data as fallback
    const mockPost = mockBlogPosts.find(
      p => p.slug === slug && p.status === 'published'
    );
    return mockPost || null;
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
      .populate('author', 'name email avatar role')
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

    return postsWithAuthor;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Return mock data as fallback
    return mockBlogPosts.filter(post => post.status === 'published');
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
    // Return mock data as fallback
    const mockPosts = mockBlogPosts.filter(post => post.status === 'published');
    return {
      posts: mockPosts,
      pagination: {
        page: 1,
        limit: mockPosts.length,
        total: mockPosts.length,
        totalPages: 1,
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
