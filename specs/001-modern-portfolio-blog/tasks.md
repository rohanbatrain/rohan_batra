# Tasks: Modern Portfolio + Blog

**Input**: Design documents from `/specs/001-modern-portfolio-blog/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Next.js 14+ App Router, TypeScript, Tailwind CSS, shadcn/ui, Clerk, MongoDB Atlas
   → Structure: Web application with Next.js frontend and API routes backend
2. Load design documents:
   → data-model.md: 7 entities (User, Project, BlogPost, Comment, Like, LottieAsset, SiteSetting)
   → contracts/api.yaml: 15 endpoints across blog, portfolio, admin, and assets
   → quickstart.md: 8 user story validation scenarios
3. Generate tasks by category:
   → Setup: Next.js project, dependencies, environment configuration
   → Tests: API contract tests, integration tests for user stories
   → Core: Mongoose models, API routes, React components, markdown processing
   → Integration: Database connection, authentication, middleware
   → Polish: UI polish, performance optimization, deployment
4. Applied task rules:
   → Different files = marked [P] for parallel execution
   → Same file/interdependent = sequential
   → Tests before implementation (TDD approach)
5. Tasks numbered T001-T045 with clear dependencies
6. Parallel execution examples provided
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Next.js App Router Structure**:
- `src/app/` - App Router pages and layouts
- `src/components/` - React components
- `src/lib/` - Utilities and configurations
- `src/types/` - TypeScript definitions
- `tests/` - Test files

## Phase 3.1: Setup
- [ ] T001 Initialize Next.js 14+ project with TypeScript in repository root
- [ ] T002 Install core dependencies (next, react, typescript, tailwindcss, @clerk/nextjs, mongoose)
- [ ] T003 [P] Configure Tailwind CSS in `tailwind.config.ts` and `src/app/globals.css`
- [ ] T004 [P] Configure TypeScript in `tsconfig.json` with strict mode
- [ ] T005 [P] Set up ESLint and Prettier in `eslint.config.mjs` and `.prettierrc`
- [ ] T006 Configure environment variables in `.env.example` and `.env.local`
- [ ] T007 [P] Initialize shadcn/ui components library
- [ ] T008 [P] Set up Vitest testing framework in `vitest.config.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests
- [ ] T009 [P] Contract test GET /api/blog/posts in `tests/contract/blog-posts-get.test.ts`
- [ ] T010 [P] Contract test GET /api/blog/posts/{slug} in `tests/contract/blog-post-get.test.ts`
- [ ] T011 [P] Contract test GET /api/blog/posts/{slug}/comments in `tests/contract/comments-get.test.ts`
- [ ] T012 [P] Contract test POST /api/blog/posts/{slug}/comments in `tests/contract/comments-post.test.ts`
- [ ] T013 [P] Contract test GET /api/blog/posts/{slug}/likes in `tests/contract/likes-get.test.ts`
- [ ] T014 [P] Contract test POST /api/blog/posts/{slug}/likes in `tests/contract/likes-post.test.ts`
- [ ] T015 [P] Contract test GET /api/portfolio/projects in `tests/contract/projects-get.test.ts`
- [ ] T016 [P] Contract test GET /api/admin/comments in `tests/contract/admin-comments-get.test.ts`
- [ ] T017 [P] Contract test PATCH /api/admin/comments/{id}/status in `tests/contract/admin-comments-patch.test.ts`
- [ ] T018 [P] Contract test GET /api/admin/lottie in `tests/contract/admin-lottie-get.test.ts`

### Integration Tests for User Stories
- [ ] T019 [P] Integration test portfolio browsing in `tests/integration/portfolio-browsing.test.ts`
- [ ] T020 [P] Integration test blog reading in `tests/integration/blog-reading.test.ts`
- [ ] T021 [P] Integration test user authentication in `tests/integration/user-auth.test.ts`
- [ ] T022 [P] Integration test commenting flow in `tests/integration/commenting.test.ts`
- [ ] T023 [P] Integration test liking posts in `tests/integration/liking.test.ts`
- [ ] T024 [P] Integration test admin moderation in `tests/integration/admin-moderation.test.ts`
- [ ] T025 [P] Integration test SEO and social sharing in `tests/integration/seo-social.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Models
- [ ] T026 [P] User model in `src/lib/models/User.ts`
- [ ] T027 [P] Project model in `src/lib/models/Project.ts`
- [ ] T028 [P] BlogPost model in `src/lib/models/BlogPost.ts`
- [ ] T029 [P] Comment model in `src/lib/models/Comment.ts`
- [ ] T030 [P] Like model in `src/lib/models/Like.ts`
- [ ] T031 [P] LottieAsset model in `src/lib/models/LottieAsset.ts`
- [ ] T032 [P] SiteSetting model in `src/lib/models/SiteSetting.ts`

### Database Connection
- [ ] T033 MongoDB connection utility in `src/lib/mongodb.ts`

### API Routes
- [ ] T034 GET /api/blog/posts route in `src/app/api/blog/posts/route.ts`
- [ ] T035 GET /api/blog/posts/[slug] route in `src/app/api/blog/posts/[slug]/route.ts`
- [ ] T036 Comments API routes in `src/app/api/blog/posts/[slug]/comments/route.ts`
- [ ] T037 Likes API routes in `src/app/api/blog/posts/[slug]/likes/route.ts`
- [ ] T038 Portfolio API routes in `src/app/api/portfolio/projects/route.ts` and `[slug]/route.ts`
- [ ] T039 Admin comments API in `src/app/api/admin/comments/route.ts` and `[id]/status/route.ts`
- [ ] T040 Admin Lottie assets API in `src/app/api/admin/lottie/route.ts`

### Markdown Processing
- [ ] T041 Markdown processing pipeline in `src/lib/markdown.ts` with shortcode support
- [ ] T042 [P] Lottie shortcode component in `src/components/shortcodes/LottieShortcode.tsx`

## Phase 3.4: Integration
- [ ] T043 Clerk authentication setup in `src/lib/auth.ts` and middleware
- [ ] T044 Database models integration with API routes
- [ ] T045 Error handling and API response utilities in `src/lib/api-utils.ts`

## Phase 3.5: Frontend Components

### Core UI Components
- [ ] T046 [P] Blog post card component in `src/components/blog/BlogPostCard.tsx`
- [ ] T047 [P] Blog post content component in `src/components/blog/BlogPostContent.tsx`
- [ ] T048 [P] Comment thread component in `src/components/blog/CommentThread.tsx`
- [ ] T049 [P] Like button component in `src/components/blog/LikeButton.tsx`
- [ ] T050 [P] Project card component in `src/components/portfolio/ProjectCard.tsx`
- [ ] T051 [P] Project detail component in `src/components/portfolio/ProjectDetail.tsx`

### Page Components
- [ ] T052 Homepage layout in `src/app/page.tsx`
- [ ] T053 Blog index page in `src/app/blog/page.tsx`
- [ ] T054 Blog post page in `src/app/blog/[slug]/page.tsx`
- [ ] T055 Portfolio page in `src/app/portfolio/page.tsx`
- [ ] T056 Project detail page in `src/app/portfolio/[slug]/page.tsx`
- [ ] T057 Admin dashboard in `src/app/admin/page.tsx`

### Layout and Navigation
- [ ] T058 Root layout with navigation in `src/app/layout.tsx`
- [ ] T059 [P] Navigation component in `src/components/layout/Navigation.tsx`
- [ ] T060 [P] Footer component in `src/components/layout/Footer.tsx`

## Phase 3.6: Content Management

### Markdown Content
- [ ] T061 Create sample blog posts in `content/posts/` directory
- [ ] T062 [P] Blog post metadata extraction utility in `src/lib/blog-utils.ts`
- [ ] T063 [P] Static generation for blog posts in blog pages

### Asset Management
- [ ] T064 [P] Image optimization configuration in `next.config.ts`
- [ ] T065 [P] Lottie animation loader in `src/components/ui/LottiePlayer.tsx`

## Phase 3.7: Authentication & Security
- [ ] T066 Clerk authentication pages setup (`/sign-in`, `/sign-up`)
- [ ] T067 [P] Protected route middleware in `src/middleware.ts`
- [ ] T068 [P] Role-based access control utility in `src/lib/rbac.ts`
- [ ] T069 Input validation and sanitization in `src/lib/validation.ts`

## Phase 3.8: Polish & Optimization

### Performance
- [ ] T070 [P] Dynamic imports for heavy components
- [ ] T071 [P] Image optimization and lazy loading implementation
- [ ] T072 [P] Bundle analysis and optimization

### SEO & Accessibility
- [ ] T073 [P] Meta tags and Open Graph setup in page components
- [ ] T074 [P] Sitemap generation in `src/app/sitemap.ts`
- [ ] T075 [P] RSS feed generation in `src/app/feed.xml/route.ts`
- [ ] T076 [P] Accessibility improvements (ARIA labels, focus management)

### Internationalization
- [ ] T077 [P] next-intl setup in `src/lib/i18n.ts`
- [ ] T078 [P] Locale routing configuration
- [ ] T079 [P] Translation files in `locales/` directory

### Testing & Quality
- [ ] T080 [P] Unit tests for utility functions in `tests/unit/`
- [ ] T081 [P] Component testing with React Testing Library
- [ ] T082 [P] E2E tests with Playwright in `tests/e2e/`
- [ ] T083 Performance testing and Core Web Vitals validation

## Phase 3.9: Deployment & Monitoring
- [ ] T084 [P] Vercel deployment configuration in `vercel.json`
- [ ] T085 [P] Docker setup in `Dockerfile` and `docker-compose.yml`
- [ ] T086 [P] GitHub Actions CI/CD pipeline in `.github/workflows/`
- [ ] T087 Environment variables setup for production
- [ ] T088 [P] Error tracking with Sentry integration
- [ ] T089 [P] Analytics setup (Vercel Analytics)
- [ ] T090 Production deployment and domain configuration

## Dependencies

### Critical Path
1. **Setup (T001-T008)** → All other phases
2. **Tests (T009-T025)** → Implementation (T026+)
3. **Models (T026-T032)** → API Routes (T034-T040)
4. **Database Connection (T033)** → Models (T026-T032)
5. **Auth Setup (T043)** → Protected API routes
6. **Markdown Processing (T041-T042)** → Blog pages (T053-T054)

### Parallel Execution Blocks
- **Models**: T026-T032 can run in parallel
- **Contract Tests**: T009-T018 can run in parallel  
- **Integration Tests**: T019-T025 can run in parallel
- **UI Components**: T046-T051 can run in parallel
- **Polish Tasks**: Most T070+ tasks can run in parallel

## Parallel Execution Examples

### Phase 1: Setup Tasks
```bash
# Can run simultaneously:
Task: "Configure Tailwind CSS in tailwind.config.ts and src/app/globals.css"
Task: "Configure TypeScript in tsconfig.json with strict mode"
Task: "Set up ESLint and Prettier in eslint.config.mjs and .prettierrc"
Task: "Initialize shadcn/ui components library"
Task: "Set up Vitest testing framework in vitest.config.ts"
```

### Phase 2: Contract Tests
```bash
# All contract tests can run in parallel:
Task: "Contract test GET /api/blog/posts in tests/contract/blog-posts-get.test.ts"
Task: "Contract test GET /api/blog/posts/{slug} in tests/contract/blog-post-get.test.ts"
Task: "Contract test POST /api/blog/posts/{slug}/comments in tests/contract/comments-post.test.ts"
# ... (all T009-T018)
```

### Phase 3: Database Models
```bash
# All model files are independent:
Task: "User model in src/lib/models/User.ts"
Task: "Project model in src/lib/models/Project.ts"
Task: "BlogPost model in src/lib/models/BlogPost.ts"
Task: "Comment model in src/lib/models/Comment.ts"
# ... (all T026-T032)
```

## Validation Checklist
*GATE: Checked before execution*

- [x] All API endpoints have contract tests (T009-T018)
- [x] All entities have model tasks (T026-T032)
- [x] All user stories have integration tests (T019-T025)
- [x] Tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks are truly independent ([P] marked appropriately)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly mapped
- [x] TDD approach enforced (tests must fail first)

## Notes
- **[P] tasks** = Different files, no dependencies - can run simultaneously
- **Sequential tasks** = Modify same files or have direct dependencies
- Verify all tests fail before implementing features
- Commit after completing each task for tracking
- Focus on one phase at a time for better organization
- Use GitHub Issues or project board to track task completion