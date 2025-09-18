const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Import the actual models
const BlogPost = require('../dist/src/models/BlogPost.js').default;
const Project = require('../dist/src/models/Project.js').default; 
const User = require('../dist/src/models/User.js').default;

async function addSampleContent() {
  try {
    await connectToDatabase();

    // Find the existing user
    let user = await User.findOne({ email: 'github@rohanbatra.in' });
    if (!user) {
      console.log('❌ No user found with email github@rohanbatra.in');
      return;
    }
    console.log('✅ Found user:', user.firstName, user.lastName);

    // Delete any existing sample content first to recreate with correct fields
    await BlogPost.deleteMany({ 
      slug: { $in: ['building-modern-web-apps-nextjs-15'] }
    });
    await Project.deleteMany({ 
      slug: { $in: ['ai-powered-portfolio-website'] }
    });

    // Create blog post with correct authorId field
    const blogPostData = {
      title: 'Building Modern Web Applications with Next.js 15',
      slug: 'building-modern-web-apps-nextjs-15',
      excerpt: 'Learn how to leverage the latest features in Next.js 15 to build fast, modern web applications with React Server Components.',
      content: `# Building Modern Web Applications with Next.js 15

Next.js 15 represents a significant leap forward in the React ecosystem, introducing powerful features that enable developers to build faster, more efficient web applications.

## What's New in Next.js 15

### App Router Stability
The App Router is now stable and production-ready, providing:
- **Improved Performance**: Better code splitting and loading strategies
- **Enhanced Developer Experience**: More intuitive file-based routing
- **React Server Components**: Server-side rendering with component-level granularity

### Benefits of Server Components
1. **Reduced Bundle Size**: Server components don't ship to the client
2. **Better Performance**: Initial page loads are faster
3. **Improved SEO**: Content is rendered on the server
4. **Enhanced Security**: Sensitive data operations stay on the server

## Conclusion
Next.js 15 provides powerful tools for building modern web applications with excellent performance and developer experience.`,
      featuredImage: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop',
      images: ['https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop'],
      category: 'Web Development',
      tags: ['Next.js', 'React', 'Web Development', 'JavaScript'],
      status: 'published',
      featured: true,
      seoTitle: 'Building Modern Web Apps with Next.js 15 - Complete Guide',
      seoDescription: 'Learn how to leverage Next.js 15 features to build fast, modern web applications.',
      readingTime: 8,
      viewCount: 1250,
      likeCount: 42,
      commentCount: 15,
      authorId: user._id,  // Use correct field name
      publishedAt: new Date('2024-09-15'),
      createdAt: new Date('2024-09-15'),
      updatedAt: new Date('2024-09-15')
    };

    const blogPost = new BlogPost(blogPostData);
    await blogPost.save();
    console.log('✅ Created blog post:', blogPost.title);

    // Create project with correct authorId field
    const projectData = {
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

### Technology Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: MongoDB with Mongoose ODM
- **Authentication**: Clerk for secure user management
- **Deployment**: Vercel with automatic scaling

### Impact
- 40% faster page load times compared to traditional portfolios
- 95% reduction in content management time`,
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
      authorId: user._id,  // Use correct field name
      createdAt: new Date('2024-09-15'),
      updatedAt: new Date('2024-09-15')
    };

    const project = new Project(projectData);
    await project.save();
    console.log('✅ Created project:', project.title);

    console.log('\n🎉 Sample content setup complete! Your homepage should now show real content instead of placeholders.');
  } catch (error) {
    console.error('❌ Error adding sample content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
addSampleContent();