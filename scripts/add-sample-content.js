// Direct MongoDB insertion script
// Run this with: node scripts/add-sample-content.js

const mongoose = require('mongoose');

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Sample blog post data
const sampleBlogPost = {
  title: 'Understanding React Server Components',
  slug: 'understanding-react-server-components',
  excerpt: 'Learn how React Server Components work and why they matter for modern web development.',
  content: `
# Understanding React Server Components

React Server Components represent a paradigm shift in how we think about React applications...

## Key Benefits
- **Performance**: Reduced JavaScript bundle size
- **SEO**: Better server-side rendering
- **Developer Experience**: Simplified data fetching

## Implementation
\`\`\`jsx
// Server Component
async function BlogPost({ id }) {
  const post = await fetchPost(id);
  return <article>{post.content}</article>;
}
\`\`\`

This new architecture enables better performance and developer experience.
  `,
  featuredImage: '/images/blog/react-server-components.jpg',
  images: ['/images/blog/react-server-components.jpg'],
  category: 'React',
  tags: ['react', 'server-components', 'nextjs'],
  status: 'published',
  featured: true,
  seoTitle: 'React Server Components Guide',
  seoDescription: 'Complete guide to React Server Components and their benefits',
  readingTime: 8,
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  authorId: 'YOUR_USER_OBJECT_ID', // Replace with actual user ID
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};

// Sample portfolio project data
const sampleProject = {
  title: 'AI-Powered Task Manager',
  slug: 'ai-powered-task-manager',
  description: 'Smart task management app with AI-driven prioritization and scheduling',
  longDescription: `
## AI-Powered Task Manager

A revolutionary task management application that uses artificial intelligence to help users optimize their productivity.

### Features
- **AI Prioritization**: Automatically ranks tasks based on deadlines, importance, and user behavior
- **Smart Scheduling**: Suggests optimal time slots for task completion
- **Natural Language Processing**: Add tasks using conversational language
- **Productivity Analytics**: Detailed insights into work patterns and efficiency

### Technology Stack
- **Frontend**: React Native for cross-platform mobile app
- **Backend**: Node.js with Express and MongoDB
- **AI/ML**: TensorFlow.js for client-side AI processing
- **Cloud**: AWS for scalable infrastructure

### Impact
- 40% increase in user productivity
- 10,000+ active users within 6 months
- Featured in Apple App Store "Productivity Apps of the Year"
  `,
  images: [
    '/images/projects/task-manager-home.jpg',
    '/images/projects/task-manager-ai.jpg',
    '/images/projects/task-manager-analytics.jpg'
  ],
  category: 'Mobile Application',
  technologies: ['React Native', 'Node.js', 'MongoDB', 'TensorFlow.js', 'AWS'],
  status: 'published',
  featured: true,
  demoUrl: 'https://task-manager-demo.example.com',
  sourceUrl: 'https://github.com/username/ai-task-manager',
  liveUrl: 'https://apps.apple.com/app/ai-task-manager',
  startDate: new Date('2023-03-01'),
  endDate: new Date('2024-01-15'),
  client: 'Personal Project',
  tags: ['ai', 'productivity', 'mobile', 'react-native'],
  viewCount: 0,
  authorId: 'YOUR_USER_OBJECT_ID', // Replace with actual user ID
  createdAt: new Date(),
  updatedAt: new Date()
};

async function insertSampleContent() {
  await connectToDatabase();

  try {
    // Import models
    const BlogPost = require('../src/models/BlogPost').default;
    const Project = require('../src/models/Project').default;

    // Insert blog post
    const blogPost = new BlogPost(sampleBlogPost);
    await blogPost.save();
    console.log('Sample blog post created:', blogPost.title);

    // Insert project
    const project = new Project(sampleProject);
    await project.save();
    console.log('Sample project created:', project.title);

    console.log('Sample content inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample content:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  insertSampleContent();
}

module.exports = { insertSampleContent };