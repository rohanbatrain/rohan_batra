# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Execution Flow (main)
# Feature Specification: Public Courses pages

**Feature Branch**: `009-description-public-courses`  
**Created**: 2025-10-01  
**Status**: Draft  
**Input**: User description:

Public Courses pages — functional spec

overview
Build public-facing pages for browsing and viewing courses:

A courses index at /courses
A course detail page at /courses/[slug] (enhanced)
Use server components with MongoDB, match site styling, and support SEO, filtering, and previewable lesson indicators.

goals
Publicly list only published and public courses
Search/filter/sort with pagination
Rich course detail with outline and previewable lesson cues
Solid SEO (metadata, OG/Twitter cards, sitemap)
Good performance (lean Mongo queries, caching/revalidate)
Accessible, keyboard-navigable UI

non-goals
Enrollment, paywalls, or gated content
Full lesson viewer (beyond simple “Preview” links)
Authoring/admin features (already live elsewhere)

information architecture and routes
- GET /courses
   - Lists published, public courses
   - Supports query params: page, limit, q, difficulty, tags, sort
- GET /courses/[slug]
   - Renders a published and public course by slug
   - Shows course overview + module/lesson outline (preview markers)
- SEO
   - generateSitemaps: include courses
   - generateMetadata for both index and detail
   - Note: In Next.js 15, always await params in dynamic routes.

data and access
- Course fields used: title, slug, subtitle, summary, heroImage, seo, difficulty, categories, tags, estimatedDurationMinutes, lessonCount, status, visibility
- Module/Lesson (read-only) for outline
- Lessons show only metadata; indicate previewable lessons (isPreviewable)
- Access control: Only courses where status === "published" AND visibility === "public"

UI/UX requirements

Index page (/courses)
- Header with title and optional subtitle/hero
- Controls
   - Search input (title/summary match)
   - Filters: Difficulty (beginner|intermediate|advanced), Tags (multi-select), Duration (short/med/long, optional), Sort (Newest, Popular [stub], A–Z)
- Grid of course cards (3/4-col responsive)
- Card content
   - Hero image (or fallback illustration)
   - Title + Subtitle (trimmed)
   - Stats row: difficulty, total lessons, estimated time
   - Tags (first 2–4, truncated)
   - CTA: View course
- Pagination (prev/next + pages) with query params
- Empty state: friendly copy, offer clearing filters

Detail page (/courses/[slug])
- Header
   - Title, Subtitle
   - Hero image
   - Key stats (difficulty, lessons, estimated time)
   - Tag chips (when present) linking back to /courses with filters applied
- About section
   - Summary (prose)
   - Optional recommended blogs (if present)
- Outline (modules and lessons)
   - Module title, order, optional summary, total minutes
   - Ordering: modules sorted by module.order; lessons follow module.lessonIds order when available (else title A–Z)
   - Lesson rows: title, contentType (including 'flashcards'), minutes
   - Previewable lessons marked with a badge and an accessible “Preview” link when content allows:
      - Blog: link to /blog/[blogSlug]
      - Standalone/video/quiz/flashcards: stub preview link (toggleable), or simple message “Preview not available yet” if no viewer exists
- CTA area (optional): “Start learning” (non-functional for now, scrolls to outline)

SEO and social
- Index generateMetadata
   - Title: “Courses | <SiteName>”
   - Description: brief catalog description
   - OG/Twitter with site image
- Course detail generateMetadata
   - Prefer course.seo.title/description/image with fallback to course fields
- Sitemap: include /courses (index) and each /courses/[slug] for published, public courses
- JSON-LD (optional, recommended): Course schema (name, description, provider). Optionally include BreadcrumbList on detail pages

performance and caching
- Efficient data access and rendering
   - List queries use projections and `lean()` to omit heavy fields and reduce payload
   - Default pagination limit: 24 (max 48)
   - Use caching/refresh patterns as appropriate for fresh-but-fast pages
- Indexes
   - Ensure a single unique index on slug (avoid duplicates)
   - Optional: search-friendly indexes for title, tags, difficulty
- Images
   - Provide appropriate dimensions and alt text; use optimized loading where available

accessibility
- Semantic headings (h1 for page title)
- Meaningful alt text for hero images
- Keyboard navigable filters and cards
- Sufficient color contrast
- ARIA labels for preview indicators (for example, aria-label="Preview blog lesson: <LessonTitle>")
- Provide accessible labels for all filter controls (search input, selects, checkboxes)
- Visible focus states; skip links optional

analytics (optional)
- Track impressions and clicks: view_courses_index, filter_change, paginate, view_course_detail, click_preview_lesson

error and empty states
- Index: No results → “No courses found” with “Clear filters”
- Detail: 404 when not found or not published/public; fallback notFound page
- Outline: If modules missing → “No outline available yet”

Deliverables
- Files to create
   - Index
      - page.tsx (server-rendered listing)
      - src/app/courses/components/CourseCard.tsx
      - src/app/courses/components/CourseFilters.tsx
      - src/app/courses/components/Pagination.tsx
      - Optional: src/app/courses/components/EmptyState.tsx
   - SEO
      - sitemap.ts (ensure courses are included)
   - Utilities
      - src/lib/courses/query.ts (derive query parameters for data access)
      - src/lib/courses/format.ts (helpers such as minutes to h/m)
      - Optional: src/lib/seo-course.ts (JSON-LD for Course + metadata helpers)
- Changes to existing
   - Enhance /courses/[slug]/page.tsx with outline (modules + lessons) and preview badges/links; enforce published + public
   - Confirm dynamic route parameter handling
   - If ISR adopted, ensure updates to courses/modules/lessons refresh public pages

Contracts
- Index query params
   - q: string (search title/summary)
   - difficulty: beginner|intermediate|advanced (string or array)
   - tags: comma-delimited or repeatable
   - sort: newest|az
   - page: number (1-based)
   - limit: number (default 24, max 48)
- Data provided to view layer (conceptual, not a public API)
   - List: { id, slug, title, subtitle, summary, heroImage, difficulty, tags[], estimatedDurationMinutes, lessonCount, updatedAt }
   - Detail: existing course fields + modules[] with lessons[] (id, title, contentType, minutes, isPreviewable, blogSlug?)

Acceptance criteria
- Index
   - Visiting /courses renders without errors and shows published+public courses
   - Search and filters update the listing and URL query without a full page reload
   - Pagination works; each page loads correct results
   - Empty state shows when no matches
- Detail
   - Visiting /courses/[slug] for a published and public course renders overview + outline
   - Visiting /courses/[slug] for non-existent, non-published, or non-public returns 404
   - Previewable lessons display a badge and an accessible link if previewable content exists (blog slugs linked)
   - Metadata reflects course SEO fields
- SEO
   - Courses are present in sitemap (index and detail)
   - OG/Twitter meta appear in head
- Performance
   - List queries are efficient and do not transfer unnecessary data; target responsive rendering locally
- Accessibility
   - Page passes basic keyboard navigation and contrast checks
   - Images have alt text; controls have labels

Edge cases
- Course without hero image → use a placeholder
- No modules/lessons yet → show “Outline coming soon”
- Courses with 0 lessonCount but modules exist → compute lessons length from outline (don’t block render)
- Very long titles/subtitles → truncate with ellipsis
- Tags with special characters → safely render; filters remain usable; tag chips on detail deep-link to index with slugified tags
- Duplicate slug index warning → track as technical debt to remove extra declarations

Rollout and QA
- Implement index page and components
- Enhance detail page outline
- Manual test:
   - Filters, search, pagination
   - 404s for missing or draft/private courses
   - Preview indicators for lessons
- Optional e2e: lightweight smoke for index and detail
- Post-release: observe logs for query performance and image issues

Open questions
- Do we want a lightweight “Preview lesson viewer” for standalone/video/quiz, or keep to links/toasts for now?
- Should a public JSON API (e.g., GET /api/courses) be exposed, or keep data server-only for now?
- Should course detail show tag chips linking back to the index with filters applied?

## User Scenarios & Testing (mandatory)

### Primary User Story
As a site visitor, I can browse a catalog of publicly available courses and view a course’s details and outline so I can decide what to learn and preview select lessons.

### Acceptance Scenarios
1. Given at least one public, published course exists, When I visit "/courses", Then I see a list of courses with images/placeholders, titles, subtitles, stats, and a "View course" action.
2. Given I enter a search or adjust filters (difficulty, tags, sort), When I apply them, Then the list updates to reflect my choices and the URL reflects my selections.
3. Given there are more results than fit on one page, When I paginate, Then I see the correct set of results for that page and can navigate backward and forward.
4. Given a valid slug of a public, published course, When I visit "/courses/[slug]", Then I see its title, subtitle, hero image or placeholder, key stats, summary, and an outline of modules and lessons.
5. Given a lesson is marked previewable, When I view the outline, Then the lesson row displays a clear preview badge and an accessible link (e.g., to a related blog post when available).
6. Given no courses match my filters, When I view the results, Then I see a friendly empty state and an option to clear filters.
7. Given a course that is not public or not published, When I attempt to visit its detail URL, Then I receive a 404 not found page.

### Edge Cases
- No hero image is available for a course → show a neutral placeholder.
- No modules or lessons yet → show a concise message indicating the outline is coming soon.
- The recorded lesson count is zero while outline exists → do not block rendering; show the outline that exists.
- Very long titles or subtitles → truncate with ellipsis without breaking layout.
- Tags include special characters → render safely and allow filtering without errors.

## Requirements (mandatory)

### Functional Requirements
- FR-001: The courses index MUST display only courses that are public and published.
- FR-002: The index MUST support search by title/summary text.
- FR-003: The index MUST support filtering by difficulty (beginner, intermediate, advanced) and tags (multiple selections).
- FR-004: The index SHOULD optionally support duration group filters (short/medium/long) if data is available.
- FR-005: The index MUST support sorting by newest and alphabetically (A–Z).
- FR-006: The index MUST support pagination with a default page size of 24 and a maximum of 48 per page.
- FR-007: Each course card MUST show hero image or placeholder, title, trimmed subtitle, difficulty, total lessons, estimated time, a small set of tags, and a clear "View course" action.
- FR-008: An empty state MUST appear when no results match filters, with an option to clear filters.
- FR-009: The course detail page MUST show title, subtitle, hero image/placeholder, key stats (difficulty, lessons, estimated time), and a readable summary.
- FR-010: The detail page MUST include a structured outline of modules with their lessons.
- FR-011: Previewable lessons MUST be visually indicated and provide an accessible preview link when appropriate (e.g., to a related blog post if present). Non-previewable lessons SHOULD present clear, non-blocking feedback.
- FR-012: The interface MUST meet basic accessibility: semantic headings, alt text on images, keyboard navigability, visible focus states, and sufficient color contrast.
- FR-013: The index and detail pages MUST include search engine and social metadata, and course detail pages MUST be included in the public sitemap.
- FR-014: Basic performance expectations MUST be met: list and detail pages respond promptly for typical local usage; data access should be efficient and avoid unnecessary data transfer.
- FR-015: Optional analytics MAY record impressions and interactions (index views, filter changes, pagination, course detail views, preview clicks) without impacting core functionality.
- FR-016: URL query parameters for the index MUST reflect search, filter, sort, page, and limit values to enable deep-linking and shareability.
- FR-017: The system MUST return a not-found response for non-existent or non-public/non-published course slugs.
- FR-018: The visual design SHOULD align with the site’s existing styling.

Clarifications (resolved):
- FR-019: Non-blog previewable lessons will show a simple informational message (no viewer in MVP). Blog-linked lessons get real Preview links.
- FR-020: No public JSON API in MVP; pages are server-rendered only.
- FR-021: Course detail pages include tag chips linking back to the index with filters applied.

### Key Entities
- Course: Represents a learning track available on the site. Attributes include name/title, slug, subtitle, summary, image, difficulty, categories/tags, estimated duration, lesson count, status, and visibility.
- Module: A grouping within a course that organizes related lessons. Attributes include title, order, and optional summary.
- Lesson: An instructional unit within a module. Attributes include title, content type, estimated minutes, whether it is previewable, and when applicable, a related article identifier used for preview linking.

---

## Review & Acceptance Checklist

Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarification items)

---
