// Example: How to add a portfolio project via API
const addPortfolioProject = async () => {
  const projectData = {
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform built with Next.js and MongoDB',
    longDescription: `
## Project Overview

This e-commerce platform was built to provide a modern, scalable solution for online retail businesses.

### Key Features
- User authentication and authorization
- Product catalog with advanced filtering
- Shopping cart and checkout process
- Payment integration with Stripe
- Admin dashboard for inventory management
- Real-time order tracking

### Technical Implementation
- **Frontend:** Next.js 14 with TypeScript
- **Backend:** API Routes with MongoDB
- **Authentication:** Clerk
- **Payments:** Stripe integration
- **Deployment:** Vercel

### Challenges Solved
- Performance optimization for large product catalogs
- Real-time inventory management
- Secure payment processing
- Mobile-responsive design

The project successfully handles thousands of concurrent users and processes hundreds of orders daily.
    `,
    images: [
      '/images/projects/ecommerce-homepage.jpg',
      '/images/projects/ecommerce-product.jpg',
      '/images/projects/ecommerce-admin.jpg'
    ],
    category: 'Web Application', // Required
    technologies: [
      'Next.js',
      'TypeScript',
      'MongoDB',
      'Stripe',
      'Tailwind CSS',
      'Clerk'
    ],
    status: 'published', // Options: 'draft', 'published', 'archived'
    featured: true, // Set to true to feature on homepage
    demoUrl: 'https://ecommerce-demo.example.com',
    sourceUrl: 'https://github.com/username/ecommerce-platform',
    liveUrl: 'https://store.example.com',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    client: 'ABC Retail Corp',
    tags: ['ecommerce', 'fullstack', 'nextjs', 'mongodb']
  };

  try {
    const response = await fetch('/api/portfolio/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Portfolio project created:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

// Call the function
addPortfolioProject();