# Research: Professional Experience Management System

**Feature**: LinkedIn-style experience management  
**Phase**: 0 - Research & Technical Discovery  
**Date**: January 4, 2025

## Overview
This document consolidates research findings for implementing a professional experience management system consistent with the existing Next.js 15 codebase patterns.

---

## 1. Existing Codebase Patterns

### Database Models (Mongoose)
**Research Question**: How are models structured in the existing codebase?

**Findings**:
- **Pattern**: TypeScript interfaces extending Mongoose Document + Schema definition
- **Example**: `src/models/BlogPost.ts`
  - Interface `IBlogPost` extends `Document` with typed ObjectId references
  - Schema includes validation (required, trim, maxlength, enum)
  - Indexes on slug fields (unique: true)
  - Timestamps enabled by default
  - References to other models via `Schema.Types.ObjectId` with ref
  
**Decision**: Follow BlogPost model pattern for Experience model
- Use `IExperience extends Document` interface
- Define ExperienceSchema with Mongoose validation
- Add compound index on (displayOrder, startDate) for sorting
- Support both featured image URL and Asset reference

**Rationale**: Consistency with existing models reduces cognitive load and enables code reuse

---

## 2. API Route Patterns

### Admin CRUD Operations
**Research Question**: What's the standard API structure for admin operations?

**Findings** from `src/app/api/admin/blog-posts/`:
- **POST** (create): Zod validation → Mongoose save → return created entity
- **GET** (list): Query params (page, limit, search, filters) → paginated results
- **GET** (single): `[id]/route.ts` → findById with lean()
- **PUT** (update): `[id]/route.ts` → findByIdAndUpdate with validation
- **DELETE**: `[id]/route.ts` → findByIdAndDelete with soft delete option

**Authentication Pattern**:
```typescript
const { userId } = await auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const user = await User.findOne({ clerkId: userId });
if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

**Validation Pattern**:
```typescript
import { z } from 'zod';
const CreateSchema = z.object({ /* fields */ });
const validatedData = CreateSchema.parse(await request.json());
```

**Decision**: Mirror BlogPost API structure for Experience endpoints
- `/api/admin/experience` - POST (create), GET (list with pagination)
- `/api/admin/experience/[id]` - GET (single), PUT (update), DELETE (delete)
- `/api/experience` - Public GET (published only, no auth required)

**Rationale**: Established pattern is well-tested and understood by the codebase

---

## 3. Content Management Patterns

### Rich Text & MDX Support
**Research Question**: How should experience descriptions support rich formatting?

**Findings**:
- **BlogPost Model** has dual content support:
  - `content` field for rich-text/HTML (required)
  - `markdown` field for MDX content (optional)
  - `contentType` enum: 'html' | 'rich-text' | 'markdown'
- **ContentEditor Component**: Toggles between TipTap (rich-text) and CodeMirror (MDX)
- **MDXPreview Component**: Renders MDX with next-mdx-remote

**Decision**: Support both rich-text and MDX for experience descriptions
- Add `description` (String, required) - main content
- Add `descriptionFormat` enum: 'rich-text' | 'markdown' (default: 'rich-text')
- Reuse existing ContentEditor component in admin form
- Reuse MDXPreview for rendering markdown descriptions

**Rationale**: Users already familiar with content editor, no new learning curve

---

## 4. Image Management

### Company Logo Storage
**Research Question**: How should company logos be stored and displayed?

**Findings** from Asset model and CloudinaryService:
- **Asset Model**: Stores cloudinary URLs with metadata (publicId, format, width, height)
- **Upload Flow**: Client uploads → Cloudinary API → Save Asset document → Reference in parent
- **BlogPost Pattern**: Has both `featuredImage` (ObjectId ref) and `featuredImageUrl` (String)
- **Display**: Use next/image for optimization with fill/contain modes

**Decision**: Support both URL input and Asset upload for company logos
- `companyLogo` field (String, optional) - Direct URL for simplicity
- `companyLogoAsset` field (ObjectId ref 'Asset', optional) - For uploaded images
- Display logic: Prioritize Asset, fallback to URL, fallback to default placeholder
- Use next/image with `width={80} height={80}` for consistent sizing

**Rationale**: Flexible approach supports both quick URL input and proper asset management

---

## 5. Homepage Section Integration

### Section Layout Patterns
**Research Question**: How are homepage sections structured?

**Findings** from `src/app/page.tsx`:
- **Structure**: Multiple async sections with individual data fetching
- **Pattern**: 
  ```tsx
  <section className='py-16 px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
    <div className='mx-auto max-w-6xl'>
      <div className='flex items-center justify-between mb-12'>
        <div>
          <h2>Section Title</h2>
          <p>Section description</p>
        </div>
        <Link href='/resource'>View All →</Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {/* Cards */}
      </div>
    </div>
  </section>
  ```
- **Data Fetching**: Top-level async components with Promise.all for parallel fetching
- **Empty States**: Sections conditionally render or show fallback content

**Decision**: Add ExperienceSection component after SkillsSection
- Fetch top 3 most recent published experiences
- Use similar grid layout (timeline on desktop, cards on mobile)
- Include "View Full Experience →" link to `/experience` page
- Hide section if no published experiences exist

**Rationale**: Maintains visual consistency and user expectations from existing sections

---

## 6. Form Patterns & Validation

### Admin Form Structure
**Research Question**: How are admin forms structured?

**Findings** from blog/portfolio admin pages:
- **Library**: react-hook-form with @hookform/resolvers/zod
- **Pattern**:
  ```tsx
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { /* ... */ }
  });
  ```
- **Components**: ShadCN Form, Input, Textarea, Select, Switch, Button
- **Submission**: POST/PUT to API → SWR mutate → Redirect or toast notification
- **Image Upload**: Separate upload button → Cloudinary → Store URL

**Decision**: Create ExperienceForm component with react-hook-form
- Fields: title, company, companyWebsite, employmentType (Select), startDate, endDate, isCurrent (Switch), location, description (ContentEditor), skills (multi-select), companyLogo (URL input + upload button)
- Validation: Zod schema with date range validation, URL validation
- Reuse existing Form components from ShadCN
- Date inputs: Use HTML date input (month-year picker)

**Rationale**: Proven form pattern with excellent UX and validation

---

## 7. Routing & SEO

### Public Page Structure
**Research Question**: How should the `/experience` route be structured for SEO?

**Findings** from `/blog` and `/portfolio` pages:
- **Metadata**: Export `generateMetadata` function with title, description, OpenGraph
- **Structured Data**: Include JSON-LD for rich results (Article, BreadcrumbList)
- **Static Generation**: Use `export const dynamic = 'force-static'` or ISR with revalidate
- **Layout**: Server Component for data fetching, Client Components for interactivity

**Decision**: Create `/app/experience/page.tsx` as Server Component
- Export metadata with title "Professional Experience | [Site Name]"
- Include Person schema with WorkExperience structured data
- Fetch all published experiences server-side
- Use ExperienceTimeline client component for display
- Enable ISR with 1-hour revalidation

**Rationale**: SEO-optimized, fast loading, automatically updates on changes

---

## 8. Date Handling & Duration Calculation

### Date Storage & Display
**Research Question**: How should dates and durations be handled?

**Findings**:
- **date-fns** already in dependencies (v4.1.0)
- **Pattern**: Store as ISO strings or Date objects in MongoDB
- **Display**: Format with `format()`, calculate differences with `differenceInMonths()`

**Decision**: Use Date objects and date-fns utilities
- Store `startDate` and `endDate` as Date type in MongoDB
- `isCurrent` boolean to indicate ongoing position
- Duration calculation:
  ```typescript
  const months = differenceInMonths(endDate || new Date(), startDate);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} yrs ${remainingMonths} mos`;
  ```
- Input: HTML month input (`<input type="month">`) returns "YYYY-MM" format

**Rationale**: date-fns provides excellent date utilities, already integrated

---

## 9. Drag-and-Drop Reordering

### Reordering Implementation
**Research Question**: How to implement drag-and-drop for experience ordering?

**Findings**:
- **@dnd-kit** already in dependencies (core, sortable, utilities)
- **Usage**: Character forms feature uses DndContext + SortableContext
- **Pattern**: 
  - Wrap list in DndContext
  - Map items with SortableContext
  - Handle onDragEnd to update order
  - Update displayOrder field in database

**Decision**: Use @dnd-kit for admin experience list reordering
- Add `displayOrder` field (Number, indexed) to Experience model
- Implement DndContext in admin list page
- On drag end: Update all affected items' displayOrder via batch API call
- Sort experiences by displayOrder ascending (newest manual order first) or startDate descending (fallback)

**Rationale**: Consistent with existing drag-and-drop implementation, proven library

---

## 10. Skills/Tags Integration

### Taxonomy Management
**Research Question**: Should skills be shared with portfolio/blog or separate?

**Findings**:
- **BlogPost**: Has `tags` field (array of strings)
- **Project**: Has `technologies` field (array of strings)
- **No shared taxonomy model** currently exists
- **Display**: Tags rendered as badges/chips with filter links

**Decision**: Use simple string array for experience skills (initial implementation)
- `skills` field: [String] in Experience model
- Admin form: Comma-separated input or CreatableSelect component
- Display: Chips/badges similar to blog tags
- **Future Enhancement**: Create shared Skill taxonomy model if needed

**Rationale**: YAGNI - Start simple, iterate if cross-referencing becomes valuable

---

## 11. Performance Considerations

### Optimization Strategies
**Research Question**: How to ensure fast loading with images and content?

**Findings** from existing codebase:
- **Images**: next/image with lazy loading by default
- **API**: Mongoose lean() queries for read-only data (faster)
- **Pagination**: Limit queries with skip/limit for lists
- **Caching**: ISR (Incremental Static Regeneration) for public pages

**Decision**: Implement performance best practices
- Use `lean()` for all read queries (homepage, public page)
- Limit homepage to 3 experiences (configurable via query)
- Lazy load company logos with next/image
- Enable ISR with 1-hour revalidate on public pages
- Add indexes: (displayOrder), (startDate), (published, startDate)
- Limit description preview to 200 characters on cards

**Rationale**: Proactive optimization prevents performance issues at scale

---

## 12. Testing Strategy

### Test Coverage
**Research Question**: What tests are needed for this feature?

**Findings** from existing test setup:
- **Unit Tests**: Vitest with @testing-library/react
- **Integration Tests**: API route testing with mocked DB
- **E2E**: Manual testing or Playwright (not currently in deps)

**Decision**: Implement comprehensive test coverage
1. **Model Tests** (`tests/models/experience.test.ts`):
   - Schema validation (required fields, enums)
   - Date validation (start before end)
   - Duration calculation methods
   
2. **API Tests** (`tests/api/admin/experience.test.ts`):
   - Auth checks (401 without auth, 403 without admin)
   - CRUD operations (create, read, update, delete)
   - Validation errors (invalid dates, missing fields)
   - Pagination and filtering
   
3. **Component Tests** (`tests/components/experience/*.test.tsx`):
   - ExperienceCard renders correctly
   - ExperienceForm validation and submission
   - ExperienceTimeline sorting and display
   
4. **Integration Tests** (`tests/integration/experience-flow.test.ts`):
   - Admin creates experience → appears on homepage
   - Reordering updates display order
   - Draft experiences don't appear publicly

**Rationale**: High test coverage prevents regressions and documents behavior

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Model** | Follow BlogPost pattern with Mongoose + TypeScript | Consistency with existing codebase |
| **API** | Mirror BlogPost API structure (admin + public routes) | Established, well-tested pattern |
| **Content** | Support rich-text and MDX via ContentEditor | Reuse existing editor component |
| **Images** | Support URL input and Asset upload for logos | Flexible for quick setup and proper management |
| **Homepage** | Add section after Skills with 3 recent experiences | Maintains visual flow and consistency |
| **Forms** | react-hook-form + Zod + ShadCN components | Proven form pattern with excellent UX |
| **Routing** | Server Component at `/experience` with ISR | SEO-optimized with automatic updates |
| **Dates** | Date objects with date-fns utilities | Already integrated, excellent library |
| **Reordering** | @dnd-kit with displayOrder field | Consistent with existing drag-and-drop |
| **Skills** | String array (simple), iterate later if needed | YAGNI - start simple |
| **Performance** | lean() queries, ISR, next/image, indexes | Proactive optimization |
| **Testing** | Vitest with model/API/component/integration tests | Comprehensive coverage prevents regressions |

---

## Alternatives Considered

### 1. Separate Timeline Component Library
**Alternative**: Extract timeline as reusable library  
**Rejected Because**: YAGNI - only one use case currently, premature abstraction

### 2. GraphQL API
**Alternative**: Use GraphQL instead of REST  
**Rejected Because**: Entire codebase uses REST, consistency is more valuable

### 3. Separate Skills Taxonomy Model
**Alternative**: Create shared Skill model with references  
**Rejected Because**: No clear need for cross-referencing yet, can refactor later

### 4. Real-time Updates
**Alternative**: WebSocket for live admin updates  
**Rejected Because**: Single-user admin panel, SWR polling sufficient

### 5. PDF Resume Auto-Generation
**Alternative**: Generate PDF from experience data  
**Rejected Because**: Out of initial scope, can be Phase 2 enhancement

---

## Open Questions & Decisions

✅ **All technical unknowns resolved** - No NEEDS CLARIFICATION remaining

Ready to proceed to Phase 1: Design & Contracts
