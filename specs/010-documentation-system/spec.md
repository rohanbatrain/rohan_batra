# Specification: Enterprise Documentation System

## Overview
A comprehensive documentation system inspired by MkDocs, Read the Docs, and GitBook that allows linking documentation to portfolio projects with full admin management capabilities. The system supports versioning, search, navigation, and MDX-powered content.

## Business Requirements

### Core Goals
1. **Project Documentation**: Link rich documentation to portfolio projects
2. **Admin Management**: Full CRUD operations for documentation with preview
3. **Version Control**: Support multiple documentation versions per project
4. **Search & Discovery**: Full-text search across all documentation
5. **Navigation Structure**: Hierarchical navigation with sections and pages
6. **MDX Support**: Rich content with components, code blocks, and interactive elements
7. **Multi-Project Support**: Single documentation system serving multiple projects
8. **Public & Private Docs**: Support both public and authenticated-only documentation

## Functional Requirements

### User Stories

#### As a Site Owner
- I want to create comprehensive documentation for my portfolio projects
- I want to manage documentation versions (v1.0, v2.0, etc.)
- I want to preview documentation before publishing
- I want to organize docs with sections and subsections
- I want analytics on documentation usage

#### As a Visitor
- I want to browse project documentation easily
- I want to search across all documentation
- I want to navigate between related documents
- I want to view code examples with syntax highlighting
- I want to bookmark and share specific doc pages

#### As a Developer (Admin)
- I want to write documentation in MDX format
- I want to include interactive components in docs
- I want to manage documentation structure hierarchically
- I want to track documentation completeness
- I want to version documentation independently from projects

## Technical Requirements

### Data Model

#### Documentation Project
```typescript
interface DocProject {
  _id: ObjectId;
  projectId?: ObjectId;  // Optional link to portfolio project
  title: string;
  slug: string;  // e.g., "api-reference", "user-guide"
  description: string;
  logoUrl?: string;
  
  // Metadata
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  
  // Configuration
  config: {
    theme?: 'light' | 'dark' | 'system';
    primaryColor?: string;
    sidebarPosition?: 'left' | 'right';
    showToc?: boolean;  // Table of contents
    showBreadcrumbs?: boolean;
    showLastUpdated?: boolean;
    showContributors?: boolean;
  };
  
  // Versions
  versions: {
    version: string;  // e.g., "1.0", "2.0", "latest"
    label?: string;
    isDefault: boolean;
    status: 'draft' | 'published' | 'archived';
  }[];
  
  // Links
  externalLinks?: {
    github?: string;
    npm?: string;
    demo?: string;
    support?: string;
  };
  
  // SEO
  seo?: {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string[];
  };
  
  // Analytics
  analytics: {
    totalViews: number;
    totalSearches: number;
    popularPages: { pageId: ObjectId; views: number }[];
  };
  
  // Access Control
  accessControl?: {
    requireAuth: boolean;
    allowedRoles?: string[];
    allowedUserIds?: ObjectId[];
  };
  
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

#### Documentation Section
```typescript
interface DocSection {
  _id: ObjectId;
  docProjectId: ObjectId;
  version: string;  // Which version this belongs to
  
  title: string;
  slug: string;  // e.g., "getting-started", "api-reference"
  description?: string;
  icon?: string;  // Icon identifier or URL
  
  // Hierarchy
  parentSectionId?: ObjectId;  // For nested sections
  order: number;
  depth: number;  // 0 for root, 1 for child, etc.
  
  // Display
  expanded: boolean;  // Default expand state in sidebar
  hidden: boolean;  // Hide from navigation
  
  // Metadata
  status: 'draft' | 'published';
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### Documentation Page
```typescript
interface DocPage {
  _id: ObjectId;
  docProjectId: ObjectId;
  sectionId?: ObjectId;  // Optional section assignment
  version: string;
  
  title: string;
  slug: string;  // e.g., "installation", "authentication"
  description?: string;
  
  // Content
  content: string;  // MDX content
  contentFormat: 'mdx' | 'markdown';
  
  // Navigation
  order: number;
  parentPageId?: ObjectId;  // For nested pages
  
  // Table of Contents
  headings: {
    level: number;  // h1, h2, h3, etc.
    text: string;
    id: string;  // Anchor ID
  }[];
  
  // Status & Publishing
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  
  // Features
  features: {
    showToc: boolean;
    showBreadcrumbs: boolean;
    showLastUpdated: boolean;
    allowComments: boolean;
    showEditLink: boolean;
  };
  
  // SEO
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  
  // Analytics
  analytics: {
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    searchAppearances: number;
    externalReferrals: number;
  };
  
  // Relationships
  relatedPages?: ObjectId[];
  prerequisites?: ObjectId[];
  
  // Assets
  assets?: {
    images?: string[];
    videos?: string[];
    downloads?: { label: string; url: string }[];
  };
  
  // Edit History
  lastEditedBy?: ObjectId;
  editHistory?: {
    editedBy: ObjectId;
    editedAt: Date;
    summary: string;
  }[];
  
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Documentation Search Index
```typescript
interface DocSearchIndex {
  _id: ObjectId;
  docProjectId: ObjectId;
  pageId: ObjectId;
  version: string;
  
  // Content for search
  title: string;
  content: string;  // Processed/stripped content
  headings: string[];
  keywords: string[];
  
  // Metadata
  sectionPath: string[];  // Breadcrumb path
  url: string;
  
  // Search scoring
  popularity: number;
  relevanceBoost: number;
  
  lastIndexedAt: Date;
}
```

### API Endpoints

#### Admin API

##### Documentation Projects
```
POST   /api/admin/docs/projects
GET    /api/admin/docs/projects
GET    /api/admin/docs/projects/:id
PUT    /api/admin/docs/projects/:id
DELETE /api/admin/docs/projects/:id

POST   /api/admin/docs/projects/:id/versions
PUT    /api/admin/docs/projects/:id/versions/:version
DELETE /api/admin/docs/projects/:id/versions/:version
```

##### Documentation Sections
```
POST   /api/admin/docs/projects/:projectId/sections
GET    /api/admin/docs/projects/:projectId/sections
GET    /api/admin/docs/sections/:id
PUT    /api/admin/docs/sections/:id
DELETE /api/admin/docs/sections/:id
POST   /api/admin/docs/sections/:id/reorder
```

##### Documentation Pages
```
POST   /api/admin/docs/projects/:projectId/pages
GET    /api/admin/docs/projects/:projectId/pages
GET    /api/admin/docs/pages/:id
PUT    /api/admin/docs/pages/:id
DELETE /api/admin/docs/pages/:id
POST   /api/admin/docs/pages/:id/publish
POST   /api/admin/docs/pages/:id/preview
POST   /api/admin/docs/pages/:id/duplicate
```

##### Bulk Operations
```
POST   /api/admin/docs/bulk/import          # Import from Markdown/MkDocs
POST   /api/admin/docs/bulk/export          # Export to Markdown
POST   /api/admin/docs/bulk/reindex         # Reindex search
POST   /api/admin/docs/bulk/move            # Move pages/sections
```

#### Public API

##### Documentation Browse
```
GET    /api/docs/:projectSlug                              # Project home
GET    /api/docs/:projectSlug/:version?                    # Version selector
GET    /api/docs/:projectSlug/:version?/structure          # Navigation tree
GET    /api/docs/:projectSlug/:version?/:pageSlug          # Page content
GET    /api/docs/:projectSlug/:version?/section/:sectionSlug  # Section pages
```

##### Search
```
GET    /api/docs/:projectSlug/search?q=:query&version=:version
GET    /api/docs/search?q=:query                           # Global search
```

##### Analytics
```
POST   /api/docs/:projectSlug/:pageSlug/view               # Track page view
POST   /api/docs/:projectSlug/search/track                 # Track search
```

### UI Components

#### Admin Dashboard

##### Documentation Manager (`src/components/admin/docs/DocProjectManager.tsx`)
- List all documentation projects
- Create/edit/delete projects
- Manage versions
- View analytics dashboard
- Bulk operations

##### Documentation Editor (`src/components/admin/docs/DocEditor.tsx`)
- Split-pane editor (MDX on left, preview on right)
- Syntax highlighting for code blocks
- Live preview with MDX components
- Auto-save drafts
- Insert components/media
- SEO metadata editor
- Page settings panel

##### Structure Manager (`src/components/admin/docs/StructureManager.tsx`)
- Drag-and-drop section/page reordering
- Tree view of documentation hierarchy
- Add/remove sections
- Nested section support
- Quick navigation

##### Version Manager (`src/components/admin/docs/VersionManager.tsx`)
- Create new versions
- Clone from existing version
- Manage version status
- Set default version
- Archive old versions

##### Analytics Dashboard (`src/components/admin/docs/DocAnalytics.tsx`)
- Page view statistics
- Popular pages chart
- Search query analytics
- User engagement metrics
- Export reports

#### Public Documentation Site

##### Documentation Layout (`src/app/docs/[projectSlug]/layout.tsx`)
- Responsive sidebar with navigation tree
- Top navbar with version selector
- Search bar with autocomplete
- Breadcrumbs
- Dark/light mode toggle
- Mobile-friendly drawer

##### Documentation Page (`src/app/docs/[projectSlug]/[...slug]/page.tsx`)
- MDX content rendering
- Table of contents sidebar
- Previous/Next page navigation
- "Edit on GitHub" link
- Page metadata display
- Share buttons

##### Documentation Search (`src/components/docs/DocSearch.tsx`)
- Global search with keyboard shortcuts (Cmd+K)
- Search suggestions
- Filter by project/version
- Highlight search terms in results
- Recent searches

##### Navigation Components
- `DocSidebar.tsx` - Collapsible navigation tree
- `DocToc.tsx` - Table of contents with scroll spy
- `DocBreadcrumbs.tsx` - Navigation breadcrumbs
- `DocVersionSelector.tsx` - Version dropdown
- `DocMobileNav.tsx` - Mobile drawer navigation

##### Content Components
- `DocCodeBlock.tsx` - Code blocks with copy button
- `DocCallout.tsx` - Info/warning/error callouts
- `DocTabs.tsx` - Tabbed content sections
- `DocSteps.tsx` - Step-by-step instructions
- `DocApiReference.tsx` - API documentation tables
- `DocImage.tsx` - Responsive images with zoom

### MDX Components Library

Create reusable components for documentation:

```tsx
// src/components/docs/mdx/index.tsx
export const DocComponents = {
  // Typography
  h1: DocHeading1,
  h2: DocHeading2,
  h3: DocHeading3,
  p: DocParagraph,
  
  // Code
  code: DocInlineCode,
  pre: DocCodeBlock,
  
  // Lists
  ul: DocUnorderedList,
  ol: DocOrderedList,
  li: DocListItem,
  
  // Custom
  Callout: DocCallout,
  Tabs: DocTabs,
  Tab: DocTab,
  Steps: DocSteps,
  Step: DocStep,
  ApiReference: DocApiReference,
  CodeGroup: DocCodeGroup,
  VideoEmbed: DocVideoEmbed,
  CardGrid: DocCardGrid,
  Card: DocCard,
};
```

### Search Implementation

Use a combination of:
1. **MongoDB Text Search** for basic search
2. **Vector Embeddings** for semantic search (future)
3. **Client-side fuzzy search** for instant results (Fuse.js)

```typescript
// Search indexing on save
async function indexDocPage(page: DocPage) {
  const content = stripMDX(page.content);
  const headings = extractHeadings(page.content);
  
  await DocSearchIndex.findOneAndUpdate(
    { pageId: page._id },
    {
      docProjectId: page.docProjectId,
      pageId: page._id,
      version: page.version,
      title: page.title,
      content,
      headings,
      keywords: extractKeywords(content),
      sectionPath: await buildSectionPath(page.sectionId),
      url: buildDocUrl(page),
      lastIndexedAt: new Date(),
    },
    { upsert: true }
  );
}
```

### File Organization

```
src/
├── app/
│   ├── docs/
│   │   ├── [projectSlug]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── [...slug]/
│   │   │   │   └── page.tsx
│   │   │   └── search/
│   │   │       └── page.tsx
│   │   └── page.tsx (Documentation hub)
│   │
│   ├── admin/
│   │   └── docs/
│   │       ├── page.tsx (Projects list)
│   │       ├── [projectId]/
│   │       │   ├── page.tsx (Project overview)
│   │       │   ├── editor/
│   │       │   │   └── page.tsx
│   │       │   ├── structure/
│   │       │   │   └── page.tsx
│   │       │   ├── versions/
│   │       │   │   └── page.tsx
│   │       │   └── analytics/
│   │       │       └── page.tsx
│   │       └── new/
│   │           └── page.tsx
│   │
│   └── api/
│       ├── docs/
│       │   ├── [projectSlug]/
│       │   │   ├── route.ts
│       │   │   ├── [version]/
│       │   │   │   └── route.ts
│       │   │   ├── structure/
│       │   │   │   └── route.ts
│       │   │   └── search/
│       │   │       └── route.ts
│       │   └── search/
│       │       └── route.ts
│       │
│       └── admin/
│           └── docs/
│               ├── projects/
│               │   ├── route.ts
│               │   └── [id]/
│               │       ├── route.ts
│               │       └── versions/
│               │           └── route.ts
│               ├── sections/
│               │   ├── route.ts
│               │   └── [id]/
│               │       └── route.ts
│               ├── pages/
│               │   ├── route.ts
│               │   └── [id]/
│               │       ├── route.ts
│               │       ├── publish/
│               │       │   └── route.ts
│               │       └── preview/
│               │           └── route.ts
│               └── bulk/
│                   ├── import/
│                   │   └── route.ts
│                   └── reindex/
│                       └── route.ts
│
├── components/
│   ├── admin/
│   │   └── docs/
│   │       ├── DocProjectManager.tsx
│   │       ├── DocEditor.tsx
│   │       ├── StructureManager.tsx
│   │       ├── SectionEditor.tsx
│   │       ├── PageEditor.tsx
│   │       ├── VersionManager.tsx
│   │       ├── DocAnalytics.tsx
│   │       └── BulkImporter.tsx
│   │
│   └── docs/
│       ├── DocLayout.tsx
│       ├── DocSidebar.tsx
│       ├── DocToc.tsx
│       ├── DocBreadcrumbs.tsx
│       ├── DocSearch.tsx
│       ├── DocVersionSelector.tsx
│       ├── DocMobileNav.tsx
│       ├── DocPagination.tsx
│       └── mdx/
│           ├── DocCodeBlock.tsx
│           ├── DocCallout.tsx
│           ├── DocTabs.tsx
│           ├── DocSteps.tsx
│           ├── DocApiReference.tsx
│           ├── DocCard.tsx
│           └── index.tsx
│
├── models/
│   ├── DocProject.ts
│   ├── DocSection.ts
│   ├── DocPage.ts
│   └── DocSearchIndex.ts
│
└── lib/
    └── docs/
        ├── mdx-processor.ts
        ├── search-indexer.ts
        ├── structure-builder.ts
        ├── version-manager.ts
        └── import-export.ts
```

## Integration Points

### With Portfolio Projects
- Link documentation to portfolio projects via `projectId`
- Display documentation link on project detail pages
- Show project info in documentation header
- Cross-reference between project and docs

### With Blog System
- Link to relevant blog posts from docs
- Embed documentation snippets in blog posts
- Shared MDX components

### With Course System
- Use documentation pages as course lesson content
- Reference documentation in course materials
- Shared navigation patterns

## Non-Functional Requirements

### Performance
- Page load < 500ms
- Search response < 100ms
- Support 10,000+ documentation pages
- CDN caching for static content

### SEO
- Server-side rendering for all pages
- Dynamic sitemap generation
- Structured data markup
- Meta tags for social sharing

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

### Security
- Role-based access control
- XSS protection in MDX rendering
- Rate limiting on search
- Secure content sanitization

## Future Enhancements

1. **Multi-language Support**: i18n for documentation
2. **Collaborative Editing**: Real-time co-editing with CRDTs
3. **AI-Powered Search**: Semantic search with embeddings
4. **Documentation Templates**: Quick-start templates for common docs
5. **API Playground**: Interactive API testing within docs
6. **Community Contributions**: Allow external contributors
7. **Export Formats**: PDF, EPUB generation
8. **Documentation Testing**: Link checking, spell checking
9. **Changelog Integration**: Auto-generate changelogs
10. **Documentation Analytics**: Heatmaps, scroll depth, engagement

## Success Metrics

- Documentation page views
- Search success rate (clicks after search)
- Average time on page
- Page completion rate (scroll depth)
- User feedback ratings
- External referrals to documentation
- Number of projects with documentation
- Documentation completeness score

## Dependencies

- `next-mdx-remote` - MDX rendering
- `remark-gfm` - GitHub Flavored Markdown
- `rehype-slug` - Heading IDs
- `rehype-autolink-headings` - Anchor links
- `rehype-pretty-code` - Code highlighting
- `fuse.js` - Client-side fuzzy search
- `@radix-ui/react-dialog` - Search modal
- `cmdk` - Command palette for search
- `react-markdown` - Markdown parsing utilities

## Migration Strategy

1. **Phase 1**: Create models and admin CRUD
2. **Phase 2**: Build admin UI for content management
3. **Phase 3**: Implement public documentation pages
4. **Phase 4**: Add search functionality
5. **Phase 5**: Integrate with portfolio projects
6. **Phase 6**: Add analytics and monitoring
7. **Phase 7**: Implement advanced features (versioning, etc.)
