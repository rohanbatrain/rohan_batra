# Brain Dump Feature - Quick Reference

## Overview
The Brain Dump feature provides a quick capture system for ideas, thoughts, tasks, and reminders in the admin panel. It's designed for rapid note-taking with minimal friction.

## Features

### 1. Quick Capture
- **Fast Entry**: Simple form with content textarea and optional metadata
- **Priority Levels**: Low, Medium, High, Urgent
- **Categorization**: Optional category field for grouping
- **Tagging**: Comma-separated tags for flexible organization
- **Metadata**: Optional source tracking and relationships

### 2. Status Management
- **Captured**: Default state for new items
- **Processed**: Mark items that have been reviewed or actioned
- **Archived**: Move old or irrelevant items out of active view

### 3. Filtering & Search
- Filter by status (captured, processed, archived)
- Filter by priority (low, medium, high, urgent)
- Search across content, tags, and categories
- Real-time stats showing counts by status and priority

### 4. Organization
- **Tags**: Multi-tag support for cross-cutting concerns
- **Categories**: Single category for primary classification
- **Priority**: Visual indicators with color coding
- **Timestamps**: Automatic creation and update tracking

### 5. Content Associations (NEW)
- **Link to Content**: Associate braindumps with existing or planned content
- **13 Content Types**: blog, project, course, book, character, portfolio, social-post, linkedin, twitter, experience, flashcard, documentation, other
- **Rich Metadata**: Each association can include:
  - **type** (required): Content type
  - **id** (optional): Internal content ID
  - **title** (optional): Display title for the association
  - **url** (optional): Link to the content
  - **note** (optional): Additional context (e.g., "Main inspiration")
- **Visual Display**: Color-coded badges with clickable links
- **Multiple Associations**: Link one braindump to multiple pieces of content

## Data Model

```typescript
{
  content: string;              // Main content (required, max 10000 chars)
  tags: string[];               // Array of tags
  category?: string;            // Optional category (max 100 chars)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  userId: ObjectId;             // Owner reference
  associations?: Array<{        // NEW: Link to other content
    type: 'blog' | 'project' | 'course' | 'book' | 'character' | 
          'portfolio' | 'social-post' | 'linkedin' | 'twitter' | 
          'experience' | 'flashcard' | 'documentation' | 'other';
    id?: string;                // Content ID (max 200 chars)
    title?: string;             // Display title (max 200 chars)
    url?: string;               // Link URL (max 500 chars)
    note?: string;              // Additional context (max 500 chars)
  }>;
  metadata?: {
    source?: string;            // e.g., 'quick-capture', 'mobile', 'api'
    relatedTo?: {
      type: string;             // 'blog', 'project', 'course', etc.
      id?: string;
    }
  };
  processedInto?: {             // What this became
    type: string;               // 'blog', 'project', 'task', etc.
    id?: string;
    note?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### List Braindumps
```
GET /api/admin/braindump
Query Params:
  - status: 'captured' | 'processed' | 'archived'
  - priority: 'low' | 'medium' | 'high' | 'urgent'
  - tags: comma-separated tag list
  - search: search query
  - page: page number (default: 1)
  - limit: items per page (default: 50, max: 200)
```

### Create Braindump
```
POST /api/admin/braindump
Body: {
  content: string;
  tags?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  associations?: Array<{
    type: string;
    id?: string;
    title?: string;
    url?: string;
    note?: string;
  }>;
  metadata?: {...};
}
```

### Get Single Braindump
```
GET /api/admin/braindump/[id]
```

### Update Braindump
```
PUT /api/admin/braindump/[id]
Body: {
  content?: string;
  tags?: string[];
  category?: string;
  priority?: string;
  status?: string;
  associations?: Array<{...}>;
  processedInto?: {...};
}
```

### Delete Braindump
```
DELETE /api/admin/braindump/[id]
```

## UI Components

### Location
- **Admin Panel**: `/admin/braindump`
- **Navigation**: Under "Quick Tools" section in sidebar

### Key Components
1. **Quick Capture Card**: Collapsible form for rapid entry
2. **Stats Cards**: Show counts for captured, processed, archived
3. **Filter Bar**: Status, priority, and search filters
4. **Braindump List**: Card-based list with actions
5. **Edit Dialog**: Modal for editing existing items

### Actions
- **Quick Capture Button**: Toggle quick capture form
- **Mark as Processed**: Change status from captured to processed
- **Archive**: Move to archived status
- **Edit**: Open edit dialog
- **Delete**: Remove braindump (with confirmation)

## Workflow Suggestions

### 1. Idea Capture
```
1. Click "Quick Capture"
2. Type your idea
3. Optionally add tags (e.g., "blog-idea", "feature-request")
4. Set priority if urgent
5. Add associations to link with related content (optional)
6. Click "Capture"
```

### 2. Processing Ideas
```
1. Filter by status: "Captured"
2. Review each item
3. Either:
   - Mark as "Processed" if actioned
   - Archive if no longer relevant
   - Edit to add more context or associations
```

### 3. Finding Related Ideas
```
1. Use search to find keywords
2. Filter by tags to group similar ideas
3. Sort by priority to handle urgent items first
4. Check associations to see what content is linked
```

### 4. Using Associations
```
Example: Blog Post Workflow
1. Capture initial idea: "React performance optimization tips"
2. When drafting blog post, add association:
   - Type: blog
   - Title: "10 React Performance Tips"
   - ID: post-123 (if draft exists)
3. Share on social media, add more associations:
   - Type: linkedin
   - URL: linkedin.com/posts/...
   - Note: "Posted on 2025-01-15"
4. Create course based on topic, add association:
   - Type: course
   - Title: "Advanced React Performance"
   - ID: course-456

Result: One braindump tracks the entire lifecycle of your idea
```

## Indexes
The model includes the following database indexes for performance:
- `{ userId: 1, status: 1, createdAt: -1 }` - Main listing query
- `{ userId: 1, tags: 1 }` - Tag-based queries
- `{ userId: 1, priority: 1, status: 1 }` - Priority filtering
- Individual indexes on `tags`, `priority`, `status`, `userId`

## Security
- Authentication required (Clerk)
- Role-based access: Editor and Admin only
- User-scoped data: Each user sees only their own braindumps
- Input validation using Zod schemas
- Content length limits (10,000 chars for content)

## Future Enhancements
- [ ] Bulk operations (archive multiple, tag multiple)
- [ ] Export to various formats (markdown, JSON, CSV)
- [ ] Convert to specific content types (blog post, task, etc.)
- [ ] Mobile-optimized quick capture widget
- [ ] Keyboard shortcuts for rapid entry
- [ ] Rich text formatting in content
- [ ] Attachments/images
- [ ] Reminders and due dates
- [ ] Integration with other admin sections
- [ ] AI-powered categorization and tagging suggestions

## Usage Tips

1. **Keep it Quick**: Don't overthink - just capture the thought
2. **Tag Generously**: Tags are flexible and help with discovery
3. **Review Regularly**: Set aside time to process captured items
4. **Use Priority Wisely**: Reserve "Urgent" for truly time-sensitive items
5. **Archive Liberally**: Don't keep old items cluttering your active list
6. **Search Often**: Use search instead of scrolling through long lists
7. **Categories for Themes**: Use categories for broad themes (work, personal, projects)
8. **Tags for Details**: Use tags for specific topics or cross-cutting concerns

## Troubleshooting

### Items not appearing
- Check status filter (default: "Captured")
- Clear search query
- Verify you're logged in with editor/admin role

### Can't create braindump
- Ensure content is not empty
- Check content length (max 10,000 chars)
- Verify authentication status

### Performance issues with large lists
- Use filters to narrow down results
- Consider archiving old items
- Use search for specific items
- The API supports pagination (adjust limit param)
