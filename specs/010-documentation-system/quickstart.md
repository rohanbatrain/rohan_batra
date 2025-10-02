# Quick Start: Documentation System

## What We're Building

An enterprise-grade documentation system inspired by MkDocs, Read the Docs, and GitBook that integrates seamlessly with your portfolio projects.

## Key Features

1. **Project-Based Documentation** - Link docs to portfolio projects
2. **Hierarchical Structure** - Sections and nested pages
3. **MDX Support** - Rich content with interactive components
4. **Live Preview** - See changes as you type
5. **Search** - Full-text search across all documentation
6. **Mobile Responsive** - Works great on all devices
7. **Admin Panel** - Full CRUD operations
8. **SEO Optimized** - Server-side rendering, sitemaps, meta tags

## Current Status

### ✅ Completed (Phase 1)

- [x] Data models created (`DocProject`, `DocSection`, `DocPage`)
- [x] Admin API for creating/listing documentation projects
- [x] Proper TypeScript types and Mongoose schemas
- [x] Database indexes for efficient querying

### 🚧 In Progress (Phase 2)

- [ ] Complete admin API routes for sections and pages
- [ ] Build admin UI for project management
- [ ] Create documentation editor with MDX support

## File Structure Created

```
src/
├── models/
│   ├── DocProject.ts       ✅ Documentation project model
│   ├── DocSection.ts       ✅ Navigation section model
│   └── DocPage.ts          ✅ Individual page model
│
└── app/api/admin/docs/
    └── projects/
        └── route.ts        ✅ Create/list projects API
```

## Quick Test

### 1. Start the Development Server

```bash
pnpm dev
```

### 2. Test the API (using curl or Postman)

```bash
# List all documentation projects
curl http://localhost:3000/api/admin/docs/projects

# Create a new documentation project
curl -X POST http://localhost:3000/api/admin/docs/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My API Documentation",
    "description": "Comprehensive API reference for my project",
    "slug": "api-docs",
    "status": "draft",
    "visibility": "public"
  }'
```

## Next Steps

### Immediate (This Week)

1. **Complete Admin API** (Phase 2)
   - Sections CRUD endpoints
   - Pages CRUD endpoints
   - Reorder/move operations

2. **Build Admin UI** (Phase 3)
   - Projects list page at `/admin/docs`
   - Project creation form
   - Quick actions (publish, archive, delete)

3. **Simple Public View** (Phase 6.1)
   - Basic documentation layout
   - Render MDX content
   - Simple navigation

### Short Term (Next 2 Weeks)

1. **Documentation Editor** (Phase 4)
   - Split-pane MDX editor
   - Live preview
   - Auto-save

2. **Structure Manager** (Phase 5)
   - Drag-and-drop tree view
   - Bulk operations

3. **Search** (Phase 7)
   - Basic search implementation
   - Search modal (Cmd+K)

### Medium Term (Next Month)

1. **MDX Components Library** (Phase 8)
   - CodeBlock with copy button
   - Callout boxes
   - Tabs, Steps, Cards

2. **Portfolio Integration** (Phase 10.1)
   - Link docs to projects
   - Show "View Docs" button

3. **SEO & Performance** (Phase 10.2-10.3)
   - Sitemap generation
   - Image optimization
   - Page caching

## How to Use (Once Complete)

### For Admins

1. **Create Documentation Project**
   - Go to `/admin/docs`
   - Click "New Documentation"
   - Fill in title, description, optional link to portfolio project
   - Save as draft

2. **Create Sections**
   - Open project in structure manager
   - Add sections like "Getting Started", "API Reference", "Guides"
   - Drag to reorder

3. **Create Pages**
   - Click "New Page" in a section
   - Write content in MDX
   - See live preview
   - Publish when ready

4. **Organize & Publish**
   - Reorder pages via drag-and-drop
   - Set page as "Previewable" for non-auth users
   - Publish entire project when ready

### For Users

1. **Browse Documentation**
   - Visit `/docs` to see all documentation projects
   - Click a project to view its docs
   - Use sidebar to navigate sections/pages

2. **Search**
   - Press `Cmd+K` or `/` to open search
   - Type query
   - Click result to jump to page

3. **Read & Learn**
   - Read pages with rich MDX content
   - Copy code examples
   - View interactive demos
   - Navigate with breadcrumbs/prev-next

## Architecture Highlights

### Data Model

```
DocProject (1) ----> (*) DocSection
   |                       |
   |                       |--> (*) DocPage
   |
   |--> (*) DocPage (root-level pages)
```

### Key Design Decisions

1. **Hierarchical Sections** - Sections can be nested up to 5 levels
2. **Flexible Page Placement** - Pages can be in sections or root-level
3. **MDX First** - Primary format is MDX for maximum flexibility
4. **Project Linking** - Optional link to portfolio project
5. **Status & Visibility** - Separate draft/published and public/private controls
6. **Analytics Built-In** - Track views, searches, popular pages

### API Design

- **Admin APIs** - Full CRUD under `/api/admin/docs/*`
- **Public APIs** - Read-only under `/api/docs/*`
- **RESTful** - Standard HTTP methods
- **Validated** - Zod schemas for all inputs
- **Authorized** - Editor/Admin role required for mutations

## Integration Points

### With Portfolio Projects

```typescript
// Link documentation to a project
{
  projectId: "507f1f77bcf86cd799439011",  // Portfolio project ID
  // ... other fields
}

// On project detail page
<Link href={`/docs/${project.docsSlug}`}>
  View Documentation
</Link>
```

### With Course System

- Reuse MDX rendering pipeline
- Reuse lesson editor patterns
- Share MDX component library
- Similar navigation patterns

### With Blog System

- Link to blog posts from docs
- Embed blog content in docs
- Cross-reference between systems

## Common Patterns (Reused from Courses)

1. **Admin Authorization** - Same `getAuthorizedUser` helper
2. **MDX Processing** - Same `next-mdx-remote` setup
3. **Slug Generation** - Same `uniqueSlug` utility
4. **Drag-and-Drop** - Same `@dnd-kit` library
5. **Form Patterns** - Similar create/edit forms
6. **Toast Notifications** - Same `useToast` hook

## Development Tips

### Adding a New MDX Component

1. Create component in `src/components/docs/mdx/DocMyComponent.tsx`
2. Export from `src/components/docs/mdx/index.tsx`
3. Add to MDX components object
4. Document props and usage
5. Test in editor preview

### Adding a New API Endpoint

1. Create route file in `src/app/api/admin/docs/*`
2. Add Zod schema for validation
3. Use `getAuthorizedUser` for auth
4. Handle errors consistently
5. Return JSON response

### Testing Locally

```bash
# Run dev server
pnpm dev

# In another terminal, test API
curl http://localhost:3000/api/admin/docs/projects

# Or use Postman/Insomnia
```

## Troubleshooting

### "Unauthorized" Error

- Make sure you're logged in as admin or editor
- Check Clerk authentication setup
- Verify user role in database

### Model Not Found

- Restart dev server
- Check model is exported correctly
- Ensure MongoDB connection is working

### MDX Not Rendering

- Check MDX syntax is valid
- Verify MDX processor is configured
- Check browser console for errors

## Resources

- [MkDocs Documentation](https://www.mkdocs.org/)
- [GitBook](https://www.gitbook.com/)
- [Read the Docs](https://readthedocs.org/)
- [MDX Documentation](https://mdxjs.com/)
- [Next.js MDX Remote](https://github.com/hashicorp/next-mdx-remote)

## Support

- Check `specs/010-documentation-system/` for detailed specs
- See `tasks.md` for implementation checklist
- Review existing course system for patterns
- Ask questions in team chat

## License

Same as main project.
