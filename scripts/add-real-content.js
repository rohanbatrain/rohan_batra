import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/mongodb.js';

// Sample blog post data
const sampleBlogPost = {
  title: 'Building Modern Web Applications with Next.js 15',
  slug: 'building-modern-web-apps-nextjs-15',
  excerpt: 'Learn how to leverage the latest features in Next.js 15 to build fast, modern web applications with React Server Components.',
  content: `# Building Modern Web Applications with Next.js 15

Next.js 15 represents a significant leap forward in the React ecosystem, introducing powerful features that enable developers to build faster, more efficient web applications. In this comprehensive guide, we'll explore the key features and best practices for leveraging Next.js 15 in your projects.

## What's New in Next.js 15

### App Router Stability
The App Router, introduced as an experimental feature in Next.js 13, is now stable and production-ready. This new routing system provides:

- **Improved Performance**: Better code splitting and loading strategies
- **Enhanced Developer Experience**: More intuitive file-based routing
- **React Server Components**: Server-side rendering with component-level granularity

### Turbopack Integration
Next.js 15 includes significant improvements to Turbopack, Vercel's Rust-based bundler:

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

To create a new Next.js 15 project with the App Router:

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

Next.js 15 provides powerful tools for building modern web applications. By understanding and leveraging these features, you can create faster, more efficient applications that provide excellent user experiences.`,
  featuredImage: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop',
  images: ['https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop'],
  category: 'Web Development',
  tags: ['Next.js', 'React', 'Web Development', 'JavaScript'],
  status: 'published',
  featured: true,
  seoTitle: 'Building Modern Web Apps with Next.js 15 - Complete Guide',
  seoDescription: 'Learn how to leverage Next.js 15 features to build fast, modern web applications. Complete guide with examples and best practices.',
  readingTime: 8,
  viewCount: 1250,
  likeCount: 42,
  commentCount: 15,
  publishedAt: new Date('2024-09-15'),
  createdAt: new Date('2024-09-15'),
  updatedAt: new Date('2024-09-15'),
};

// Sample portfolio project data
const sampleProject = {
  title: 'AI-Powered Portfolio Website',
  slug: 'ai-powered-portfolio-website',
  description: 'Modern portfolio website with AI-powered content management and dynamic blog functionality',
  longDescription: `## AI-Powered Portfolio Website

A cutting-edge portfolio website that leverages artificial intelligence to enhance content management and user experience.

### Features
- **AI Content Generation**: Automatically generate blog post excerpts and SEO descriptions
- **Dynamic Content Management**: Real-time content updates with MongoDB integration
- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Authentication**: Secure user management with Clerk
- **Performance Optimized**: Server-side rendering with optimal loading speeds

### Technology Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: MongoDB with Mongoose ODM
- **Authentication**: Clerk for secure user management
- **Deployment**: Vercel with automatic scaling
- **AI Integration**: OpenAI GPT for content enhancement

### Impact
- 40% faster page load times compared to traditional portfolios
- 95% reduction in content management time
- Featured in multiple web development showcases`,
  images: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop'
  ],
  category: 'Web Development',
  technologies: ['Next.js', 'TypeScript', 'MongoDB', 'Tailwind CSS', 'Clerk'],
  status: 'published',
  featured: true,
  liveUrl: 'https://rohanbatra.dev',
  sourceUrl: 'https://github.com/rohanbatra/portfolio',
  startDate: new Date('2024-08-01'),
  endDate: new Date('2024-09-15'),
  client: 'Personal Project',
  tags: ['portfolio', 'ai', 'nextjs', 'typescript'],
  viewCount: 0,
  createdAt: new Date('2024-09-15'),
  updatedAt: new Date('2024-09-15'),
};

async function addSampleContent() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Import models using dynamic imports
    const { default: BlogPost } = await import('../src/models/BlogPost.js');
    const { default: Project } = await import('../src/models/Project.js');
    const { default: User } = await import('../src/models/User.js');

    // First, ensure we have a user to associate with the content
    let user = await User.findOne({ email: 'rohan@example.com' });
    if (!user) {
      user = new User({
        clerkId: 'sample_user_id',
        email: 'rohan@example.com',
        name: 'Rohan Batra',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await user.save();
      console.log('Created sample user:', user.name);
    }

    // Create blog post with user reference
    const blogPostWithAuthor = {
      ...sampleBlogPost,
      author: user._id
    };

    const existingBlogPost = await BlogPost.findOne({ slug: sampleBlogPost.slug });
    if (!existingBlogPost) {
      const blogPost = new BlogPost(blogPostWithAuthor);
      await blogPost.save();
      console.log('Created sample blog post:', blogPost.title);
    } else {
      console.log('Blog post already exists:', existingBlogPost.title);
    }

    // Create project with user reference
    const projectWithAuthor = {
      ...sampleProject,
      author: user._id
    };

    const existingProject = await Project.findOne({ slug: sampleProject.slug });
    if (!existingProject) {
      const project = new Project(projectWithAuthor);
      await project.save();
      console.log('Created sample project:', project.title);
    } else {
      console.log('Project already exists:', existingProject.title);
    }

    console.log('Sample content setup complete!');
  } catch (error) {
    console.error('Error adding sample content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleContent();