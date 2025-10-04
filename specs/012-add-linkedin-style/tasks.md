# Tasks: Professional Experience Management System

**Input**: Design documents from `/Users/rohan/Documents/repos/rohan_batra/specs/012-add-linkedin-style/`  
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript 5.x, Next.js 15.5.3, React 19, Mongoose 8.18.1
   → Structure: Next.js App Router (web application)
2. Load design documents ✅
   → data-model.md: Experience entity extracted
   → contracts/: 2 API specs (admin + public) extracted
   → quickstart.md: 13 test scenarios extracted
3. Generate tasks by category ✅
   → Setup: TypeScript config, dependencies check
   → Tests: Model tests, API tests, component tests, integration tests
   → Core: Experience model, types, service, utilities
   → APIs: 6 admin endpoints + 1 public endpoint
   → Components: 4 React components + utilities
   → Pages: 3 admin pages + 1 public page + homepage update
   → Polish: Navigation, SEO, performance, documentation
4. Apply task rules ✅
   → Different files = [P] for parallel
   → Tests before implementation (TDD where applicable)
   → Dependencies tracked
5. Number tasks sequentially (T001-T035) ✅
6. Generate dependency graph ✅
7. Validate completeness ✅
   → All contracts have implementation tasks
   → Experience entity has model task
   → All test scenarios covered
8. Return: SUCCESS (35 tasks ready for execution)
```

---

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths are absolute from repository root

## Path Conventions
- **Models**: `src/models/`
- **Types**: `src/types/`
- **Services**: `src/lib/services/`
- **Utils**: `src/lib/utils/`
- **API Routes**: `src/app/api/`
- **Pages**: `src/app/`
- **Components**: `src/components/`
- **Tests**: `src/test/` or `tests/`

---

## Phase 3.1: Setup & Foundation

### T001: Verify Dependencies
**Description**: Verify all required dependencies are installed (no new installs needed)  
**File**: `package.json` (verify only)  
**Actions**:
- Confirm mongoose@8.18.1 installed
- Confirm @dnd-kit packages installed (core, sortable, utilities)
- Confirm date-fns@4.1.0 installed
- Confirm next-mdx-remote@5.0.0 installed
- Confirm react-hook-form + zod installed
- Confirm vitest + testing-library installed
- Run `pnpm install` to ensure lock file updated

**Dependencies**: None  
**Estimated Time**: 10 minutes

---

### T002 [P]: Create Experience TypeScript Types
**Description**: Define TypeScript interfaces and types for Experience entity  
**File**: `src/types/experience.ts`  
**Actions**:
- Create `Experience` interface (matches public API response)
- Create `IExperience` interface (extends Mongoose Document)
- Create `EmploymentType` type (8 values)
- Create `ContentFormat` type ('rich-text' | 'markdown')
- Create `ExperienceCreateInput` type (form data)
- Create `ExperienceUpdateInput` type (partial form data)
- Export all types

**Dependencies**: None  
**Estimated Time**: 30 minutes

**Example**:
```typescript
export type EmploymentType = 
  | 'Full-time' 
  | 'Part-time' 
  | 'Self-employed' 
  | 'Freelance' 
  | 'Contract' 
  | 'Internship' 
  | 'Apprenticeship' 
  | 'Seasonal';

export type ContentFormat = 'rich-text' | 'markdown';

export interface Experience {
  _id: string;
  title: string;
  company: string;
  // ... rest of fields from data-model.md
}
```

---

### T003: Create Experience Mongoose Model
**Description**: Implement Experience model with validation and indexes  
**File**: `src/models/Experience.ts`  
**Actions**:
- Import mongoose and IExperience type
- Define ExperienceSchema with all fields from data-model.md
- Add field validation (required, trim, maxLength, enum)
- Add custom validators (date range, isCurrent logic)
- Add indexes: (displayOrder, startDate), (published, startDate), (startDate)
- Add timestamps: true
- Export Experience model

**Dependencies**: T002 (types)  
**Estimated Time**: 1 hour

**Key Validations**:
- title: required, max 200 chars
- company: required, max 200 chars
- employmentType: enum (8 types)
- startDate: required, Date
- endDate: optional, Date, must be >= startDate if present
- isCurrent + endDate: custom validator (isCurrent=true → endDate must be null)
- description: required, max 5000 chars
- skills: array of strings, max 20 items

---

### T004 [P]: Create Date & Duration Utilities
**Description**: Utility functions for date formatting and duration calculation  
**File**: `src/lib/utils/experience-utils.ts`  
**Actions**:
- Import date-fns (format, differenceInMonths)
- Function: `calculateDuration(startDate, endDate?, isCurrent)` → string
  - Returns "2 yrs 3 mos" or "3 mos" or "1 yr"
- Function: `formatDateRange(startDate, endDate?, isCurrent)` → string
  - Returns "Aug 2023 - Present · 1 yr 5 mos"
- Function: `calculateTotalYears(experiences[])` → number
  - Sum all durations, return total years as float
- Export all utilities

**Dependencies**: None  
**Estimated Time**: 45 minutes

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### T005 [P]: Model Tests for Experience
**Description**: Unit tests for Experience Mongoose model validation  
**File**: `src/test/models/experience.test.ts`  
**Actions**:
- Test: Valid experience document saves successfully
- Test: Required fields validation (title, company, startDate, location, description)
- Test: Employment type enum validation
- Test: Date validation (endDate >= startDate)
- Test: isCurrent logic (isCurrent=true → endDate must be null)
- Test: String length limits (title 200, description 5000)
- Test: Skills array max 20 items
- Test: Indexes exist on model
- Use Vitest + in-memory MongoDB or mocks

**Dependencies**: T003 (model created)  
**Estimated Time**: 1.5 hours

---

### T006 [P]: API Contract Tests - Admin Experience Endpoints
**Description**: Integration tests for admin API endpoints  
**File**: `src/test/api/admin/experience.test.ts`  
**Actions**:
- Test: POST /api/admin/experience (create)
  - Success: Valid data → 201, experience object returned
  - Fail: Missing required fields → 400 with validation errors
  - Fail: No auth → 401
  - Fail: Non-admin user → 403
- Test: GET /api/admin/experience (list)
  - Success: Returns paginated list
  - Success: Filters by published status
  - Success: Search by title/company
  - Fail: No auth → 401
- Test: GET /api/admin/experience/[id] (single)
  - Success: Returns experience by ID
  - Fail: Invalid ID → 404
  - Fail: No auth → 401
- Test: PUT /api/admin/experience/[id] (update)
  - Success: Updates and returns updated experience
  - Fail: Invalid data → 400
  - Fail: No auth → 401
- Test: DELETE /api/admin/experience/[id] (delete)
  - Success: Deletes experience → 200
  - Fail: Invalid ID → 404
  - Fail: No auth → 401
- Test: POST /api/admin/experience/reorder (batch update)
  - Success: Updates displayOrder for multiple items

**Dependencies**: T003 (model), T008+ (API routes - these tests MUST FAIL initially)  
**Estimated Time**: 2 hours

---

### T007 [P]: API Contract Tests - Public Experience Endpoint
**Description**: Integration tests for public API endpoint  
**File**: `src/test/api/experience.test.ts`  
**Actions**:
- Test: GET /api/experience
  - Success: Returns only published experiences
  - Success: Sorted by displayOrder then startDate desc
  - Success: Includes computed fields (duration, dateRange, totalYears)
  - Success: Limit parameter works (homepage uses limit=3)
  - Success: No auth required
  - Verify: Draft experiences NOT included

**Dependencies**: T012 (public API route - test MUST FAIL initially)  
**Estimated Time**: 1 hour

---

### T008 [P]: Component Tests - ExperienceCard
**Description**: Unit tests for ExperienceCard component  
**File**: `src/test/components/ExperienceCard.test.tsx`  
**Actions**:
- Test: Renders with all required props
- Test: Displays company logo (URL or placeholder)
- Test: Displays title, company, location
- Test: Displays formatted date range with duration
- Test: Displays employment type badge
- Test: Displays skills as chips
- Test: Renders description (truncated on card view)
- Test: Dark mode styling applied
- Use @testing-library/react + Vitest

**Dependencies**: T013+ (component - test MUST FAIL initially)  
**Estimated Time**: 1 hour

---

### T009 [P]: Integration Test - Experience Flow
**Description**: End-to-end test for complete user journey  
**File**: `src/test/integration/experience-flow.test.ts`  
**Actions**:
- Test Scenario: Admin creates experience → appears on homepage
  - Step 1: POST to create experience (published=true)
  - Step 2: Verify experience in database
  - Step 3: GET homepage data, verify experience in list
  - Step 4: GET /experience page, verify in timeline
- Test Scenario: Draft experience stays private
  - Step 1: POST to create experience (published=false)
  - Step 2: GET public API, verify NOT in list
  - Step 3: GET admin API, verify IS in list
- Test Scenario: Reorder experiences
  - Step 1: Create 3 experiences
  - Step 2: POST reorder with new order
  - Step 3: GET public API, verify new order
- Mock Clerk authentication

**Dependencies**: T008-T022 (all routes and components)  
**Estimated Time**: 2 hours

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T010: Implement Experience Service
**Description**: Business logic layer for experience operations  
**File**: `src/lib/services/experience-service.ts`  
**Actions**:
- Import Experience model, connectToDatabase
- Function: `getExperiences(filters, pagination)` - List with filters
- Function: `getExperienceById(id)` - Single experience
- Function: `createExperience(data)` - Create new
- Function: `updateExperience(id, data)` - Update existing
- Function: `deleteExperience(id)` - Delete
- Function: `reorderExperiences(updates[])` - Batch update displayOrder
- Function: `getPublishedExperiences(limit?)` - Public list
- Function: `enrichExperienceWithComputedFields(experience)` - Add duration, dateRange
- Function: `resolveCompanyLogo(experience)` - Handle Asset vs URL
- Use lean() queries for read operations
- Add error handling

**Dependencies**: T003 (model), T004 (utils)  
**Estimated Time**: 2 hours

---

### T011: Implement POST /api/admin/experience (Create)
**Description**: API endpoint to create new experience  
**File**: `src/app/api/admin/experience/route.ts` (POST handler)  
**Actions**:
- Import Clerk auth(), User model, Experience model, Zod
- Check authentication (userId exists)
- Check authorization (user.role === 'admin')
- Define ExperienceCreateSchema with Zod (all validations from data-model.md)
- Parse and validate request body
- Map contentFormat field if needed (like blog posts)
- Call experienceService.createExperience()
- Return 201 with created experience
- Error handling: 400 (validation), 401 (auth), 403 (forbidden), 500 (server error)

**Dependencies**: T010 (service), T006 (tests ready to pass)  
**Estimated Time**: 1 hour

---

### T012: Implement GET /api/admin/experience (List)
**Description**: API endpoint to list all experiences with pagination/filters  
**File**: `src/app/api/admin/experience/route.ts` (GET handler)  
**Actions**:
- Check auth + admin
- Parse query params: page, limit, published, search, employmentType, sortBy, sortOrder
- Build filters object
- Call experienceService.getExperiences(filters, pagination)
- Return experiences array + pagination metadata
- Error handling

**Dependencies**: T010 (service), T006 (tests)  
**Estimated Time**: 1 hour

---

### T013: Implement GET /api/admin/experience/[id] (Single)
**Description**: API endpoint to get single experience by ID  
**File**: `src/app/api/admin/experience/[id]/route.ts` (GET handler)  
**Actions**:
- Check auth + admin
- Await params (Next.js 15 pattern)
- Extract id from params
- Call experienceService.getExperienceById(id)
- Return 404 if not found
- Return experience object
- Error handling

**Dependencies**: T010 (service), T006 (tests)  
**Estimated Time**: 30 minutes

---

### T014: Implement PUT /api/admin/experience/[id] (Update)
**Description**: API endpoint to update existing experience  
**File**: `src/app/api/admin/experience/[id]/route.ts` (PUT handler)  
**Actions**:
- Check auth + admin
- Await params, extract id
- Define ExperienceUpdateSchema with Zod (all fields optional)
- Parse and validate request body
- Call experienceService.updateExperience(id, data)
- Return 404 if not found
- Return updated experience
- Error handling

**Dependencies**: T010 (service), T006 (tests)  
**Estimated Time**: 45 minutes

---

### T015: Implement DELETE /api/admin/experience/[id] (Delete)
**Description**: API endpoint to delete experience  
**File**: `src/app/api/admin/experience/[id]/route.ts` (DELETE handler)  
**Actions**:
- Check auth + admin
- Await params, extract id
- Call experienceService.deleteExperience(id)
- Return 404 if not found
- Return success message
- Error handling

**Dependencies**: T010 (service), T006 (tests)  
**Estimated Time**: 30 minutes

---

### T016: Implement POST /api/admin/experience/reorder (Reorder)
**Description**: API endpoint to batch update displayOrder  
**File**: `src/app/api/admin/experience/reorder/route.ts` (POST handler)  
**Actions**:
- Check auth + admin
- Define ReorderSchema with Zod: { updates: [{ id, displayOrder }] }
- Parse and validate request body
- Call experienceService.reorderExperiences(updates)
- Return success message + count updated
- Error handling

**Dependencies**: T010 (service), T006 (tests)  
**Estimated Time**: 45 minutes

---

### T017: Implement GET /api/experience (Public List)
**Description**: Public API endpoint to list published experiences  
**File**: `src/app/api/experience/route.ts` (GET handler)  
**Actions**:
- No auth required (public endpoint)
- Parse query params: limit (default 10), employmentType (optional filter)
- Call experienceService.getPublishedExperiences(limit)
- Enrich each experience with computed fields (duration, dateRange)
- Calculate totalYears across all experiences
- Return { experiences, totalYears }
- Error handling (500 only)

**Dependencies**: T010 (service), T004 (utils), T007 (tests)  
**Estimated Time**: 1 hour

---

## Phase 3.4: UI Components

### T018 [P]: Create ExperienceCard Component
**Description**: Reusable card component for displaying single experience  
**File**: `src/components/experience/ExperienceCard.tsx`  
**Actions**:
- Import Experience type, Image from next/image
- Props: experience (Experience), variant ('compact' | 'full')
- Render company logo (80x80, rounded, fallback to placeholder)
- Display title (bold), company (medium), employment type badge
- Display formatted date range + duration
- Display location with icon
- Display description (truncated in compact mode)
- Display skills as chips/badges
- Optional: company website link
- Tailwind styling matching existing cards
- Dark mode support
- Hover effects
- Make it a Client Component if interactive, otherwise Server Component

**Dependencies**: T002 (types), T004 (utils)  
**Estimated Time**: 2 hours

---

### T019 [P]: Create ExperienceTimeline Component
**Description**: Timeline layout component for /experience page  
**File**: `src/components/experience/ExperienceTimeline.tsx`  
**Actions**:
- Import Experience type, ExperienceCard
- Props: experiences (Experience[])
- Desktop: Vertical timeline with connector line between entries
- Mobile: Stacked cards without connector
- Each entry shows ExperienceCard in 'full' variant
- Responsive breakpoints (Tailwind: md, lg)
- Framer Motion: Fade-in animation on scroll
- Empty state: "No experiences yet"
- Make it a Client Component for animations

**Dependencies**: T018 (ExperienceCard)  
**Estimated Time**: 1.5 hours

---

### T020 [P]: Create ExperienceForm Component
**Description**: Admin form for creating/editing experiences  
**File**: `src/components/experience/ExperienceForm.tsx`  
**Actions**:
- Import react-hook-form, zodResolver, ShadCN form components
- Import ContentEditor component (reuse from blog)
- Props: experience? (Experience - for edit mode), onSubmit, onCancel
- Define formSchema with Zod (same as API validation)
- Fields:
  - title (Input)
  - company (Input)
  - companyWebsite (Input, URL)
  - companyLogo (Input, URL + optional upload button)
  - employmentType (Select dropdown - 8 options)
  - startDate (Input type="month")
  - endDate (Input type="month", disabled if isCurrent)
  - isCurrent (Switch)
  - location (Input)
  - description (ContentEditor with format toggle)
  - skills (Multi-select or comma-separated input)
  - displayOrder (Number input)
  - published (Switch)
- Form validation with error messages
- Submit button (Create / Update)
- Cancel button
- Loading state during submission
- Make it a Client Component

**Dependencies**: T002 (types)  
**Estimated Time**: 3 hours

---

### T021 [P]: Create ExperienceSection Component
**Description**: Homepage section component displaying recent experiences  
**File**: `src/components/experience/ExperienceSection.tsx`  
**Actions**:
- Import Experience type, ExperienceCard, Link
- Props: experiences (Experience[], limited to 3)
- Section structure matching existing homepage sections:
  - Container: py-16, px-6, max-w-6xl, gradient background
  - Header: "Professional Experience" title + description
  - "View Full Experience →" link to /experience
  - Grid: 1 column mobile, 2 tablet, 3 desktop
  - Map experiences to ExperienceCard (compact variant)
- Conditional rendering: Hide section if experiences.length === 0
- Make it a Server Component

**Dependencies**: T018 (ExperienceCard)  
**Estimated Time**: 1 hour

---

## Phase 3.5: Admin Pages

### T022: Create Admin Experience List Page
**Description**: Admin page to list and manage all experiences with drag-drop  
**File**: `src/app/admin/experience/page.tsx`  
**Actions**:
- Import Clerk auth, User model, experienceService
- Check auth + admin (server-side)
- Fetch all experiences from experienceService
- Client Component section:
  - Import DndContext, SortableContext from @dnd-kit
  - Display experiences in sortable list/table
  - Show: title, company, employment type, dates, published status
  - Actions: Edit (link), Delete (button with confirmation)
  - Drag handles for reordering
  - On drag end: Call POST /api/admin/experience/reorder
- "Add Experience" button (link to create page)
- Empty state if no experiences
- Use SWR for client-side data fetching + mutations
- Dark mode support

**Dependencies**: T011-T016 (API routes), T018 (card for display)  
**Estimated Time**: 2.5 hours

---

### T023: Create Admin Experience Create Page
**Description**: Admin page to create new experience  
**File**: `src/app/admin/experience/create/page.tsx`  
**Actions**:
- Import Clerk auth, User model, ExperienceForm
- Check auth + admin (server-side)
- Render ExperienceForm with no initial data
- onSubmit handler:
  - POST to /api/admin/experience
  - Show success toast
  - Redirect to /admin/experience
- onCancel handler: Navigate back to list
- Page title: "Create New Experience"
- Make it a Client Component (for form interactivity)

**Dependencies**: T020 (ExperienceForm), T011 (POST API)  
**Estimated Time**: 45 minutes

---

### T024: Create Admin Experience Edit Page
**Description**: Admin page to edit existing experience  
**File**: `src/app/admin/experience/edit/[id]/page.tsx`  
**Actions**:
- Import Clerk auth, User model, experienceService, ExperienceForm
- Check auth + admin (server-side)
- Await params (Next.js 15 pattern), extract id
- Fetch experience by id from experienceService
- Return 404 if not found
- Render ExperienceForm with experience data
- onSubmit handler:
  - PUT to /api/admin/experience/[id]
  - Show success toast
  - Redirect to /admin/experience
- onCancel handler: Navigate back to list
- Page title: "Edit Experience"
- Make it a Client Component

**Dependencies**: T020 (ExperienceForm), T014 (PUT API)  
**Estimated Time**: 1 hour

---

## Phase 3.6: Public Pages

### T025: Create Public Experience Timeline Page
**Description**: Public page displaying all published experiences in timeline  
**File**: `src/app/experience/page.tsx`  
**Actions**:
- Server Component (for SEO)
- Export generateMetadata() function:
  - title: "Professional Experience | [Site Name]"
  - description: "Browse my professional career history and work experiences"
  - OpenGraph tags
- Fetch published experiences from experienceService
- Calculate totalYears from experiences
- Render page structure:
  - Page header with title
  - Summary: "X years of professional experience"
  - Optional: "Download Resume" button (link to PDF)
  - ExperienceTimeline component with experiences
  - Empty state: "No experiences to display yet"
- Export revalidate = 3600 (ISR 1-hour)
- Add JSON-LD structured data (Person with worksFor/hasOccupation)
- Dark mode support

**Dependencies**: T019 (ExperienceTimeline), T017 (public API)  
**Estimated Time**: 2 hours

---

### T026: Update Homepage with Experience Section
**Description**: Add ExperienceSection to homepage  
**File**: `src/app/page.tsx` (UPDATE existing file)  
**Actions**:
- Import experienceService, ExperienceSection
- In existing async component function:
  - Fetch top 3 published experiences: experienceService.getPublishedExperiences(3)
  - Add to Promise.all() with other homepage data fetches
- Add ExperienceSection in layout:
  - Position: After SkillsSection, before Featured Projects
  - Pass experiences prop
  - Conditional render: Only show if experiences.length > 0
- Ensure gradient backgrounds match existing sections
- No layout shift (reserve space or use min-height)

**Dependencies**: T021 (ExperienceSection), T017 (public API)  
**Estimated Time**: 30 minutes

---

## Phase 3.7: Polish & Integration

### T027: Add Experience to Admin Navigation
**Description**: Add "Experience" link to admin panel navigation  
**File**: `src/app/admin/layout.tsx` or `src/components/admin/AdminNav.tsx` (whichever exists)  
**Actions**:
- Locate admin navigation component
- Add new nav item:
  - Label: "Experience"
  - Icon: Briefcase or similar (from lucide-react)
  - href: "/admin/experience"
  - Order: After "Blog" or "Portfolio", before "Settings"
- Ensure active state styling works
- Dark mode compatible

**Dependencies**: T022 (admin list page exists)  
**Estimated Time**: 15 minutes

---

### T028 [P]: Add SEO Metadata & JSON-LD Structured Data
**Description**: Enhance /experience page with rich structured data  
**File**: `src/app/experience/page.tsx` (UPDATE)  
**Actions**:
- Enhance generateMetadata():
  - Add OpenGraph image
  - Add Twitter card
  - Add keywords
- Add JSON-LD structured data in page:
  ```typescript
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "[Your Name]",
    "hasOccupation": experiences.map(exp => ({
      "@type": "OrganizationRole",
      "roleName": exp.title,
      "startDate": exp.startDate,
      "endDate": exp.endDate || undefined,
      "organization": {
        "@type": "Organization",
        "name": exp.company,
        "url": exp.companyWebsite
      }
    }))
  };
  ```
- Inject script tag in page
- Test with Google Rich Results Test

**Dependencies**: T025 (page created)  
**Estimated Time**: 45 minutes

---

### T029 [P]: Performance Optimization
**Description**: Optimize images, queries, and rendering for performance  
**File**: Multiple files  
**Actions**:
- **Images**:
  - Verify next/image used for all company logos
  - Add domains to next.config.ts (if using external URLs)
  - Set loading="lazy" on images below fold
  - Add placeholder="blur" where applicable
- **API Queries**:
  - Verify lean() used on all read queries
  - Add .select() to limit fields if needed
  - Verify indexes exist on Experience model
- **Caching**:
  - Confirm ISR on /experience page (revalidate: 3600)
  - Add cache headers to API responses if needed
- **Bundle Size**:
  - Verify @dnd-kit only loaded on admin pages
  - Check no unnecessary dependencies imported
- Run Lighthouse audit: Target score > 90

**Dependencies**: All implementation complete  
**Estimated Time**: 1 hour

---

### T030 [P]: Dark Mode Styling Verification
**Description**: Ensure all experience components support dark mode  
**File**: Multiple component files  
**Actions**:
- Test each component in dark mode:
  - ExperienceCard: text contrast, background, borders
  - ExperienceTimeline: connector line visible, cards readable
  - ExperienceForm: inputs, labels, switches styled
  - ExperienceSection: gradient backgrounds work
  - Admin list page: table/list readable
- Verify Tailwind dark: classes applied correctly
- Check employment type badges have good contrast
- Verify company logos visible against dark backgrounds
- Test on homepage and /experience page
- Fix any contrast issues (WCAG AA minimum)

**Dependencies**: T018-T021 (components created)  
**Estimated Time**: 1 hour

---

### T031 [P]: Component Unit Tests
**Description**: Add unit tests for utility functions and edge cases  
**File**: `src/test/utils/experience-utils.test.ts`  
**Actions**:
- Test calculateDuration():
  - Current position (no end date, isCurrent=true)
  - Past position with end date
  - Same month start and end (0 months)
  - Less than 1 year (show months only)
  - Exactly 1 year (show years only)
  - Years + months
- Test formatDateRange():
  - Current position ("Present")
  - Past position with dates
  - Format: "MMM yyyy - MMM yyyy · duration"
- Test calculateTotalYears():
  - Multiple experiences
  - Overlapping experiences
  - Return float (e.g., 5.5 years)
- Test resolveCompanyLogo():
  - Asset takes priority
  - Fallback to URL
  - Fallback to placeholder

**Dependencies**: T004 (utils created)  
**Estimated Time**: 1.5 hours

---

### T032 [P]: Update Repository Documentation
**Description**: Document the experience feature in project README  
**File**: `README.md` (UPDATE) or `docs/FEATURES.md`  
**Actions**:
- Add "Professional Experience" section to features list
- Document:
  - What: LinkedIn-style experience management
  - Admin: CRUD interface at /admin/experience
  - Public: Timeline at /experience, section on homepage
  - Tech: Mongoose model, drag-drop with @dnd-kit, MDX support
- Add API endpoints to API documentation (if exists)
- Update admin panel screenshots (if exists)
- Add to deployment checklist:
  - Verify MongoDB indexes created
  - Verify Clerk auth configured
  - Seed production data via admin panel

**Dependencies**: All implementation complete  
**Estimated Time**: 30 minutes

---

### T033: Run Manual Testing Scenarios
**Description**: Execute all 13 quickstart test scenarios  
**File**: `specs/012-add-linkedin-style/quickstart.md` (reference)  
**Actions**:
- Start dev server: `pnpm dev`
- Execute each scenario in quickstart.md:
  1. ✅ Admin creates first experience
  2. ✅ Add past experience with end date
  3. ✅ Edit existing experience
  4. ✅ Reorder via drag-and-drop
  5. ✅ Draft not publicly visible
  6. ✅ Delete experience
  7. ✅ MDX description support
  8. ✅ Responsive design (mobile/tablet/desktop)
  9. ✅ SEO and structured data
  10. ✅ Performance (< 2s load, Lighthouse > 90)
  11. ✅ Error handling and validation
  12. ✅ Dark mode support
  13. ✅ Skills filter (if implemented)
- Document any issues found
- Create bug tasks for any failures
- Mark all scenarios complete in quickstart.md

**Dependencies**: All tasks T001-T032 complete  
**Estimated Time**: 3 hours

---

### T034: Run Automated Test Suite
**Description**: Execute all Vitest tests and verify coverage  
**File**: Terminal command  
**Actions**:
- Run `pnpm test` - All tests should pass
- Run `pnpm test:coverage` - Verify > 80% coverage
- Review coverage report:
  - Models: Experience model covered
  - API routes: All admin + public endpoints covered
  - Components: Card, Timeline, Form covered
  - Utils: Duration/date functions covered
- Fix any failing tests
- Investigate low coverage areas
- Run `pnpm typecheck` - No TypeScript errors
- Generate coverage badge (optional)

**Dependencies**: T005-T009 (tests), all implementation  
**Estimated Time**: 30 minutes (if tests pass)

---

### T035: Final Code Review & Cleanup
**Description**: Review all code, remove TODOs, ensure consistency  
**File**: All created/modified files  
**Actions**:
- Code quality:
  - Remove console.logs (except intentional logging)
  - Remove commented code
  - Remove TODO comments (convert to issues if needed)
  - Consistent formatting (run `pnpm lint`)
- Consistency check:
  - All components follow existing patterns
  - All API routes have same error handling
  - All forms use same validation approach
  - Naming conventions consistent
- Documentation:
  - All complex functions have JSDoc comments
  - All components have prop type documentation
  - README updated
- Git:
  - Review all changed files in branch
  - Ensure no sensitive data committed
  - Squash or organize commits logically
- Create PR with:
  - Feature description
  - Link to spec.md
  - Screenshots of UI
  - Checklist from quickstart.md
  - Note any known limitations

**Dependencies**: All tasks T001-T034 complete  
**Estimated Time**: 1 hour

---

## Dependencies Graph

```
Setup & Foundation (T001-T004)
    │
    ├─> Tests First (T005-T009) [Parallel]
    │
    ├─> Core Implementation (T010-T017)
    │   └─> T010 (Service) required by all API routes
    │
    ├─> UI Components (T018-T021) [Parallel after T002, T004]
    │
    ├─> Admin Pages (T022-T024)
    │   └─> Requires: T011-T016 (APIs), T020 (Form)
    │
    ├─> Public Pages (T025-T026)
    │   └─> Requires: T017 (API), T019 (Timeline), T021 (Section)
    │
    └─> Polish & Integration (T027-T035)
        └─> Requires: All above complete
```

**Critical Path**: T001 → T002 → T003 → T010 → T011-T017 → T022-T026 → T033-T035  
**Parallelizable**: T002+T004, T005-T009, T011-T016, T018-T021, T028-T032

---

## Parallel Execution Examples

### Batch 1: Setup & Types (Can run together)
```bash
# Task T002: Create types
task: "Create Experience TypeScript types in src/types/experience.ts with EmploymentType enum, ContentFormat type, Experience interface, IExperience interface, and input types"

# Task T004: Create utilities (parallel, different file)
task: "Create date and duration utility functions in src/lib/utils/experience-utils.ts with calculateDuration(), formatDateRange(), and calculateTotalYears()"
```

### Batch 2: Tests (All can run in parallel - different files)
```bash
# Task T005
task: "Write model tests for Experience in src/test/models/experience.test.ts covering validation, required fields, enums, date logic, and indexes"

# Task T006
task: "Write API integration tests for admin endpoints in src/test/api/admin/experience.test.ts covering all CRUD operations and auth checks"

# Task T007
task: "Write API integration tests for public endpoint in src/test/api/experience.test.ts covering published filter and computed fields"

# Task T008
task: "Write component tests for ExperienceCard in src/test/components/ExperienceCard.test.tsx covering rendering, props, and dark mode"

# Task T009
task: "Write integration test for experience flow in src/test/integration/experience-flow.test.ts covering create, publish, and display on homepage"
```

### Batch 3: API Routes (Can run in parallel - different route files)
```bash
# T011
task: "Implement POST /api/admin/experience endpoint in src/app/api/admin/experience/route.ts with auth, validation, and creation logic"

# T012
task: "Implement GET /api/admin/experience endpoint in src/app/api/admin/experience/route.ts with pagination, filtering, and search"

# T017
task: "Implement GET /api/experience endpoint in src/app/api/experience/route.ts returning published experiences with computed fields"
```

### Batch 4: UI Components (All can run in parallel - different files)
```bash
# T018
task: "Create ExperienceCard component in src/components/experience/ExperienceCard.tsx with logo, title, company, dates, description, and skills"

# T019
task: "Create ExperienceTimeline component in src/components/experience/ExperienceTimeline.tsx with timeline layout and animations"

# T020
task: "Create ExperienceForm component in src/components/experience/ExperienceForm.tsx with all fields, validation, and ContentEditor integration"

# T021
task: "Create ExperienceSection component in src/components/experience/ExperienceSection.tsx for homepage display"
```

### Batch 5: Polish (Can run in parallel - different concerns)
```bash
# T028
task: "Add SEO metadata and JSON-LD structured data to src/app/experience/page.tsx"

# T029
task: "Optimize performance: verify images use next/image, queries use lean(), ISR configured, run Lighthouse audit"

# T030
task: "Verify dark mode styling on all experience components and pages"

# T031
task: "Write unit tests for utility functions in src/test/utils/experience-utils.test.ts"

# T032
task: "Update README.md with experience feature documentation, API endpoints, and deployment notes"
```

---

## Task Execution Notes

### Before Starting
- ✅ Ensure on branch: `012-add-linkedin-style`
- ✅ Pull latest changes from main
- ✅ Run `pnpm install` to verify dependencies
- ✅ Have design docs open: data-model.md, contracts/, quickstart.md

### During Implementation
- **TDD Approach**: Write tests (T005-T009) before implementation (T010-T017)
- **Incremental Commits**: Commit after each completed task
- **Test After Each Task**: Run `pnpm test` to ensure no regressions
- **Type Check**: Run `pnpm typecheck` frequently
- **Dev Server**: Keep `pnpm dev` running to catch runtime errors

### Estimation Guidelines
- **Simple Tasks** (types, utils, single endpoint): 30-60 minutes
- **Medium Tasks** (components, API routes): 1-2 hours
- **Complex Tasks** (forms, pages with drag-drop): 2-3 hours
- **Testing Tasks**: 1-2 hours per test file
- **Integration Tasks**: 2-3 hours

**Total Estimated Time**: 35 tasks × ~1.2 hours avg = ~42 hours (5-6 days)  
**With Parallel Execution**: Could reduce to 3-4 days with 2-3 developers

---

## Validation Checklist

After completing all tasks, verify:

- [x] All 35 tasks marked complete
- [x] All tests passing (`pnpm test`)
- [x] TypeScript compiles without errors (`pnpm typecheck`)
- [x] All 13 quickstart scenarios pass (T033)
- [x] Test coverage > 80% (T034)
- [x] Lighthouse performance score > 90 (T029)
- [x] Dark mode fully functional (T030)
- [x] SEO metadata present (T028)
- [x] No console errors in browser
- [x] No TypeScript errors in IDE
- [x] All API endpoints documented (T032)
- [x] PR created with description and screenshots (T035)

**When all items checked**: Feature is ready for code review and merge to main! 🎉

---

## Troubleshooting

**Issue**: Tests failing after implementation  
**Solution**: Review test assertions, ensure mock data matches schema, check async/await

**Issue**: Drag-drop not working  
**Solution**: Verify @dnd-kit imports correct, check DndContext wrapper, test without strict mode

**Issue**: Images not loading  
**Solution**: Add image domains to next.config.ts, check CORS, verify URLs accessible

**Issue**: TypeScript errors in forms  
**Solution**: Ensure Zod schema matches type definitions, check react-hook-form types

**Issue**: API returns 401/403  
**Solution**: Check Clerk auth setup, verify user.role in database, test with valid admin token

**Issue**: Performance score low  
**Solution**: Enable ISR, optimize images (next/image), lazy load below fold, check bundle size

---

**Tasks Generated**: 35  
**Estimated Total Time**: 40-45 hours  
**Parallel Opportunities**: 15 tasks marked [P]  
**Critical Path**: ~25 hours (if serialized)  
**With 3 Developers**: Could complete in 3-4 days

Ready for implementation! 🚀
