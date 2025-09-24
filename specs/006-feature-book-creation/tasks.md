
# Tasks: Book Creation System (006-feature-book-creation)

Note: Cohesive with existing UI/UX, services, models, routes, and tests. Reuse patterns from blog/portfolio/journal systems; do not reinvent.

## Conventions
- [P] = Can run in parallel (different files / low coupling)
- Use direct DB access in Server Components via services (no fetch during SSR)
- Use Clerk auth patterns and Zod validation as in existing admin APIs
- Follow existing route shapes and test naming under `test/`

## TDD & Order
- Setup/verification → Make existing contract tests pass → Extend models → Services → Admin API → Public pages → Settings/Analytics → Integration tests → Polish

## Tasks

T001. Verify branch and install deps [P]
- Ensure you are on `006-feature-book-creation`
- Install deps if needed:
  - `pnpm install`

T002. Align to existing contract tests (do NOT create new ones)
- Confirm these files exist; they define acceptance for APIs:
  - `/Users/rohan/Documents/repos/rohan_batra/test/api-admin-books.contract.test.ts`
  - `/Users/rohan/Documents/repos/rohan_batra/test/api-admin-chapters.contract.test.ts`
- If a public books contract test is missing, add minimal one:
  - `/Users/rohan/Documents/repos/rohan_batra/test/api-public-books.contract.test.ts` [P]
  - Based on `specs/006-feature-book-creation/contracts/public-books.md`

T003. Extend existing models to match data model [P]
- Update `/Users/rohan/Documents/repos/rohan_batra/src/models/Book.ts` to include: status/visibility enums, series fields, seo fields, translationKey, analyticsEnabled, partial-unique slug, publishedAt handling
- Update `/Users/rohan/Documents/repos/rohan_batra/src/models/Chapter.ts` to include: status/visibility enums, order, storyDate normalization (YYYY-MM-DD → UTC midnight), wordCount computation, translationKey, publishedAt
- Do NOT add a new link model. Reuse existing `src/models/Character.ts` which already supports `bookId`, `role`, `significance`, and relationships.
- Compatibility: keep existing fields used today (e.g., `description`, `genre`, `orderIndex`, chapter `status` values). New fields must be optional to avoid breaking current admin APIs.
- Add optional `slug` fields to Book/Chapter (unique on non-deleted) for public pages; admin APIs should not require them.

T004. Verify SSR service (exists) and adjust if needed
- The service already exists at `/Users/rohan/Documents/repos/rohan_batra/src/lib/book-service.ts`.
- Validate behavior:
  - `listPublishedBooks({ language?, genre?, page?, limit? })` filters `visibility: 'public'` and paginates.
  - `getBookBySlug(slug)` returns only public books.
  - `listPublishedChapters(bookId)` sorts by chapter order and filters to published chapters.
  - `getChapterBySlugs(bookSlug, chapterSlug)` ensures both book and chapter are public/published.
- If any mismatch with model/visibility arises, update functions to map model status to “published” as `status === 'complete'` and sort by `orderIndex`.

T005. Admin Books API routes (reuse patterns)
- Paths under `/Users/rohan/Documents/repos/rohan_batra/src/app/api/admin/books`:
  - `route.ts` (GET list, POST create)
  - `[id]/route.ts` (GET, PUT, DELETE?trash|permanent)
  - `bulk/route.ts` (POST bulk actions)
  - `slug/exists/route.ts` (GET slug availability)
- Reuse: Clerk role checks, Zod schemas, trash/restore + slug conflict handling from existing admin routes

T006. Admin Chapters API routes (fix existing + add missing)
- Current status:
  - File exists: `/src/app/api/admin/books/[id]/chapters/route.ts` (GET/POST) but uses non-existent fields (`order`, `isPublished`, `status: 'draft'|'in-progress'|'completed'`).
  - File exists: `/src/app/api/admin/chapters/[id]/route.ts` (GET/PUT/DELETE) and incorrectly filters by `chapter.authorId` (field not in schema).
- Actions:
  - Update `/src/app/api/admin/books/[id]/chapters/route.ts` to map to the model:
    - Sort and persist by `orderIndex` instead of `order`.
    - Compute `isPublished` as `status === 'complete'` (do not store a boolean).
    - Map `summary` (API) ↔ `notes` (model).
    - Do not accept `wordCount` from client; let model pre-save derive it from `content`. After save, use actual `wordCount` to update the parent book’s `currentWordCount`.
    - For editor permissions, verify access via the parent book’s `authorId` (do not query `chapter.authorId`).
  - Add missing nested routes to match contracts:
    - `/src/app/api/admin/books/[bookId]/chapters/[chapterId]/route.ts` with `PUT` and `DELETE` implementing the same field mappings as above and checking access via the book.
    - `/src/app/api/admin/books/[bookId]/chapters/reorder/route.ts` (PUT) to reorder by `orderIndex` across a list.
  - Keep global `/src/app/api/admin/chapters/[id]/route.ts` but fix it:
    - Remove reliance on `chapter.authorId`; instead load the chapter, then load its book to validate editor access (book.authorId).
    - Apply the same field mappings (`orderIndex`, `notes`, `status` mapping) as the nested route.
- Compatibility mapping (align with existing tests and current model):
  - API `chapterNumber` ↔ model `orderIndex`.
  - API `summary` ↔ model `notes`.
  - API `isPublished` ↔ derived from `status === 'complete'`.
  - Ensure GET returns `chapters` sorted by `orderIndex` asc and includes fields:
    `_id, title, content, summary, chapterNumber, wordCount, isPublished, bookId, createdAt, updatedAt`.
  - POST accepts `{ title, content, summary?, chapterNumber }` and persists to `{ title, content, notes, orderIndex }`.
  - PUT accepts updates with same mapping; enforce editor-only access via parent book ownership.

  T007. Character integration (reuse existing Character model)
  - Current status: Nested route already exists at `/src/app/api/admin/books/[id]/characters/route.ts` with GET/POST (create-in-book).
  - Enhance: support attaching an existing character by ID (optional alternate POST), and a DELETE to detach (`character.bookId = null`).
  - Support search/filter by role/significance on GET.
  - Reuse Clerk roles + Zod validation; no new schema.

T008. Public pages (SSR via service; avoid public fetch APIs)
- Add pages under `/Users/rohan/Documents/repos/rohan_batra/src/app/books`:
  - `page.tsx` → list published books with optional filters (respect settings)
  - `[slug]/page.tsx` → book detail, only published/non-private chapters
  - `[slug]/[chapterSlug]/page.tsx` → chapter page with SEO metadata
- Use `src/lib/seo.ts` for metadata generation
 - Show characters on the book detail page using `CharacterModel.findByBook(book._id)`; group by role/significance like existing character views

T009. Admin UI (extend existing BooksManagement)
- Current status: `/src/app/admin/books/page.tsx` + `components/admin/books/BooksManagement.tsx` already provide list, search, filters, and create.
- Extend capabilities:
  - Add bulk actions (selection + actions) to list.
  - Add edit flow: `src/app/admin/books/[id]/page.tsx` with tabs:
    - Chapters: list, reorder, publish toggles; inline editor launch.
    - Characters: list, attach/detach existing, set role/significance.
  - Optional `new/page.tsx` if separate from inline create is preferred.

T010. Writing editor integration (reuse current editor patterns)
- Reuse existing rich editor setup/components used in journals (markdown paste → rich text, autosave, version history/diff)
- Add keyboard shortcuts per `research.md`

T011. Settings integration (extend existing SiteSetting)
- Add settings keys if missing: default timezone for story dates, default visibility for new books/chapters, analytics enablement
- Update existing Admin Settings UI to surface these controls (toggle/select), matching current minimal UI style

T012. Minimal analytics (verify)
- Admin analytics endpoints already aggregate books/chapters. If pageview analytics are toggled in settings, ensure public pages emit existing analytics events/hooks; otherwise skip.

T013. SEO + sitemap updates [P]
- Update `/Users/rohan/Documents/repos/rohan_batra/src/app/sitemap.ts` to include books/chapters
- Ensure `robots.ts` and `sitemap` include new routes where relevant

T014. Data integrity utilities [P]
- Add slug collision resolver (reuse existing util if present)
- Add helper to normalize `storyDate`

T015. Make contract tests pass (run and iterate)
- Run:
  - `pnpm test -r src/test/api-admin-books.contract.test.ts`
  - `pnpm test -r src/test/api-admin-chapters.contract.test.ts`
  - If created: `pnpm test -r src/test/api-public-books.contract.test.ts`
- Fix implementations until green

T016. Integration test from quickstart [P]
- File: `/Users/rohan/Documents/repos/rohan_batra/test/integration/books.quickstart.test.ts`
- Flow: create book → add chapters → publish some → verify public visibility and chapter ordering

T017. Docs and polish [P]
- Update `specs/006-feature-book-creation/quickstart.md` with any UI diffs
- Ensure admin pages follow existing look & feel (shadcn/ui, tables, switches, date inputs)

## Parallelization Notes
- T003–T004–T013–T014–T017 can run in parallel
- T005–T006 depend on models/services; T008–T009 depend on services
- T015 should run repeatedly after core tasks to guide fixes

## Agent Command Examples
- Run specific tests:
  - `pnpm test -r test/api-admin-books.contract.test.ts`
  - `pnpm test -r test/api-admin-chapters.contract.test.ts`
- Lint/format (existing scripts):
  - `pnpm lint && pnpm format`
