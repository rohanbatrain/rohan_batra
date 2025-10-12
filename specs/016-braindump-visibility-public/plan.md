
# Implementation Plan: Braindump Visibility & Public Rendering

**Branch**: `016-braindump-visibility-public` | **Date**: October 9, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-braindump-visibility-public/spec.md`

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
This feature transforms the braindump system from a fully private, user-scoped tool into a comprehensive knowledge sharing platform. The implementation adds a three-tier visibility system (Private, Unlisted, Public), public rendering pages with SEO optimization, role-based access control for admin moderation, and a complete social engagement suite including comments, reactions, search/discovery, collaborative editing, and analytics. The feature is delivered in 4 phases over 10 weeks (60-80 hours) with backward compatibility maintained throughout.

## Technical Context
**Language/Version**: TypeScript 5.x with Next.js 15.5.3 (App Router)
**Primary Dependencies**: 
- **Frontend**: React 19, Next.js 15, Radix UI, shadcn/ui, TipTap, lucide-react
- **Backend**: Next.js API Routes, Zod (validation), D3.js (visualizations)
- **Auth**: Clerk (@clerk/nextjs v6.32)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS, class-variance-authority
- **Dev Tools**: TypeScript, ESLint, Vitest, tsx
**Storage**: MongoDB Atlas (existing database with Braindump, User, FlashcardDeck models)
**Testing**: Vitest (unit + integration), Playwright (future E2E)
**Target Platform**: Web application (Next.js server-side rendered + static pages)
**Project Type**: Web (full-stack Next.js application with unified frontend/backend)
**Performance Goals**: 
- Public page load < 2s (90th percentile with ISR)
- Public API response < 500ms (90th percentile)
- Search results < 1s
- Dashboard load < 3s
**Constraints**: 
- Zero downtime migration (all existing braindumps must remain functional)
- 100% backward compatibility (existing private braindumps untouched)
- SEO-friendly (Open Graph, Twitter Cards, robots.txt compliance)
- WCAG 2.1 Level AA accessibility compliance
- Rate limiting (100 req/min public API, 10 comments/hour/user)
**Scale/Scope**: 
- Support for thousands of public braindumps
- Full-text search indexing
- Analytics event tracking
- Email notification system
- CDN-ready static page generation

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (Constitution template is not yet fully defined for this project)

**Notes**: 
- The constitution file at `.specify/memory/constitution.md` contains only template placeholders
- No specific constitutional principles are currently enforced
- Once principles are defined, this section should be re-evaluated
- Recommended principles for this project:
  - **Test-First**: Write tests before implementation (TDD)
  - **Type Safety**: Strict TypeScript, no `any` types
  - **API Contracts**: OpenAPI/Zod schemas for all endpoints
  - **Security First**: XSS prevention, rate limiting, CSRF protection
  - **Accessibility**: WCAG 2.1 AA compliance mandatory
  - **Performance**: Lighthouse scores > 90

**Current Assessment**:
- No constitutional violations to document
- Design follows Next.js App Router best practices
- MongoDB Mongoose patterns already established in codebase
- Existing authentication (Clerk) will be leveraged

## Project Structure

### Documentation (this feature)
```
specs/016-braindump-visibility-public/
├── spec.md                  # Feature specification (complete)
├── plan.md                  # This file (/plan command output)
├── research.md              # Phase 0 output (/plan command)
├── data-model.md            # Phase 1 output (/plan command)
├── quickstart.md            # Phase 1 output (/plan command)
├── contracts/               # Phase 1 output (/plan command)
│   ├── braindump-public.yaml
│   ├── braindump-admin.yaml
│   ├── comments.yaml
│   ├── reactions.yaml
│   ├── sharing.yaml
│   ├── analytics.yaml
│   └── notifications.yaml
├── tasks.md                 # Phase 2 output (/tasks command - NOT created by /plan)
├── IMPLEMENTATION_SUMMARY.md    # Supporting documentation
├── VISUAL_ROADMAP.md            # Supporting documentation
└── IMPLEMENTATION_CHECKLIST.md  # Supporting documentation
```

### Source Code (repository root)
```
# This is a Next.js 15 full-stack web application (Option 2 variant)

src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   ├── braindump/      # NEW: Public API endpoints
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── comments/route.ts
│   │   │   ├── route.ts
│   │   │   └── feed.xml/route.ts
│   │   └── admin/
│   │       └── braindump/  # EXISTING: Update with visibility
│   ├── braindump/          # NEW: Public pages
│   │   └── [id]/page.tsx
│   ├── braindumps/         # NEW: Public listing page
│   │   └── page.tsx
│   └── admin/
│       ├── braindump/      # EXISTING: Enhance UI
│       └── analytics/      # NEW: Analytics dashboard
├── components/
│   ├── braindump/
│   │   ├── BraindumpPublicView.tsx      # NEW
│   │   ├── BraindumpListingPage.tsx     # NEW
│   │   ├── CommentThread.tsx            # NEW
│   │   ├── ReactionBar.tsx              # NEW
│   │   ├── ShareDialog.tsx              # NEW
│   │   ├── QuickCaptureCard.tsx         # UPDATE
│   │   └── BraindumpCard.tsx            # UPDATE
│   ├── analytics/
│   │   ├── AnalyticsDashboard.tsx       # NEW
│   │   └── NotificationBell.tsx         # NEW
│   └── ui/                  # EXISTING: shadcn/ui components
├── lib/
│   ├── braindump/
│   │   ├── search.ts        # NEW: Full-text search
│   │   ├── recommendations.ts  # NEW
│   │   └── link-parser.ts   # EXISTING: Wiki link parser
│   ├── security/
│   │   ├── sanitize.ts      # NEW: HTML sanitization
│   │   └── rate-limit.ts    # NEW: Rate limiting
│   └── auth/
│       ├── roles.ts         # UPDATE: Permission helpers
│       └── permissions.ts   # NEW: Granular permissions
├── models/
│   ├── Braindump.ts         # UPDATE: Add visibility, slug, metadata
│   ├── Comment.ts           # NEW
│   ├── Reaction.ts          # NEW
│   ├── SharePermission.ts   # NEW
│   ├── AnalyticsEvent.ts    # NEW
│   └── Notification.ts      # NEW
└── types/
    └── braindump.ts         # UPDATE: New types

tests/
├── integration/
│   ├── braindump-visibility.test.ts
│   ├── braindump-public-api.test.ts
│   ├── comments.test.ts
│   ├── reactions.test.ts
│   ├── sharing.test.ts
│   └── analytics.test.ts
└── unit/
    ├── models/
    ├── lib/
    └── components/

scripts/
└── migrate-braindump-visibility.ts  # NEW: Database migration
```

**Structure Decision**: Next.js full-stack application (unified frontend/backend in `src/`)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
When /tasks command is executed, it will:
1. Load `.specify/templates/tasks-template.md` as the base structure
2. Parse all Phase 1 artifacts (contracts/*.yaml, data-model.md, quickstart.md)
3. Generate ordered implementation tasks following TDD approach:
   - **Contract Test Tasks**: One task per API contract to create failing tests
   - **Model Tasks**: One task per entity in data-model.md to implement Mongoose schemas
   - **Migration Tasks**: Database migration for adding new fields to existing Braindump model
   - **API Implementation Tasks**: Implement routes to make contract tests pass
   - **Component Tasks**: UI components for public pages, admin controls, engagement features
   - **Integration Test Tasks**: One task per quickstart.md scenario
   - **Performance Tasks**: Implement ISR, rate limiting, caching
   - **Security Tasks**: XSS prevention, CSRF protection, input sanitization

**Ordering Strategy**:
1. **TDD First**: All test tasks before implementation tasks
2. **Dependencies**: 
   - Data models → Migrations → API routes → UI components
   - Contract tests → API implementation → Integration tests
3. **Parallelization**: Tasks marked [P] can be executed concurrently
   - All 7 contract test files can be created in parallel [P]
   - All 6 entity models can be implemented in parallel [P] after migration
   - Public UI and Admin UI can be developed in parallel [P]
4. **Phase Alignment**:
   - Phase 1 (Core Visibility): Tasks 1-10 (~15 hours)
   - Phase 2 (Discovery): Tasks 11-18 (~15 hours)
   - Phase 3 (Social): Tasks 19-28 (~20 hours)
   - Phase 4 (Analytics): Tasks 29-35 (~15 hours)

**Estimated Task Breakdown**:
- Contract tests: 7 tasks [P]
- Data models: 6 tasks [P] (1 migration + 5 new models)
- API routes: 10 tasks (create/update visibility, comments CRUD, reactions, sharing, analytics, notifications)
- Public pages: 4 tasks (view page, listing page, search, RSS)
- Admin UI: 3 tasks (visibility controls, share management, moderation)
- Engagement UI: 5 tasks (comments, replies, reactions, social sharing)
- Analytics UI: 2 tasks (braindump analytics, dashboard)
- Integration tests: 16 tasks (from quickstart.md scenarios)
- Performance/Security: 4 tasks (ISR, rate limiting, XSS prevention, caching)

**Total Estimated Output**: 57 tasks organized into 4 phases (aligning with spec.md phases)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan. The /plan command STOPS here.

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning approach described (/plan command) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅
- [ ] Phase 4: Implementation complete - READY TO START
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented (N/A - no violations) ✅

**Artifacts Generated**:
- [x] research.md (Phase 0) - 12 research areas with decisions and rationales
- [x] data-model.md (Phase 1) - 6 entities with schemas, validation, indexes
- [x] contracts/ (Phase 1) - 7 OpenAPI YAML files for all endpoints
- [x] quickstart.md (Phase 1) - 16 integration test scenarios
- [x] .github/copilot-instructions.md (Phase 1) - Updated with new technologies
- [x] tasks.md (Phase 3) - 62 ordered, dependency-mapped implementation tasks

**Next Step**: Begin implementation by executing tasks.md starting with Phase 3.1 (Setup)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
