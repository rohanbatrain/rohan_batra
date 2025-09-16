# Quickstart Guide: Modern Portfolio + Blog

**Date**: 2025-09-16  
**Feature**: Modern Portfolio + Blog  
**Phase**: 1 - Development Setup and Testing

---

## Prerequisites

### Required Software
- Node.js 18+ with npm/yarn
- Git
- MongoDB Atlas account (or local MongoDB)
- Clerk account for authentication
- Code editor (VS Code recommended)

### Environment Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Configure MongoDB Atlas connection
5. Set up Clerk authentication keys

---

## Development Environment

### Quick Start Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Create `.env.local` with:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Optional: File Upload (Cloudinary/AWS)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## User Story Validation Tests

### Story 1: Browse Portfolio
**Scenario**: Visitor views portfolio projects and personal information

**Test Steps**:
1. Navigate to `http://localhost:3000`
2. Verify homepage loads with portfolio section
3. Click on a featured project
4. Verify project details page displays correctly
5. Check that all images load properly
6. Verify responsive design on mobile

**Expected Results**:
- ✅ Homepage displays portfolio summary
- ✅ Projects show title, description, technologies
- ✅ Project detail page shows full content
- ✅ Images are optimized and load quickly
- ✅ Layout is responsive

### Story 2: Read Blog Posts
**Scenario**: User discovers and reads blog content

**Test Steps**:
1. Navigate to `/blog`
2. Verify blog index shows published posts
3. Click on a blog post
4. Verify markdown content renders correctly
5. Check that shortcodes (Lottie, images) work
6. Test language switching if multilingual

**Expected Results**:
- ✅ Blog index lists posts with summaries
- ✅ Post content renders from markdown
- ✅ Lottie animations load and play
- ✅ Images are responsive and optimized
- ✅ SEO metadata is present

### Story 3: User Authentication
**Scenario**: User signs up and logs in

**Test Steps**:
1. Click "Sign In" button
2. Complete Clerk authentication flow
3. Verify user is logged in (profile visible)
4. Test sign out functionality
5. Verify protected features require auth

**Expected Results**:
- ✅ Clerk auth modal appears
- ✅ User can create account/sign in
- ✅ User profile displays correctly
- ✅ Protected routes redirect to auth
- ✅ Sign out works properly

### Story 4: Comment on Blog Posts
**Scenario**: Authenticated user leaves comments

**Test Steps**:
1. Sign in to the application
2. Navigate to a blog post
3. Scroll to comments section
4. Write and submit a comment
5. Verify comment appears (pending/published)
6. Test comment threading/replies

**Expected Results**:
- ✅ Comment form only visible when logged in
- ✅ Comment submission works
- ✅ Comment appears in list
- ✅ Reply functionality works
- ✅ Moderation status is respected

### Story 5: Like Blog Posts
**Scenario**: User expresses appreciation for content

**Test Steps**:
1. Sign in to the application
2. Navigate to a blog post
3. Click the like button
4. Verify like count increases
5. Test unlike functionality
6. Verify one like per user per post

**Expected Results**:
- ✅ Like button appears for authenticated users
- ✅ Click increases like count
- ✅ User can unlike post
- ✅ Cannot like same post multiple times
- ✅ Like persists across page reloads

### Story 6: Content Creation
**Scenario**: Content creator publishes blog post

**Test Steps**:
1. Create markdown file in `/content/posts/`
2. Add frontmatter with metadata
3. Include shortcode for Lottie animation
4. Build the application
5. Verify post appears in blog index
6. Check that shortcodes render correctly

**Expected Results**:
- ✅ Markdown file is processed correctly
- ✅ Frontmatter metadata is extracted
- ✅ Post appears in blog listing
- ✅ Shortcodes render as components
- ✅ SEO metadata is generated

### Story 7: Admin Moderation
**Scenario**: Admin manages content and users

**Test Steps**:
1. Sign in with admin role account
2. Navigate to admin dashboard
3. Review pending comments
4. Approve/reject comments
5. Manage Lottie assets
6. Update site settings

**Expected Results**:
- ✅ Admin dashboard is accessible
- ✅ Comment moderation interface works
- ✅ File upload for Lottie assets works
- ✅ Settings can be updated
- ✅ Changes persist correctly

### Story 8: SEO and Social Sharing
**Scenario**: Content is discoverable and shareable

**Test Steps**:
1. Navigate to a blog post
2. View page source for meta tags
3. Test social sharing links
4. Check sitemap.xml generation
5. Verify RSS feed
6. Test search functionality

**Expected Results**:
- ✅ Open Graph meta tags present
- ✅ Twitter Card metadata correct
- ✅ Sitemap includes all pages
- ✅ RSS feed is valid
- ✅ Search returns relevant results

---

## Performance Validation

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Tests
```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Check bundle size
npm run analyze

# Test loading performance
npm run test:performance
```

### Expected Performance Metrics
- ✅ Homepage loads in < 3 seconds
- ✅ Blog posts load in < 2 seconds
- ✅ Images are lazy-loaded
- ✅ Animations don't block rendering
- ✅ JavaScript bundle < 500KB

---

## Accessibility Validation

### Accessibility Tests
```bash
# Run accessibility audit
npm run test:a11y

# Test with screen reader
# Manual testing with VoiceOver/NVDA
```

### Accessibility Checklist
- ✅ All images have alt text
- ✅ Focus management works correctly
- ✅ Color contrast meets WCAG AA
- ✅ Keyboard navigation functional
- ✅ Screen reader friendly markup

---

## Security Validation

### Security Tests
- ✅ User input is sanitized
- ✅ API endpoints are protected
- ✅ Rate limiting is active
- ✅ HTTPS enforced in production
- ✅ Environment variables secured

### Security Checklist
```bash
# Test API authentication
curl -X POST http://localhost:3000/api/blog/posts/test-post/comments \
  -H "Content-Type: application/json" \
  -d '{"content": "Test comment"}'
# Should return 401 Unauthorized

# Test input sanitization
# Submit comment with <script> tags
# Should be sanitized/escaped
```

---

## Deployment Validation

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy to preview environment
4. Test all functionality in production
5. Set up custom domain

### Docker Deployment
```bash
# Build Docker image
docker build -t portfolio .

# Run container
docker run -p 3000:3000 --env-file .env portfolio

# Test containerized application
curl http://localhost:3000/api/health
```

---

## Monitoring and Analytics

### Setup Verification
- ✅ Vercel Analytics configured
- ✅ Error tracking (Sentry) active
- ✅ Performance monitoring enabled
- ✅ Database monitoring configured

### Health Check Endpoints
```bash
# Application health
GET /api/health

# Database connectivity
GET /api/health/db

# Authentication service
GET /api/health/auth
```

---

## Common Issues and Troubleshooting

### Database Connection Issues
```bash
# Test MongoDB connection
node -e "require('./lib/mongodb').connectToDatabase().then(() => console.log('Connected')).catch(console.error)"
```

### Authentication Issues
```bash
# Verify Clerk configuration
curl -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  https://api.clerk.dev/v1/users
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues
```bash
# Analyze bundle
npm run analyze

# Check for memory leaks
node --inspect=0.0.0.0:9229 npm start
```

---

## Success Criteria

### Functional Requirements Met
- ✅ Portfolio displays projects correctly
- ✅ Blog renders markdown with shortcodes
- ✅ User authentication works
- ✅ Comments and likes functional
- ✅ Admin moderation works
- ✅ Multilingual support active
- ✅ SEO optimization present

### Performance Requirements Met
- ✅ Page load times under targets
- ✅ Core Web Vitals pass
- ✅ Images optimized
- ✅ Animations smooth

### Security Requirements Met
- ✅ Input validation active
- ✅ Authentication required for UGC
- ✅ Admin access protected
- ✅ Rate limiting functional

This quickstart guide validates that all user stories work as expected and the system meets its functional and non-functional requirements.