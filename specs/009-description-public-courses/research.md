# Research: Public Courses pages

Date: 2025-10-01

## Unknowns and Decisions (Resolved)

1) Non-blog preview behavior
- Decision: For MVP, only blog-linked lessons get a real Preview link. All other previewable types (standalone/video/quiz/flashcards) show an accessible informational message when clicked.
- Rationale: Avoids scope creep into building viewers; keeps UX clear.
- Alternatives: Build lightweight viewers or stubs for each type (rejected for MVP due to scope/time).

2) Public JSON API
- Decision: No public JSON API; server-rendered pages only.
- Rationale: Reduces surface area and caching/invalidation complexity for launch.
- Alternatives: Add GET /api/courses and detail APIs (deferred until a concrete need arises).

3) Tag chips on course detail
- Decision: Include tag chips that deep-link to /courses with filters applied.
- Rationale: Improves navigability and discovery from detail to catalog.
- Alternatives: Omit chips or make them non-interactive (rejected in favor of UX).

## Best Practices & Notes

- Data access
  - Use projections and `lean()` for list queries to keep payloads small.
  - Ensure a single unique index on `slug`; eliminate duplicates to remove warnings.
  - Default pagination limit 24; cap at 48.

- SEO & sitemap
  - Include only published + public courses in sitemap.
  - Use course.seo fields when provided; fallback to title/summary/hero.

- Accessibility
  - Semantic document structure (h1 for page header).
  - Alt text or empty alt for decorative images; ensure contrast and focus states.
  - Label preview indicators with ARIA for screen readers.

- Performance
  - Avoid heavy fields in index grid; lazy-load images with intrinsic sizes.
  - Prefer stable keys and memoized lists to minimize re-render work.

- Error handling
  - Index: friendly empty state with a clear “Clear filters” action.
  - Detail: 404 for missing/draft/private; outline placeholder when modules missing.

## Open Risks

- Duplicate index declarations in Mongoose may continue to warn until cleaned.
- If tag vocabulary is large, multi-select UX could get busy; consider typeahead chips later.

## Next Steps

- Proceed to Phase 1 design: formalize data-model, contracts (data shapes), and quickstart validation steps.
