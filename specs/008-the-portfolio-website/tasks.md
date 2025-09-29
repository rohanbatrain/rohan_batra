# Tasks: Courses Section Expansion

Date: 2025-09-25
Branch: 008-the-portfolio-website

This file enumerates implementation tasks in dependency order, marking parallelizable items with [P]. Favor TDD: write/adjust tests first, then implement until green.

Legend
- [P] = Can be executed in parallel with other [P] tasks (no file/contract conflicts)
- Inputs = contracts/api.yaml, data-model.md, research.md, quickstart.md, plan.md
- Success criteria = measurable checks (tests passing, routes working, UI rendering)

## High-level flow
1) Models and utilities → 2) Services → 3) API endpoints → 4) Frontend surfaces → 5) Workers/backgrounds → 6) Admin tools → 7) QA (accessibility/perf) → 8) Docs

## Tasks

T001 — Create base Mongoose models [Course, CourseModule, CourseLesson] [P]
- Files: src/models/Course.ts, src/models/CourseModule.ts, src/models/CourseLesson.ts
- Do: Define schemas, validation, and indexes per data-model.md. Export types.
- Tests: src/test/models/course.model.test.ts (schema validation + unique slug); module/lesson tests.
- Success: Vitest model tests pass; indexes defined; typecheck passes.

T002 — Create models [CourseQuiz, CourseEnrollment] [P]
- Files: src/models/CourseQuiz.ts, src/models/CourseEnrollment.ts
- Do: Add constraints (unique lessonId on quiz; compound unique (courseId,userId) on enrollment).
- Tests: quiz validation, enrollment uniqueness and lifecycle.
- Success: Tests pass; indexes defined.

T003 — Create models [CourseProgress, CertificateProvider, Certificate] [P]
- Files: src/models/CourseProgress.ts, src/models/CertificateProvider.ts, src/models/Certificate.ts
- Do: Add percentage normalization helpers on progress; certificate lifecycle fields/indexes.
- Tests: progress normalization; certificate number format and required fields for issued status.
- Success: Tests pass; unique indexes set (certificateNumber, enrollmentId on progress/cert).

T004 — Add shared types and zod validators [P]
- Files: src/types/courses.ts, src/lib/validators/courses.ts
- Do: Mirror OpenAPI request/response shapes for progress update, curriculum editor payloads.
- Tests: validator unit tests for happy/edge.
- Success: Validators used in API handlers later; tests pass.

T005 — Certificate numbering and QR utility [P]
- Files: src/lib/certificates/ids.ts, src/lib/certificates/qr.ts
- Do: Deterministic certificateNumber generator (e.g., RB-COURSE-YYYY-XXXX); QR payload builder with verification URL.
- Tests: deterministic outputs by date/seed; valid URL formats.
- Success: Tests pass.

T006 — Progress calculation utility [P]
- Files: src/lib/courses/progress.ts
- Do: Compute module and course percentages from lesson weights; idempotent merges.
- Tests: aggregation correctness on varied weights; edge cases (missing lessons).
- Success: Tests pass.

T007 — Dashboard service (composition) — server-only
- Files: src/lib/services/dashboard-service.ts
- Do: Compose enrolled courses + enrollment + progress + certificates + recommendations (stub provider).
- Tests: unit tests using model fakes; returns DTO per contracts/api.yaml DashboardSummary.
- Depends: T001–T006
- Success: Tests pass; types align with contracts.

T008 — Certificate rendering service (PDF/PNG) [P]
- Files: src/lib/services/certificate-service.ts, src/lib/certificates/templates/portfolio.tsx
- Do: Implement @react-pdf/renderer template; generate PDF buffer; PNG via @vercel/og + sharp; upload via existing storage util.
- Tests: unit/integration (mock storage) — renders with sample data; emits URLs and metadata.
- Depends: T005
- Success: Tests pass; artifact buffers created in test; interfaces stable.

T009 — SBD client and provider adapter [P]
- Files: src/lib/services/sbd-client.ts, src/lib/services/providers/sbd.ts
- Do: Signed REST calls; map local certificate data to SBD payload; handle retries + basic error mapping.
- Tests: client unit tests (mock fetch/axios); provider adapter returns external IDs.
- Success: Tests pass; env var gates respected.

T010 — API contracts tests (public courses) [P]
- Files: src/test/api/contracts/courses.public.test.ts
- Do: Supertest against Next API routes (to be implemented), using OpenAPI schemas as references. Start with GET /courses and GET /courses/{slug}.
- Depends: T001 (models to seed fixtures)
- Success: Tests initially fail (red) until endpoints implemented.

T011 — API contracts tests (enroll/progress/complete) [P]
- Files: src/test/api/contracts/courses.progress.test.ts
- Do: Define tests for POST /courses/{slug}/enroll, GET/PUT /courses/{slug}/progress, POST /courses/{slug}/complete.
- Depends: T001–T006
- Success: Tests red.

T012 — API contracts tests (dashboard) [P]
- Files: src/test/api/contracts/dashboard.test.ts
- Do: Tests for GET /dashboard/summary, /dashboard/certificates, /dashboard/recommendations.
- Depends: T007
- Success: Tests red.

T013 — API contracts tests (certificates public/download) [P]
- Files: src/test/api/contracts/certificates.test.ts
- Do: Tests for GET /certificates/{certificateNumber} and GET /certificates/{certificateId}/download?format=pdf|png.
- Depends: T003, T008
- Success: Tests red.

T014 — API contracts tests (admin courses & providers) [P]
- Files: src/test/api/contracts/admin.test.ts
- Do: Tests for /admin/courses (GET/POST), /admin/courses/{id} (PATCH), /admin/courses/{id}/modules (PUT), /admin/courses/{id}/publish (POST), /admin/certificates/providers (GET/POST), /admin/certificates/{id}/reissue (POST).
- Depends: T001–T006, T008–T009
- Success: Tests red.

T015 — Implement GET /api/courses (list) and GET /api/courses/[slug]
- Files: src/app/api/courses/route.ts, src/app/api/courses/[slug]/route.ts
- Do: Query published courses; filters; single course detail with modules/lessons.
- Depends: T010
- Success: Contracts tests green for public listing/detail.

T016 — Implement POST /api/courses/[slug]/enroll
- Files: src/app/api/courses/[slug]/enroll/route.ts
- Do: Create or reuse enrollment; initialize progress.
- Depends: T011
- Success: Contracts tests pass for enroll.

T017 — Implement GET/PUT /api/courses/[slug]/progress
- Files: src/app/api/courses/[slug]/progress/route.ts
- Do: Return current progress; update completion lists and current lesson; recalc percentages; enforce auth and ownership.
- Depends: T011, T006
- Success: Contracts tests pass for progress get/update.

T018 — Implement POST /api/courses/[slug]/complete
- Files: src/app/api/courses/[slug]/complete/route.ts
- Do: Validate eligibility; mark enrollment completed; create certificate (pending) and enqueue render; return pending/issued state.
- Depends: T011, T003, T008
- Success: Contracts tests pass for completion flow.

T019 — Implement GET /api/dashboard/* (summary, certificates, recommendations)
- Files: src/app/api/dashboard/summary/route.ts, src/app/api/dashboard/certificates/route.ts, src/app/api/dashboard/recommendations/route.ts
- Do: Use dashboard-service to assemble payloads; secure via Clerk; return DTOs.
- Depends: T012, T007
- Success: Contracts tests pass for dashboard endpoints.

T020 — Implement certificates public/asset endpoints
- Files: src/app/api/certificates/[certificateNumber]/route.ts, src/app/api/certificates/[certificateId]/download/route.ts
- Do: Public verification by certificateNumber; download redirects to signed URLs; increment download count.
- Depends: T013, T003, T008
- Success: Contracts tests pass for certificates endpoints.

T021 — Implement admin courses endpoints
- Files: src/app/api/admin/courses/route.ts, src/app/api/admin/courses/[courseId]/route.ts, src/app/api/admin/courses/[courseId]/modules/route.ts, src/app/api/admin/courses/[courseId]/publish/route.ts
- Do: Admin auth guard; CRUD metadata; replace curriculum with structureVersion bump and validations; publish guard rails.
- Depends: T014, T001–T006
- Success: Contracts tests pass for admin courses.

T022 — Implement admin certificate providers & reissue endpoints
- Files: src/app/api/admin/certificates/providers/route.ts, src/app/api/admin/certificates/[certificateId]/reissue/route.ts
- Do: Manage providers; reissue triggers render job and optional SBD sync.
- Depends: T014, T008–T009
- Success: Contracts tests pass for admin providers/reissue.

T023 — Add SBD webhook endpoint (missing in contracts) and update OpenAPI
- Files: src/app/api/certificates/sbd/webhook/route.ts, specs/008-the-portfolio-website/contracts/api.yaml
- Do: Handle signature verification, status updates; extend contract with this path.
- Depends: T009, T020, T022
- Success: Unit tests pass; contract updated and linted.

T024 — Frontend: Courses catalog page and card components [P]
- Files: src/app/courses/page.tsx, src/components/courses/CourseCard.tsx, src/components/courses/Filters.tsx
- Do: Render paginated list using existing card styles; filters; featured carousel reuse.
- Tests: RTL snapshot tests; a11y role checks.
- Depends: T015
- Success: Page renders with mock/live API; lint/type pass.

T025 — Frontend: Course detail page with curriculum accordion and sticky nav [P]
- Files: src/app/courses/[slug]/page.tsx, src/components/courses/CurriculumAccordion.tsx, src/components/courses/StickySidebar.tsx
- Do: Show hero, summary, enroll/resume CTA; render lessons (blog links, standalone markdown, external video embeds); previewable toggle.
- Tests: RTL interaction tests; verify links and fallback UI.
- Depends: T015–T018
- Success: Page renders end-to-end with progress updates.

T026 — Frontend: Dashboard pages (summary and certificates tab) [P]
- Files: src/app/dashboard/page.tsx, src/components/dashboard/ProgressCard.tsx, src/components/dashboard/CertificatesList.tsx
- Do: Server components fetching summary; client interactions for resume buttons and downloads.
- Tests: RTL + minimal Playwright smoke.
- Depends: T019–T020
- Success: Dashboard loads <1.5s locally, tests pass.

T027 — Frontend: Admin courses editor [P]
- Files: src/app/admin/courses/page.tsx, src/app/admin/courses/[id]/page.tsx, src/components/admin/CurriculumEditor.tsx
- Do: List, create, edit, reorder modules/lessons (drag-and-drop), publish with validation messages.
- Tests: RTL for editor behaviors; e2e happy path.
- Depends: T021
- Success: Admin flows functional with contract-compliant payloads.

T028 — Background jobs: queue and workers for certificate rendering and PNG conversion
- Files: src/lib/jobs/queue.ts, src/lib/jobs/certificate.render.worker.ts
- Do: Use existing queue infra (or minimal BullMQ) gated by env; enqueue on complete/reissue; handle retries.
- Tests: worker unit tests with fake queue; integration around T018/T022.
- Depends: T008, T018, T022
- Success: Jobs run in dev; retry/backoff logic covered by tests.

T029 — Observability & analytics hooks [P]
- Files: src/lib/analytics/events.ts, sprinkle in API handlers
- Do: Emit events for enroll, lesson complete, course complete, certificate download; reuse existing logging.
- Tests: unit tests ensure events called.
- Depends: T016–T020
- Success: Tests pass; events visible in dev logs.

T030 — Playwright setup and core e2e stories
- Files: playwright.config.ts, e2e/courses.spec.ts, e2e/dashboard.spec.ts, e2e/admin.spec.ts
- Do: Add config; implement Quickstart Story 1–5 happy paths.
- Depends: T024–T027
- Success: E2E pass locally (chromium).

T031 — Accessibility sweep [P]
- Files: fixes across components (aria roles, labels); scripts/a11y-checks.md
- Do: Keyboard navigation, aria labels on accordions, buttons, and downloads; basic a11y tests.
- Depends: T024–T027
- Success: Axe/Storybook a11y checks pass for key pages.

T032 — Performance budget and LCP improvements [P]
- Files: image optimizations, code-splitting in course pages, caching in dashboard-service
- Do: Ensure course LCP <2.3s (mobile), dashboard p95 <300ms; add caching headers/selective fetches.
- Depends: T019, T024–T026
- Success: Lighthouse targets met locally.

T033 — Documentation and Quickstart updates [P]
- Files: specs/008-the-portfolio-website/quickstart.md, README.md
- Do: Add new commands, env vars, monitoring notes, and troubleshooting tips (SBD webhook, workers).
- Depends: T019–T028
- Success: Docs reviewed; steps reproducible.

T034 — Final polish and release checklist
- Files: CHANGELOG.md (new), specs/008-the-portfolio-website/plan.md (progress update)
- Do: Gate runs (lint, typecheck, unit, e2e); resolve flakes; update plan progress; prepare release notes.
- Depends: T001–T033
- Success: All gates green; plan updated; ready to merge.

## Notes
- AuthN/AuthZ: Use Clerk in API handlers; admin routes enforce admin role.
- Fallbacks: Respect research.md policies for missing blog slugs and external resources.
- Contract drift: If shapes change, update contracts/api.yaml and adjust contract tests first.

## Optional command snippets (for reference)
- Run unit tests: pnpm test
- Run affected tests only: pnpm test -t "dashboard-service"
- Start dev API/UI: pnpm dev
- E2E locally (after T030): pnpm exec playwright test --project=chromium
