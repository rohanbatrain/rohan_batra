import connectToDatabase from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import { ProjectWithAuthor } from '@/types/project';

// Mock data for development when database is not available
const mockProjects: ProjectWithAuthor[] = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    slug: 'ecommerce-platform',
    description:
      'A full-stack e-commerce solution built with Next.js, TypeScript, and Stripe integration. Features include product catalog, shopping cart, user authentication, payment processing, and admin dashboard.',
    longDescription: `A comprehensive e-commerce platform that provides a complete shopping experience for both customers and administrators. Built with modern web technologies to ensure scalability, performance, and maintainability.

## Key Features

### Customer Experience
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Add, remove, and modify items with real-time updates
- **Secure Checkout**: Integrated with Stripe for secure payment processing
- **User Accounts**: Profile management, order history, and wishlist functionality
- **Responsive Design**: Optimized for all devices and screen sizes

### Admin Dashboard
- **Product Management**: Add, edit, and organize product inventory
- **Order Processing**: View and manage customer orders
- **Analytics**: Sales reports and customer insights
- **User Management**: Customer support and account administration

### Technical Highlights
- **Server-Side Rendering**: Fast initial page loads with Next.js
- **Type Safety**: Full TypeScript implementation for reliability
- **Database**: MongoDB with Mongoose for scalable data storage
- **Payment Processing**: Secure transactions with Stripe integration
- **Authentication**: User management with NextAuth.js
- **Deployment**: Optimized for Vercel with automatic scaling

## Development Process

This project was built following modern development practices including:
- Test-driven development with Jest and Testing Library
- Continuous integration with GitHub Actions
- Code quality enforcement with ESLint and Prettier
- Performance monitoring with Lighthouse CI
- Security scanning with dependabot`,
    images: [
      '/placeholder-project.jpg',
      '/placeholder-project-2.jpg',
      '/placeholder-project.jpg',
    ],
    category: 'Web Development',
    technologies: [
      'Next.js',
      'TypeScript',
      'Stripe',
      'MongoDB',
      'Tailwind CSS',
    ],
    status: 'published' as const,
    featured: true,
    liveUrl: 'https://ecommerce-demo.vercel.app',
    sourceUrl: 'https://github.com/example/ecommerce',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2024-01-15'),
    tags: ['Full-Stack', 'E-Commerce', 'React'],
    viewCount: 150,
    authorId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    author: {
      id: '1',
      firstName: 'Rohan',
      lastName: 'Batra',
      avatar: '/placeholder-avatar.jpg',
    },
  },
  {
    _id: '2',
    title: 'Task Management App',
    slug: 'task-management-app',
    description:
      'A collaborative task management application with real-time updates, team workspaces, and advanced project tracking features.',
    longDescription:
      'This task management application demonstrates real-time collaboration capabilities using WebSocket technology. Users can create projects, manage tasks with different status levels, collaborate with team members, and track progress through interactive dashboards.',
    images: ['/placeholder-project.jpg', '/placeholder-project-2.jpg'],
    category: 'Web Development',
    technologies: ['React', 'Node.js', 'Socket.io', 'PostgreSQL', 'Express'],
    status: 'published' as const,
    featured: true,
    liveUrl: 'https://taskmanager-demo.vercel.app',
    sourceUrl: 'https://github.com/example/taskmanager',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-12-01'),
    tags: ['Full-Stack', 'Real-Time', 'Collaboration'],
    viewCount: 120,
    authorId: '1',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01'),
    author: {
      id: '1',
      firstName: 'Rohan',
      lastName: 'Batra',
      avatar: '/placeholder-avatar.jpg',
    },
  },
  {
    _id: '3',
    title: 'Weather Dashboard',
    slug: 'weather-dashboard',
    description:
      'A responsive weather application with location-based forecasts, interactive maps, and weather alerts.',
    longDescription:
      'This weather dashboard provides comprehensive weather information with a beautiful, intuitive interface. Features include current weather conditions, 7-day forecasts, interactive weather maps, location-based services, weather alerts and notifications, and historical weather data visualization.',
    images: ['/placeholder-project.jpg'],
    category: 'Web Development',
    technologies: ['React', 'OpenWeather API', 'Chart.js', 'CSS3'],
    status: 'published' as const,
    featured: false,
    liveUrl: 'https://weather-dashboard-demo.vercel.app',
    sourceUrl: 'https://github.com/example/weather-dashboard',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2023-09-15'),
    tags: ['Frontend', 'API Integration', 'Data Visualization'],
    viewCount: 85,
    authorId: '1',
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2023-09-15'),
    author: {
      id: '1',
      firstName: 'Rohan',
      lastName: 'Batra',
      avatar: '/placeholder-avatar.jpg',
    },
  },
];

export async function getProjectBySlug(
  slug: string
): Promise<ProjectWithAuthor | null> {
  try {
    await connectToDatabase();

    // Find the project by slug and populate author
    const project = await ProjectModel.findOne({
      slug,
      status: 'published', // Only return published projects
    }).populate('author', 'name email avatar role');

    if (!project) {
      // Return mock data for development
      const mockProject = mockProjects.find(
        p => p.slug === slug && p.status === 'published'
      );
      return mockProject || null;
    }

    // Transform to include author info
    const projectWithAuthor: ProjectWithAuthor = {
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      images: project.images,
      category: project.category,
      technologies: project.technologies,
      status: project.status,
      featured: project.featured,
      liveUrl: project.liveUrl,
      sourceUrl: project.sourceUrl,
      startDate: project.startDate,
      endDate: project.endDate,
      tags: project.tags,
      viewCount: project.viewCount,
      authorId: project.author._id.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      author: {
        id: project.author._id.toString(),
        firstName: project.author.name.split(' ')[0] || '',
        lastName: project.author.name.split(' ').slice(1).join(' ') || '',
        avatar: project.author.avatar,
      },
    };

    return projectWithAuthor;
  } catch (error) {
    console.error('Error fetching project:', error);
    // Return mock data as fallback
    const mockProject = mockProjects.find(
      p => p.slug === slug && p.status === 'published'
    );
    return mockProject || null;
  }
}

export async function getPublishedProjects(
  limit: number = 100
): Promise<ProjectWithAuthor[]> {
  try {
    await connectToDatabase();

    const projects = await ProjectModel.find({
      status: 'published',
    })
      .populate('author', 'name email avatar role')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit);

    const projectsWithAuthor = projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      featuredImage: project.images?.[0] || '',
      images: project.images,
      category: project.category,
      technologies: project.technologies,
      status: project.status,
      featured: project.featured,
      liveUrl: project.liveUrl,
      sourceUrl: project.sourceUrl,
      githubUrl: project.sourceUrl, // Map sourceUrl to githubUrl
      startDate: project.startDate,
      endDate: project.endDate,
      tags: project.tags,
      viewCount: project.viewCount,
      likeCount: 0, // Not implemented yet
      authorId: project.author._id.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      author: {
        id: project.author._id.toString(),
        firstName: project.author.name.split(' ')[0] || '',
        lastName: project.author.name.split(' ').slice(1).join(' ') || '',
        avatar: project.author.avatar,
      },
    }));

    return projectsWithAuthor;
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Return mock data as fallback
    return mockProjects.filter(project => project.status === 'published');
  }
}

export async function getProjectsWithPagination(params: {
  page?: number;
  limit?: number;
  category?: string;
  technology?: string;
  featured?: boolean;
  status?: string;
  search?: string;
}): Promise<{
  projects: ProjectWithAuthor[];
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
    limit = 12,
    category,
    technology,
    featured,
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

    // Technology filter
    if (technology) {
      query.technologies = { $in: [technology] };
    }

    // Featured filter
    if (featured !== undefined) {
      query.featured = featured;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await ProjectModel.countDocuments(query);

    // Get projects with author population
    const projects = await ProjectModel.find(query)
      .populate('author', 'name email avatar role')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform to include author info
    const projectsWithAuthor: ProjectWithAuthor[] = projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      featuredImage: project.images?.[0] || '',
      images: project.images,
      category: project.category,
      technologies: project.technologies,
      status: project.status,
      featured: project.featured,
      liveUrl: project.liveUrl,
      sourceUrl: project.sourceUrl,
      githubUrl: project.sourceUrl, // Map sourceUrl to githubUrl
      startDate: project.startDate,
      endDate: project.endDate,
      tags: project.tags,
      viewCount: project.viewCount,
      likeCount: 0, // Not implemented yet
      authorId: project.author._id.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      author: {
        id: project.author._id.toString(),
        firstName: project.author.name.split(' ')[0] || '',
        lastName: project.author.name.split(' ').slice(1).join(' ') || '',
        avatar: project.author.avatar,
      },
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      projects: projectsWithAuthor,
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
    console.error('Error fetching projects with pagination:', error);
    // Return mock data as fallback
    const filteredMockProjects = mockProjects.filter(
      project => project.status === 'published'
    );
    return {
      projects: filteredMockProjects,
      pagination: {
        page: 1,
        limit: filteredMockProjects.length,
        total: filteredMockProjects.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

export async function incrementProjectViewCount(slug: string): Promise<void> {
  try {
    await connectToDatabase();
    await ProjectModel.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } });
  } catch (error) {
    console.error('Error incrementing project view count:', error);
    // Silently fail - view count increment is not critical
  }
}
