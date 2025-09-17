# GitHub Copilot Instructions

This repository contains a modern portfolio website with blog functionality. Below are the key technologies and patterns to follow when generating code suggestions.

## Technology Stack

### Core Framework
- **Next.js 14+** with App Router (TypeScript)
- **React 18+** with Server Components
- **TypeScript** in strict mode

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for component library
- **Framer Motion** for animations
- **Three.js** (react-three-fiber) for 3D elements

### Authentication & Database
- **Clerk** for user authentication and management
- **MongoDB Atlas** with Mongoose for data modeling
- Role-based access control (admin, editor, user)

### Content Management
- **Database-driven** blog posts and books with rich content storage
- **Book writing system** with chapters, character sketches, and journals
- **Novel.sh editor** for beautiful, calming writing experience
- **Markdown paste support** with automatic rich text conversion
- **Character management** with relationships and development tracking
- **MongoDB** with Mongoose for all content management
- **Component integration** for Lottie animations, images, embeds

### Development & Testing
- **Vitest** + **React Testing Library** for unit tests
- **Playwright** for E2E testing
- **ESLint** + **Prettier** for code quality
- **Husky** for git hooks

### Deployment & Monitoring
- **Vercel** for primary hosting
- **Docker** support for self-hosting
- **Sentry** for error tracking
- **Vercel Analytics** for performance monitoring

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   ├── admin/             # Admin dashboard routes
│   ├── api/               # API route handlers
│   │   ├── blog/          # Blog post endpoints
│   │   ├── portfolio/     # Portfolio project endpoints
│   │   ├── comments/      # Comment management endpoints
│   │   ├── likes/         # Like/reaction endpoints
│   │   └── admin/         # Admin-only endpoints
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── blog/             # Blog-specific components
│   ├── portfolio/        # Portfolio components
│   ├── admin/            # Admin dashboard components
│   └── auth/             # Authentication components
├── lib/                  # Utilities and configurations
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # Clerk configuration
│   ├── blog-service.ts   # Direct blog data access
│   ├── portfolio-service.ts # Direct portfolio data access
│   └── markdown.ts       # Markdown processing
├── models/               # Mongoose data models
│   ├── BlogPost.ts       # Blog post schema
│   ├── Project.ts        # Portfolio project schema
│   ├── Comment.ts        # Comment schema
│   ├── Like.ts           # Like/reaction schema
│   ├── User.ts           # User profile schema
│   ├── LottieAsset.ts    # Lottie animation schema
│   └── SiteSetting.ts    # Global settings schema
├── hooks/                # Custom React hooks
└── types/                # TypeScript definitions

content/
└── posts/                # Markdown blog posts
    ├── en/               # English posts
    └── es/               # Spanish posts

public/
├── lottie/               # Lottie animation files
└── images/               # Static images
```

## Code Style Guidelines

### React Components
- Use Server Components by default, Client Components only when needed
- Prefer composition over inheritance
- Use TypeScript interfaces for props
- Follow shadcn/ui patterns for UI components

### API Routes
- Use App Router route handlers (`route.ts`)
- Implement proper error handling and status codes
- Validate inputs with Zod schemas
- Use Clerk middleware for authentication

### Database Operations
- Use Mongoose models with TypeScript interfaces
- Implement proper error handling
- Use transactions for multi-document operations
- Add appropriate indexes for performance

### Styling
- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use CSS custom properties for dynamic values
- Implement dark mode support

## Feature-Specific Patterns

### Blog & Book System
- Database-driven content with rich metadata and Novel.sh editor
- Book writing with chapters, character development, and journals
- Dynamic routing via `[slug]/page.tsx` for both blogs and books
- Markdown paste conversion for seamless writing workflow
- Character relationship mapping and development tracking
- ISR (Incremental Static Regeneration) for performance
- Direct database access via content services for SSR

### Portfolio System
- Database-driven portfolio projects with rich metadata
- Technology tag management and filtering
- Image gallery and project link management
- Direct database access via portfolio-service.ts for SSR

### Authentication Flow
- Clerk handles all auth UI and logic with sign-in/sign-up components
- Role-based component rendering (admin, editor, user)
- Protected API routes with Clerk middleware
- User profile synced to MongoDB with role management

### Admin Dashboard System
- Comprehensive content management at `/admin/*` routes
- Role-based access control (admin vs editor permissions)
- Blog post management with markdown editor and SEO controls
- Portfolio project management with media handling
- Comment moderation with threading and spam detection
- Lottie asset management with upload and preview
- User management and role assignment (admin only)
- Site settings configuration with type-appropriate controls
- Real-time analytics and activity monitoring

### Content Management
- Database-driven blog posts, books, and character development
- Book chapters with order management and progress tracking
- Character sketches with relationship mapping and development arcs
- Character journals for backstory and development documentation
- Comment system with moderation workflow
- Like/reaction system for engagement tracking
- Lottie asset management with usage analytics
- Global site settings with public/private configurations

### Multilingual Support
- Language-based routing with [locale] dynamic segments
- Content translation linking via translationKey
- Language switcher component for user preference
- Localized content management in admin dashboard

### Performance Optimization
- Image optimization with `next/image`
- Lazy loading for heavy components
- Bundle splitting for large dependencies
- CDN integration for static assets

## Recent Feature Work

### Current Sprint: 001-modern-portfolio-blog (COMPLETED)
- ✅ Implemented portfolio + blog website with Next.js 14+ and TypeScript
- ✅ Integrated Clerk authentication with role-based access control
- ✅ Built markdown processing pipeline with custom shortcodes
- ✅ Created MongoDB data models for all content types
- ✅ Established API endpoints for blog, portfolio, comments, and likes
- ✅ Implemented direct database services for SSR performance

### Next Sprint: 003-add-a-matching (IN PROGRESS)
- 🔄 Building comprehensive admin dashboard for content management
- 🔄 Implementing CRUD interfaces for all content types
- 🔄 Creating comment moderation and user management systems
- 🔄 Adding Lottie asset management with upload capabilities
- 🔄 Building site settings configuration interface
- 🔄 Integrating analytics and activity monitoring

## Context Notes

- This is a personal portfolio website with blog functionality
- Target audience includes recruiters, clients, and general public
- SEO optimization is critical for discoverability
- Multilingual support (English/Spanish) required
- Rich animations and 3D elements for visual appeal
- Production deployment on Vercel with Docker fallback

## Common Patterns to Suggest

1. **Server Components for data fetching with direct database access**
2. **Client Components for interactivity and authentication state**
3. **Zod schemas for comprehensive API validation**
4. **Clerk hooks for authentication state and role checking**
5. **Mongoose models with TypeScript interfaces for type safety**
6. **shadcn/ui components with Tailwind CSS for consistent styling**
7. **Framer Motion for smooth animations and transitions**
8. **Error boundaries and loading states for graceful UX**
9. **Role-based rendering for admin/editor/user permissions**
10. **Direct database services to avoid HTTP fetch during SSR**

### Admin Dashboard Patterns
- **Comprehensive CRUD interfaces** for all content types
- **Role-based component access** with admin vs editor differentiation
- **Form validation** using existing Mongoose schema rules
- **Real-time updates** and optimistic UI patterns
- **Bulk operations** for efficient content management
- **Activity monitoring** and audit trail integration

When generating code, prioritize type safety, performance, accessibility, role-based security, and maintainability.