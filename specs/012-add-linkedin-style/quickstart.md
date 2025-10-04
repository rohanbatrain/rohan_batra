# Quickstart Guide: Professional Experience Feature

**Feature**: LinkedIn-style experience management  
**Phase**: 1 - Design & Contracts  
**Date**: January 4, 2025

## Purpose
This quickstart guide provides step-by-step instructions for manually testing the professional experience feature after implementation. Use this to validate that all user stories from the specification are working correctly.

---

## Prerequisites

### Required
- ✅ Development server running (`pnpm dev`)
- ✅ MongoDB connection active
- ✅ Admin user created with proper role
- ✅ Clerk authentication configured

### Optional
- Sample company logo images (for upload testing)
- Lorem ipsum text for descriptions

---

## Test Scenario 1: Admin Creates First Experience

**User Story**: As an admin, I want to create my first professional experience entry so that it appears on the homepage.

### Steps

1. **Navigate to Admin Panel**
   ```
   URL: http://localhost:3000/admin
   Expected: See admin navigation with "Experience" link
   ```

2. **Open Experience Management**
   ```
   Click: "Experience" in admin nav
   URL: http://localhost:3000/admin/experience
   Expected: See empty state with "Add Experience" button
   ```

3. **Click Create Button**
   ```
   Click: "Add Experience" button
   URL: http://localhost:3000/admin/experience/create
   Expected: See experience creation form with all fields
   ```

4. **Fill Required Fields**
   ```
   Title: "Technical Head"
   Company: "Google Developer Groups UPES"
   Employment Type: Select "Part-time" from dropdown
   Start Date: "2023-08" (August 2023)
   End Date: Leave empty
   Is Current: Toggle ON
   Location: "Dehradun, India"
   Description: "Leading technical initiatives and mentoring developers in the community."
   Description Format: "Rich Text" (default)
   ```

5. **Add Optional Fields**
   ```
   Company Website: "https://gdgupes.tech"
   Company Logo: "https://gdgupes.tech/logo.png"
   Skills: Add tags: "Leadership", "JavaScript", "Event Management"
   Display Order: 1
   Published: Toggle ON
   ```

6. **Submit Form**
   ```
   Click: "Create Experience" button
   Expected: 
   - Success toast notification
   - Redirect to /admin/experience
   - New experience appears in list
   ```

7. **Verify Homepage Display**
   ```
   Navigate: http://localhost:3000
   Expected:
   - "Professional Experience" section visible
   - Experience card shows: company logo, title, company, duration
   - "View Full Experience →" link present
   ```

**✅ Pass Criteria**: Experience created, saved to database, appears on homepage

---

## Test Scenario 2: Add Past Experience with End Date

**User Story**: As an admin, I want to add a past internship to my timeline.

### Steps

1. **Navigate to Create Page**
   ```
   URL: http://localhost:3000/admin/experience/create
   ```

2. **Fill Experience Details**
   ```
   Title: "Software Engineering Intern"
   Company: "Microsoft"
   Employment Type: Select "Internship"
   Start Date: "2022-06"
   End Date: "2022-08"
   Is Current: OFF (unchecked)
   Location: "Redmond, WA"
   Description: "Developed microservices for Azure platform..."
   Skills: "TypeScript", "Azure", "Docker"
   Published: ON
   ```

3. **Submit and Verify**
   ```
   Click: "Create Experience"
   Expected:
   - Redirects to list page
   - Two experiences now visible
   - Duration calculated correctly (3 mos)
   ```

4. **Check Timeline Order**
   ```
   Navigate: http://localhost:3000/experience
   Expected:
   - Technical Head appears first (most recent)
   - Microsoft internship appears second
   - Both show correct date ranges
   ```

**✅ Pass Criteria**: Past experience with end date displays correct duration

---

## Test Scenario 3: Edit Existing Experience

**User Story**: As an admin, I want to update an experience entry to fix a typo.

### Steps

1. **Open Experience List**
   ```
   URL: http://localhost:3000/admin/experience
   Expected: See list of all experiences
   ```

2. **Click Edit on First Entry**
   ```
   Click: Edit icon/button on "Technical Head" entry
   URL: http://localhost:3000/admin/experience/edit/[id]
   Expected: Form pre-filled with existing data
   ```

3. **Update Fields**
   ```
   Description: Change to "Leading technical initiatives, mentoring 50+ developers..."
   Add Skill: "Technical Mentoring"
   ```

4. **Save Changes**
   ```
   Click: "Update Experience" button
   Expected:
   - Success toast
   - Redirect to list
   - Changes reflected in list view
   ```

5. **Verify Update on Public Page**
   ```
   Navigate: http://localhost:3000/experience
   Expected: Updated description and new skill visible
   ```

**✅ Pass Criteria**: Edits persist and appear on public pages

---

## Test Scenario 4: Reorder Experiences via Drag-and-Drop

**User Story**: As an admin, I want to manually order experiences to highlight specific roles.

### Steps

1. **Open Experience List**
   ```
   URL: http://localhost:3000/admin/experience
   Expected: See draggable list of experiences
   ```

2. **Drag Microsoft Internship Above Technical Head**
   ```
   Action: Click and drag Microsoft entry to top position
   Expected: 
   - Visual feedback during drag
   - Order updates after drop
   - Display order numbers change
   ```

3. **Verify Homepage Reflects New Order**
   ```
   Navigate: http://localhost:3000
   Expected: Microsoft internship now appears first in experience section
   ```

4. **Verify Timeline Page Order**
   ```
   Navigate: http://localhost:3000/experience
   Expected: Same order as admin panel (Microsoft first)
   ```

**✅ Pass Criteria**: Drag-and-drop updates displayOrder field and persists

---

## Test Scenario 5: Draft Experience Not Publicly Visible

**User Story**: As an admin, I want to save a draft experience without publishing it yet.

### Steps

1. **Create Draft Experience**
   ```
   URL: http://localhost:3000/admin/experience/create
   Fill:
   - Title: "Freelance Developer"
   - Company: "Self-Employed"
   - Employment Type: "Self-employed"
   - Start Date: "2021-01"
   - End Date: "2021-12"
   - Is Current: OFF
   - Location: "Remote"
   - Description: "Draft content..."
   - Published: OFF (unchecked)
   Submit
   ```

2. **Verify in Admin List**
   ```
   URL: http://localhost:3000/admin/experience
   Expected:
   - Draft experience visible with "Draft" badge
   - Listed alongside published experiences
   ```

3. **Check Homepage**
   ```
   URL: http://localhost:3000
   Expected: Draft experience NOT visible in experience section
   ```

4. **Check Timeline Page**
   ```
   URL: http://localhost:3000/experience
   Expected: Draft experience NOT visible in timeline
   ```

5. **Publish Draft**
   ```
   Edit draft experience
   Toggle Published: ON
   Save
   Expected: Now appears on homepage and timeline page
   ```

**✅ Pass Criteria**: Draft experiences hidden from public, visible only to admin

---

## Test Scenario 6: Delete Experience

**User Story**: As an admin, I want to remove an outdated experience entry.

### Steps

1. **Open Experience List**
   ```
   URL: http://localhost:3000/admin/experience
   ```

2. **Click Delete on Freelance Entry**
   ```
   Click: Delete icon/button
   Expected: Confirmation dialog appears
   ```

3. **Confirm Deletion**
   ```
   Click: "Confirm" in dialog
   Expected:
   - Success toast
   - Entry removed from list
   - Page remains on /admin/experience
   ```

4. **Verify Removal**
   ```
   Check: Admin list - entry gone
   Check: Homepage - entry not displayed
   Check: Timeline page - entry not displayed
   ```

**✅ Pass Criteria**: Deleted experience removed from all views

---

## Test Scenario 7: MDX Description Support

**User Story**: As an admin, I want to use Markdown for rich formatting in descriptions.

### Steps

1. **Create Experience with MDX**
   ```
   URL: http://localhost:3000/admin/experience/create
   Fill:
   - Title: "Senior Developer"
   - Company: "Tech Corp"
   - Employment Type: "Full-time"
   - Dates: 2020-01 to 2022-12
   - Location: "San Francisco, CA"
   - Description Format: Select "Markdown"
   - Description: Enter MDX content:
     ```
     # Key Achievements
     
     - Built **scalable microservices** architecture
     - Reduced API latency by *40%*
     - Led team of 5 developers
     
     ## Technologies
     - React, Node.js, PostgreSQL
     ```
   - Published: ON
   ```

2. **Submit and View**
   ```
   Click: "Create Experience"
   Navigate: http://localhost:3000/experience
   Expected:
   - Markdown renders with proper formatting
   - Headers, bold, italic, lists display correctly
   - Code blocks styled properly
   ```

**✅ Pass Criteria**: MDX content renders correctly with formatting

---

## Test Scenario 8: Responsive Design

**User Story**: As a visitor, I want to view experiences on my mobile device.

### Steps

1. **Open DevTools**
   ```
   Browser: Press F12 or Cmd+Opt+I
   Enable: Device toolbar (mobile view)
   ```

2. **Test Homepage (Mobile)**
   ```
   URL: http://localhost:3000
   Device: iPhone 12 Pro (390x844)
   Expected:
   - Experience section stacks vertically
   - Company logos remain visible
   - Text doesn't overflow
   - "View Full Experience" button accessible
   ```

3. **Test Timeline Page (Mobile)**
   ```
   URL: http://localhost:3000/experience
   Device: iPhone 12 Pro
   Expected:
   - Timeline converts to card layout
   - Each experience card fills width
   - No horizontal scrolling
   - Skills wrap properly
   - Dates and duration readable
   ```

4. **Test Tablet View**
   ```
   Device: iPad (768x1024)
   Expected:
   - 2-column grid on homepage
   - Timeline shows abbreviated connector
   - Touch targets appropriately sized
   ```

5. **Test Admin Panel (Mobile)**
   ```
   URL: http://localhost:3000/admin/experience
   Device: iPhone 12 Pro
   Expected:
   - List view scrollable
   - Edit/delete buttons accessible
   - Form inputs full-width
   - Date pickers work on mobile
   ```

**✅ Pass Criteria**: All layouts responsive without horizontal scroll

---

## Test Scenario 9: SEO and Structured Data

**User Story**: As a site owner, I want my experience page to be SEO-optimized for search engines.

### Steps

1. **View Page Source**
   ```
   URL: http://localhost:3000/experience
   Right-click: "View Page Source"
   ```

2. **Check Meta Tags**
   ```
   Expected to find:
   - <title>Professional Experience | [Site Name]</title>
   - <meta name="description" content="...">
   - <meta property="og:title" content="...">
   - <meta property="og:description" content="...">
   ```

3. **Check Structured Data**
   ```
   Look for: <script type="application/ld+json">
   Expected JSON-LD with:
   - "@type": "Person"
   - "worksFor" or "hasOccupation" properties
   - Individual experience entries
   ```

4. **Test with Google Rich Results**
   ```
   URL: https://search.google.com/test/rich-results
   Input: http://localhost:3000/experience (if publicly accessible)
   OR: Copy page source and paste
   Expected: Valid structured data, no errors
   ```

**✅ Pass Criteria**: Proper meta tags and valid JSON-LD structured data

---

## Test Scenario 10: Performance

**User Story**: As a visitor, I want the experience page to load quickly.

### Steps

1. **Open DevTools Network Tab**
   ```
   Browser: F12 → Network tab
   ```

2. **Load Homepage (Cold)**
   ```
   URL: http://localhost:3000
   Hard Refresh: Cmd+Shift+R (disable cache)
   Expected:
   - Total load time < 2s
   - Experience section renders quickly
   - Company logos lazy-load
   ```

3. **Load Timeline Page**
   ```
   URL: http://localhost:3000/experience
   Expected:
   - Initial render < 1s
   - Images lazy-load as scrolled
   - No layout shift (CLS < 0.1)
   ```

4. **Check Lighthouse Score**
   ```
   DevTools: Lighthouse tab
   Run audit: Desktop, Performance
   Expected:
   - Performance score > 90
   - First Contentful Paint < 1.5s
   - Largest Contentful Paint < 2.5s
   ```

**✅ Pass Criteria**: Page loads in < 2s, Lighthouse score > 90

---

## Test Scenario 11: Error Handling

**User Story**: As an admin, I want clear error messages when form validation fails.

### Steps

1. **Submit Empty Form**
   ```
   URL: http://localhost:3000/admin/experience/create
   Click: "Create Experience" without filling fields
   Expected:
   - Form doesn't submit
   - Red error messages under each required field
   - "Title is required"
   - "Company is required"
   - "Start date is required"
   - etc.
   ```

2. **Invalid Date Range**
   ```
   Fill:
   - Start Date: "2023-06"
   - End Date: "2022-01" (before start)
   - Is Current: OFF
   Submit
   Expected: Error "End date must be after start date"
   ```

3. **Current Position with End Date**
   ```
   Fill:
   - Start Date: "2023-06"
   - End Date: "2024-01"
   - Is Current: Toggle ON
   Submit
   Expected: Error "Current positions cannot have an end date"
   ```

4. **Invalid URL**
   ```
   Fill:
   - Company Website: "not-a-url"
   Submit
   Expected: Error "Invalid URL format"
   ```

5. **Description Too Short**
   ```
   Fill all required fields correctly
   Description: "Short" (< 10 characters)
   Submit
   Expected: Error "Description must be at least 10 characters"
   ```

**✅ Pass Criteria**: All validation errors display clearly with helpful messages

---

## Test Scenario 12: Dark Mode Support

**User Story**: As a visitor, I want the experience section to look good in dark mode.

### Steps

1. **Enable Dark Mode**
   ```
   Toggle: Site theme switcher to "Dark"
   OR: OS setting to dark mode (if site respects system preference)
   ```

2. **View Homepage**
   ```
   URL: http://localhost:3000
   Expected:
   - Experience section has dark background
   - Text readable (sufficient contrast)
   - Company logos visible against dark background
   - Hover states clear in dark mode
   ```

3. **View Timeline Page**
   ```
   URL: http://localhost:3000/experience
   Expected:
   - Dark theme applied consistently
   - Cards have appropriate dark styling
   - Skills badges readable
   - Timeline connector visible
   ```

4. **View Admin Panel**
   ```
   URL: http://localhost:3000/admin/experience
   Expected:
   - Form inputs styled for dark mode
   - Table/list readable
   - Buttons have proper contrast
   ```

**✅ Pass Criteria**: All experience views fully support dark mode with proper contrast

---

## Test Scenario 13: Skills Filter (Future Enhancement)

**Note**: This may not be implemented initially. Include if skill filtering is added.

### Steps

1. **View Timeline with Multiple Experiences**
   ```
   URL: http://localhost:3000/experience
   Ensure: Multiple experiences with different skills
   ```

2. **Click a Skill Badge**
   ```
   Click: "JavaScript" skill chip on any experience
   Expected:
   - Filter applied (URL param or visual indicator)
   - Only experiences with "JavaScript" skill show
   - Other experiences hidden/filtered
   ```

3. **Clear Filter**
   ```
   Click: "Clear filter" or "X" button
   Expected: All experiences visible again
   ```

**✅ Pass Criteria**: Skill filtering works without page reload

---

## Automated Test Commands

After manual testing, run automated tests:

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test experience        # All experience tests
pnpm test models/experience # Model tests only
pnpm test api/admin/experience  # API tests only

# Run with coverage
pnpm test:coverage

# Run type checking
pnpm typecheck
```

**Expected**: All tests pass, coverage > 80%

---

## Rollback Procedure

If critical bugs found during testing:

1. **Revert Database Changes**
   ```bash
   # If using migration scripts
   pnpm admin:rollback-experience
   ```

2. **Revert Code**
   ```bash
   git checkout main
   git branch -D 012-add-linkedin-style
   ```

3. **Restore Previous State**
   ```bash
   # If needed, restore from backup
   ./scripts/restore-backup.sh [backup-date]
   ```

---

## Success Checklist

Mark each scenario as complete after testing:

- [ ] Scenario 1: Admin creates first experience
- [ ] Scenario 2: Add past experience with end date
- [ ] Scenario 3: Edit existing experience
- [ ] Scenario 4: Reorder via drag-and-drop
- [ ] Scenario 5: Draft not publicly visible
- [ ] Scenario 6: Delete experience
- [ ] Scenario 7: MDX description support
- [ ] Scenario 8: Responsive design (mobile/tablet/desktop)
- [ ] Scenario 9: SEO and structured data
- [ ] Scenario 10: Performance (< 2s load, Lighthouse > 90)
- [ ] Scenario 11: Error handling and validation
- [ ] Scenario 12: Dark mode support
- [ ] Scenario 13: Skills filter (if implemented)

**Feature is ready for production when all scenarios pass ✅**

---

## Troubleshooting

### Experience Not Appearing on Homepage
- Check: Is `published` field set to `true`?
- Check: Is start date valid (not in future)?
- Check: Is displayOrder conflicting with others?
- Check: Clear browser cache and hard refresh

### Drag-and-Drop Not Working
- Check: Is @dnd-kit installed?
- Check: Console for JavaScript errors
- Check: Are experiences loading correctly?

### Date Formatting Issues
- Check: date-fns is installed
- Check: Start/end dates are valid Date objects
- Check: Timezone handling (UTC vs local)

### Images Not Loading
- Check: Company logo URL is accessible
- Check: Asset reference is valid ObjectId
- Check: Next.js image domains configured
- Check: CORS headers on image host

---

## Next Steps After Quickstart

1. **Load Production Data**: Import real experiences or create via admin panel
2. **Performance Audit**: Run Lighthouse on production build
3. **Analytics Setup**: Track experience page views, CTA clicks
4. **User Feedback**: Gather feedback from actual users
5. **Iterate**: Plan Phase 2 enhancements based on usage

---

**Document Version**: 1.0  
**Last Updated**: January 4, 2025  
**Maintained By**: Development Team
