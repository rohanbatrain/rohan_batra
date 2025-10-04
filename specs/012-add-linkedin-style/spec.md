# Feature Specification: Professional Experience Management System

**Feature Branch**: `012-add-linkedin-style`  
**Created**: January 2025  
**Status**: Draft  
**Input**: User description: "Add LinkedIn-style experience section with full admin CRUD, homepage section, and dedicated /experience route"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: LinkedIn-style experience management system identified
2. Extract key concepts from description
   → Actors: site owner (admin), site visitors
   → Actions: create/edit/delete experiences, view experiences, filter/sort experiences
   → Data: work experiences, company info, dates, descriptions, skills
   → Constraints: consistent with existing site design, responsive, SEO-optimized
3. For each unclear aspect:
   → All requirements sufficiently clear from description
4. Fill User Scenarios & Testing section
   → Primary flows: admin manages experiences, visitors view timeline
5. Generate Functional Requirements
   → CRUD operations, display sections, filtering, responsive design
6. Identify Key Entities
   → Experience (work history entity with all related fields)
7. Run Review Checklist
   → All sections complete, requirements testable
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
**As a site owner**, I want to manage my professional work experience (similar to LinkedIn) so that visitors can view my career progression and qualifications.

**As a site visitor**, I want to view the site owner's professional experience in a clear, chronological timeline so that I can understand their career background and expertise.

### Acceptance Scenarios

#### Admin Flow
1. **Given** an authenticated admin user, **When** they navigate to the admin panel, **Then** they see an "Experience" section in the navigation
2. **Given** the admin is on the experience management page, **When** they click "Add Experience", **Then** a form opens to create a new experience entry
3. **Given** the admin is filling the experience form, **When** they provide required fields (title, company, dates), **Then** the system validates and saves the entry
4. **Given** an existing experience entry, **When** the admin clicks edit, **Then** they can modify all fields including reordering
5. **Given** an existing experience entry, **When** the admin clicks delete, **Then** the system prompts for confirmation before removal
6. **Given** multiple experience entries, **When** the admin drags entries, **Then** the display order updates accordingly

#### Visitor Flow
1. **Given** published experience entries exist, **When** a visitor navigates to the homepage, **Then** they see a "Professional Experience" section with 2-3 most recent entries
2. **Given** the visitor is on the homepage experience section, **When** they click "View Full Experience", **Then** they navigate to `/experience` route
3. **Given** the visitor is on `/experience` page, **When** the page loads, **Then** they see all experience entries in reverse chronological order (most recent first)
4. **Given** experience entries with long descriptions, **When** the visitor views them, **Then** descriptions support rich text formatting (markdown/HTML)
5. **Given** experience entries with company logos, **When** displayed, **Then** logos appear consistently sized and formatted
6. **Given** the visitor is on mobile device, **When** viewing experiences, **Then** the timeline layout adapts responsively

### Edge Cases
- What happens when no experience entries exist yet? 
  → Homepage shows empty state or hides section, `/experience` shows encouraging message
- How does the system handle very long company names or titles?
  → Text truncates with ellipsis on cards, full text on detail view
- What if start date is after end date?
  → Form validation prevents invalid date ranges
- How are concurrent positions handled (multiple jobs at same time)?
  → Each entry is independent, timeline shows overlapping periods
- What happens to entries marked as "Present" (current position)?
  → System displays "Present" instead of end date, automatically calculates ongoing duration
- How are gaps in employment displayed?
  → Timeline shows all entries chronologically, gaps are implicit between entries
- What if admin uploads very large image for company logo?
  → System validates file size, suggests optimization, or auto-resizes

## Requirements *(mandatory)*

### Functional Requirements

#### Admin Panel - Experience Management
- **FR-001**: System MUST provide a dedicated "Experience" section in admin navigation
- **FR-002**: System MUST display all experience entries in a list/table view with drag-to-reorder capability
- **FR-003**: System MUST provide "Create New Experience" button to add entries
- **FR-004**: System MUST provide edit functionality for each experience entry
- **FR-005**: System MUST provide delete functionality with confirmation dialog
- **FR-006**: System MUST validate required fields (title, company name, start date)
- **FR-007**: System MUST allow marking position as "Current" (ongoing, no end date)
- **FR-008**: System MUST calculate and display duration automatically based on dates
- **FR-009**: System MUST support rich text descriptions (markdown or HTML with preview)
- **FR-010**: System MUST support company logo upload with preview
- **FR-011**: System MUST support multiple employment types (Full-time, Part-time, Contract, Self-employed, etc.)
- **FR-012**: System MUST support location field (city, state, country or "Remote")
- **FR-013**: System MUST support optional skills/tags associated with each position
- **FR-014**: System MUST support optional URL for company website
- **FR-015**: System MUST save draft states before publishing
- **FR-016**: System MUST support visibility toggle (published/draft)

#### Homepage Experience Section
- **FR-017**: System MUST display "Professional Experience" section on homepage
- **FR-018**: System MUST show 2-3 most recent published experience entries
- **FR-019**: System MUST display each entry with: company logo, title, company name, duration, brief description
- **FR-020**: System MUST provide "View Full Experience →" link to dedicated page
- **FR-021**: System MUST hide section completely when no published entries exist
- **FR-022**: System MUST maintain consistent styling with existing homepage sections (blog, portfolio)
- **FR-023**: System MUST be responsive across all device sizes

#### Dedicated Experience Page (/experience)
- **FR-024**: System MUST create dedicated route at `/experience`
- **FR-025**: System MUST display all published experience entries in reverse chronological order
- **FR-026**: System MUST use timeline/card layout similar to LinkedIn
- **FR-027**: System MUST display full details: title, company (with logo), employment type, dates, duration, location, description, skills
- **FR-028**: System MUST show employment type badge (Full-time, Part-time, etc.)
- **FR-029**: System MUST display location with icon
- **FR-030**: System MUST render rich text descriptions properly
- **FR-031**: System MUST display skills/tags as clickable chips
- **FR-032**: System MUST show company website link when provided
- **FR-033**: System MUST include proper SEO metadata (title, description, structured data)
- **FR-034**: System MUST be fully responsive on mobile, tablet, and desktop
- **FR-035**: System MUST support dark mode consistent with site theme
- **FR-036**: System MUST include a "Download Resume" button prominently placed
- **FR-037**: System MUST show total years of experience calculation at top

#### Content Display
- **FR-038**: System MUST display company logos in consistent size (circular or square with border radius)
- **FR-039**: System MUST show duration in human-readable format (e.g., "2 yrs 3 mos")
- **FR-040**: System MUST display "Present" for current positions
- **FR-041**: System MUST support expandable descriptions for long content
- **FR-042**: System MUST use consistent color scheme with existing site (blue accents, proper contrast)
- **FR-043**: System MUST animate entry appearance on scroll (subtle fade/slide)

### Key Entities

#### Experience
**Purpose**: Represents a single work experience/position in the user's career history

**Core Attributes**:
- **Title/Position**: The job title or role name (e.g., "Technical Head", "Senior Developer")
- **Company Name**: Name of the organization (e.g., "GDG UPES", "Microsoft")
- **Company Logo**: Image URL or file reference for company branding
- **Company Website**: Optional URL to company website
- **Employment Type**: Enum of employment classification
  - Full-time
  - Part-time  
  - Self-employed
  - Freelance
  - Contract
  - Internship
  - Apprenticeship
  - Seasonal
- **Start Date**: Month and year when position began
- **End Date**: Month and year when position ended (null if current)
- **Is Current**: Boolean flag indicating ongoing position
- **Location**: Geographic location or "Remote" 
  - Format: "City, State, Country" or "Remote" or "Hybrid"
- **Description**: Rich text detailing responsibilities, achievements, and impact
  - Support for markdown/HTML formatting
  - Bullet points for key accomplishments
  - Metrics and quantifiable results
- **Skills/Tags**: Array of skill keywords associated with this position
  - Used for filtering and SEO
  - Linked to site-wide skill taxonomy if applicable
- **Display Order**: Integer for manual sorting/ordering
- **Visibility Status**: Published or Draft
- **Created/Updated Timestamps**: For audit trail

**Relationships**:
- May reference existing Portfolio Projects (optional link)
- May reference existing Blog Posts written about the work (optional)
- Shares Skills taxonomy with Portfolio and Blog systems

**Business Rules**:
- Start Date must be before End Date (if End Date provided)
- At most one position can be marked "Current" per company (soft rule, not enforced)
- Duration is calculated automatically from Start Date to (End Date or Current Date)
- When marked Current, End Date must be null
- Description should support character limit (e.g., 2000 chars for summary, unlimited for full)

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none found)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
