# Quickstart: Unified Admin Dashboard & Content Platform

## Prerequisites

### Environment Setup
- [x] Node.js 18+ and pnpm installed.
- [x] MongoDB Atlas connection string configured.
- [x] Clerk authentication configured with `admin` and `editor` roles.
- [x] Redis instance (e.g., Vercel KV, Upstash) connection string configured.
- [x] Cloudinary account (or other asset provider) credentials configured.
- [x] AI Provider (e.g., OpenAI) API key configured.

### Required Environment Variables
```bash
# .env.local

# Database
MONGODB_URI="mongodb+srv://..."
MONGODB_DB_NAME="your_db_name"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Caching
REDIS_URL="redis://..."

# Asset Management
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# AI Services
AI_PROVIDER_API_KEY="your_ai_provider_key"
```

## Step-by-Step Walkthrough

### Phase 1: Data Migration & Setup

#### 1.1 Run the Data Migration Script
This one-time script migrates any existing hardcoded content into the new database structure, creating `Asset` documents for media files.

1.  **Execute the Script**
    ```bash
    # This script finds hardcoded data, uploads media to Cloudinary,
    # creates Asset documents, and links them to posts/projects.
    pnpm tsx scripts/migrate-to-unified-models.ts
    ```

2.  **Validation**
    -   Check the script output for successful asset uploads and document updates.
    -   Verify in your Cloudinary account that the images and Lottie files now exist.
    -   Verify in your MongoDB `assets` collection that new documents have been created.

### Phase 2: Core Admin Features

#### 2.1 Manage Users (Admin Only)
1.  **Navigate to User Management**
    -   Go to `http://localhost:3000/admin/users`.
2.  **Change a User's Role**
    -   Find a user with the `user` role.
    -   In the "Role" column, select `editor` from the dropdown.
    -   The change is saved automatically, and a success notification appears.
3.  **Validation**
    -   Log in as that user and verify they can now access editor-specific pages but not admin-only pages like User Management.

#### 2.2 Manage Assets
1.  **Navigate to Asset Management**
    -   Go to `http://localhost:3000/admin/assets`.
2.  **Upload a New Asset**
    -   Click "Upload Asset".
    -   Drag and drop or select an image file.
    -   Enter a "Title" and "Alt Text".
    -   Click "Upload".
3.  **Validation**
    -   The new asset appears in the gallery.
    -   The asset is visible in your Cloudinary media library.

#### 2.3 Moderate Comments (Admin/Editor)
1.  **Navigate to Comment Moderation**
    -   Go to `http://localhost:3000/admin/comments`.
    -   The view defaults to `pending` comments.
2.  **Moderate a Comment**
    -   For a pending comment, click the "Approve" button.
3.  **Validation**
    -   The comment disappears from the `pending` queue.
    -   Filter the list by `approved` status to see the comment you just moderated.
    -   The comment is now visible on the public-facing blog post or project page.

#### 2.4 Update Site Settings (Admin Only)
1.  **Navigate to Site Settings**
    -   Go to `http://localhost:3000/admin/settings`.
2.  **Change the Site Title**
    -   Find the setting with the key `siteTitle`.
    -   Update its value to "My Awesome New Site Title".
    -   Click "Save Settings".
3.  **Validation**
    -   A success notification appears.
    -   Refresh the public homepage. The new site title should be visible in the browser tab and header. This confirms that the setting was updated and the Redis cache was invalidated and repopulated.

### Phase 3: Content Creation with New Systems

#### 3.1 Create a Blog Post Using the Asset Library
1.  **Start a New Post**
    -   Go to `http://localhost:3000/admin/blog/new`.
2.  **Add a Cover Image**
    -   Instead of an upload button, click "Select from Asset Library".
    -   A modal opens showing all your managed assets.
    -   Select the image you uploaded in step 2.2.
3.  **Use AI Assistance**
    -   Enter a title, e.g., "The Future of Web Development".
    -   Click the "Generate Draft with AI" button.
    -   The content editor will be populated with an AI-generated article.
4.  **Publish and Validate**
    -   Set the status to `Published` and save.
    -   View the post on the public site and confirm the cover image is displayed correctly.

### Phase 4: Analytics

#### 4.1 View the Analytics Dashboard
1.  **Navigate to Analytics**
    -   Go to `http://localhost:3000/admin/analytics`.
2.  **Review the Data**
    -   Observe the charts for "Total Views", "Top Posts", etc.
3.  **Validation**
    -   The data loads quickly, as it is served from the Redis cache.
    -   The data reflects recent activity (note: the cache is updated by a background job, so it may not be real-time to the second).

## Success Criteria

-   **Data is Centralized**: All content and media are sourced from the database and Cloudinary, with no hardcoded data remaining.
-   **Admin is Unified**: All management tasks (users, comments, assets, settings) are possible from the `/admin` dashboard.
-   **System is Performant**: Public pages that use cached data (like site settings) load noticeably faster.
-   **Workflows are Integrated**: Creating a blog post seamlessly uses the new, centralized asset library and AI tools.
-   **Security is Enforced**: Roles (`admin`, `editor`) correctly restrict access to sensitive areas.

## Step-by-Step Walkthrough

### Phase 1: Database Preparation

#### 1.1 Remove Legacy Demo Content
1. **Access Admin Dashboard**
   ```
   Navigate to: http://localhost:3000/admin
   Sign in with admin credentials
   ```

2. **Initiate Content Cleanup**
   ```
   Path: Admin → Content Management → Maintenance
   Click: "Remove Demo Content" button
   Select: "Demo content only" (default)
   Confirm: Check "I understand this action cannot be undone"
   Execute: Click "Remove Demo Content"
   ```

3. **Validation**
   - Success message: "Removed X blog posts and Y projects"
   - Public site: No demo content visible on blog/portfolio pages
   - Admin lists: Only legitimate content remains
   - **Error Handling**: If operation fails, check MongoDB connection and user permissions

#### 1.2 Seed Fresh Sample Content
1. **Run Seeding Script**
   ```bash
   # Option A: Command line
   pnpm tsx db/seed.ts
   
   # Option B: Admin interface
   Navigate to: Admin → Content Management → Seeding
   Click: "Seed Sample Content"
   Options: Check "Reset existing seeded content" if needed
   Execute: Click "Generate Sample Content"
   ```

2. **Expected Output**
   ```
   ✓ Created 5 sample blog posts
   ✓ Created 6 sample projects  
   ✓ Generated seed batch: seed-1726642800000-development
   ✓ All content tagged for easy cleanup
   ```

3. **Validation**
   - Admin blog list shows 5 new posts with "SEEDED" badge
   - Admin project list shows 6 new projects with variety of statuses
   - Public blog page displays published sample posts
   - **Error Handling**: Seeding conflicts resolved by slug; duplicates prevented

### Phase 2: Blog Management Features

#### 2.1 Create a New Blog Post
1. **Access Blog Creation**
   ```
   Path: Admin → Blog → New Post
   URL: http://localhost:3000/admin/blog/new
   ```

2. **Fill Basic Information**
   ```
   Title: "My Awesome Blog Post"
   Slug: "my-awesome-blog-post" (auto-generated, editable)
   Status: "Draft" (default)
   Tags: Add tags like "tech", "tutorial", "nextjs"
   ```

3. **Rich Content Editor**
   ```
   Content: Use rich text editor with:
   - Headings (H1-H6)
   - Lists (ordered/unordered)  
   - Links and inline formatting
   - Image insertion with alt text
   ```

4. **Cover Image Upload**
   ```
   Click: "Upload Cover Image"
   Select: Image file (PNG/JPEG/WebP, max 10MB)
   Alt Text: "Descriptive text for accessibility"
   ```

5. **SEO Configuration**
   ```
   SEO Title: "Custom title for search engines" (max 60 chars)
   Meta Description: "Compelling description for search results" (max 160 chars)
   Canonical URL: Leave blank for auto-generation
   Indexing: ✓ Allow indexing, ✓ Follow links (defaults)
   ```

6. **Save as Draft**
   ```
   Action: Click "Save Draft"
   Result: Post appears in drafts list with "DRAFT" status badge
   ```

#### 2.2 Add Lottie Animation (Optional)
1. **Animation Section**
   ```
   Expand: "Lottie Animation" section in post editor
   Option A - URL: Enter HTTPS URL to .json file
   Option B - Upload: Select local .json file (max 1MB)
   Title: "Animation description"
   Settings: ✓ Loop, ✗ Autoplay (recommended)
   ```

2. **Preview Animation**
   ```
   Click: "Preview Animation" button
   Verify: Animation loads and plays correctly
   ```

3. **Validation**
   - Animation appears in post preview
   - **Fallback**: Static placeholder shows if animation fails
   - **Performance**: Animation loads only when in viewport

#### 2.3 Schedule or Publish Post
1. **Scheduling Workflow**
   ```
   Status: Change from "Draft" to "Scheduled"
   Scheduled Date: Select future date and time
   Time Zone: Displayed in your local time, stored as UTC
   Save: Click "Update Post"
   ```

2. **Immediate Publishing**
   ```
   Status: Change to "Published"
   Publish Date: Auto-set to current time
   Save: Click "Publish Now"
   ```

3. **Validation**
   - Scheduled: Post shows "SCHEDULED" badge with countdown
   - Published: Post appears on public blog page immediately
   - **URL**: Slug becomes immutable after first publish

### Phase 3: Portfolio Project Management

#### 3.1 Create Portfolio Project
1. **Project Creation**
   ```
   Path: Admin → Portfolio → New Project
   Title: "E-commerce Platform"
   Slug: "ecommerce-platform" (auto-generated)
   Description: Detailed project description (1-2000 chars)
   ```

2. **Technology Tags**
   ```
   Tags: Add relevant technologies
   Examples: "React", "Node.js", "MongoDB", "Stripe", "Docker"
   Max: 15 tags per project
   ```

3. **Primary Image**
   ```
   Upload: Main project screenshot
   Alt Text: "E-commerce platform dashboard screenshot"
   ```

4. **Project Links**
   ```
   Demo: https://demo.example.com
   Source: https://github.com/user/project
   Docs: https://docs.example.com
   ```

#### 3.2 Build Image Gallery
1. **Gallery Management**
   ```
   Section: "Project Gallery" in project editor
   Upload: Multiple images (max 12 total)
   Order: Drag and drop to reorder
   Captions: Optional descriptive text for each image
   ```

2. **Image Optimization**
   ```
   Validation: Each image validated for:
   - File type: PNG, JPEG, WebP only
   - Size: Maximum 10MB per image
   - Dimensions: Maximum 4096x4096 pixels
   - Alt text: Required for accessibility
   ```

3. **Gallery Preview**
   ```
   Preview: Click "Preview Gallery" to see layout
   Ordering: Verify images display in correct sequence
   Responsive: Test on different screen sizes
   ```

### Phase 4: Advanced Features

#### 4.1 Bulk Operations
1. **Bulk Post Management**
   ```
   Path: Admin → Blog → All Posts
   Selection: Check multiple posts
   Actions: "Bulk Actions" dropdown
   Options: Publish, Unpublish, Delete, Add Tag, Remove Tag
   Confirmation: Required for destructive actions
   ```

2. **Progress Monitoring**
   ```
   Progress: Real-time progress bar during bulk operations
   Results: Detailed success/failure report
   Errors: Clear error messages for failed operations
   ```

#### 4.2 Search and Filtering
1. **Admin Search**
   ```
   Search Bar: Top of admin lists
   Scope: Searches title, content, and tags
   Filters: Status, tags, date ranges
   Sorting: By date, title, or custom fields
   ```

2. **Advanced Filtering**
   ```
   Status Filter: Draft, Scheduled, Published
   Tag Filter: Multi-select tag filtering
   Date Range: Created/updated date ranges
   Author Filter: Filter by creator (admin only)
   ```

## Validation Checklist

### Content Validation
- [ ] Blog posts save successfully in all status states
- [ ] Slugs are unique and URL-safe (kebab-case)
- [ ] Rich text content renders correctly on public pages
- [ ] Cover images display with proper alt text
- [ ] SEO metadata appears in page source
- [ ] Lottie animations load and play correctly (when present)

### Security Validation  
- [ ] Draft posts not accessible via direct URL
- [ ] Scheduled posts not visible until publish time
- [ ] Admin endpoints require authentication
- [ ] Role permissions enforced (admin vs editor)
- [ ] File uploads validated for type and size
- [ ] HTML content sanitized to prevent XSS

### Performance Validation
- [ ] Admin pages load within 2 seconds
- [ ] Image uploads complete successfully
- [ ] Gallery images lazy load properly
- [ ] Search results return promptly
- [ ] Bulk operations handle 50+ items without timeout

### Data Integrity
- [ ] Seeding is idempotent (no duplicates on re-run)
- [ ] Demo content cleanup targets only tagged content
- [ ] Version history tracks all changes
- [ ] Audit fields (created/updated timestamps) accurate
- [ ] Database indexes support efficient queries

## Error Scenarios & Troubleshooting

### Common Issues

#### Upload Failures
```
Error: "File too large"
Solution: Ensure image < 10MB, use image compression tools

Error: "Unsupported file type"
Solution: Use PNG, JPEG, or WebP formats only

Error: "Missing alt text"
Solution: Add descriptive alt text for accessibility
```

#### Publishing Issues
```
Error: "Slug already exists"
Solution: Modify slug to be unique, system suggests alternatives

Error: "Scheduled time in past"
Solution: Select future datetime or publish immediately

Error: "Missing required fields"
Solution: Fill required title and content before publishing
```

#### Authentication Errors
```
Error: "Insufficient permissions"
Solution: Verify user has admin/editor role in Clerk dashboard

Error: "Session expired"
Solution: Refresh page to re-authenticate with Clerk
```

### Support Resources
- **Admin Help**: Built-in help tooltips throughout admin interface
- **Error Logs**: Check browser console for detailed error messages
- **Database**: Verify MongoDB connection and collection permissions
- **Environment**: Confirm all required environment variables set

## Success Criteria

### Functional Success
- All CRUD operations working for blog posts and projects
- Seeding and cleanup operations complete successfully
- Publishing workflow (draft → scheduled → published) functions correctly
- Image uploads and gallery management operational
- Search and filtering provide relevant results

### Quality Success
- All admin forms have proper validation and error handling
- User interface is intuitive and responsive
- Performance meets established benchmarks
- Security controls prevent unauthorized access
- Accessibility standards maintained (WCAG 2.1 AA)
