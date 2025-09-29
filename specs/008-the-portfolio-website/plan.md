# Implementation Plan: Courses Section Expansion

**Branch**: `008-the-portfolio-website` | **Date**: 2025-09-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-the-portfolio-website/spec.md`

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
Extend the portfolio site with a reuse-first Courses section and tightly integrated flashcard study experiences that layer modular curricula, lesson progress, and certificates on top of the existing Books/Blogs ecosystem. Learners gain a personalized dashboard with progress cards, recommendations, flashcard decks, and a certificates tab, while completions trigger branded or Second Brain Database (SBD) credentials without reinventing established UI components, media handling, or content pipelines. Admin tooling evolves in tandem so courses, flashcards, and supporting assets can be curated from a single dashboard.

## Technical Context
**Language/Version**: TypeScript (Next.js 15.5 / React 19, Node 18 runtime)  
**Primary Dependencies**: Next.js App Router, Tailwind CSS + shadcn/ui, Clerk, MongoDB/Mongoose, Framer Motion, `@react-pdf/renderer`, `@vercel/og`, `sharp`, Novel.sh editor, Cloudinary asset pipeline, spaced-review-friendly UI primitives  
**Storage**: MongoDB Atlas (courses, modules, enrollments, progress, certificates); existing Cloudinary/S3 bucket for certificate assets; SBD REST API for external verification payloads  
**Testing**: Vitest + React Testing Library, Playwright E2E, contract tests via supertest/OpenAPI mocks, background job smoke tests  
**Target Platform**: Web application on Vercel (Next.js server components + edge rendering), optional Docker self-hosting  
**Project Type**: web – single Next.js codebase with integrated API route handlers and server actions  
**Performance Goals**: Course overview LCP < 2.3s mobile, dashboard summary API p95 < 300 ms, certificate rendering job < 30 s, retry backlog cleared within 5 min  
**Constraints**: Reuse existing components/assets, graceful degradation for missing linked content, multi-provider certificate issuance, accessibility parity with Books/Blogs, maintain TDD & lint/type gates  
**Scale/Scope**: 30–50 courses, thousands of learners, flashcard decks per course/module, up to 10k certificates/year, localization-ready

**Arguments from user specification**:
- Courses reuse blog lessons, standalone modules, or external video resources (e.g., YouTube) while allowing advanced features like quizzes and progress tracking.
- Learner dashboard surfaces enrolled courses, progress bars, recommendations that reference related blogs/books, a flashcard center, and a certificates tab.
- Certificates can be issued under the Rohan Batra brand or via Second Brain Database, including PDFs/PNGs, QR codes, and share workflows.
- Design must echo Udemy/Skillshare best practices (accordion curricula, sticky navigation, celebratory animations) without departing from existing visual language.
- Reuse-first mandate: leverage Lottie animations, image pipeline, markdown/Novel.sh editor, and shadcn/ui components to avoid reinvention.
- Flashcard decks provide quick reinforcement experiences linked to courses or consumable on their own, sharing the same visual language and analytics hooks.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file contains placeholder sections and no explicit prohibitions, so standard guardrails are enforced:
- ✅ Test-first approach (contract tests → Vitest → Playwright) remains mandatory.
- ✅ Simplicity upheld by extending existing stacks instead of introducing parallel services.
- ✅ Observability preserved via existing logging/analytics hooks extended for progress and certificates.
- ✅ No new repositories or independent projects introduced.

**Initial Constitution Check**: PASS

## Project Structure

### Documentation (this feature)
```
specs/008-the-portfolio-website/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.yaml
└── tasks.md        # Generated by /tasks (future)
```

### Source Code (repository root)
```
src/
├── app/                 # App Router routes (courses, dashboard, admin)
├── components/          # Reusable UI primitives (shadcn/ui extensions, cards, accordions)
├── lib/                 # Services (dashboard-service, certificate-service, sbd-client)
├── models/              # Mongoose schemas (Course, Enrollment, Progress, Certificate)
├── jobs/                # Background workers (certificate rendering, SBD sync)
├── hooks/               # Client hooks (useProgress, useCertificateDownload)
└── test/                # Contract/unit/integration tests
```

**Structure Decision**: Option 2 (Web application) – remain within the existing Next.js monorepo, separating concerns via folders rather than new packages.

## Phase 0: Outline & Research
Completed (see [research.md](./research.md)). Key outcomes:
- Finalized curriculum schema (`Course` → `CourseModule` → `CourseLesson`) with union lesson types to maximize reuse and documented flashcard deck associations at the module/lesson level.
- Chose certificate tooling stack (`@react-pdf/renderer`, `@vercel/og`, `sharp`) and provider abstraction supporting portfolio + SBD flows.
- Defined SBD integration as webhook-based with signed payloads, retries, and mirrored verification data.
- Established explicit fallback behaviors for missing blog lessons, unavailable external resources, and standalone lesson minimums.
- Confirmed dashboard aggregation via dedicated `dashboard-service` to deliver single payloads to server components.

All `NEEDS CLARIFICATION` markers from the spec are resolved.

## Phase 1: Design & Contracts
Outputs delivered:
- **Data Model** ([data-model.md](./data-model.md)) — Documents entities, validation, indexes, and state transitions for courses, progress, and certificates.
- **API Contracts** ([contracts/api.yaml](./contracts/api.yaml)) — Defines learner/public/admin endpoints for courses catalog, enroll/progress, dashboard, certificates, and provider management.
- **Quickstart** ([quickstart.md](./quickstart.md)) — Provides environment variables, smoke tests, and validation flows covering dashboard, certificates, and fallbacks.
- **Agent Context** — To be updated post-plan via `.specify/scripts/bash/update-agent-context.sh copilot` to register new technologies (certificate rendering stack, SBD client).

No implementation yet; tests will be generated during task planning following TDD.

**Post-Design Constitution Check**: PASS

## Phase 2: Task Planning Approach
(Definition only; /tasks command will create `tasks.md`.)

**Strategy**
- Derive contract tests for each endpoint group (public catalog, learner interactions, dashboard aggregate, certificate downloads, admin management) before implementation.
- Map each data entity to a schema + migration task, including background job wiring for certificate rendering and SBD sync.
- Create service-layer tasks (dashboard-service, certificate-service, sbd-client, flashcard-service) followed by API handlers and server actions.
- Split frontend work into reusable primitives, course surfaces (catalog/detail/player), flashcard study modes, dashboard widgets, certificates tab, and admin curriculum editor.
- Allocate explicit tasks for accessibility/performance validation, celebratory animations, and fallback monitoring.

**Ordering & Parallelization**
1. Schema groundwork and migrations (sequential).
2. Contract tests + service logic for enroll/progress/certificates (sequential TDD).
3. Certificate rendering pipeline & background jobs (parallelizable sub-tasks) [P].
4. Dashboard aggregation API & tests (after progress service) (sequential).
5. Frontend pages/components (parallel by surface with mocked data) [P].
6. Admin curriculum editor + validations (depends on backend, partially parallel) [P].
7. Observability, analytics, accessibility, and performance polish.

**Estimated Output**: 28–34 tasks spanning schemas, services, APIs, frontend surfaces, workers, QA, and deployment updates.

## Phase 3+: Future Implementation
- **Phase 3**: /tasks command generates actionable tasks.md
- **Phase 4**: Implementation across backend, frontend, workers
- **Phase 5**: Validation (tests, quickstart checks, accessibility/perf audits)

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| None | — | — |

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command – definition only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 – See `/memory/constitution.md`*
