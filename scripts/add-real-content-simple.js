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

// Define schemas inline for simplicity
const userSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  name: String,
  role: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
});

const blogPostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  featuredImage: String,
  images: [String],
  category: String,
  tags: [String],
  status: String,
  featured: Boolean,
  seoTitle: String,
  seoDescription: String,
  readingTime: Number,
  viewCount: Number,
  likeCount: Number,
  commentCount: Number,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
});

const projectSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  longDescription: String,
  images: [String],
  category: String,
  technologies: [String],
  status: String,
  featured: Boolean,
  liveUrl: String,
  sourceUrl: String,
  startDate: Date,
  endDate: Date,
  client: String,
  tags: [String],
  viewCount: Number,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);
const BlogPost = mongoose.model('BlogPost', blogPostSchema);
const Project = mongoose.model('Project', projectSchema);

// Sample data
const sampleUser = {
  clerkId: 'sample_user_id',
  email: 'rohan@example.com',
  name: 'Rohan Batra',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  createdAt: new Date(),
  updatedAt: new Date()
};

const sampleBlogPost = {
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
  publishedAt: new Date('2024-09-15'),
  createdAt: new Date('2024-09-15'),
  updatedAt: new Date('2024-09-15')
};

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
  createdAt: new Date('2024-09-15'),
  updatedAt: new Date('2024-09-15')
};

async function addSampleContent() {
  try {
    await connectToDatabase();

    // Create or find user
    let user = await User.findOne({ email: sampleUser.email });
    if (!user) {
      user = new User(sampleUser);
      await user.save();
      console.log('✅ Created sample user:', user.name);
    } else {
      console.log('📍 User already exists:', user.name);
    }

    // Create blog post
    const existingBlogPost = await BlogPost.findOne({ slug: sampleBlogPost.slug });
    if (!existingBlogPost) {
      const blogPost = new BlogPost({ ...sampleBlogPost, authorId: user._id });
      await blogPost.save();
      console.log('✅ Created sample blog post:', blogPost.title);
    } else {
      console.log('📍 Blog post already exists:', existingBlogPost.title);
    }

    // Create project
    const existingProject = await Project.findOne({ slug: sampleProject.slug });
    if (!existingProject) {
      const project = new Project({ ...sampleProject, authorId: user._id });
      await project.save();
      console.log('✅ Created sample project:', project.title);
    } else {
      console.log('📍 Project already exists:', existingProject.title);
    }

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