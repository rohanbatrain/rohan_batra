# Implementation Plan: Enterprise Documentation System

## Overview
Build a MkDocs/GitBook-inspired documentation system that integrates with portfolio projects, with full admin management and MDX support.

## Phase 1: Data Models & Database Schema

### 1.1 Create Documentation Models
- [ ] `src/models/DocProject.ts` - Main documentation project
- [ ] `src/models/DocSection.ts` - Navigation sections
- [ ] `src/models/DocPage.ts` - Individual pages
- [ ] `src/models/DocSearchIndex.ts` - Search index (optional, can use text search)

### 1.2 Database Indexes
- Add indexes for efficient querying
- Text search indexes for content
- Compound indexes for common query patterns

## Phase 2: Admin API Routes

### 2.1 Documentation Project Management
- [ ] POST `/api/admin/docs/projects` - Create project
- [ ] GET `/api/admin/docs/projects` - List projects
- [ ] GET `/api/admin/docs/projects/:id` - Get project details
- [ ] PUT `/api/admin/docs/projects/:id` - Update project
- [ ] DELETE `/api/admin/docs/projects/:id` - Delete project

### 2.2 Section Management
- [ ] POST `/api/admin/docs/projects/:projectId/sections` - Create section
- [ ] GET `/api/admin/docs/projects/:projectId/sections` - List sections
- [ ] PUT `/api/admin/docs/sections/:id` - Update section
- [ ] DELETE `/api/admin/docs/sections/:id` - Delete section
- [ ] POST `/api/admin/docs/sections/reorder` - Reorder sections

### 2.3 Page Management
- [ ] POST `/api/admin/docs/projects/:projectId/pages` - Create page
- [ ] GET `/api/admin/docs/projects/:projectId/pages` - List pages
- [ ] GET `/api/admin/docs/pages/:id` - Get page
- [ ] PUT `/api/admin/docs/pages/:id` - Update page
- [ ] DELETE `/api/admin/docs/pages/:id` - Delete page
- [ ] POST `/api/admin/docs/pages/:id/publish` - Publish page

### 2.4 Utilities
- [ ] POST `/api/admin/docs/bulk/import` - Import from markdown
- [ ] GET `/api/admin/docs/bulk/export` - Export to markdown
- [ ] POST `/api/admin/docs/search/reindex` - Rebuild search index

## Phase 3: Public API Routes

### 3.1 Documentation Browsing
- [ ] GET `/api/docs/:projectSlug` - Get project home
- [ ] GET `/api/docs/:projectSlug/structure` - Get navigation tree
- [ ] GET `/api/docs/:projectSlug/pages/:pageSlug` - Get page content
- [ ] GET `/api/docs/:projectSlug/search` - Search within project
- [ ] GET `/api/docs/search` - Global documentation search

### 3.2 Analytics (Optional Phase 2+)
- [ ] POST `/api/docs/:projectSlug/pages/:pageSlug/view` - Track view
- [ ] POST `/api/docs/:projectSlug/search/track` - Track search

## Phase 4: Admin UI Components

### 4.1 Documentation Project Manager
- [ ] `src/app/admin/docs/page.tsx` - Projects list page
- [ ] `src/components/admin/docs/DocProjectList.tsx` - Project cards/table
- [ ] `src/components/admin/docs/DocProjectForm.tsx` - Create/edit form
- [ ] Quick actions: publish, archive, delete

### 4.2 Documentation Editor
- [ ] `src/app/admin/docs/[projectId]/page.tsx` - Project overview
- [ ] `src/app/admin/docs/[projectId]/editor/page.tsx` - Main editor
- [ ] `src/components/admin/docs/DocEditor.tsx` - Split-pane MDX editor
- [ ] Live preview with MDX rendering
- [ ] Auto-save drafts
- [ ] Media/asset picker integration

### 4.3 Structure Manager
- [ ] `src/app/admin/docs/[projectId]/structure/page.tsx` - Structure page
- [ ] `src/components/admin/docs/StructureManager.tsx` - Drag-drop tree
- [ ] Section creation/editing
- [ ] Page reordering
- [ ] Nested sections support

### 4.4 Page Manager
- [ ] `src/components/admin/docs/PageList.tsx` - Paginated page list
- [ ] `src/components/admin/docs/PageForm.tsx` - Page metadata form
- [ ] `src/components/admin/docs/PageEditor.tsx` - Content editor
- [ ] SEO settings panel
- [ ] Version history viewer

## Phase 5: Public Documentation Site

### 5.1 Documentation Layout
- [ ] `src/app/docs/layout.tsx` - Docs site layout
- [ ] `src/app/docs/page.tsx` - Documentation hub/landing
- [ ] `src/app/docs/[projectSlug]/layout.tsx` - Project-specific layout
- [ ] Responsive sidebar navigation
- [ ] Mobile drawer menu
- [ ] Dark mode support

### 5.2 Documentation Pages
- [ ] `src/app/docs/[projectSlug]/page.tsx` - Project home
- [ ] `src/app/docs/[projectSlug]/[...slug]/page.tsx` - Dynamic pages
- [ ] MDX rendering with custom components
- [ ] Table of contents
- [ ] Breadcrumbs navigation
- [ ] Previous/Next page links

### 5.3 Navigation Components
- [ ] `src/components/docs/DocSidebar.tsx` - Collapsible sidebar
- [ ] `src/components/docs/DocToc.tsx` - Table of contents with scroll spy
- [ ] `src/components/docs/DocBreadcrumbs.tsx` - Breadcrumb trail
- [ ] `src/components/docs/DocMobileNav.tsx` - Mobile drawer

### 5.4 Search Components
- [ ] `src/components/docs/DocSearch.tsx` - Search modal (Cmd+K)
- [ ] `src/app/docs/search/page.tsx` - Search results page
- [ ] Autocomplete suggestions
- [ ] Filter by project
- [ ] Search result highlighting

## Phase 6: MDX Components Library

### 6.1 Core Components
- [ ] `src/components/docs/mdx/DocCodeBlock.tsx` - Code with copy button
- [ ] `src/components/docs/mdx/DocCallout.tsx` - Info/warning/error boxes
- [ ] `src/components/docs/mdx/DocTabs.tsx` - Tabbed content
- [ ] `src/components/docs/mdx/DocSteps.tsx` - Step-by-step guide
- [ ] `src/components/docs/mdx/DocCard.tsx` - Card component
- [ ] `src/components/docs/mdx/DocCardGrid.tsx` - Card grid layout

### 6.2 Advanced Components
- [ ] `src/components/docs/mdx/DocApiReference.tsx` - API docs table
- [ ] `src/components/docs/mdx/DocVideoEmbed.tsx` - Video player
- [ ] `src/components/docs/mdx/DocImage.tsx` - Responsive images
- [ ] `src/components/docs/mdx/DocDiagram.tsx` - Mermaid diagrams
- [ ] `src/components/docs/mdx/index.tsx` - Export all components

## Phase 7: Utilities & Helpers

### 7.1 Documentation Utilities
- [ ] `src/lib/docs/mdx-processor.ts` - MDX compilation
- [ ] `src/lib/docs/structure-builder.ts` - Build navigation tree
- [ ] `src/lib/docs/search-indexer.ts` - Index content for search
- [ ] `src/lib/docs/heading-extractor.ts` - Extract headings for TOC
- [ ] `src/lib/docs/slug-generator.ts` - Generate unique slugs

### 7.2 Import/Export
- [ ] `src/lib/docs/import-markdown.ts` - Import from MD/MDX
- [ ] `src/lib/docs/export-markdown.ts` - Export to MD/MDX
- [ ] `src/lib/docs/import-mkdocs.ts` - Import from MkDocs (optional)
- [ ] `src/lib/docs/import-docusaurus.ts` - Import from Docusaurus (optional)

## Phase 8: Integration & Polish

### 8.1 Portfolio Integration
- [ ] Link documentation to portfolio projects
- [ ] Show "View Docs" button on project pages
- [ ] Display project info in doc header
- [ ] Cross-reference projects in docs

### 8.2 Search Implementation
- [ ] MongoDB text search setup
- [ ] Client-side fuzzy search (Fuse.js)
- [ ] Search analytics tracking
- [ ] Search suggestions/autocomplete

### 8.3 SEO & Performance
- [ ] Generate sitemap for docs
- [ ] Add structured data markup
- [ ] Implement page caching
- [ ] Image optimization
- [ ] Code splitting for large docs

### 8.4 Analytics & Monitoring
- [ ] Page view tracking
- [ ] Search query tracking
- [ ] Popular pages dashboard
- [ ] User engagement metrics

## Phase 9: Testing & QA

### 9.1 Unit Tests
- [ ] Model validation tests
- [ ] API route tests
- [ ] Utility function tests
- [ ] Component unit tests

### 9.2 Integration Tests
- [ ] End-to-end doc creation flow
- [ ] Navigation tree building
- [ ] Search functionality
- [ ] MDX rendering

### 9.3 Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] ARIA labels
- [ ] Color contrast

## Phase 10: Documentation & Launch

### 10.1 Documentation
- [ ] Admin user guide
- [ ] API documentation
- [ ] MDX component reference
- [ ] Import/export guide

### 10.2 Deployment
- [ ] Database migrations
- [ ] Environment variables
- [ ] CDN setup for assets
- [ ] Monitoring setup

## Implementation Order

### Sprint 1: Foundation (Week 1)
1. Create data models (1.1)
2. Admin API routes for projects (2.1)
3. Admin API routes for sections & pages (2.2, 2.3)
4. Basic admin UI for project management (4.1)

### Sprint 2: Editor & Structure (Week 2)
1. Documentation editor component (4.2)
2. Structure manager with drag-drop (4.3)
3. Page management UI (4.4)
4. MDX processing utilities (7.1)

### Sprint 3: Public Site (Week 3)
1. Public documentation layout (5.1)
2. Documentation pages rendering (5.2)
3. Navigation components (5.3)
4. Basic MDX components (6.1)

### Sprint 4: Search & Polish (Week 4)
1. Search implementation (5.4, 8.2)
2. Advanced MDX components (6.2)
3. Portfolio integration (8.1)
4. SEO optimization (8.3)

### Sprint 5: Testing & Launch (Week 5)
1. Write tests (9.1, 9.2)
2. Accessibility audit (9.3)
3. Documentation (10.1)
4. Deploy (10.2)

## Dependencies Installation

```bash
# Already installed:
# - next-mdx-remote
# - remark-gfm
# - rehype-slug
# - rehype-autolink-headings
# - rehype-pretty-code

# New dependencies needed:
pnpm add fuse.js                      # Client-side search
pnpm add cmdk                         # Command palette
pnpm add react-use                    # Hooks utilities
pnpm add date-fns                     # Date formatting
```

## Success Criteria

- [ ] Can create documentation project and link to portfolio
- [ ] Can create sections and pages with drag-drop reordering
- [ ] Can write documentation in MDX with live preview
- [ ] Public docs site is fully navigable and searchable
- [ ] MDX components render correctly
- [ ] Search works across all documentation
- [ ] Mobile responsive and accessible
- [ ] Page load time < 500ms
- [ ] All tests passing

## Risk Mitigation

1. **MDX Complexity**: Use existing MDX pipeline from courses
2. **Search Performance**: Start with MongoDB text search, optimize later
3. **Editor UX**: Use proven patterns from course lesson editor
4. **Mobile Navigation**: Test early and iterate
5. **Data Migration**: Create backup/restore scripts early

## Future Enhancements (Post-MVP)

- Multi-language documentation (i18n)
- Version control for documentation
- Collaborative editing
- AI-powered search
- API playground
- PDF/EPUB export
- Community contributions
- Documentation analytics dashboard
