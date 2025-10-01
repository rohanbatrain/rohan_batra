
# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

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
````markdown

# Implementation Plan: Public Courses pages

**Branch**: `009-description-public-courses` | **Date**: 2025-10-01 | **Spec**: [/Users/rohan/Documents/repos/rohan_batra/specs/009-description-public-courses/spec.md]
**Input**: Feature specification from `/specs/009-description-public-courses/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Loaded spec from /Users/rohan/Documents/repos/rohan_batra/specs/009-description-public-courses/spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type detected: Web application (Next.js app router)
   → Structure Decision: Single project (src/*)
3. Fill the Constitution Check section based on the constitution document
4. Evaluate Constitution Check section
   → No blocking violations; minor deviation on contract tests timing documented
   → Update Progress Tracking: Initial Constitution Check = PASS
5. Execute Phase 0 → research.md
   → Resolved previously marked ambiguities in spec via research decisions
6. Execute Phase 1 → contracts, data-model.md, quickstart.md
7. Re-evaluate Constitution Check
   → No new violations; Post-Design Constitution Check = PASS
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Build public-facing Courses index (`/courses`) and detail (`/courses/[slug]`) pages that list only published + public courses, provide search/filter/sort with pagination, and render a rich detail view with outline and preview indicators; use server-rendered Next.js components with MongoDB via Mongoose, lean projections for performance, and include SEO metadata and sitemap entries. MVP excludes a public JSON API and dedicated viewers for non-blog lesson previews; blog-linked lessons get a real Preview link.

## Technical Context
**Language/Version**: TypeScript, Next.js 15 (App Router)  
**Primary Dependencies**: React 18, Next.js, Mongoose/MongoDB, Zod, Tailwind CSS, shadcn/ui  
**Storage**: MongoDB (Mongoose models: Course, CourseModule, CourseLesson)  
**Testing**: Vitest (configured by `vitest.config.ts`)  
**Target Platform**: Vercel/Node.js (SSR/Server Components)  
**Project Type**: web (single project layout under `src/`)  
**Performance Goals**: Efficient list queries (lean + projections), responsive SSR, default page size 24 (cap 48), avoid heavy fields in grids  
**Constraints**: Public visibility gating (status=published AND visibility=public), no client fetch for index, SEO-friendly metadata/sitemap  
**Scale/Scope**: Small catalog (tens to low hundreds of courses) initially; simple filters (difficulty, tags)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Test-First: Partial. Contracts defined, quickstart scenarios documented. Contract tests generation deferred to /tasks to keep /plan lean.  
- Simplicity: Adheres. No extra services; server-only data access.  
- Observability: N/A at feature level; minimal logging acceptable.  
- Versioning/Breaking: No public API introduced in MVP.  

Result: Initial Constitution Check = PASS (with minor deviation documented in Complexity Tracking). Post-Design Check = PASS.

## Project Structure

### Documentation (this feature)
```
specs/009-description-public-courses/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
└── contracts/           # Phase 1 output (/plan command)
```

### Source Code (repository root)
```
src/
├── app/
├── models/
├── lib/
└── components/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Single project (DEFAULT) confirmed.

## Phase 0: Outline & Research
Unknowns identified and resolved (see `research.md`):
- Non-blog preview behavior → MVP shows accessible informational message; only blog-linked lessons get Preview links.
- Public JSON API → Not in MVP; server-rendered pages only.
- Tag chips on detail → Included; deep-link back to index with filters applied.

Output: `research.md` created with decisions, rationale, and alternatives.

## Phase 1: Design & Contracts
Artifacts produced:
- `data-model.md`: Course/Module/Lesson (public read models), validation/display rules.
- `contracts/courses-openapi.yaml`: Internal shapes for list and detail rendering.
- `quickstart.md`: Validation steps (index/detail, SEO, a11y, sitemap).

Contract tests: Deferred to /tasks to avoid brittle stubs; tracked as a deviation below.

Post-Design Constitution Check: PASS.

## Phase 2: Task Planning Approach
When executing /tasks for this feature:
- Load tasks template and generate tasks from contracts, data model, and quickstart.
- Create contract test tasks [P] for index/detail shapes and query param parsing.
- Create integration test scenarios from quickstart (index filters/pagination, detail outline, visibility gating).
- Order: tests → minimal services/utils → pages/components → SEO/sitemap wiring → accessibility polish.

Estimated Output: ~25 tasks in `tasks.md` (NOT created by /plan).

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Contract tests deferred in /plan | Keep /plan output focused on design docs; testing will be added with /tasks | Creating failing tests now without a runner may add noise; /tasks will generate and run them coherently |


## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (documented in research.md)
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

````
**Task Generation Strategy**:
