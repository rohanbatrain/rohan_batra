# Tasks: Admin Dashboard for Content Management with Book Writing System

**Input**: Design documents from `/specs/003-add-a-matching/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript, Next.js 14+ App Router, React 18+, Tailwind CSS, shadcn/ui, Clerk, Mongoose, Novel.sh
   → Structure: Next.js integrated frontend/backend architecture
2. Load optional design documents: ✅
   → data-model.md: Existing entities (BlogPost, Project, Comment, User, LottieAsset, SiteSetting) + NEW (Book, Chapter, Character, CharacterJournal)
   → contracts/api.yaml: 16 admin API endpoints + NEW 16 book writing endpoints (32 total)
   → research.md: UX patterns, authentication, optimistic updates
   → quickstart.md: 6-phase implementation with testing scenarios
3. Generate tasks by category: ✅
   → Setup: middleware, layout structure, dependencies (Novel.sh)
   → Tests: contract tests for all 32 endpoints, integration tests
   → Core: admin components, API routes, middleware, book writing system
   → Integration: authentication, role-based access, Novel.sh editor integration
   → Polish: error handling, performance, mobile responsive, export functionality
4. Apply task rules: ✅
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
8. Validate task completeness: ✅
   → All 32 API contracts have tests ✅ (16 admin + 16 book writing)
   → All 10 entity types have admin interfaces ✅ (6 existing + 4 book writing)
   → All endpoints implemented ✅
   → Novel.sh editor integration ✅
   → Book writing system complete ✅
9. Return: SUCCESS (tasks ready for execution) ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App Router**: `src/app/`, `src/components/`, `src/lib/`
- **Admin routes**: `src/app/admin/`
- **API routes**: `src/app/api/admin/`
- **Components**: `src/components/admin/`
- **Tests**: `src/test/`

## Phase 3.1: Setup
- [ ] T001 **CRITICAL**: Create missing middleware.ts with complete role-based route protection (currently missing entirely)
- [ ] T002 Install Novel.sh editor dependencies for beautiful writing experience in `package.json`
- [ ] T003 [P] Configure admin layout structure in `src/app/admin/layout.tsx`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Dashboard & Admin Core Tests
- [ ] T004 [P] Contract test GET /admin/stats in `src/test/api-admin-stats.contract.test.ts`
- [ ] T005 [P] Contract test GET /admin/activity in `src/test/api-admin-activity.contract.test.ts`

### Blog Management Tests
- [ ] T006 [P] Contract test GET /admin/blog/posts in `src/test/api-admin-blog-posts.contract.test.ts`
- [ ] T007 [P] Contract test POST /admin/blog/posts in `src/test/api-admin-blog-posts-create.contract.test.ts`
- [ ] T008 [P] Contract test GET /admin/blog/posts/{slug} in `src/test/api-admin-blog-posts-slug.contract.test.ts`
- [ ] T009 [P] Contract test PUT /admin/blog/posts/{slug} in `src/test/api-admin-blog-posts-update.contract.test.ts`
- [ ] T010 [P] Contract test DELETE /admin/blog/posts/{slug} in `src/test/api-admin-blog-posts-delete.contract.test.ts`

### Portfolio Management Tests
- [ ] T011 [P] Contract test GET /admin/portfolio/projects in `src/test/api-admin-portfolio-projects.contract.test.ts`
- [ ] T012 [P] Contract test POST /admin/portfolio/projects in `src/test/api-admin-portfolio-projects-create.contract.test.ts`
- [ ] T013 [P] Contract test GET /admin/portfolio/projects/{slug} in `src/test/api-admin-portfolio-projects-slug.contract.test.ts`
- [ ] T014 [P] Contract test PUT /admin/portfolio/projects/{slug} in `src/test/api-admin-portfolio-projects-update.contract.test.ts`
- [ ] T015 [P] Contract test DELETE /admin/portfolio/projects/{slug} in `src/test/api-admin-portfolio-projects-delete.contract.test.ts`

### Comment Management Tests
- [ ] T016 [P] Contract test GET /admin/comments in `src/test/api-admin-comments.contract.test.ts`
- [ ] T017 [P] Contract test PUT /admin/comments/{commentId} in `src/test/api-admin-comments-update.contract.test.ts`
- [ ] T018 [P] Contract test DELETE /admin/comments/{commentId} in `src/test/api-admin-comments-delete.contract.test.ts`
- [ ] T019 [P] Contract test PATCH /admin/comments/bulk in `src/test/api-admin-comments-bulk.contract.test.ts`

### User Management Tests
- [ ] T020 [P] Contract test GET /admin/users in `src/test/api-admin-users.contract.test.ts`
- [ ] T021 [P] Contract test GET /admin/users/{userId} in `src/test/api-admin-users-detail.contract.test.ts`
- [ ] T022 [P] Contract test PUT /admin/users/{userId} in `src/test/api-admin-users-update.contract.test.ts`

### Asset Management Tests
- [ ] T023 [P] Contract test GET /admin/assets in `src/test/api-admin-assets.contract.test.ts`
- [ ] T024 [P] Contract test POST /admin/assets in `src/test/api-admin-assets-upload.contract.test.ts`
- [ ] T025 [P] Contract test PUT /admin/assets/{assetId} in `src/test/api-admin-assets-update.contract.test.ts`
- [ ] T026 [P] Contract test DELETE /admin/assets/{assetId} in `src/test/api-admin-assets-delete.contract.test.ts`

### Settings Management Tests
- [ ] T027 [P] Contract test GET /admin/settings in `src/test/api-admin-settings.contract.test.ts`
- [ ] T028 [P] Contract test POST /admin/settings in `src/test/api-admin-settings-create.contract.test.ts`
- [ ] T029 [P] Contract test PUT /admin/settings/{key} in `src/test/api-admin-settings-update.contract.test.ts`
- [ ] T030 [P] Contract test DELETE /admin/settings/{key} in `src/test/api-admin-settings-delete.contract.test.ts`

### Book Writing System Tests (NEW)
- [ ] T031 [P] Contract test GET /admin/books in `src/test/api-admin-books.contract.test.ts`
- [ ] T032 [P] Contract test POST /admin/books in `src/test/api-admin-books-create.contract.test.ts`
- [ ] T033 [P] Contract test PUT /admin/books/{id} in `src/test/api-admin-books-update.contract.test.ts`
- [ ] T034 [P] Contract test DELETE /admin/books/{id} in `src/test/api-admin-books-delete.contract.test.ts`
- [ ] T035 [P] Contract test GET /admin/books/{id}/chapters in `src/test/api-admin-chapters.contract.test.ts`
- [ ] T036 [P] Contract test POST /admin/books/{id}/chapters in `src/test/api-admin-chapters-create.contract.test.ts`
- [ ] T037 [P] Contract test PUT /admin/chapters/{id} in `src/test/api-admin-chapters-update.contract.test.ts`
- [ ] T038 [P] Contract test DELETE /admin/chapters/{id} in `src/test/api-admin-chapters-delete.contract.test.ts`
- [ ] T039 [P] Contract test GET /admin/books/{id}/characters in `src/test/api-admin-characters.contract.test.ts`
- [ ] T040 [P] Contract test POST /admin/books/{id}/characters in `src/test/api-admin-characters-create.contract.test.ts`
- [ ] T041 [P] Contract test PUT /admin/characters/{id} in `src/test/api-admin-characters-update.contract.test.ts`
- [ ] T042 [P] Contract test DELETE /admin/characters/{id} in `src/test/api-admin-characters-delete.contract.test.ts`
- [ ] T043 [P] Contract test GET /admin/characters/{id}/journals in `src/test/api-admin-journals.contract.test.ts`
- [ ] T044 [P] Contract test POST /admin/characters/{id}/journals in `src/test/api-admin-journals-create.contract.test.ts`
- [ ] T045 [P] Contract test PUT /admin/journals/{id} in `src/test/api-admin-journals-update.contract.test.ts`
- [ ] T046 [P] Contract test DELETE /admin/journals/{id} in `src/test/api-admin-journals-delete.contract.test.ts`

### Integration Tests
- [ ] T047 [P] Integration test admin dashboard overview flow in `src/test/admin-dashboard-overview.integration.test.ts`
- [ ] T048 [P] Integration test blog post management workflow in `src/test/admin-blog-management.integration.test.ts`
- [ ] T049 [P] Integration test comment moderation workflow in `src/test/admin-comment-moderation.integration.test.ts`
- [ ] T050 [P] Integration test role-based access control in `src/test/admin-rbac.integration.test.ts`
- [ ] T051 [P] Integration test book writing workflow with Novel.sh in `src/test/admin-book-writing.integration.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Dashboard Overview API Routes (Admin/Editor)
- [ ] T052 GET /admin/stats endpoint in `src/app/api/admin/stats/route.ts`
- [ ] T053 GET /admin/activity endpoint in `src/app/api/admin/activity/route.ts`

### Dashboard Overview UI Components (Admin/Editor)
- [ ] T054 [P] Dashboard stats cards component in `src/components/admin/dashboard/StatsCards.tsx`
- [ ] T055 [P] Recent activity component in `src/components/admin/dashboard/RecentActivity.tsx`
- [ ] T056 [P] Admin navigation sidebar component in `src/components/admin/layout/AdminSidebar.tsx`
- [ ] T057 Admin dashboard overview page in `src/app/admin/page.tsx`

### Blog Management API Routes (Admin/Editor)
- [ ] T058 GET /admin/blog/posts endpoint in `src/app/api/admin/blog/posts/route.ts`
- [ ] T059 POST /admin/blog/posts endpoint in `src/app/api/admin/blog/posts/route.ts`
- [ ] T060 GET /admin/blog/posts/{slug} endpoint in `src/app/api/admin/blog/posts/[slug]/route.ts`
- [ ] T061 PUT /admin/blog/posts/{slug} endpoint in `src/app/api/admin/blog/posts/[slug]/route.ts`
- [ ] T062 DELETE /admin/blog/posts/{slug} endpoint in `src/app/api/admin/blog/posts/[slug]/route.ts`

### Blog Management UI Components (Admin/Editor)
- [ ] T063 [P] Blog post list component with filtering in `src/components/admin/blog/BlogPostList.tsx`
- [ ] T064 [P] Blog post editor component with Novel.sh and markdown paste support in `src/components/admin/blog/BlogPostEditor.tsx`
- [ ] T065 [P] Blog post status workflow component in `src/components/admin/blog/PostStatusWorkflow.tsx`
- [ ] T066 [P] Blog SEO management component in `src/components/admin/blog/SEOManager.tsx`
- [ ] T067 Blog management page in `src/app/admin/blog/page.tsx`

### Portfolio Management API Routes (Admin/Editor)
- [ ] T068 GET /admin/portfolio/projects endpoint in `src/app/api/admin/portfolio/projects/route.ts`
- [ ] T069 POST /admin/portfolio/projects endpoint in `src/app/api/admin/portfolio/projects/route.ts`
- [ ] T070 GET /admin/portfolio/projects/{slug} endpoint in `src/app/api/admin/portfolio/projects/[slug]/route.ts`
- [ ] T071 PUT /admin/portfolio/projects/{slug} endpoint in `src/app/api/admin/portfolio/projects/[slug]/route.ts`
- [ ] T072 DELETE /admin/portfolio/projects/{slug} endpoint in `src/app/api/admin/portfolio/projects/[slug]/route.ts`

### Portfolio Management UI Components (Admin/Editor)
- [ ] T073 [P] Project list component with grid view in `src/components/admin/portfolio/ProjectList.tsx`
- [ ] T074 [P] Project editor form with image management in `src/components/admin/portfolio/ProjectEditor.tsx`
- [ ] T075 [P] Technology selector component in `src/components/admin/portfolio/TechnologySelector.tsx`
- [ ] T076 [P] Project timeline component in `src/components/admin/portfolio/ProjectTimeline.tsx`
- [ ] T077 Portfolio management page in `src/app/admin/portfolio/page.tsx`

### Comment Management API Routes (Admin/Editor)
- [ ] T078 GET /admin/comments endpoint in `src/app/api/admin/comments/route.ts`
- [ ] T079 PUT /admin/comments/{commentId} endpoint in `src/app/api/admin/comments/[commentId]/route.ts`
- [ ] T080 DELETE /admin/comments/{commentId} endpoint in `src/app/api/admin/comments/[commentId]/route.ts`
- [ ] T081 PATCH /admin/comments/bulk endpoint in `src/app/api/admin/comments/bulk/route.ts`

### Comment Management UI Components (Admin/Editor)
- [ ] T082 [P] Comment list with threaded view in `src/components/admin/comments/CommentList.tsx`
- [ ] T083 [P] Comment moderation actions in `src/components/admin/comments/ModerationActions.tsx`
- [ ] T084 [P] Bulk comment actions in `src/components/admin/comments/BulkActions.tsx`
- [ ] T085 Comment management page in `src/app/admin/comments/page.tsx`

### User Management API Routes (Admin Only)
- [ ] T086 GET /admin/users endpoint in `src/app/api/admin/users/route.ts`
- [ ] T087 GET /admin/users/{userId} endpoint in `src/app/api/admin/users/[userId]/route.ts`
- [ ] T088 PUT /admin/users/{userId} endpoint in `src/app/api/admin/users/[userId]/route.ts`

### User Management UI Components (Admin Only)
- [ ] T089 [P] User list with role management in `src/components/admin/users/UserList.tsx`
- [ ] T090 [P] User profile editor in `src/components/admin/users/UserEditor.tsx`
- [ ] T091 [P] Role assignment component in `src/components/admin/users/RoleAssignment.tsx`
- [ ] T092 User management page in `src/app/admin/users/page.tsx`

### Asset Management API Routes (Admin/Editor)
- [ ] T093 GET /admin/assets endpoint in `src/app/api/admin/assets/route.ts`
- [ ] T094 POST /admin/assets endpoint in `src/app/api/admin/assets/route.ts`
- [ ] T095 PUT /admin/assets/{assetId} endpoint in `src/app/api/admin/assets/[assetId]/route.ts`
- [ ] T096 DELETE /admin/assets/{assetId} endpoint in `src/app/api/admin/assets/[assetId]/route.ts`

### Asset Management UI Components (Admin/Editor)
- [ ] T097 [P] Asset browser with preview in `src/components/admin/assets/AssetBrowser.tsx`
- [ ] T098 [P] Asset upload component with drag-drop in `src/components/admin/assets/AssetUpload.tsx`
- [ ] T099 [P] Lottie asset preview in `src/components/admin/assets/LottiePreview.tsx`
- [ ] T100 Asset management page in `src/app/admin/assets/page.tsx`

### Settings Management API Routes (Admin Only)
- [ ] T101 GET /admin/settings endpoint in `src/app/api/admin/settings/route.ts`
- [ ] T102 POST /admin/settings endpoint in `src/app/api/admin/settings/route.ts`
- [ ] T103 PUT /admin/settings/{key} endpoint in `src/app/api/admin/settings/[key]/route.ts`
- [ ] T104 DELETE /admin/settings/{key} endpoint in `src/app/api/admin/settings/[key]/route.ts`

### Settings Management UI Components (Admin Only)
- [ ] T105 [P] Settings form component with type-specific controls in `src/components/admin/settings/SettingsForm.tsx`
- [ ] T106 [P] Settings categories component in `src/components/admin/settings/SettingsCategories.tsx`
- [ ] T107 Settings management page in `src/app/admin/settings/page.tsx`

### Book Writing System API Routes (Admin/Editor) - NEW
- [ ] T108 GET /admin/books endpoint in `src/app/api/admin/books/route.ts`
- [ ] T109 POST /admin/books endpoint in `src/app/api/admin/books/route.ts`
- [ ] T110 PUT /admin/books/{id} endpoint in `src/app/api/admin/books/[id]/route.ts`
- [ ] T111 DELETE /admin/books/{id} endpoint in `src/app/api/admin/books/[id]/route.ts`
- [ ] T112 GET /admin/books/{id}/chapters endpoint in `src/app/api/admin/books/[id]/chapters/route.ts`
- [ ] T113 POST /admin/books/{id}/chapters endpoint in `src/app/api/admin/books/[id]/chapters/route.ts`
- [ ] T114 PUT /admin/chapters/{id} endpoint in `src/app/api/admin/chapters/[id]/route.ts`
- [ ] T115 DELETE /admin/chapters/{id} endpoint in `src/app/api/admin/chapters/[id]/route.ts`
- [ ] T116 GET /admin/books/{id}/characters endpoint in `src/app/api/admin/books/[id]/characters/route.ts`
- [ ] T117 POST /admin/books/{id}/characters endpoint in `src/app/api/admin/books/[id]/characters/route.ts`
- [ ] T118 PUT /admin/characters/{id} endpoint in `src/app/api/admin/characters/[id]/route.ts`
- [ ] T119 DELETE /admin/characters/{id} endpoint in `src/app/api/admin/characters/[id]/route.ts`
- [ ] T120 GET /admin/characters/{id}/journals endpoint in `src/app/api/admin/characters/[id]/journals/route.ts`
- [ ] T121 POST /admin/characters/{id}/journals endpoint in `src/app/api/admin/characters/[id]/journals/route.ts`
- [ ] T122 PUT /admin/journals/{id} endpoint in `src/app/api/admin/journals/[id]/route.ts`
- [ ] T123 DELETE /admin/journals/{id} endpoint in `src/app/api/admin/journals/[id]/route.ts`

### Book Writing System UI Components (Admin/Editor) - NEW
- [ ] T124 [P] Book dashboard with progress tracking in `src/components/admin/books/BookDashboard.tsx`
- [ ] T125 [P] Book creation/edit form with Novel.sh editor in `src/components/admin/books/BookForm.tsx`
- [ ] T126 [P] Chapter editor with Novel.sh and markdown paste in `src/components/admin/books/ChapterEditor.tsx`
- [ ] T127 [P] Character profile editor with rich descriptions in `src/components/admin/books/CharacterForm.tsx`
- [ ] T128 [P] Character relationships mapping component in `src/components/admin/books/CharacterRelationships.tsx`
- [ ] T129 [P] Character journal editor with Novel.sh in `src/components/admin/books/JournalEditor.tsx`
- [ ] T130 [P] Book progress visualization component in `src/components/admin/books/ProgressChart.tsx`
- [ ] T131 Book management page in `src/app/admin/books/page.tsx`
- [ ] T132 Individual book workspace in `src/app/admin/books/[id]/page.tsx`
- [ ] T133 Chapter management page in `src/app/admin/books/[id]/chapters/page.tsx`
- [ ] T134 Character management page in `src/app/admin/books/[id]/characters/page.tsx`

## Phase 3.4: Integration
- [ ] T135 **CRITICAL**: Connect all admin API routes to existing MongoDB models and implement role validation
- [ ] T136 **MISSING**: Add admin navigation integration to existing Navigation.tsx component
- [ ] T137 Implement optimistic UI updates for quick actions (status changes, bulk operations)
- [ ] T138 Add file upload handling for Lottie assets with validation and metadata extraction
- [ ] T139 Add error handling and logging for all admin operations
- [ ] T140 **NEW**: Create authentication UI components (SignInButton, UserProfile, etc.)
- [ ] T141 **NEW**: Implement performance caching with SWR for admin dashboard
- [ ] T142 **NEW**: Integrate Novel.sh editor across all content creation interfaces
- [ ] T143 **NEW**: Add book writing system to admin navigation and routing
- [ ] T144 **NEW**: Implement auto-save functionality for all Novel.sh editors
- [ ] T145 **NEW**: Add markdown paste conversion handlers across all editors

## Phase 3.5: Polish
- [ ] T146 [P] Add loading states and skeletons for all admin components in `src/components/admin/ui/`
- [ ] T147 [P] Implement mobile responsive design for admin dashboard
- [ ] T148 [P] Add comprehensive error boundaries and fallback UI
- [ ] T149 [P] Unit tests for admin utility functions in `src/test/admin-utils.test.ts`
- [ ] T150 [P] Performance optimization with React.memo and useMemo for heavy components
- [ ] T151 [P] Add data caching with SWR for dashboard statistics
- [ ] T152 [P] Implement virtual scrolling for large content lists
- [ ] T153 [P] Add book writing keyboard shortcuts and writing modes
- [ ] T154 [P] Implement export functionality for books (PDF, EPUB, DOCX)
- [ ] T155 [P] Add word count tracking and writing goals for books and chapters
- [ ] T156 [P] Implement collaborative editing features for book writing
- [ ] T157 Run complete admin dashboard testing following quickstart.md scenarios
- [ ] T158 Update documentation with admin dashboard and book writing usage guide

## Dependencies
### Sequential Dependencies
- **Setup** (T001-T003) before all other phases
- **Tests** (T004-T051) before **Core Implementation** (T052-T134)
- **Core API Routes** before corresponding **UI Components**:
  - T052-T053 → T054-T057 (Dashboard)
  - T058-T062 → T063-T067 (Blog)
  - T068-T072 → T073-T077 (Portfolio)
  - T078-T081 → T082-T085 (Comments)
  - T086-T088 → T089-T092 (Users)
  - T093-T096 → T097-T100 (Assets)
  - T101-T104 → T105-T107 (Settings)
  - T108-T123 → T124-T134 (Book Writing System)
- **Core Implementation** (T052-T134) before **Integration** (T135-T145)
- **Integration** (T135-T145) before **Polish** (T146-T158)

### Parallel Dependencies
- All contract tests (T004-T046) can run in parallel
- All integration tests (T047-T051) can run in parallel
- Component tasks marked [P] within each section can run in parallel
- API route tasks within different domains can run in parallel

## Parallel Execution Examples
```bash
# Phase 3.2: Launch all contract tests together
Task: "Contract test GET /admin/stats in src/test/api-admin-stats.contract.test.ts"
Task: "Contract test GET /admin/activity in src/test/api-admin-activity.contract.test.ts"
Task: "Contract test GET /admin/blog/posts in src/test/api-admin-blog-posts.contract.test.ts"
Task: "Contract test GET /admin/books in src/test/api-admin-books.contract.test.ts"
# ... (all 46 contract tests can run simultaneously)

# Phase 3.3: Launch parallel component development
Task: "Dashboard stats cards component in src/components/admin/dashboard/StatsCards.tsx"
Task: "Recent activity component in src/components/admin/dashboard/RecentActivity.tsx"
Task: "Admin navigation sidebar component in src/components/admin/layout/AdminSidebar.tsx"
Task: "Book dashboard with progress tracking in src/components/admin/books/BookDashboard.tsx"
# ... (all [P] marked tasks within same phase)
```

## Notes
- **[P]** tasks = different files, no dependencies - can run in parallel
- Verify tests fail before implementing (TDD approach)
- Commit after each task completion
- **Novel.sh Integration**: All content editors use Novel.sh for beautiful writing experience
- **Book Writing System**: Complete author workflow with character development and progress tracking
- **Markdown Paste**: Automatic conversion from markdown to rich text across all editors
- **Critical Missing**: middleware.ts file must be created first (T001)

## Task Generation Rules Applied
1. **From Contracts** ✅: 46 contract test tasks from 32 API endpoints (admin + book writing)
2. **From Data Model** ✅: 10 entity management interfaces (6 existing + 4 book writing)
3. **From User Stories/Quickstart** ✅: 5 integration test tasks covering major workflows
4. **Ordering** ✅: Setup → Tests → Models → Services → Endpoints → UI → Integration → Polish

## Validation Checklist ✅
- [x] All 32 API endpoints have contract tests
- [x] All 10 entity types have admin management interfaces
- [x] Novel.sh editor integration across all content creation
- [x] Book writing system with character development
- [x] Markdown paste conversion functionality
- [x] Role-based access control implementation
- [x] Mobile responsive design considerations
- [x] Performance optimization tasks
- [x] Export functionality for book writing
- [x] Dependencies clearly defined and sequenced

## Success Criteria
- Complete admin dashboard with all 6 management sections + book writing system
- Novel.sh editor providing beautiful, calming writing experience
- Automatic markdown paste conversion across all editors
- Role-based access control with admin/editor permissions
- Book writing workflow with character development and progress tracking
- Mobile responsive design maintaining UX consistency
- All tests passing with >90% coverage
- Performance metrics meeting targets (<3s load, 60fps animations)
- Export functionality for books in multiple formats
- Comprehensive documentation for admin and book writing features