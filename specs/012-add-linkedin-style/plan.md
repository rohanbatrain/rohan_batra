
# Implementation Plan: Professional Experience Management System

**Branch**: `012-add-linkedin-style` | **Date**: January 4, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/rohan/Documents/repos/rohan_batra/specs/012-add-linkedin-style/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Add LinkedIn-style professional experience management system with full CRUD admin interface, homepage timeline section displaying recent experiences, and dedicated `/experience` route for complete career history. System supports rich text descriptions, company logos, employment types, date ranges with "Present" for current positions, skills/tags, and responsive design matching existing site aesthetics.

## Technical Context
**Language/Version**: TypeScript 5.x with Next.js 15.5.3 (App Router)
**Primary Dependencies**: React 19, Mongoose 8.18.1, next-mdx-remote 5.0.0, Clerk Auth 6.32.0, ShadCN UI, Tailwind CSS 4, Framer Motion 12.23.13
**Storage**: MongoDB via Mongoose ODM (following existing patterns: BlogPost, Project, Course models)
**Testing**: Vitest 3.2.4 with @testing-library/react 16.3.0, jsdom 27.0.0
**Target Platform**: Web (Next.js SSR/SSG), responsive mobile/tablet/desktop
**Project Type**: web (Next.js full-stack application with API routes)
**Performance Goals**: <2s homepage load, <200ms API response, lazy image loading for company logos
**Constraints**: Consistent with existing UI/UX patterns, dark mode support, SEO-optimized with structured data, TypeScript strict mode
**Scale/Scope**: Single-user portfolio site, ~10-20 experience entries expected, admin-only write access, public read access

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution file is a template without specific requirements. Proceeding with standard Next.js best practices:

### Standard Web Application Principles
- ✅ **Component-Based Architecture**: React components with clear separation of concerns
- ✅ **API-First Design**: RESTful API routes with proper HTTP methods
- ✅ **Type Safety**: TypeScript strict mode for all code
- ✅ **Testing Strategy**: Unit tests for models/services, integration tests for API routes, E2E for user flows
- ✅ **Database Schema**: Mongoose models with validation and indexing
- ✅ **Authentication**: Clerk-based role checks (admin-only for mutations)
- ✅ **Performance**: Server Components by default, Client Components only when needed
- ✅ **Consistency**: Match existing patterns (BlogPost, Project models and admin pages)

### Project-Specific Requirements
- Follow existing admin panel patterns (`/admin/[resource]` structure)
- Use existing UI components (ShadCN + custom components)
- Maintain consistent styling (Tailwind with existing theme)
- Support existing content editor patterns (MDX/rich-text)
- Follow existing API patterns (Zod validation, error handling)

**Status**: ✅ PASS - No constitutional violations detected

## Project Structure

### Documentation (this feature)
```
specs/012-add-linkedin-style/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── admin-experience-api.yaml    # OpenAPI spec for admin CRUD
│   ├── public-experience-api.yaml   # OpenAPI spec for public read
│   └── experience.schema.json       # JSON schema for Experience entity
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Next.js Web Application Structure (existing)
src/
├── models/
│   └── Experience.ts              # NEW: Mongoose model
├── types/
│   └── experience.ts              # NEW: TypeScript types
├── lib/
│   └── services/
│       └── experience-service.ts  # NEW: Business logic
├── app/
│   ├── page.tsx                   # UPDATE: Add experience section
│   ├── experience/
│   │   └── page.tsx              # NEW: Public experience timeline
│   ├── admin/
│   │   └── experience/
│   │       ├── page.tsx          # NEW: List/manage experiences
│   │       ├── create/
│   │       │   └── page.tsx      # NEW: Create form
│   │       └── edit/
│   │           └── [id]/
│   │               └── page.tsx  # NEW: Edit form
│   └── api/
│       ├── admin/
│       │   └── experience/
│       │       ├── route.ts      # NEW: POST (create), GET (list)
│       │       └── [id]/
│       │           └── route.ts  # NEW: GET, PUT, DELETE (single)
│       └── experience/
│           └── route.ts          # NEW: Public GET (published only)
├── components/
│   ├── experience/
│   │   ├── ExperienceCard.tsx           # NEW: Display card
│   │   ├── ExperienceTimeline.tsx       # NEW: Timeline layout
│   │   ├── ExperienceForm.tsx           # NEW: Admin form
│   │   └── ExperienceSection.tsx        # NEW: Homepage section
│   └── ui/
│       └── [existing ShadCN components] # REUSE

tests/
├── models/
│   └── experience.test.ts         # NEW: Model tests
├── api/
│   ├── admin/
│   │   └── experience.test.ts    # NEW: Admin API tests
│   └── experience.test.ts        # NEW: Public API tests
└── integration/
    └── experience-flow.test.ts    # NEW: E2E tests
```

**Structure Decision**: Web application (Next.js App Router) - matches existing project structure

## Phase 0: Outline & Research
**Status**: ✅ COMPLETE

**Artifacts Generated**:
- ✅ `research.md` - Comprehensive technical research covering:
  - Existing codebase patterns (models, API routes, forms)
  - Content management strategy (MDX + rich-text)
  - Image handling (Asset model + direct URLs)
  - Homepage section integration patterns
  - Date handling with date-fns
  - Drag-and-drop with @dnd-kit
  - Skills/tags approach (string arrays)
  - Performance optimizations (lean queries, ISR, next/image)
  - Testing strategy (Vitest + React Testing Library)

**Key Decisions Made**:
1. Follow BlogPost model pattern for consistency
2. Reuse ContentEditor component for descriptions
3. Support both URL and Asset for company logos
4. Add section after SkillsSection on homepage
5. Use @dnd-kit for reordering (already in dependencies)
6. Start with simple string arrays for skills (iterate later)
7. Implement comprehensive test coverage (model/API/component/integration)

**Output**: All technical unknowns resolved, ready for design phase

## Phase 1: Design & Contracts
**Status**: ✅ COMPLETE

**Artifacts Generated**:

1. ✅ **data-model.md** - Complete data entity design:
   - IExperience interface with all fields
   - Field specifications and validation rules
   - Enumerations (EmploymentType, ContentFormat)
   - Relationships (Asset reference)
   - Indexes for performance
   - Computed properties (duration, date formatting)
   - Example documents
   - Migration considerations

2. ✅ **contracts/admin-experience-api.yaml** - OpenAPI 3.0 spec:
   - GET / - List experiences (paginated, filtered)
   - POST / - Create experience
   - GET /{id} - Get single experience
   - PUT /{id} - Update experience
   - DELETE /{id} - Delete experience
   - POST /reorder - Batch update display order
   - Full request/response schemas
   - Authentication (Clerk JWT)
   - Error responses (401, 403, 404, 400, 500)

3. ✅ **contracts/public-experience-api.yaml** - Public read API:
   - GET / - List published experiences (no auth)
   - Includes computed fields (duration, dateRange)
   - Returns totalYears calculation
   - Optimized for homepage (limit=3) and timeline page

4. ✅ **quickstart.md** - Manual testing guide:
   - 13 test scenarios covering all user stories
   - Step-by-step validation procedures
   - Pass criteria for each scenario
   - Responsive design testing
   - SEO validation steps
   - Performance benchmarks
   - Error handling verification
   - Automated test commands
   - Troubleshooting guide

**Design Principles Applied**:
- RESTful API conventions
- Zod validation for all inputs
- Clerk-based authentication
- MongoDB lean() queries for reads
- Server Components for SEO
- ISR for public pages (1-hour revalidate)
- Client Components only when needed (forms, drag-drop)

**Output**: Complete technical design ready for task breakdown

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
The `/tasks` command will generate `tasks.md` with the following structure:

### Task Categories

**A. Foundation (Database & Types)**
- Task 001: Create Experience Mongoose model (`src/models/Experience.ts`)
- Task 002: Create Experience TypeScript types (`src/types/experience.ts`)
- Task 003: Add indexes to Experience model (displayOrder, startDate, published)

**B. Business Logic Layer**
- Task 004: Create experience service (`src/lib/services/experience-service.ts`)
  - CRUD operations
  - Duration calculation utility
  - Date formatting utility
  - Logo resolution (Asset vs URL)

**C. API Routes - Admin**
- Task 005: Implement POST /api/admin/experience (create) [P]
- Task 006: Implement GET /api/admin/experience (list with pagination) [P]
- Task 007: Implement GET /api/admin/experience/[id] (single) [P]
- Task 008: Implement PUT /api/admin/experience/[id] (update) [P]
- Task 009: Implement DELETE /api/admin/experience/[id] (delete) [P]
- Task 010: Implement POST /api/admin/experience/reorder (batch update) [P]

**D. API Routes - Public**
- Task 011: Implement GET /api/experience (public list)

**E. UI Components**
- Task 012: Create ExperienceCard component (display card) [P]
- Task 013: Create ExperienceTimeline component (timeline layout) [P]
- Task 014: Create ExperienceForm component (admin CRUD form) [P]
- Task 015: Create ExperienceSection component (homepage section) [P]
- Task 016: Create duration/date formatting utilities [P]

**F. Admin Pages**
- Task 017: Create /admin/experience page (list with drag-drop)
- Task 018: Create /admin/experience/create page
- Task 019: Create /admin/experience/edit/[id] page

**G. Public Pages**
- Task 020: Create /experience page (timeline view with SEO)
- Task 021: Update homepage (add ExperienceSection)

**H. Testing**
- Task 022: Write Experience model tests
- Task 023: Write admin API tests (all CRUD endpoints)
- Task 024: Write public API tests
- Task 025: Write ExperienceCard component tests [P]
- Task 026: Write ExperienceForm component tests [P]
- Task 027: Write integration test (create → appears on homepage)

**I. Documentation & Polish**
- Task 028: Add experience section to admin navigation
- Task 029: Add SEO metadata and JSON-LD structured data
- Task 030: Performance optimization (lazy images, ISR config)
- Task 031: Dark mode styling verification
- Task 032: Update README with experience feature documentation

**Ordering Strategy**:
1. **Foundation First**: Models and types before everything (001-003)
2. **Service Layer**: Business logic before API routes (004)
3. **Parallel API Development**: All endpoints can be built simultaneously [P]
4. **Parallel UI Components**: Independent components marked [P]
5. **Pages Depend on Components**: Admin/public pages after components
6. **Tests Follow Implementation**: Write tests as components/APIs complete
7. **Integration Last**: Polish and integration after core functionality

**Dependency Graph**:
```
001-003 (Models/Types) → 004 (Service) → 005-011 (APIs) → 017-019 (Admin Pages)
                                       → 012-016 (Components) → 020-021 (Public Pages)
                                       → 022-027 (Tests)
                                       → 028-032 (Polish)
```

**Estimated Effort**: 
- Tasks 001-011: 6-8 hours (backend)
- Tasks 012-016: 4-5 hours (components)
- Tasks 017-021: 5-6 hours (pages)
- Tasks 022-027: 4-5 hours (testing)
- Tasks 028-032: 2-3 hours (polish)
- **Total**: 21-27 hours (3-4 days)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: No complexity violations detected

The implementation follows standard Next.js patterns already established in the codebase:
- Uses existing Mongoose model patterns (BlogPost, Project)
- Reuses existing UI components (ContentEditor, ShadCN components)
- Follows existing API route structure
- Matches existing admin panel layout
- No new dependencies required (all tools already in package.json)
- No architectural changes needed

**Conclusion**: Implementation complexity is appropriate for feature scope


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none - no violations)

**Artifacts Generated**:
- [x] specs/012-add-linkedin-style/plan.md (this file)
- [x] specs/012-add-linkedin-style/research.md
- [x] specs/012-add-linkedin-style/data-model.md
- [x] specs/012-add-linkedin-style/contracts/admin-experience-api.yaml
- [x] specs/012-add-linkedin-style/contracts/public-experience-api.yaml
- [x] specs/012-add-linkedin-style/quickstart.md
- [x] specs/012-add-linkedin-style/tasks.md ✅ JUST CREATED

---

## Implementation Ready

✅ **Phase 0-3 Complete** - All planning, design, and task artifacts generated

**Start Implementation**: Begin with T001 (Verify Dependencies) from tasks.md

**Task Summary**:
- 35 numbered tasks (T001-T035)
- Organized in 7 phases: Setup → Tests → Core → Components → Pages → Polish
- 15 tasks marked [P] for parallel execution
- Estimated: 40-45 hours total (3-4 days with 3 developers)
- TDD approach: Tests before implementation

**Next Steps**:
1. Checkout branch: `012-add-linkedin-style`
2. Open: `specs/012-add-linkedin-style/tasks.md`
3. Start with T001: Verify dependencies
4. Follow task order, commit after each completion
5. Run tests frequently (`pnpm test`, `pnpm typecheck`)
6. Execute quickstart scenarios when complete (T033)

---
*Based on Constitution v2.1.1 - See `.specify/memory/constitution.md`*
