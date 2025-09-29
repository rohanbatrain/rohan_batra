import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables BEFORE importing anything that uses them
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Now import the modules that depend on environment variables
// Import models dynamically to handle ES module issues
let BlogPost: any, Project: any, User: any;

// Initialize MongoDB connection
import '../src/lib/mongodb';

const DEMO_BLOG_POSTS = [
  {
    title: 'Building Modern Web Applications with Next.js 14',
    content: `
# Building Modern Web Applications with Next.js 14

Next.js 14 introduces groundbreaking features that revolutionize how we build web applications. From the improved App Router to enhanced performance optimizations, this latest version sets new standards for developer experience and application performance.

## Key Features of Next.js 14

### Server Components Revolution
Server Components have matured significantly, offering unprecedented performance benefits. By rendering components on the server, we reduce client-side JavaScript bundles and improve initial page load times.

\`\`\`tsx
// Example Server Component
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
\`\`\`

### Enhanced Performance
- **Partial Prerendering**: Combines static and dynamic content seamlessly
- **Improved Bundling**: Reduced JavaScript bundle sizes
- **Better Caching**: Enhanced caching strategies for optimal performance

### Developer Experience
- **TypeScript Integration**: First-class TypeScript support
- **Enhanced DevTools**: Better debugging and development tools
- **Simplified Configuration**: Streamlined setup process

## Real-World Implementation

When building our portfolio platform, we leveraged these features to create a blazing-fast, SEO-optimized website. The combination of Server Components and the new App Router resulted in a 40% improvement in Core Web Vitals.

### Performance Metrics
- **First Contentful Paint**: 0.8s
- **Largest Contentful Paint**: 1.2s
- **Time to Interactive**: 1.5s
- **Lighthouse Score**: 98/100

## Best Practices

1. **Embrace Server Components**: Use them for data fetching and static content
2. **Strategic Client Components**: Reserve for interactive elements only
3. **Optimize Images**: Leverage Next.js Image component for automatic optimization
4. **Implement Proper Caching**: Use both client and server-side caching strategies

Next.js 14 represents a significant leap forward in web development, offering tools and patterns that make building fast, scalable applications more accessible than ever.
    `,
    excerpt:
      'Explore the revolutionary features of Next.js 14 and learn how to build modern, performant web applications with Server Components, enhanced performance optimizations, and improved developer experience.',
    status: 'published',
    category: 'Web Development',
    tags: [
      'nextjs',
      'react',
      'web-development',
      'performance',
      'server-components',
    ],
    seoTitle: 'Next.js 14 Guide: Building Modern Web Applications',
    seoDescription:
      'Complete guide to Next.js 14 features including Server Components, performance optimizations, and best practices for modern web development.',
  },
  {
    title: 'Mastering TypeScript for Full-Stack Development',
    content: `
# Mastering TypeScript for Full-Stack Development

TypeScript has become the de facto standard for building robust, scalable applications. This comprehensive guide explores advanced TypeScript patterns and best practices for full-stack development.

## Advanced Type System Features

### Conditional Types
Conditional types enable powerful type transformations based on type relationships.

\`\`\`typescript
type ApiResponse<T> = T extends string
  ? { message: T }
  : T extends number
  ? { count: T }
  : { data: T };

// Usage
type StringResponse = ApiResponse<string>; // { message: string }
type NumberResponse = ApiResponse<number>; // { count: number }
type ObjectResponse = ApiResponse<User>; // { data: User }
\`\`\`

### Template Literal Types
Create dynamic string types for better API design.

\`\`\`typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = \`/api/\${string}\`;
type ApiRoute<M extends HttpMethod, E extends Endpoint> = \`\${M} \${E}\`;

// Usage
type UserRoutes = 
  | ApiRoute<'GET', '/api/users'>
  | ApiRoute<'POST', '/api/users'>
  | ApiRoute<'PUT', '/api/users/[id]'>;
\`\`\`

## Full-Stack Type Safety

### Shared Type Definitions
Maintain consistency between frontend and backend with shared types.

\`\`\`typescript
// types/api.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
\`\`\`

TypeScript's powerful type system enables us to build more reliable, maintainable applications. By leveraging advanced features like conditional types, template literals, and proper type guards, we can achieve end-to-end type safety that catches errors at compile time rather than runtime.
    `,
    excerpt:
      'Deep dive into advanced TypeScript patterns for full-stack development, including conditional types, template literals, type guards, and best practices for building type-safe applications.',
    status: 'published',
    category: 'Programming',
    tags: [
      'typescript',
      'javascript',
      'full-stack',
      'type-safety',
      'best-practices',
    ],
    seoTitle: 'Advanced TypeScript Guide for Full-Stack Developers',
    seoDescription:
      'Master advanced TypeScript concepts and patterns for building robust, type-safe full-stack applications with practical examples and best practices.',
  },
  {
    title: 'Building Scalable APIs with Node.js and Express',
    content: `
# Building Scalable APIs with Node.js and Express

Creating robust, scalable APIs is crucial for modern web applications. This guide covers best practices for building production-ready APIs using Node.js and Express, including authentication, validation, testing, and deployment strategies.

## API Architecture Principles

### RESTful Design
Follow REST principles for consistent and intuitive API design.

\`\`\`javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// GET /api/users - List all users
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const users = await User.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-password');
  
  res.json({
    users,
    totalPages: Math.ceil(await User.countDocuments() / limit),
    currentPage: page
  });
});

// POST /api/users - Create new user
router.post('/', validateUser, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
\`\`\`

### Middleware Architecture
Leverage Express middleware for cross-cutting concerns.

\`\`\`javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
\`\`\`

## Performance Optimization

### Caching Strategies
Implement intelligent caching for improved performance.

\`\`\`javascript
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
\`\`\`

Building scalable APIs requires careful consideration of architecture, performance, security, and maintainability. By following these patterns and best practices, you can create robust APIs that grow with your application's needs.
    `,
    excerpt:
      'Learn how to build scalable, production-ready APIs with Node.js and Express, including authentication, validation, caching strategies, and performance optimization techniques.',
    status: 'published',
    category: 'Backend Development',
    tags: ['nodejs', 'express', 'api', 'backend', 'scalability'],
    seoTitle: 'Node.js API Development: Building Scalable Backend Services',
    seoDescription:
      'Comprehensive guide to building scalable APIs with Node.js and Express, covering architecture patterns, authentication, caching, and best practices.',
  },
];

const DEMO_PROJECTS = [
  {
    title: 'E-Commerce Platform with Next.js',
    description:
      'A comprehensive e-commerce platform built with Next.js 14, featuring modern UI, secure payments, real-time inventory management, and advanced admin dashboard.',
    shortDescription:
      'Full-stack e-commerce platform with secure payments and real-time inventory.',
    technologies: [
      'Next.js',
      'TypeScript',
      'MongoDB',
      'Stripe',
      'Tailwind CSS',
    ],
    category: 'Full-Stack',
    status: 'published',
    featured: true,
    images: [{ url: '/placeholder-project.jpg', alt: 'E-Commerce Platform' }],
    links: {
      live: 'https://ecommerce-demo.vercel.app',
      github: 'https://github.com/example/ecommerce-platform',
    },
  },
  {
    title: 'AI-Powered Task Management App',
    description:
      'An intelligent task management application that uses AI to help users prioritize tasks, set realistic deadlines, and improve productivity with machine learning insights.',
    shortDescription:
      'AI-powered task management with intelligent prioritization and automated scheduling.',
    technologies: ['React', 'Node.js', 'OpenAI', 'PostgreSQL', 'Docker'],
    category: 'AI/ML',
    status: 'published',
    featured: true,
    images: [{ url: '/placeholder-project-2.jpg', alt: 'AI Task Manager' }],
    links: {
      live: 'https://ai-tasks.app',
      github: 'https://github.com/example/ai-task-manager',
    },
  },
  {
    title: 'Real-Time Collaborative Code Editor',
    description:
      'A web-based collaborative code editor with real-time synchronization, multi-language support, and integrated video chat for seamless pair programming sessions.',
    shortDescription:
      'Real-time collaborative code editor with video chat for pair programming.',
    technologies: ['React', 'Node.js', 'Socket.io', 'Monaco Editor', 'WebRTC'],
    category: 'Developer Tools',
    status: 'published',
    featured: false,
    images: [{ url: '/placeholder-project.jpg', alt: 'Code Editor' }],
    links: {
      live: 'https://codepair.dev',
      github: 'https://github.com/example/codepair',
    },
  },
];

async function migrateContent() {
  try {
    console.log('🚀 Starting migration of demo content...');

    // Import mongoose to ensure it's available
    const mongoose = await import('mongoose');

    // Wait for MongoDB connection
    if (mongoose.default.connection.readyState === 0) {
      console.log('⏳ Connecting to MongoDB...');
      await mongoose.default.connection.asPromise();
    }

    console.log('✅ MongoDB connected');

    // Access models directly from mongoose registry since they're already loaded
    BlogPost = mongoose.default.models.BlogPost;
    Project = mongoose.default.models.Project;
    User = mongoose.default.models.User;

    // Debug: Check if models are available
    console.log('📦 Available models:', Object.keys(mongoose.default.models));
    console.log('🔍 User model:', User ? 'Available' : 'Undefined');
    console.log('🔍 BlogPost model:', BlogPost ? 'Available' : 'Undefined');
    console.log('🔍 Project model:', Project ? 'Available' : 'Undefined');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' }).lean();
    if (!adminUser) {
      throw new Error(
        'No admin user found. Please create an admin user first.'
      );
    }

    console.log(`📝 Found admin user: ${adminUser.email}`);

    // Clear existing demo content
    console.log('🧹 Clearing existing demo content...');
    await BlogPost.deleteMany({
      $or: [
        { title: { $regex: 'Next.js 14|TypeScript|Node.js', $options: 'i' } },
        { slug: { $regex: 'nextjs-14|typescript|nodejs', $options: 'i' } },
      ],
    });
    await Project.deleteMany({
      $or: [
        {
          title: {
            $regex: 'E-Commerce|Task Management|Code Editor',
            $options: 'i',
          },
        },
        {
          slug: {
            $regex: 'ecommerce|task-management|code-editor',
            $options: 'i',
          },
        },
      ],
    });

    // Create blog posts
    console.log('📝 Creating blog posts...');
    const blogPosts = [];
    for (const postData of DEMO_BLOG_POSTS) {
      const post = new BlogPost({
        ...postData,
        slug: postData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim(),
        author: adminUser._id,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await post.save();
      blogPosts.push(post);
      console.log(`  ✅ Created blog post: ${post.title}`);
    }

    // Create projects
    console.log('🚀 Creating projects...');
    const projects = [];
    for (const projectData of DEMO_PROJECTS) {
      const project = new Project({
        ...projectData,
        slug: projectData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim(),
        author: adminUser._id,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await project.save();
      projects.push(project);
      console.log(`  ✅ Created project: ${project.title}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • Blog posts created: ${blogPosts.length}`);
    console.log(`   • Projects created: ${projects.length}`);
    console.log(`   • Author: ${adminUser.email}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateContent();
