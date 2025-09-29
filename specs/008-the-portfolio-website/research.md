# Research: Courses Section Expansion

**Date**: 2025-09-25  
**Feature**: Courses Section for Portfolio Website  
**Phase**: 0 - Research & Technology Decisions

---

## Technology Decisions

### Content Architecture & Reuse Strategy
**Decision**: Layer a dedicated `Course` domain on top of the existing Next.js + Mongoose stack, modeling courses as structured collections of lessons that reference existing blog posts, media assets, and UI primitives wherever possible.  
**Rationale**:
- Preserves the investment in the Books/Blogs pipelines (markdown processing, rich embeds, Lottie/image handling, SEO metadata).
- Keeps the authoring experience familiar by allowing lessons to point to existing blog slugs or reuse markdown rendering components.
- Minimizes new infrastructure while enabling future extensibility (quizzes, gated content, certificates).
**Alternatives considered**:
- Building a standalone CMS for courses → rejected because it duplicates capabilities and fragments the content pipeline.
- Embedding full course content inside blog posts → rejected because it limits curriculum structuring, progress tracking, and certification logic.

### Curriculum Structure (Modules & Lessons)
**Decision**: Represent curricula as ordered `CourseModule` documents containing ordered `CourseLesson` entries with a `contentType` union (`blog`, `standalone`, `video`, `quiz`).  
**Rationale**:
- Supports reuse (blog lessons just reference an existing slug) while enabling bespoke lessons (standalone markdown/MDX) and external embeds (YouTube/Vimeo) without branching code paths.
- Provides a clear place to add quizzes or future lesson types without schema churn.
- Keeps module ordering and lesson ordering explicit for progress tracking.
**Alternatives considered**:
- Flat list of lessons without modules → rejected because longer courses need modular structure for dashboards and sticky navigation.
- Separate collections per lesson type → rejected as it fractures querying and complicates ordering logic.

### Progress Tracking Model
**Decision**: Track enrollment and progress separately via `CourseEnrollment` (user-course relationship) and `CourseProgress` (per-enrollment progress snapshots with completed lesson IDs, timestamps, and percent complete).  
**Rationale**:
- Mirrors existing analytics/service patterns (`likes`, `comments`) while allowing resumable progress and detailed timestamps for dashboards.
- Simplifies generating dashboard cards and progress bars by querying a single aggregate record per enrollment.
- Supports future gamification (streaks, XP) without reworking enrollment records.
**Alternatives considered**:
- Embedding progress directly on the enrollment document → rejected to avoid bloating the enrollment record and to keep history/change tracking clean.
- Calculating progress on-the-fly → rejected due to performance concerns for dashboards and certificate eligibility checks.

### Certificate Generation & Providers
**Decision**: Introduce `CertificateProvider` definitions with a shared template interface. Generate PDFs using `@react-pdf/renderer` (Node-friendly, React-based) and derive PNG previews using `@vercel/og` (Satori) + `sharp` for rasterization.  
**Rationale**:
- React-based templates let us reuse design tokens and components for consistent branding.
- `@react-pdf/renderer` avoids headless Chrome dependencies, keeping builds light on Vercel.
- `@vercel/og` already powers OG image generation in Next.js; pairing with `sharp` keeps PNG generation deterministic.
- Provider abstraction (Rohan Batra vs SBD) supports multi-brand issuance, verification URLs, and provider-specific metadata.
**Alternatives considered**:
- Puppeteer/Playwright for PDF & PNG → rejected due to heavy dependencies and cold-start penalties.
- Generating certificates entirely through SBD → rejected to keep portfolio-branded certificates controllable in-house.

### Second Brain Database (SBD) Integration
**Decision**: Treat SBD as an external certificate fulfillment provider accessed via REST webhooks. Certificates issued under SBD trigger a signed request to the SBD API, storing their verification payload alongside the locally generated certificate artifacts.  
**Rationale**:
- Keeps local issuance logic authoritative while honoring SBD as the verification source.
- Enables asynchronous retries and reconciliation jobs if SBD is temporarily unavailable.
- Allows the dashboard to expose a unified certificate list regardless of provider.
**Alternatives considered**:
- Mirroring the entire certificate lifecycle in SBD → rejected to maintain autonomy over portfolio-branded certificates.
- Ignoring SBD and only issuing locally → rejected because the requirement explicitly calls for multi-provider issuance.

### Video & External Resource Handling
**Decision**: Reuse the existing rich embed component library (currently used for markdown shortcodes) to render external resources within course lessons. Store provider metadata (platform, duration) directly on the lesson.  
**Rationale**:
- Eliminates the need for new media players; YouTube/Vimeo/IFrame logic already exists for blog embeds.
- Maintains visual consistency with existing content blocks and responsive behavior.
- Allows fallback messaging and analytics to piggyback on existing embed hooks.
**Alternatives considered**:
- Building bespoke video players per provider → rejected as it duplicates work and increases maintenance.
- Linking out to external resources without embedding → rejected for poorer UX and loss of progress tracking control.

### Dashboard Aggregation Layer
**Decision**: Build a `dashboard-service` module that composes enrollment, progress, recommendations, and certificates into a single DTO for the React client.  
**Rationale**:
- Keeps server-side data shaping co-located and testable.
- Allows server components to fetch complete dashboard payloads via a single call, minimizing client waterfalls.
- Simplifies adding additional cards (e.g., streaks) later without touching the client contract.
**Alternatives considered**:
- Multiple API calls per widget → rejected to protect performance and simplify caching.
- Client-side aggregation with SWR → rejected because SSR dashboards need data on first paint.

### UI & Interaction Patterns
**Decision**: Extend existing shadcn/ui primitives (Tabs, Accordion, Progress, Cards) with a course design system variant library, mirroring Udemy/Skillshare layouts (sticky overview column, accordion curriculum, progress bars).  
**Rationale**:
- Guarantees visual parity with existing site components (colors, typography, padding).
- Minimizes bespoke CSS by staying within the Tailwind + shadcn paradigm.
- Fits within the responsive breakpoints already in use.
**Alternatives considered**:
- Importing third-party course UI kits → rejected to maintain cohesive branding.
- Building everything from scratch → rejected for time and maintenance overhead.

### Error & Fallback Handling
**Decision**: Define deterministic fallback policies for missing linked content or third-party outages: display graceful fallback UI, flag the issue for admins, and prevent enrollment blockers when possible.  
**Rationale**:
- Resolves spec ambiguities proactively and keeps the learner experience intact.
- Allows monitoring/alerting while avoiding hard failures for learners.
- Keeps dashboard metrics accurate even if individual lessons are temporarily unavailable.
**Alternatives considered**:
- Hard-failing course pages when dependencies break → rejected as it degrades UX and violates reuse-first spirit.
- Silently ignoring missing assets → rejected due to discoverability/compliance concerns.

---

## Clarification Outcomes

- **Deleted Linked Blog Posts**: Courses referencing a missing blog slug will surface a “Lesson temporarily unavailable” card, exclude the lesson from progress calculations, and emit an admin notification so the course can be patched. The course remains publishable if ≥80% of lessons are healthy; otherwise it auto-downgrades to draft.
- **Unavailable External Resources**: External lessons display an inline warning with retry CTA. The system logs the outage, retries on server-side render, and offers a placeholder summary so learners can continue. Progress credit is deferred until the resource responds successfully.
- **Standalone Lesson Minimums**: Publishing logic enforces at least one lesson per course. If a course contains only standalone lessons, they must include rendered markdown content blocks before publishing.

All previous `[NEEDS CLARIFICATION]` markers in the specification are now resolved by these decisions.

---

## Risk & Mitigation Highlights

- **Certificate Rendering Performance**: Pre-render portfolio-branded certificates on completion and cache SBD-issued metadata to avoid repeated heavy computation. Add background job for PNG conversion.
- **Data Integrity**: Use transactions when marking a course complete (update progress → issue certificate → enqueue notifications) to avoid partial state.
- **Analytics Consistency**: Reuse existing logging hooks to capture lesson views and certificate downloads, maintaining continuity with Books/Blogs analytics.
- **Accessibility**: Mirror Books/Blogs keyboard navigation patterns for accordions, sticky sections, and progress bars, and ensure certificate downloads have accessible labels.

---

All research tasks are closed with actionable decisions, unblocking Phase 1 design.
