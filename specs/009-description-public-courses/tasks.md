# Tasks: Public Courses pages

**Input**: Design documents from `/specs/009-description-public-courses/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md → Extract tech stack (Next.js, TS, Mongoose), structure (single project)
2. Load data-model.md → Entities (Course, Module, Lesson)
3. Load contracts/ → Internal shapes for list/detail
4. Load research.md → Decisions (no public API, preview behavior, tag chips)
5. Load quickstart.md → Test scenarios (index, detail, SEO, a11y, sitemap)
6. Generate tasks by category (Setup → Tests → Core → Integration → Polish)
7. Apply task rules (tests first, parallel [P] when files are independent)
8. Number tasks (T001+), add dependency notes
9. Output tasks.md
```

## Phase 3.1: Setup
- [ ] T001 Ensure Mongo connection util and models exist (verify only) in `src/lib/mongodb.ts` and `src/models/{Course,CourseModule,CourseLesson}.ts`
  - Note: Models/util already exist; no code changes expected.
- [ ] T002 Create course utilities scaffolding (if absent) [P]
  - Files:
    - `src/lib/courses/query.ts`
    - `src/lib/courses/format.ts`
  - Ensure: Parse query params, list with lean+projections, formatting helpers.
- [ ] T003 Update sitemap to include courses index and details
  - File: `src/app/sitemap.ts`
  - Include: `/courses` and `/courses/[slug]` for published+public.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
- [ ] T004 [P] Contract test: Courses index shape from `contracts/courses-openapi.yaml`
  - File: `src/test/contract/courses.index.contract.test.ts`
  - Assert: items fields, pagination fields presence.
- [ ] T005 [P] Contract test: Course detail shape from `contracts/courses-openapi.yaml`
  - File: `src/test/contract/courses.detail.contract.test.ts`
  - Assert: modules/lessons structure; contentType includes 'flashcards'.
- [ ] T006 [P] Integration test: Index filtering/sorting/pagination
  - File: `src/test/integration/courses.index.int.test.ts`
  - Seed: In-memory or stub DB methods; assert filters (difficulty, tags), sort (newest/A–Z), pagination behavior.
- [ ] T007 [P] Integration test: Detail outline and visibility gating
  - File: `src/test/integration/courses.detail.int.test.ts`
  - Assert: 404 for non-public/non-published; outline ordering (module.order, lessonIds order or A–Z fallback); preview link for blog lessons.
- [ ] T008 [P] Quickstart test: SEO + sitemap entries present
  - File: `src/test/integration/courses.seo.int.test.ts`
  - Assert: generateMetadata values; sitemap contains `/courses` and detail URLs.

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T009 Implement Courses index page `/src/app/courses/page.tsx`
  - Server-rendered; uses `parseCourseIndexQuery` and `listPublicCourses`; grid of cards; pagination; empty state.
- [ ] T010 Implement detail outline `/src/app/courses/[slug]/page.tsx`
  - Enforce `status=published` AND `visibility=public`; modules+lessons list; preview badges/links; tag chips linking back to `/courses` with filters.
- [ ] T011 Implement course query helpers `/src/lib/courses/query.ts`
  - Ensure projections, lean, filters (q, difficulty, tags), sort (newest/A–Z), pagination (default 24, max 48).
- [ ] T012 Implement formatting helpers `/src/lib/courses/format.ts`
  - `formatMinutes`, `truncate` utilities used in pages.
- [ ] T013 Update sitemap `/src/app/sitemap.ts` to list courses
  - Include index and detail entries; dates from updatedAt/publishedAt/createdAt.
- [ ] T014 Fix validator enum to include 'flashcards' `/src/lib/validators/courses.ts`
  - Keep in sync with models/types.

## Phase 3.4: Integration
- [ ] T015 Wire SEO metadata for index and detail
  - Use existing `src/lib/seo.ts` helpers or inline metadata for index; detail uses course.seo overrides with fallbacks.
- [ ] T016 Add JSON-LD generator for Course (optional) [P]
  - File: `src/lib/seo-course.ts` (optional)
  - Schema.org Course/BreadcrumbList; integrate on detail page.
- [ ] T017 Accessibility polish
  - Ensure alt text, ARIA labels on preview buttons, semantic headings, focus states.

## Phase 3.5: Polish
- [ ] T018 [P] Unit tests for query parsing and formatting helpers
  - Files: `src/test/unit/courses.query.unit.test.ts`, `src/test/unit/courses.format.unit.test.ts`
- [ ] T019 Performance review
  - Verify projections and lean usage; avoid heavy fields in grids; confirm index usage.
- [ ] T020 [P] Documentation updates
  - Update `specs/009-description-public-courses/quickstart.md` with any new validation nuances; add short README section if needed.
- [ ] T021 Developer ergonomics
  - Add small comments in code where assumptions are made (ordering rules, visibility gating), and ensure types are explicit.

## Dependencies
- T004–T008 (tests) must run and fail before T009–T014 (implementation).
- T009 blocks T015 (SEO polish on index); T010 blocks T015 (SEO polish on detail);
- T011 and T012 support T009; T013 (sitemap) can run after T009/T010.
- Parallel [P] tasks target distinct files (no conflicts).

## Parallel Execution Examples
```
# Run contract/integration tests authoring in parallel:
Task: T004 Contract test: courses index shape
Task: T005 Contract test: course detail shape
Task: T006 Integration test: index filters/sort/pagination
Task: T007 Integration test: detail outline & visibility
Task: T008 Quickstart test: SEO + sitemap

# Run helper unit tests in parallel later:
Task: T018 Unit tests for query/format helpers
Task: T020 Docs updates
```

## Validation Checklist (gate)
- [ ] All contract files have tests (T004, T005)
- [ ] All entities’ behaviors are covered by integration tests (T006, T007)
- [ ] SEO and sitemap validated (T008)
- [ ] Tests precede implementations (T004–T008 before T009–T014)
- [ ] Parallel tasks do not touch the same files
- [ ] Each task has concrete file paths and unambiguous goals
