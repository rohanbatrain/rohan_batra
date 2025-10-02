# 📚 Documentation System - Quick Reference Card

## 🔗 Key URLs

| Purpose | URL | Access |
|---------|-----|--------|
| **Documentation Hub** | `/docs` | Public |
| **Admin Dashboard** | `/admin/docs` | Admin/Editor |
| **Create Project** | `/admin/docs/new` | Admin/Editor |
| **View Project** | `/docs/{slug}` | Public |
| **View Page** | `/docs/{slug}/{page-slug}` | Public |

## 🎯 Quick Actions

### Create Documentation Project
1. Go to `/admin/docs`
2. Click "New Project"
3. Fill in title, slug, description
4. Configure theme (optional)
5. Save

### Add a Page
1. Go to `/admin/docs/{projectId}`
2. Click "Add Page"
3. Write MDX content
4. See live preview
5. Publish

### Add a Section
1. Go to `/admin/docs/{projectId}`
2. Click "Add Section"
3. Enter title
4. Choose parent (optional)
5. Save

## 🎨 MDX Components

```mdx
# Standard Markdown
# Heading 1
## Heading 2
**bold** *italic* `code`
- List item
[Link](url)
![Image](url)

# Custom Components
<Alert type="info" title="Note">
  Content here
</Alert>

<Card title="Title">
  Content here
</Card>

<Badge>Label</Badge>

<CodeBlock title="file.ts" language="typescript">
  code here
</CodeBlock>
```

## 📋 Project Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Status** | Draft, Published, Archived | Publication state |
| **Visibility** | Public, Private, Unlisted | Access control |
| **Theme** | Color, Font, CSS | Appearance |
| **SEO** | Title, Description, OG Image | Search optimization |

## 🔧 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Content**: MDX (Markdown + React)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Auth**: Clerk
- **Validation**: Zod

## 📦 File Locations

```
Key Files:
├── Models:           src/models/Doc*.ts
├── API Routes:       src/app/api/admin/docs/
├── Admin Pages:      src/app/admin/docs/
├── Public Pages:     src/app/docs/
├── Admin Components: src/components/admin/
└── Public Components: src/components/docs/
```

## 🎯 Features at a Glance

✅ MDX content with React components  
✅ Live preview editor  
✅ Auto-save (every 3 seconds)  
✅ Hierarchical navigation (5 levels)  
✅ Mobile responsive  
✅ Dark mode support  
✅ SEO optimized  
✅ Analytics tracking  
✅ Copy code buttons  
✅ Breadcrumb navigation  
✅ Search ready (Cmd+K)  

## 📊 Admin Capabilities

- Create/edit/delete projects
- Manage sections (hierarchy)
- Write/edit pages (MDX)
- Set status & visibility
- Configure themes
- View analytics
- Manage SEO settings

## 🌐 Public Features

- Browse documentation hub
- Navigate with sidebar
- Mobile drawer menu
- Copy code snippets
- Table of contents
- Previous/Next navigation
- Breadcrumbs
- Back to top button

## 🔐 Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features |
| **Editor** | Create/edit documentation |
| **User** | View public documentation only |

## 📈 Analytics Tracked

- Total views per project
- Views per page
- Total searches
- Average time on page

View at: `/admin/docs/{projectId}`

## 🎨 UI Patterns

**Colors**: Uses theme variables (primary, muted, etc.)  
**Spacing**: Consistent gap-4, space-y-6, px-6, py-12  
**Typography**: Follows site scale (text-4xl, text-3xl, etc.)  
**Components**: Reuses existing shadcn/ui components  

## 🚀 Getting Started

**5-Minute Quickstart:**
1. Navigate to `/admin/docs`
2. Click "New Project"
3. Enter "My First Doc" as title
4. Save project
5. Click "Add Page"
6. Write some MDX
7. Publish
8. View at `/docs/my-first-doc`

## 💡 Pro Tips

- Use **sections** to organize large docs
- Set **order** field to control display sequence
- Enable **isExpanded** on important sections
- Use **excerpt** for page summaries
- Add **meta descriptions** for SEO
- Link to **portfolio projects** for context

## 🐛 Troubleshooting

**Page not showing?**
- Check status is "Published"
- Verify project is "Published"
- Check visibility setting

**MDX error?**
- Validate JSX syntax
- Check component names are capitalized
- Ensure all tags are closed

**Auto-save not working?**
- Check browser console
- Verify network connection
- Ensure you have edit permissions

## 📚 Resources

- **Full Spec**: `specs/010-documentation-system/spec.md`
- **Quick Start**: `DOCS_QUICK_START.md`
- **Integration**: `INTEGRATION_COMPLETE.md`
- **Summary**: `DOCUMENTATION_FINAL_SUMMARY.md`

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-10-02
