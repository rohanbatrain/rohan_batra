#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Dynamic imports after env is loaded
const connectToDatabase = (await import('../src/lib/mongodb.js')).default;
const BlogPost = (await import('../src/models/BlogPost.js')).default;
const Project = (await import('../src/models/Project.js')).default;
const User = (await import('../src/models/User.js')).default;

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
    categories: ['Web Development', 'React', 'Next.js'],
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

### API Route Type Safety
Ensure type safety in API routes with proper typing.

\`\`\`typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, User } from '@/types/api';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    const users = await getUsersFromDatabase();
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users',
    }, { status: 500 });
  }
}
\`\`\`

## Database Integration with Mongoose

### Typed Schemas
Create type-safe Mongoose schemas with TypeScript.

\`\`\`typescript
import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, {
  timestamps: true,
});

export const User = model<IUser>('User', userSchema);
\`\`\`

## Best Practices

### 1. Strict Configuration
Always use strict TypeScript configuration for maximum type safety.

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
\`\`\`

### 2. Type Guards
Implement robust type guards for runtime type checking.

\`\`\`typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).name === 'string' &&
    typeof (obj as User).email === 'string'
  );
}
\`\`\`

### 3. Generic Utilities
Create reusable generic utilities for common patterns.

\`\`\`typescript
type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type CreateInput<T> = Optional<WithTimestamps<T>, 'createdAt' | 'updatedAt'>;
\`\`\`

TypeScript's powerful type system enables us to build more reliable, maintainable applications. By leveraging advanced features like conditional types, template literals, and proper type guards, we can achieve end-to-end type safety that catches errors at compile time rather than runtime.
    `,
    excerpt:
      'Deep dive into advanced TypeScript patterns for full-stack development, including conditional types, template literals, type guards, and best practices for building type-safe applications.',
    status: 'published',
    categories: ['TypeScript', 'Web Development', 'Programming'],
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
    title: 'The Art of API Design: Building RESTful Services',
    content: `
# The Art of API Design: Building RESTful Services

Well-designed APIs are the backbone of modern applications. This guide explores principles, patterns, and best practices for creating robust, scalable RESTful services that developers love to use.

## RESTful Design Principles

### Resource-Oriented Architecture
Design your API around resources, not actions. Resources should be nouns, and HTTP methods should represent actions.

\`\`\`
// Good: Resource-oriented
GET    /api/users          # Get all users
GET    /api/users/123      # Get specific user
POST   /api/users          # Create new user
PUT    /api/users/123      # Update user
DELETE /api/users/123      # Delete user

// Bad: Action-oriented
POST /api/getUsers
POST /api/createUser
POST /api/updateUser
POST /api/deleteUser
\`\`\`

### HTTP Status Codes
Use appropriate HTTP status codes to communicate the result of operations.

\`\`\`typescript
// Success responses
200 OK               # Successful GET, PUT
201 Created          # Successful POST
204 No Content       # Successful DELETE

// Client error responses
400 Bad Request      # Invalid request data
401 Unauthorized     # Authentication required
403 Forbidden        # Insufficient permissions
404 Not Found        # Resource doesn't exist
422 Unprocessable    # Validation errors

// Server error responses
500 Internal Error   # Server-side errors
503 Service Unavailable # Temporary server issues
\`\`\`

## API Response Patterns

### Consistent Response Structure
Maintain a consistent response format across all endpoints.

\`\`\`typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Success response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123",
    "version": "v1"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email format is invalid"
    }
  }
}
\`\`\`

### Pagination and Filtering
Implement consistent pagination and filtering patterns.

\`\`\`typescript
// Query parameters
GET /api/users?page=2&limit=20&sort=name&order=asc&status=active

// Response with pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 1250,
    "totalPages": 63,
    "hasNext": true,
    "hasPrev": true
  }
}
\`\`\`

## Authentication and Authorization

### JWT-Based Authentication
Implement secure JWT-based authentication with proper token management.

\`\`\`typescript
// Login endpoint
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 3600
    }
  }
}
\`\`\`

### Role-Based Access Control
Implement granular permissions based on user roles.

\`\`\`typescript
// Middleware for role checking
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Access denied'
        }
      });
    }
    
    next();
  };
};

// Usage
app.get('/api/admin/users', 
  authenticateToken, 
  requireRole(['admin']), 
  getUsersHandler
);
\`\`\`

## Error Handling

### Comprehensive Error Handling
Implement robust error handling with meaningful error messages.

\`\`\`typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Global error handler
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
\`\`\`

## API Documentation

### OpenAPI Specification
Document your API using OpenAPI (Swagger) specification.

\`\`\`yaml
openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
  description: RESTful API for user management

paths:
  /api/users:
    get:
      summary: Get all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UsersResponse'
\`\`\`

## Performance Optimization

### Caching Strategies
Implement intelligent caching to improve API performance.

\`\`\`typescript
// Redis caching example
const getUsers = async (page: number, limit: number) => {
  const cacheKey = \`users:\${page}:\${limit}\`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(users));
  
  return users;
};
\`\`\`

### Rate Limiting
Protect your API from abuse with rate limiting.

\`\`\`typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

app.use('/api/', limiter);
\`\`\`

Building excellent APIs requires attention to detail, consistency, and a deep understanding of how developers will interact with your services. Focus on creating intuitive, well-documented, and performant APIs that scale with your application's growth.
    `,
    excerpt:
      'Learn the principles and best practices for designing robust, scalable RESTful APIs including resource design, authentication, error handling, and performance optimization.',
    status: 'published',
    categories: ['API Design', 'Backend Development', 'Web Development'],
    tags: ['api', 'rest', 'backend', 'nodejs', 'design-patterns'],
    seoTitle: 'RESTful API Design Guide: Best Practices & Patterns',
    seoDescription:
      'Comprehensive guide to designing RESTful APIs with best practices for authentication, error handling, performance optimization, and developer experience.',
  },
  {
    title: 'Database Design Patterns for Modern Applications',
    content: `
# Database Design Patterns for Modern Applications

Effective database design is crucial for building scalable, performant applications. This guide explores modern database patterns, optimization techniques, and best practices for both SQL and NoSQL databases.

## Database Selection Criteria

### SQL vs NoSQL Decision Matrix

**Choose SQL when:**
- ACID compliance is critical
- Complex relationships and joins are common
- Data consistency is paramount
- Mature ecosystem and tooling needed

**Choose NoSQL when:**
- Horizontal scaling is required
- Schema flexibility is important
- High-volume, high-velocity data
- Specific use cases (document, graph, key-value)

\`\`\`typescript
// Example: User profile with flexible attributes
// Better suited for NoSQL
interface UserProfile {
  id: string;
  basicInfo: {
    name: string;
    email: string;
  };
  preferences: Record<string, unknown>; // Flexible schema
  metadata: {
    lastLogin: Date;
    createdAt: Date;
  };
}

// Example: Financial transactions
// Better suited for SQL
interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: Decimal;
  currency: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}
\`\`\`

## MongoDB Design Patterns

### Document Embedding vs Referencing

**Embed when:**
- Data is accessed together frequently
- 1:1 or 1:few relationships
- Child documents don't need independent access

\`\`\`typescript
// Embedding pattern - Blog post with comments
interface BlogPost {
  _id: ObjectId;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  comments: Array<{
    id: string;
    content: string;
    author: string;
    createdAt: Date;
  }>;
}
\`\`\`

**Reference when:**
- Data grows unbounded
- Many-to-many relationships
- Independent data access patterns

\`\`\`typescript
// Referencing pattern - User and Posts
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  postIds: ObjectId[]; // Reference to posts
}

interface Post {
  _id: ObjectId;
  title: string;
  content: string;
  authorId: ObjectId; // Reference to user
}
\`\`\`

### Aggregation Pipeline Patterns

**Faceted Search Pattern**
\`\`\`javascript
// Complex search with multiple facets
db.products.aggregate([
  {
    $match: {
      category: "electronics",
      price: { $gte: 100, $lte: 1000 }
    }
  },
  {
    $facet: {
      products: [
        { $skip: 0 },
        { $limit: 20 },
        { $project: { name: 1, price: 1, rating: 1 } }
      ],
      priceRanges: [
        {
          $bucket: {
            groupBy: "$price",
            boundaries: [0, 100, 300, 500, 1000, Infinity],
            default: "Other",
            output: { count: { $sum: 1 } }
          }
        }
      ],
      brands: [
        { $group: { _id: "$brand", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]
    }
  }
]);
\`\`\`

## PostgreSQL Advanced Patterns

### JSONB for Flexible Schema
\`\`\`sql
-- User table with flexible metadata
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile JSONB,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index on JSONB fields for performance
CREATE INDEX idx_users_profile_name ON users USING GIN ((profile->>'name'));
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);

-- Query JSONB data
SELECT * FROM users 
WHERE profile->>'city' = 'New York'
  AND preferences->>'theme' = 'dark';
\`\`\`

### Partitioning for Large Tables
\`\`\`sql
-- Range partitioning by date
CREATE TABLE analytics_events (
    id BIGSERIAL,
    event_type VARCHAR(50),
    user_id INTEGER,
    event_data JSONB,
    created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE analytics_events_2024_01 
PARTITION OF analytics_events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE analytics_events_2024_02 
PARTITION OF analytics_events
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
\`\`\`

## Performance Optimization

### Index Strategies

**MongoDB Compound Indexes**
\`\`\`javascript
// Compound index for common query patterns
db.users.createIndex({
  "status": 1,        // Equality first
  "lastLogin": -1,    // Sort second
  "email": 1          // Range last
});

// Partial index for active users only
db.users.createIndex(
  { "email": 1 },
  { partialFilterExpression: { "status": "active" } }
);
\`\`\`

**PostgreSQL Index Types**
\`\`\`sql
-- B-tree index (default)
CREATE INDEX idx_users_email ON users (email);

-- GIN index for full-text search
CREATE INDEX idx_posts_content_gin ON posts USING GIN (to_tsvector('english', content));

-- Partial index
CREATE INDEX idx_active_users ON users (created_at) 
WHERE status = 'active';

-- Covering index
CREATE INDEX idx_users_covering ON users (status) INCLUDE (name, email);
\`\`\`

### Query Optimization

**MongoDB Aggregation Optimization**
\`\`\`javascript
// Optimized aggregation pipeline
db.orders.aggregate([
  // Match early to reduce documents
  { $match: { 
    status: "completed",
    createdAt: { $gte: ISODate("2024-01-01") }
  }},
  
  // Use indexes effectively
  { $sort: { createdAt: -1 } },
  
  // Limit early if possible
  { $limit: 1000 },
  
  // Group and calculate
  { $group: {
    _id: "$customerId",
    totalSpent: { $sum: "$amount" },
    orderCount: { $sum: 1 }
  }}
]);
\`\`\`

**PostgreSQL Query Optimization**
\`\`\`sql
-- Use EXPLAIN ANALYZE to understand query plans
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5;

-- Optimize with appropriate indexes
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_orders_user_id ON orders (user_id);
\`\`\`

## Data Consistency Patterns

### MongoDB Transactions
\`\`\`typescript
// Multi-document transaction
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    // Transfer money between accounts
    await Account.updateOne(
      { _id: fromAccountId },
      { $inc: { balance: -amount } },
      { session }
    );
    
    await Account.updateOne(
      { _id: toAccountId },
      { $inc: { balance: amount } },
      { session }
    );
    
    await Transaction.create([{
      fromAccountId,
      toAccountId,
      amount,
      status: 'completed'
    }], { session });
  });
} finally {
  await session.endSession();
}
\`\`\`

### PostgreSQL ACID Transactions
\`\`\`sql
BEGIN;

-- Update inventory
UPDATE products 
SET stock_quantity = stock_quantity - 5 
WHERE id = 1 AND stock_quantity >= 5;

-- Create order if update was successful
INSERT INTO orders (product_id, quantity, user_id)
SELECT 1, 5, 123
WHERE (SELECT stock_quantity FROM products WHERE id = 1) >= 0;

-- Check if both operations succeeded
DO $$
BEGIN
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
END $$;

COMMIT;
\`\`\`

## Caching Strategies

### Redis Cache Patterns
\`\`\`typescript
// Cache-aside pattern
const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const cacheKey = \`user:profile:\${userId}\`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const profile = await User.findById(userId);
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(profile));
  
  return profile;
};

// Write-through pattern
const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  // Update database
  const updatedProfile = await User.findByIdAndUpdate(userId, updates, { new: true });
  
  // Update cache immediately
  const cacheKey = \`user:profile:\${userId}\`;
  await redis.setex(cacheKey, 3600, JSON.stringify(updatedProfile));
  
  return updatedProfile;
};
\`\`\`

## Backup and Recovery

### MongoDB Backup Strategy
\`\`\`bash
# Point-in-time backup with mongodump
mongodump --host localhost:27017 --db myapp --out /backup/$(date +%Y%m%d_%H%M%S)

# Replica set with oplog for continuous backup
mongodump --host rs0/localhost:27017 --oplog --out /backup/full_backup

# Restore with oplog replay
mongorestore --host localhost:27017 --oplogReplay /backup/full_backup
\`\`\`

### PostgreSQL Backup Strategy
\`\`\`bash
# Full database backup
pg_dump -h localhost -U postgres -d myapp -f backup_$(date +%Y%m%d_%H%M%S).sql

# Continuous archiving with WAL
# In postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /backup/wal_archive/%f'

# Point-in-time recovery
pg_basebackup -h localhost -D /backup/base_backup -U postgres -P -W
\`\`\`

Effective database design requires understanding your application's access patterns, consistency requirements, and scalability needs. Choose the right database technology and design patterns that align with your specific use case, and always plan for performance, reliability, and maintainability from the start.
    `,
    excerpt:
      'Comprehensive guide to modern database design patterns covering SQL and NoSQL databases, performance optimization, data consistency, caching strategies, and backup solutions.',
    status: 'published',
    categories: ['Database Design', 'Backend Development', 'Performance'],
    tags: ['database', 'mongodb', 'postgresql', 'optimization', 'architecture'],
    seoTitle: 'Database Design Patterns for Scalable Applications',
    seoDescription:
      'Master modern database design patterns for building scalable applications with MongoDB and PostgreSQL, including performance optimization and best practices.',
  },
];

const DEMO_PROJECTS = [
  {
    title: 'AI-Powered Task Management Platform',
    description:
      'A comprehensive task management platform with AI-powered features for intelligent task prioritization, automated scheduling, and productivity insights.',
    shortDescription:
      'AI-powered task management with intelligent prioritization and automated scheduling features.',
    technologies: [
      'Next.js',
      'TypeScript',
      'OpenAI API',
      'PostgreSQL',
      'Prisma',
      'Tailwind CSS',
      'Clerk',
    ],
    categories: ['Web Application', 'AI/ML', 'Productivity'],
    status: 'published',
    featured: true,
    images: [
      {
        url: '/images/projects/task-manager-dashboard.jpg',
        alt: 'Task Manager Dashboard',
      },
      { url: '/images/projects/task-manager-ai.jpg', alt: 'AI Features' },
      {
        url: '/images/projects/task-manager-mobile.jpg',
        alt: 'Mobile Interface',
      },
    ],
    links: {
      live: 'https://taskmaster-ai.vercel.app',
      github: 'https://github.com/rohanbatra/taskmaster-ai',
      demo: 'https://demo.taskmaster-ai.vercel.app',
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
  {
    title: 'E-Commerce Analytics Dashboard',
    description:
      'A comprehensive analytics dashboard for e-commerce businesses featuring real-time sales tracking, customer insights, inventory management, and predictive analytics.',
    shortDescription:
      'Comprehensive e-commerce analytics with real-time tracking and predictive insights.',
    technologies: [
      'Vue.js',
      'D3.js',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Redis',
      'Docker',
    ],
    categories: ['Web Application', 'Analytics', 'E-commerce'],
    status: 'published',
    featured: false,
    images: [
      {
        url: '/images/projects/ecommerce-dashboard.jpg',
        alt: 'Analytics Dashboard',
      },
      {
        url: '/images/projects/ecommerce-insights.jpg',
        alt: 'Customer Insights',
      },
      { url: '/images/projects/ecommerce-mobile.jpg', alt: 'Mobile Dashboard' },
    ],
    links: {
      github: 'https://github.com/rohanbatra/ecommerce-analytics',
      demo: 'https://demo-analytics.vercel.app',
    },
    seo: {
      title: 'E-Commerce Analytics Dashboard - Business Intelligence',
      description:
        'Powerful analytics dashboard for e-commerce businesses with real-time tracking and predictive insights.',
      keywords: [
        'ecommerce',
        'analytics',
        'dashboard',
        'business intelligence',
        'vuejs',
      ],
    },
  },
  {
    title: 'Social Media Content Scheduler',
    description:
      'A unified platform for scheduling and managing social media content across multiple platforms with AI-powered content suggestions and performance analytics.',
    shortDescription:
      'Multi-platform social media scheduler with AI content suggestions.',
    technologies: [
      'React',
      'Node.js',
      'GraphQL',
      'Apollo',
      'PostgreSQL',
      'Bull Queue',
      'AWS S3',
    ],
    categories: ['Web Application', 'Social Media', 'Marketing'],
    status: 'published',
    featured: false,
    images: [
      {
        url: '/images/projects/social-scheduler-main.jpg',
        alt: 'Content Scheduler',
      },
      {
        url: '/images/projects/social-scheduler-calendar.jpg',
        alt: 'Calendar View',
      },
      {
        url: '/images/projects/social-scheduler-analytics.jpg',
        alt: 'Performance Analytics',
      },
    ],
    links: {
      live: 'https://socialsync.app',
      github: 'https://github.com/rohanbatra/social-sync',
    },
    seo: {
      title: 'Social Media Content Scheduler - SocialSync',
      description:
        'Unified platform for scheduling social media content with AI-powered suggestions and analytics.',
      keywords: [
        'social media',
        'content scheduler',
        'marketing',
        'automation',
        'ai',
      ],
    },
  },
  {
    title: 'Blockchain-Based Supply Chain Tracker',
    description:
      'A transparent supply chain tracking system built on blockchain technology, enabling end-to-end traceability of products from manufacturer to consumer.',
    shortDescription:
      'Blockchain-powered supply chain tracking for product traceability.',
    technologies: [
      'Solidity',
      'Web3.js',
      'React',
      'Node.js',
      'Ethereum',
      'IPFS',
      'Material-UI',
    ],
    categories: ['Blockchain', 'Supply Chain', 'Web3'],
    status: 'published',
    featured: true,
    images: [
      {
        url: '/images/projects/blockchain-tracker-main.jpg',
        alt: 'Supply Chain Dashboard',
      },
      {
        url: '/images/projects/blockchain-tracker-timeline.jpg',
        alt: 'Product Timeline',
      },
      {
        url: '/images/projects/blockchain-tracker-verify.jpg',
        alt: 'Verification System',
      },
    ],
    links: {
      github: 'https://github.com/rohanbatra/supply-chain-blockchain',
      demo: 'https://supply-tracker-demo.vercel.app',
    },
    seo: {
      title: 'Blockchain Supply Chain Tracker - Transparent Traceability',
      description:
        'Blockchain-based supply chain tracking system for transparent product traceability from source to consumer.',
      keywords: [
        'blockchain',
        'supply chain',
        'ethereum',
        'web3',
        'traceability',
      ],
    },
  },
  {
    title: 'Voice-Controlled Smart Home Hub',
    description:
      'An intelligent home automation system with voice control, machine learning-based pattern recognition, and seamless integration with IoT devices.',
    shortDescription:
      'AI-powered smart home hub with voice control and IoT integration.',
    technologies: [
      'Python',
      'TensorFlow',
      'React Native',
      'MQTT',
      'Raspberry Pi',
      'SQLite',
      'Speech Recognition',
    ],
    categories: ['IoT', 'AI/ML', 'Mobile App'],
    status: 'published',
    featured: false,
    images: [
      { url: '/images/projects/smart-home-app.jpg', alt: 'Mobile Control App' },
      {
        url: '/images/projects/smart-home-dashboard.jpg',
        alt: 'Control Dashboard',
      },
      {
        url: '/images/projects/smart-home-devices.jpg',
        alt: 'Connected Devices',
      },
    ],
    links: {
      github: 'https://github.com/rohanbatra/smart-home-hub',
    },
    seo: {
      title: 'Voice-Controlled Smart Home Hub - AI Home Automation',
      description:
        'Intelligent home automation system with voice control and machine learning for seamless IoT device management.',
      keywords: ['smart home', 'iot', 'voice control', 'ai', 'home automation'],
    },
  },
];

async function migrateContent() {
  try {
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

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateContent()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

export default migrateContent;
