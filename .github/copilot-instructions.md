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
- **Markdown** files with YAML frontmatter for blog posts
- **remark/rehype** pipeline for markdown processing
- **MDX** support for React components in markdown
- Custom shortcodes for Lottie animations, images, embeds

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
│   ├── api/               # API route handlers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── blog/             # Blog-specific components
│   └── portfolio/        # Portfolio components
├── lib/                  # Utilities and configurations
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # Clerk configuration
│   └── markdown.ts       # Markdown processing
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

### Blog System
- Markdown files in `/content/posts/` with frontmatter
- Dynamic routing via `[slug]/page.tsx`
- ISR (Incremental Static Regeneration) for performance
- Custom shortcodes processed during build

### Authentication Flow
- Clerk handles all auth UI and logic
- Role-based component rendering
- Protected API routes with Clerk middleware
- User profile synced to MongoDB

### Content Management
- File-based CMS for blog posts
- Admin dashboard for comment moderation
- Lottie asset management
- Real-time content updates via ISR

### Performance Optimization
- Image optimization with `next/image`
- Lazy loading for heavy components
- Bundle splitting for large dependencies
- CDN integration for static assets

## Recent Feature Work

### Current Sprint: 001-modern-portfolio-blog
- Implementing portfolio + blog website
- Setting up Next.js with TypeScript and Tailwind
- Integrating Clerk authentication
- Building markdown processing pipeline
- Creating admin dashboard for content moderation

## Context Notes

- This is a personal portfolio website with blog functionality
- Target audience includes recruiters, clients, and general public
- SEO optimization is critical for discoverability
- Multilingual support (English/Spanish) required
- Rich animations and 3D elements for visual appeal
- Production deployment on Vercel with Docker fallback

## Common Patterns to Suggest

1. **Server Components for data fetching**
2. **Client Components for interactivity**
3. **Zod schemas for API validation**
4. **Clerk hooks for authentication state**
5. **Mongoose models for database operations**
6. **Tailwind classes for styling**
7. **Framer Motion for animations**
8. **Error boundaries for graceful failures**

When generating code, prioritize type safety, performance, accessibility, and maintainability.