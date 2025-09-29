#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

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
];

const DEMO_PROJECTS = [
  {
    title: 'E-Commerce Platform with Next.js',
    description:
      'A full-stack e-commerce platform built with Next.js, featuring modern UI, secure payments, and real-time inventory management.',
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
      'An intelligent task management application that uses AI to help users prioritize tasks, set realistic deadlines, and improve productivity.',
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
    seo: {
      title: 'AI Task Management Platform - Smart Productivity Solution',
      description:
        'Revolutionary task management platform powered by AI for intelligent prioritization and automated scheduling.',
      keywords: ['ai', 'task management', 'productivity', 'nextjs', 'openai'],
    },
  },
  {
    title: 'Real-Time Collaborative Code Editor',
    description:
      'A web-based collaborative code editor with real-time synchronization, multi-language support, and integrated video chat for pair programming sessions.',
    shortDescription:
      'Real-time collaborative code editor with video chat for pair programming.',
    technologies: [
      'React',
      'Node.js',
      'Socket.io',
      'Monaco Editor',
      'WebRTC',
      'Express',
      'MongoDB',
    ],
    categories: ['Web Application', 'Developer Tools', 'Real-time'],
    status: 'published',
    featured: true,
    images: [
      {
        url: '/images/projects/code-editor-main.jpg',
        alt: 'Code Editor Interface',
      },
      {
        url: '/images/projects/code-editor-collaboration.jpg',
        alt: 'Collaboration Features',
      },
      {
        url: '/images/projects/code-editor-video.jpg',
        alt: 'Video Chat Integration',
      },
    ],
    links: {
      live: 'https://codepair.dev',
      github: 'https://github.com/rohanbatra/codepair',
      demo: 'https://demo.codepair.dev',
    },
    seo: {
      title: 'Real-Time Collaborative Code Editor - CodePair',
      description:
        'Web-based collaborative code editor with real-time sync and video chat for seamless pair programming.',
      keywords: [
        'code editor',
        'collaboration',
        'real-time',
        'pair programming',
        'webrtc',
      ],
    },
  },
];

async function migrateContent() {
  try {
    // Dynamic imports after env is loaded
    const { default: connectToDatabase } = await import(
      '../src/lib/mongodb.js'
    );
    const { default: BlogPost } = await import('../src/models/BlogPost.js');
    const { default: Project } = await import('../src/models/Project.js');
    const { default: User } = await import('../src/models/User.js');

    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error(
        'Admin user not found. Please create an admin user first.'
      );
    }

    console.log(`Found admin user: ${adminUser.name}`);

    // Clear existing demo data
    console.log('Clearing existing demo data...');
    await BlogPost.deleteMany({ 'audit.createdBy': adminUser._id });
    await Project.deleteMany({ 'audit.createdBy': adminUser._id });

    // Migrate blog posts
    console.log('Creating demo blog posts...');
    const blogPosts = [];

    for (const postData of DEMO_BLOG_POSTS) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const post = new BlogPost({
        ...postData,
        slug,
        authorId: adminUser._id,
        analytics: {
          views: Math.floor(Math.random() * 1000) + 50,
          likes: Math.floor(Math.random() * 100) + 5,
          comments: Math.floor(Math.random() * 20) + 1,
          shares: Math.floor(Math.random() * 50) + 2,
          readTime: Math.ceil(postData.content.split(' ').length / 200),
          socialShares: {
            facebook: Math.floor(Math.random() * 20),
            twitter: Math.floor(Math.random() * 30),
            linkedin: Math.floor(Math.random() * 15),
            total: Math.floor(Math.random() * 65),
          },
        },
        audit: {
          createdBy: adminUser._id,
          createdAt: new Date(),
          log: [
            {
              action: 'created',
              userId: adminUser._id,
              userName: adminUser.name,
              timestamp: new Date(),
              metadata: { demo: true, source: 'migration' },
            },
          ],
        },
      });

      await post.save();
      blogPosts.push(post);
    }

    console.log(`Created ${blogPosts.length} blog posts`);

    // Migrate projects
    console.log('Creating demo projects...');
    const projects = [];

    for (const projectData of DEMO_PROJECTS) {
      const slug = projectData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const project = new Project({
        ...projectData,
        slug,
        analytics: {
          views: Math.floor(Math.random() * 500) + 25,
          likes: Math.floor(Math.random() * 50) + 3,
          shares: Math.floor(Math.random() * 25) + 1,
          clickthroughs: {
            live: Math.floor(Math.random() * 100),
            github: Math.floor(Math.random() * 200),
            demo: Math.floor(Math.random() * 75),
            documentation: Math.floor(Math.random() * 50),
          },
        },
        audit: {
          createdBy: adminUser._id,
          createdAt: new Date(),
          log: [
            {
              action: 'created',
              userId: adminUser._id,
              userName: adminUser.name,
              timestamp: new Date(),
              metadata: { demo: true, source: 'migration' },
            },
          ],
        },
      });

      await project.save();
      projects.push(project);
    }

    console.log(`Created ${projects.length} projects`);

    console.log('\n✅ Demo content migration completed successfully!');
    console.log(`
📊 Summary:
- Blog Posts: ${blogPosts.length}
- Projects: ${projects.length}
- Total Content Items: ${blogPosts.length + projects.length}

🎉 Your admin dashboard should now display the demo content!
    `);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateContent()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });
