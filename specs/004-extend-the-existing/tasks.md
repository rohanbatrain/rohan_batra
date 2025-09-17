# Tasks: Unified Admin Dashboard & Content Platform

**Input**: Design documents from `/specs/004-extend-the-existing/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/openapi.yaml

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Found: 4-phase implementation plan with Next.js 14, TypeScript, MongoDB, Redis
   → Extract: tech stack (Next.js, MongoDB, Redis, Cloudinary, OpenAI), structure
2. Load optional design documents:
   → data-model.md: Extract 6 entities → Asset, User, Comment, SiteSetting, BlogPost, Project
   → contracts/openapi.yaml: 30+ endpoints → comprehensive API tests
   → research.md: Extract Redis caching, Cloudinary integration, AI decisions
3. Generate tasks by category:
   → Setup: dependencies, environment, database
   → Tests: contract tests, integration tests (TDD)
   → Core: models, services, API endpoints
   → Integration: Redis, Cloudinary, OpenAI, middleware
   → Polish: optimization, testing, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   ✓ All contracts have tests
   ✓ All entities have models
   ✓ All endpoints implemented
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 1: Setup & Dependencies

- [ ] T001 Install new dependencies: ioredis, cloudinary, openai, @types/ioredis
- [ ] T002 [P] Configure environment variables in .env.example for Redis, Cloudinary, OpenAI
- [ ] T003 [P] Create Redis connection utility in src/lib/redis.ts
- [ ] T004 [P] Create Cloudinary configuration in src/lib/cloudinary.ts
- [ ] T005 [P] Create OpenAI client configuration in src/lib/openai.ts

## Phase 2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE PHASE 3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests - Admin Assets API
- [ ] T006 [P] Contract test GET /api/admin/assets in src/test/api-admin-assets.contract.test.ts
- [ ] T007 [P] Contract test POST /api/admin/assets in src/test/api-admin-assets-create.contract.test.ts
- [ ] T008 [P] Contract test PUT /api/admin/assets/{id} in src/test/api-admin-assets-update.contract.test.ts
- [ ] T009 [P] Contract test DELETE /api/admin/assets/{id} in src/test/api-admin-assets-delete.contract.test.ts

### Contract Tests - Admin Users API
- [ ] T010 [P] Contract test GET /api/admin/users in src/test/api-admin-users.contract.test.ts
- [ ] T011 [P] Contract test GET /api/admin/users/{id} in src/test/api-admin-users-get.contract.test.ts
- [ ] T012 [P] Contract test PUT /api/admin/users/{id} in src/test/api-admin-users-update.contract.test.ts

### Contract Tests - Admin Comments API
- [ ] T013 [P] Contract test GET /api/admin/comments in src/test/api-admin-comments.contract.test.ts
- [ ] T014 [P] Contract test PUT /api/admin/comments/{id}/moderate in src/test/api-admin-comments-moderate.contract.test.ts
- [ ] T015 [P] Contract test DELETE /api/admin/comments/{id} in src/test/api-admin-comments-delete.contract.test.ts

### Contract Tests - Admin Settings API
- [ ] T016 [P] Contract test GET /api/admin/settings in src/test/api-admin-settings.contract.test.ts
- [ ] T017 [P] Contract test PUT /api/admin/settings in src/test/api-admin-settings-update.contract.test.ts

### Contract Tests - AI Assistant API
- [ ] T018 [P] Contract test POST /api/ai/suggest-tags in src/test/api-ai-suggest-tags.contract.test.ts
- [ ] T019 [P] Contract test POST /api/ai/improve-content in src/test/api-ai-improve-content.contract.test.ts
- [ ] T020 [P] Contract test POST /api/ai/generate-seo in src/test/api-ai-generate-seo.contract.test.ts

### Integration Tests
- [ ] T021 [P] Integration test asset upload workflow in src/test/integration/asset-upload.test.ts
- [ ] T022 [P] Integration test comment moderation workflow in src/test/integration/comment-moderation.test.ts
- [ ] T023 [P] Integration test Redis caching in src/test/integration/redis-cache.test.ts
- [ ] T024 [P] Integration test AI content assistance in src/test/integration/ai-assistance.test.ts

## Phase 3: Core Implementation (ONLY after tests are failing)

### Data Models
- [ ] T025 [P] Create Asset model in src/models/Asset.ts
- [ ] T026 [P] Update User model with admin fields in src/models/User.ts
- [ ] T027 [P] Update Comment model with moderation in src/models/Comment.ts
- [ ] T028 [P] Create SiteSetting model in src/models/SiteSetting.ts
- [ ] T029 [P] Update BlogPost model with asset references in src/models/BlogPost.ts
- [ ] T030 [P] Update Project model with asset references in src/models/Project.ts

### Cache Services
- [ ] T031 [P] Create Redis cache service in src/lib/cache-service.ts
- [ ] T032 [P] Create asset cache utilities in src/lib/asset-cache.ts
- [ ] T033 [P] Create content cache utilities in src/lib/content-cache.ts

### Core Services
- [ ] T034 [P] Create AssetService for uploads in src/lib/asset-service.ts
- [ ] T035 [P] Create UserService for admin ops in src/lib/user-service.ts
- [ ] T036 [P] Create CommentService for moderation in src/lib/comment-service.ts
- [ ] T037 [P] Create SettingsService for config in src/lib/settings-service.ts
- [ ] T038 [P] Create AIService for content assistance in src/lib/ai-service.ts

### API Endpoints - Admin Assets
- [ ] T039 GET /api/admin/assets endpoint in src/app/api/admin/assets/route.ts
- [ ] T040 POST /api/admin/assets endpoint (same file as T039)
- [ ] T041 GET /api/admin/assets/[id] endpoint in src/app/api/admin/assets/[id]/route.ts
- [ ] T042 PUT /api/admin/assets/[id] endpoint (same file as T041)
- [ ] T043 DELETE /api/admin/assets/[id] endpoint (same file as T041)

### API Endpoints - Admin Users
- [ ] T044 GET /api/admin/users endpoint in src/app/api/admin/users/route.ts
- [ ] T045 GET /api/admin/users/[id] endpoint in src/app/api/admin/users/[id]/route.ts
- [ ] T046 PUT /api/admin/users/[id] endpoint (same file as T045)

### API Endpoints - Admin Comments
- [ ] T047 GET /api/admin/comments endpoint in src/app/api/admin/comments/route.ts
- [ ] T048 PUT /api/admin/comments/[id]/moderate endpoint in src/app/api/admin/comments/[id]/moderate/route.ts
- [ ] T049 DELETE /api/admin/comments/[id] endpoint in src/app/api/admin/comments/[id]/route.ts

### API Endpoints - Admin Settings
- [ ] T050 GET /api/admin/settings endpoint in src/app/api/admin/settings/route.ts
- [ ] T051 PUT /api/admin/settings endpoint (same file as T050)

### API Endpoints - AI Assistant
- [ ] T052 [P] POST /api/ai/suggest-tags endpoint in src/app/api/ai/suggest-tags/route.ts
- [ ] T053 [P] POST /api/ai/improve-content endpoint in src/app/api/ai/improve-content/route.ts
- [ ] T054 [P] POST /api/ai/generate-seo endpoint in src/app/api/ai/generate-seo/route.ts

## Phase 4: Admin UI Components

### Asset Management UI
- [ ] T055 [P] Create AssetGrid component in src/components/admin/AssetGrid.tsx
- [ ] T056 [P] Create AssetUpload component in src/components/admin/AssetUpload.tsx
- [ ] T057 [P] Create AssetDetails component in src/components/admin/AssetDetails.tsx

### User Management UI
- [ ] T058 [P] Create UserList component in src/components/admin/UserList.tsx
- [ ] T059 [P] Create UserProfile component in src/components/admin/UserProfile.tsx
- [ ] T060 [P] Create RoleSelector component in src/components/admin/RoleSelector.tsx

### Comment Management UI
- [ ] T061 [P] Create CommentQueue component in src/components/admin/CommentQueue.tsx
- [ ] T062 [P] Create CommentModeration component in src/components/admin/CommentModeration.tsx

### Settings UI
- [ ] T063 [P] Create SettingsForm component in src/components/admin/SettingsForm.tsx
- [ ] T064 [P] Create SettingsPreview component in src/components/admin/SettingsPreview.tsx

### AI Assistant UI
- [ ] T065 [P] Create AITagSuggester component in src/components/admin/AITagSuggester.tsx
- [ ] T066 [P] Create AIContentImprover component in src/components/admin/AIContentImprover.tsx
- [ ] T067 [P] Create AISEOGenerator component in src/components/admin/AISEOGenerator.tsx

## Phase 5: Admin Pages

- [ ] T068 Create admin assets page in src/app/admin/assets/page.tsx
- [ ] T069 Create admin users page in src/app/admin/users/page.tsx
- [ ] T070 Create admin comments page in src/app/admin/comments/page.tsx
- [ ] T071 Create admin settings page in src/app/admin/settings/page.tsx
- [ ] T072 Update admin dashboard with new sections in src/app/admin/page.tsx

## Phase 6: Integration & Middleware

- [ ] T073 Create asset middleware for uploads in src/middleware/asset-middleware.ts
- [ ] T074 Update authentication middleware for admin routes in src/middleware.ts
- [ ] T075 Create cache invalidation middleware in src/middleware/cache-middleware.ts
- [ ] T076 Create rate limiting for AI endpoints in src/middleware/rate-limit.ts

## Phase 7: Polish & Optimization

### Performance & Caching
- [ ] T077 [P] Add Redis caching to blog service in src/lib/blog-service.ts
- [ ] T078 [P] Add Redis caching to portfolio service in src/lib/portfolio-service.ts
- [ ] T079 [P] Optimize asset delivery with CDN in src/lib/asset-service.ts

### Unit Tests
- [ ] T080 [P] Unit tests for AssetService in src/test/unit/asset-service.test.ts
- [ ] T081 [P] Unit tests for UserService in src/test/unit/user-service.test.ts
- [ ] T082 [P] Unit tests for CommentService in src/test/unit/comment-service.test.ts
- [ ] T083 [P] Unit tests for AIService in src/test/unit/ai-service.test.ts

### Documentation & Deployment
- [ ] T084 [P] Update API documentation in docs/api.md
- [ ] T085 [P] Create admin user guide in docs/admin-guide.md
- [ ] T086 Update Docker configuration for Redis in docker-compose.yml
- [ ] T087 Create database migration scripts in scripts/migrate-unified-admin.ts

## Dependencies

### Critical Paths
- **Setup** (T001-T005) → Everything else
- **Tests** (T006-T024) → Implementation (T025-T087)
- **Models** (T025-T030) → Services (T031-T038) → Endpoints (T039-T054)
- **Services** (T031-T038) → UI Components (T055-T067)
- **Endpoints** (T039-T054) → Admin Pages (T068-T072)
- **Core Implementation** (T025-T072) → Integration (T073-T076) → Polish (T077-T087)

### File-Level Dependencies
- T039-T040 (same file: src/app/api/admin/assets/route.ts)
- T041-T043 (same file: src/app/api/admin/assets/[id]/route.ts)
- T045-T046 (same file: src/app/api/admin/users/[id]/route.ts)
- T050-T051 (same file: src/app/api/admin/settings/route.ts)

## Parallel Execution Examples

### Phase 2: Contract Tests (can run together)
```bash
# Launch T006-T020 together:
Task: "Contract test GET /api/admin/assets in src/test/api-admin-assets.contract.test.ts"
Task: "Contract test POST /api/admin/assets in src/test/api-admin-assets-create.contract.test.ts"
Task: "Contract test PUT /api/admin/assets/{id} in src/test/api-admin-assets-update.contract.test.ts"
Task: "Contract test DELETE /api/admin/assets/{id} in src/test/api-admin-assets-delete.contract.test.ts"
# ... and T010-T020
```

### Phase 3: Data Models (can run together)
```bash
# Launch T025-T030 together:
Task: "Create Asset model in src/models/Asset.ts"
Task: "Update User model with admin fields in src/models/User.ts"
Task: "Update Comment model with moderation in src/models/Comment.ts"
Task: "Create SiteSetting model in src/models/SiteSetting.ts"
Task: "Update BlogPost model with asset references in src/models/BlogPost.ts"
Task: "Update Project model with asset references in src/models/Project.ts"
```

### Phase 4: UI Components (can run together)
```bash
# Launch T055-T067 together:
Task: "Create AssetGrid component in src/components/admin/AssetGrid.tsx"
Task: "Create AssetUpload component in src/components/admin/AssetUpload.tsx"
Task: "Create UserList component in src/components/admin/UserList.tsx"
# ... and T058-T067
```

## Validation Checklist
*GATE: Checked before execution*

- [x] All contracts have corresponding tests (T006-T020)
- [x] All entities have model tasks (T025-T030)
- [x] All tests come before implementation (Phase 2 → Phase 3)
- [x] Parallel tasks truly independent (marked with [P])
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies properly ordered (setup → tests → core → integration → polish)

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Redis, Cloudinary, and OpenAI integrations require API keys
- Admin routes require role-based authentication
- Asset uploads need CORS configuration
- AI endpoints need rate limiting