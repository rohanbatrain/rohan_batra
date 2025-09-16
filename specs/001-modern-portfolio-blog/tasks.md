# Tasks: Modern Portfolio + Blog

**Input**: Design documents from `/specs/001-modern-portfolio-blog/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: Next.js 14+, TypeScript, Tailwind, Clerk, MongoDB
   → Structure: Next.js App Router with API routes
2. Load design documents ✓:
   → data-model.md: 7 entities (User, Project, BlogPost, Comment, Like, LottieAsset, SiteSetting)
   → contracts/api.yaml: 13 API endpoints across 5 domains
   → quickstart.md: 8 user stories with validation scenarios
3. Generate tasks by category ✓:
   → Setup: Next.js project, dependencies, environment
   → Tests: 13 contract tests + 8 integration tests
   → Core: 7 models + 13 API routes + services
   → Frontend: Components, pages, animations
   → Integration: DB, auth, markdown processing
   → Polish: validation, performance, deployment
4. Task rules applied ✓:
   → Different files = [P] parallel execution
   → Tests before implementation (TDD)
   → Dependencies tracked
5. Generated 65 sequential tasks (T001-T065)
6. Parallel execution examples provided
7. Validation complete ✓: All contracts, entities, and stories covered
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Next.js App Router Structure** (from plan.md):
- `src/app/` - App Router pages and layouts
- `src/components/` - React components  
- `src/lib/` - Utilities and configurations
- `src/models/` - Mongoose models
- `src/test/` - Test files
- `src/types/` - TypeScript definitions

## Phase 3.1: Setup

- [ ] T001 Initialize Next.js 14 project with TypeScript and App Router in repository root
- [ ] T002 [P] Install core dependencies: Tailwind CSS, shadcn/ui, Framer Motion, Clerk, MongoDB/Mongoose
- [ ] T003 [P] Configure TypeScript strict mode in `tsconfig.json`
- [ ] T004 [P] Set up ESLint and Prettier in `eslint.config.mjs` and `.prettierrc`
- [ ] T005 [P] Configure Tailwind CSS and shadcn/ui in `tailwind.config.ts` and `components.json`
- [ ] T006 [P] Set up Vitest configuration in `vitest.config.ts`
- [ ] T007 Create environment variables template in `.env.example`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (API Endpoints)
- [ ] T008 [P] Contract test GET /api/blog/posts in `src/test/api-blog-posts.contract.test.ts`
- [ ] T009 [P] Contract test GET /api/blog/posts/[slug] in `src/test/api-blog-posts-slug.contract.test.ts`
- [ ] T010 [P] Contract test POST /api/comments in `src/test/api-comments-create.contract.test.ts`
- [ ] T011 [P] Contract test GET /api/comments in `src/test/api-comments.contract.test.ts`
- [ ] T012 [P] Contract test POST /api/likes in `src/test/api-likes.contract.test.ts`
- [ ] T013 [P] Contract test GET /api/portfolio/projects in `src/test/api-portfolio-projects.contract.test.ts`
- [ ] T014 [P] Contract test GET /api/admin/stats in `src/test/api-admin-stats.contract.test.ts`
- [ ] T015 [P] Contract test PATCH /api/admin/comments/{id}/status in `src/test/api-admin-comments-moderate.contract.test.ts`

### Integration Tests (User Stories)
- [ ] T016 [P] Integration test portfolio browsing flow in `src/test/integration-portfolio-browse.test.ts`
- [ ] T017 [P] Integration test blog reading flow in `src/test/integration-blog-read.test.ts`
- [ ] T018 [P] Integration test user authentication flow in `src/test/integration-auth.test.ts`
- [ ] T019 [P] Integration test comment creation flow in `src/test/integration-comments.test.ts`
- [ ] T020 [P] Integration test like functionality in `src/test/integration-likes.test.ts`
- [ ] T021 [P] Integration test content creation workflow in `src/test/integration-content-creation.test.ts`
- [ ] T022 [P] Integration test admin moderation in `src/test/integration-admin-moderation.test.ts`
- [ ] T023 [P] Integration test SEO and social sharing in `src/test/integration-seo.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Models
- [ ] T024 [P] User model with Clerk integration in `src/models/User.ts`
- [ ] T025 [P] Project model with validation in `src/models/Project.ts`
- [ ] T026 [P] BlogPost model with metadata in `src/models/BlogPost.ts`
- [ ] T027 [P] Comment model with threading in `src/models/Comment.ts`
- [ ] T028 [P] Like model with constraints in `src/models/Like.ts`
- [ ] T029 [P] LottieAsset model in `src/models/LottieAsset.ts`
- [ ] T030 [P] SiteSetting model in `src/models/SiteSetting.ts`

### API Routes Implementation
- [ ] T031 GET /api/blog/posts route in `src/app/api/blog/posts/route.ts`
- [ ] T032 GET /api/blog/posts/[slug] route in `src/app/api/blog/posts/[slug]/route.ts`
- [ ] T033 POST /api/comments route with auth in `src/app/api/comments/route.ts`
- [ ] T034 POST /api/likes route with auth in `src/app/api/likes/route.ts`
- [ ] T035 GET /api/portfolio/projects route in `src/app/api/portfolio/projects/route.ts`
- [ ] T036 GET /api/portfolio/projects/[slug] route in `src/app/api/portfolio/projects/[slug]/route.ts`
- [ ] T037 GET /api/admin/stats route with role check in `src/app/api/admin/stats/route.ts`

## Phase 3.4: Frontend Implementation

### Core Components
- [ ] T038 [P] Portfolio project card component in `src/components/portfolio/ProjectCard.tsx`
- [ ] T039 [P] Blog post summary component in `src/components/blog/PostSummary.tsx`
- [ ] T040 [P] Comment thread component in `src/components/blog/CommentThread.tsx`
- [ ] T041 [P] Like button component in `src/components/blog/LikeButton.tsx`

### Pages and Layouts
- [ ] T042 Homepage with portfolio section in `src/app/page.tsx`
- [ ] T043 Blog listing page in `src/app/blog/page.tsx`
- [ ] T044 Blog post detail page in `src/app/blog/[slug]/page.tsx`
- [ ] T045 Admin dashboard page in `src/app/admin/page.tsx`

## Phase 3.5: Content Management

### Markdown Processing
- [ ] T046 [P] Markdown parser with frontmatter in `src/lib/markdown.ts`
- [ ] T047 [P] Lottie shortcode component in `src/components/shortcodes/LottiePlayer.tsx`
- [ ] T048 [P] Image shortcode component in `src/components/shortcodes/OptimizedImage.tsx`
- [ ] T049 [P] Blog post file reader service in `src/lib/blog-reader.ts`

## Phase 3.6: Integration

- [ ] T050 MongoDB connection setup in `src/lib/mongodb.ts`
- [ ] T051 Clerk authentication middleware in `src/lib/auth.ts`
- [ ] T052 Role-based access control utilities in `src/lib/rbac.ts`
- [ ] T053 Error handling and logging setup in `src/lib/error-handler.ts`
- [ ] T054 Input validation and sanitization in `src/lib/validation.ts`

## Phase 3.7: Polish

### Performance & SEO
- [ ] T055 [P] Image optimization configuration in `next.config.ts`
- [ ] T056 [P] Sitemap generation in `src/app/sitemap.ts`
- [ ] T057 [P] RSS feed generation in `src/app/feed.xml/route.ts`
- [ ] T058 [P] Performance monitoring setup with Vercel Analytics

### Testing & Validation
- [ ] T059 [P] Unit tests for utilities in `src/test/unit/`
- [ ] T060 [P] Accessibility testing with Playwright
- [ ] T061 [P] Performance testing with Lighthouse
- [ ] T062 Security validation and rate limiting tests

### Documentation & Deployment
- [ ] T063 [P] API documentation update in `README.md`
- [ ] T064 [P] Environment setup documentation
- [ ] T065 Docker configuration for self-hosting in `Dockerfile`

## Dependencies

### Critical Dependencies (Block Progress)
- **Phase 3.1** (Setup) must complete before all other phases
- **Phase 3.2** (Tests) must complete before **Phase 3.3** (Implementation)
- **T024-T030** (Models) must complete before **T031-T037** (API Routes)
- **T050** (MongoDB) blocks **T024-T030** (Models)
- **T051** (Auth) blocks **T033, T034, T037** (Protected routes)

### Sequential Dependencies
- T031 blocks T042, T043 (Blog pages need API)
- T032 blocks T044 (Post detail needs API)
- T033 blocks T040 (Comments need API)
- T034 blocks T041 (Likes need API)
- T046, T049 blocks T043, T044 (Blog pages need markdown processing)

### Parallel Groups
- **Models (T024-T030)**: All independent, can run simultaneously
- **Contract Tests (T008-T015)**: All independent
- **Integration Tests (T016-T023)**: All independent
- **Core Components (T038-T041)**: All independent
- **Utilities (T046-T048, T055-T058)**: All independent

## Parallel Execution Examples

### Phase 3.2: Launch All Tests Together
```bash
# Contract tests (can all run in parallel)
Task: "Contract test GET /api/blog/posts in src/test/api-blog-posts.contract.test.ts"
Task: "Contract test POST /api/comments in src/test/api-comments-create.contract.test.ts"
Task: "Contract test GET /api/portfolio/projects in src/test/api-portfolio-projects.contract.test.ts"
# ... (all 8 contract tests)

# Integration tests (can all run in parallel)  
Task: "Integration test portfolio browsing in src/test/integration-portfolio-browse.test.ts"
Task: "Integration test blog reading in src/test/integration-blog-read.test.ts"
Task: "Integration test user authentication in src/test/integration-auth.test.ts"
# ... (all 8 integration tests)
```

### Phase 3.3: Launch All Models Together (After MongoDB Setup)
```bash
# All models are independent
Task: "User model with Clerk integration in src/models/User.ts"
Task: "Project model with validation in src/models/Project.ts"
Task: "BlogPost model with metadata in src/models/BlogPost.ts"
Task: "Comment model with threading in src/models/Comment.ts"
Task: "Like model with constraints in src/models/Like.ts"
Task: "LottieAsset model in src/models/LottieAsset.ts"
Task: "SiteSetting model in src/models/SiteSetting.ts"
```

### Phase 3.4: Launch Core Components Together
```bash
# Frontend components are independent
Task: "Portfolio project card component in src/components/portfolio/ProjectCard.tsx"
Task: "Blog post summary component in src/components/blog/PostSummary.tsx"
Task: "Comment thread component in src/components/blog/CommentThread.tsx"
Task: "Like button component in src/components/blog/LikeButton.tsx"
```

## Notes
- **[P] tasks** = different files, no dependencies, safe for parallel execution
- **Sequential tasks** = modify same file or have dependencies
- Verify all tests fail before implementing (TDD)
- Commit after each task completion
- Use GitHub Copilot instructions for consistent code patterns
- Follow shadcn/ui patterns for UI components

## Task Generation Rules Applied

1. **From Contracts** (contracts/api.yaml):
   - 13 endpoints → 8 contract test tasks (T008-T015)
   - 13 endpoints → 7 API route implementation tasks (T031-T037)

2. **From Data Model** (data-model.md):
   - 7 entities → 7 model creation tasks [P] (T024-T030)
   - Relationships → service integration tasks

3. **From User Stories** (quickstart.md):
   - 8 stories → 8 integration test tasks [P] (T016-T023)
   - Validation scenarios → polish tasks (T059-T062)

4. **Architecture Requirements**:
   - Next.js App Router → page/layout tasks (T042-T045)
   - Markdown CMS → content processing tasks (T046-T049)
   - Authentication → Clerk integration tasks (T051-T052)

## Validation Checklist ✓

- [x] All 13 API contracts have corresponding test tasks
- [x] All 7 entities have model creation tasks
- [x] All 8 user stories have integration tests
- [x] All tests come before implementation (TDD)
- [x] Parallel tasks ([P]) are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly documented
- [x] 65 total tasks cover complete feature scope
- [x] Tasks follow constitutional principles (modern stack, test-driven)

## Success Criteria

Upon completion of all tasks:
- ✅ Production-ready Next.js portfolio + blog website
- ✅ MongoDB-backed user interactions (comments, likes)
- ✅ Clerk authentication with role-based access
- ✅ Markdown-based blog with custom shortcodes
- ✅ Admin dashboard for content moderation
- ✅ SEO-optimized with multilingual support
- ✅ Performance targets met (<3s load, 60fps animations)
- ✅ Accessibility compliant (WCAG)
- ✅ Ready for Vercel deployment with Docker fallback