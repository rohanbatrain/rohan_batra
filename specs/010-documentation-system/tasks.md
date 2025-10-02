# Tasks: Enterprise Documentation System

## Phase 1: Foundation & Data Models ✅

### 1.1 Database Models
- [x] Create `DocProject` model in `src/models/DocProject.ts`
- [x] Create `DocSection` model in `src/models/DocSection.ts`
- [x] Create `DocPage` model in `src/models/DocPage.ts`
- [ ] Add migrations/indexes to existing MongoDB setup

### 1.2 Admin API - Documentation Projects
- [x] POST `/api/admin/docs/projects/route.ts` - Create project
- [x] GET `/api/admin/docs/projects/route.ts` - List projects
- [ ] GET `/api/admin/docs/projects/[id]/route.ts` - Get details
- [ ] PUT `/api/admin/docs/projects/[id]/route.ts` - Update project
- [ ] DELETE `/api/admin/docs/projects/[id]/route.ts` - Delete project

## Phase 2: Admin API - Sections & Pages

### 2.1 Section Management
- [ ] POST `/api/admin/docs/projects/[projectId]/sections/route.ts` - Create section
- [ ] GET `/api/admin/docs/projects/[projectId]/sections/route.ts` - List sections
- [ ] PUT `/api/admin/docs/sections/[id]/route.ts` - Update section
- [ ] DELETE `/api/admin/docs/sections/[id]/route.ts` - Delete section
- [ ] POST `/api/admin/docs/sections/reorder/route.ts` - Reorder sections

### 2.2 Page Management
- [ ] POST `/api/admin/docs/projects/[projectId]/pages/route.ts` - Create page
- [ ] GET `/api/admin/docs/projects/[projectId]/pages/route.ts` - List pages
- [ ] GET `/api/admin/docs/pages/[id]/route.ts` - Get page
- [ ] PUT `/api/admin/docs/pages/[id]/route.ts` - Update page
- [ ] DELETE `/api/admin/docs/pages/[id]/route.ts` - Delete page
- [ ] POST `/api/admin/docs/pages/[id]/publish/route.ts` - Publish page

## Phase 3: Admin UI - Project Management

### 3.1 Project List & Overview
- [ ] Create `src/app/admin/docs/page.tsx` - Projects list page
- [ ] Create `src/components/admin/docs/DocProjectList.tsx` - Project cards
- [ ] Create `src/components/admin/docs/DocProjectForm.tsx` - Create/edit form
- [ ] Add quick actions: publish, archive, delete
- [ ] Add filter by status, visibility, linked project

### 3.2 Project Detail View
- [ ] Create `src/app/admin/docs/[projectId]/page.tsx` - Overview page
- [ ] Show project stats (pages, views, searches)
- [ ] Show linked portfolio project
- [ ] Quick links to sections, pages, settings

## Phase 4: Admin UI - Documentation Editor

### 4.1 Main Editor Interface
- [ ] Create `src/app/admin/docs/[projectId]/editor/page.tsx` - Editor page
- [ ] Create `src/components/admin/docs/DocEditor.tsx` - Split-pane editor
- [ ] Left pane: MDX editor with syntax highlighting
- [ ] Right pane: Live preview with MDX rendering
- [ ] Toolbar: Bold, italic, code, link, image, etc.
- [ ] Auto-save drafts (debounced)
- [ ] Save status indicator

### 4.2 Editor Features
- [ ] MDX syntax highlighting (using CodeMirror or Monaco)
- [ ] Autocomplete for MDX components
- [ ] Insert media picker (images, videos)
- [ ] Insert MDX component snippets
- [ ] Search and replace
- [ ] Keyboard shortcuts (Cmd+S to save, etc.)

### 4.3 Page Metadata Panel
- [ ] Page settings sidebar
- [ ] Title, slug, description inputs
- [ ] Section assignment dropdown
- [ ] Order/position control
- [ ] Status toggle (draft/published)
- [ ] Features toggles (TOC, breadcrumbs, etc.)
- [ ] SEO metadata inputs

## Phase 5: Admin UI - Structure Manager

### 5.1 Navigation Tree Builder
- [ ] Create `src/app/admin/docs/[projectId]/structure/page.tsx`
- [ ] Create `src/components/admin/docs/StructureManager.tsx`
- [ ] Tree view of sections and pages
- [ ] Drag-and-drop to reorder (using @dnd-kit)
- [ ] Expand/collapse sections
- [ ] Add/edit/delete sections inline
- [ ] Add/edit/delete pages inline

### 5.2 Bulk Operations
- [ ] Select multiple pages/sections
- [ ] Move to different section
- [ ] Change status (publish/unpublish)
- [ ] Delete multiple items
- [ ] Duplicate pages

## Phase 6: Public Documentation Site

### 6.1 Documentation Layout
- [ ] Create `src/app/docs/layout.tsx` - Global docs layout
- [ ] Create `src/app/docs/page.tsx` - Documentation hub
- [ ] Create `src/app/docs/[projectSlug]/layout.tsx` - Project layout
- [ ] Create `src/components/docs/DocLayout.tsx` - Responsive layout
- [ ] Sidebar navigation
- [ ] Top navbar with logo, search, dark mode
- [ ] Mobile drawer menu
- [ ] Footer with links

### 6.2 Documentation Pages
- [ ] Create `src/app/docs/[projectSlug]/page.tsx` - Project home
- [ ] Create `src/app/docs/[projectSlug]/[...slug]/page.tsx` - Dynamic pages
- [ ] MDX rendering with `next-mdx-remote`
- [ ] Custom MDX components integration
- [ ] Table of contents with scroll spy
- [ ] Previous/Next navigation
- [ ] Breadcrumbs trail

### 6.3 Navigation Components
- [ ] Create `src/components/docs/DocSidebar.tsx` - Collapsible sidebar
- [ ] Create `src/components/docs/DocToc.tsx` - Table of contents
- [ ] Create `src/components/docs/DocBreadcrumbs.tsx` - Breadcrumbs
- [ ] Create `src/components/docs/DocMobileNav.tsx` - Mobile menu
- [ ] Create `src/components/docs/DocPagination.tsx` - Prev/Next links

## Phase 7: Search & Discovery

### 7.1 Search Implementation
- [ ] Create `src/lib/docs/search-indexer.ts` - Index builder
- [ ] MongoDB text search setup
- [ ] Create search API endpoint
- [ ] Client-side fuzzy search (Fuse.js)
- [ ] Search result highlighting

### 7.2 Search UI
- [ ] Create `src/components/docs/DocSearch.tsx` - Search modal
- [ ] Keyboard shortcut (Cmd+K) to open
- [ ] Autocomplete suggestions
- [ ] Filter by project
- [ ] Recent searches
- [ ] Search result cards

### 7.3 Search Results Page
- [ ] Create `src/app/docs/search/page.tsx` - Results page
- [ ] Paginated results
- [ ] Filters (project, section, date)
- [ ] Sort options (relevance, date)
- [ ] Empty state

## Phase 8: MDX Components Library

### 8.1 Core Components
- [ ] Create `src/components/docs/mdx/DocCodeBlock.tsx` - Code with copy
- [ ] Create `src/components/docs/mdx/DocCallout.tsx` - Callout boxes
- [ ] Create `src/components/docs/mdx/DocTabs.tsx` - Tabbed content
- [ ] Create `src/components/docs/mdx/DocSteps.tsx` - Step-by-step
- [ ] Create `src/components/docs/mdx/DocCard.tsx` - Card component
- [ ] Create `src/components/docs/mdx/DocCardGrid.tsx` - Card grid

### 8.2 Advanced Components
- [ ] Create `src/components/docs/mdx/DocApiReference.tsx` - API docs
- [ ] Create `src/components/docs/mdx/DocVideoEmbed.tsx` - Video player
- [ ] Create `src/components/docs/mdx/DocImage.tsx` - Responsive image
- [ ] Create `src/components/docs/mdx/DocDiagram.tsx` - Mermaid diagrams
- [ ] Create `src/components/docs/mdx/index.tsx` - Export all

### 8.3 Component Documentation
- [ ] Document each component's props
- [ ] Create usage examples
- [ ] Add to Storybook (optional)

## Phase 9: Utilities & Helpers

### 9.1 MDX Processing
- [ ] Create `src/lib/docs/mdx-processor.ts` - Compile MDX
- [ ] Create `src/lib/docs/heading-extractor.ts` - Extract headings
- [ ] Create `src/lib/docs/slug-generator.ts` - Generate slugs
- [ ] Create `src/lib/docs/toc-builder.ts` - Build table of contents

### 9.2 Navigation Building
- [ ] Create `src/lib/docs/structure-builder.ts` - Build nav tree
- [ ] Create `src/lib/docs/breadcrumb-builder.ts` - Build breadcrumbs
- [ ] Create `src/lib/docs/pagination-builder.ts` - Prev/next links

### 9.3 Import/Export
- [ ] Create `src/lib/docs/import-markdown.ts` - Import MD files
- [ ] Create `src/lib/docs/export-markdown.ts` - Export to MD
- [ ] Create `src/lib/docs/import-mkdocs.ts` - Import MkDocs config
- [ ] Bulk import from directory structure

## Phase 10: Integration & Polish

### 10.1 Portfolio Integration
- [ ] Update Project model to include `docsSlug` field
- [ ] Add "View Documentation" button to project pages
- [ ] Link documentation in project detail page
- [ ] Show project info in documentation header
- [ ] Cross-reference projects in docs

### 10.2 SEO Optimization
- [ ] Generate sitemap for documentation
- [ ] Add structured data (BreadcrumbList, Article)
- [ ] Meta tags for social sharing
- [ ] Open Graph images
- [ ] Canonical URLs

### 10.3 Performance
- [ ] Implement page caching
- [ ] Code splitting for large docs
- [ ] Image optimization
- [ ] Lazy load sidebar navigation
- [ ] Preload next page on hover

### 10.4 Analytics
- [ ] Track page views
- [ ] Track search queries
- [ ] Popular pages dashboard
- [ ] User engagement metrics
- [ ] Export analytics reports

## Phase 11: Testing

### 11.1 Unit Tests
- [ ] Model validation tests
- [ ] API route tests
- [ ] Utility function tests
- [ ] Component unit tests

### 11.2 Integration Tests
- [ ] End-to-end doc creation flow
- [ ] Navigation tree building
- [ ] Search functionality
- [ ] MDX rendering

### 11.3 Accessibility
- [ ] Keyboard navigation tests
- [ ] Screen reader compatibility
- [ ] ARIA labels audit
- [ ] Color contrast check
- [ ] Focus management

## Phase 12: Documentation & Deployment

### 12.1 Admin Documentation
- [ ] Write admin user guide
- [ ] Create video tutorials
- [ ] Document MDX components
- [ ] Write import/export guide

### 12.2 Deployment
- [ ] Environment variables setup
- [ ] Database migrations script
- [ ] CDN setup for assets
- [ ] Monitoring and logging
- [ ] Backup strategy

## Bug Fixes & Improvements

### Course Sub-Lessons UI
- [ ] Fix: Add visual indentation for sub-lessons in CourseManagerContent
- [ ] Fix: Add "Add sub-lesson" button next to parent lessons
- [ ] Fix: Show parent-child relationship clearly
- [ ] Improvement: Collapsible sub-lesson groups

### Documentation Quick Wins
- [ ] Add markdown import from file upload
- [ ] Add templates for common doc types (Getting Started, API Reference, etc.)
- [ ] Add keyboard shortcuts overlay (press `?`)
- [ ] Add dark mode for documentation site
- [ ] Add print stylesheet for docs

## Future Enhancements (Post-MVP)

- [ ] Multi-language documentation (i18n)
- [ ] Version control for documentation pages
- [ ] Collaborative editing with real-time sync
- [ ] AI-powered semantic search
- [ ] API playground integration
- [ ] Community contributions (pull requests)
- [ ] PDF/EPUB export
- [ ] Documentation testing (link checking, spell check)
- [ ] Automatic changelog generation
- [ ] Documentation analytics dashboard with heatmaps

## Dependencies

```bash
# Already installed (from courses):
# - next-mdx-remote
# - remark-gfm
# - rehype-slug
# - rehype-autolink-headings
# - rehype-pretty-code

# New dependencies:
pnpm add fuse.js              # Fuzzy search
pnpm add cmdk                 # Command palette
pnpm add react-use            # Useful hooks
pnpm add @dnd-kit/core        # Already installed
pnpm add @dnd-kit/sortable    # Already installed
```

## Success Metrics

- [ ] Can create and publish documentation project
- [ ] Can create sections and pages with MDX content
- [ ] Can drag-drop to reorder sections/pages
- [ ] Live preview works in editor
- [ ] Search returns relevant results < 100ms
- [ ] Mobile responsive and accessible
- [ ] Page load < 500ms
- [ ] All tests passing
- [ ] Zero TS/lint errors

## Priority

**High Priority (Week 1-2):**
- Phase 1: Foundation & Data Models ✅
- Phase 2: Admin API Routes
- Phase 3: Admin UI Project Management
- Phase 6: Public Documentation Site (basic)

**Medium Priority (Week 3-4):**
- Phase 4: Admin UI Editor
- Phase 5: Admin UI Structure Manager
- Phase 7: Search Implementation
- Phase 8: MDX Components (core)

**Low Priority (Week 5+):**
- Phase 8: MDX Components (advanced)
- Phase 9: Utilities (import/export)
- Phase 10: Integration & Polish
- Phase 11: Testing
- Phase 12: Documentation

## Notes

- Reuse patterns from course system (lesson editor, MDX rendering, etc.)
- Keep UI consistent with existing admin panels
- Start simple, iterate based on usage
- Document as you build
- Write tests for critical paths
