# Data Model: Professional Experience

**Feature**: LinkedIn-style experience management  
**Phase**: 1 - Design & Contracts  
**Date**: January 4, 2025

## Overview
This document defines the data entities and their relationships for the professional experience management system.

---

## Core Entity: Experience

### Purpose
Represents a single work experience entry in the user's professional career history, similar to LinkedIn's experience section.

### Schema Definition

```typescript
interface IExperience {
  // Core Information
  title: string;                          // Job title/position (e.g., "Technical Head", "Senior Developer")
  company: string;                        // Company name (e.g., "GDG UPES", "Microsoft")
  companyWebsite?: string;                // Optional company website URL
  
  // Visual Branding
  companyLogo?: string;                   // Direct URL to company logo
  companyLogoAsset?: ObjectId;            // Reference to Asset document (uploaded image)
  
  // Employment Details
  employmentType: EmploymentType;         // Type of employment
  startDate: Date;                        // Position start date (month precision)
  endDate?: Date;                         // Position end date (null if current)
  isCurrent: boolean;                     // Flag for ongoing position
  location: string;                       // Location (e.g., "San Francisco, CA" or "Remote")
  
  // Content
  description: string;                    // Detailed description of role, responsibilities, achievements
  descriptionFormat: ContentFormat;       // Format of description content
  
  // Metadata
  skills: string[];                       // Associated skills/technologies
  displayOrder: number;                   // Manual ordering (lower = higher priority)
  published: boolean;                     // Visibility status (draft vs published)
  
  // Audit Fields
  createdAt: Date;                        // Auto-generated creation timestamp
  updatedAt: Date;                        // Auto-generated update timestamp
}
```

### Field Specifications

#### Core Information

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `title` | String | Yes | max 200 chars, trim | Job title or position name |
| `company` | String | Yes | max 200 chars, trim | Company or organization name |
| `companyWebsite` | String | No | Valid URL format | Link to company website |

#### Visual Branding

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `companyLogo` | String | No | Valid URL format | Direct link to company logo image |
| `companyLogoAsset` | ObjectId | No | Valid Asset reference | Uploaded logo via Asset system |

**Display Priority**: 
1. Use `companyLogoAsset` if present (preferred)
2. Fallback to `companyLogo` URL if no asset
3. Show default placeholder if neither exists

#### Employment Details

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `employmentType` | Enum | Yes | See EmploymentType enum | Classification of employment |
| `startDate` | Date | Yes | Valid date, ≤ today | When position began |
| `endDate` | Date | No | Valid date, ≥ startDate, ≤ today | When position ended (null if current) |
| `isCurrent` | Boolean | Yes | Default: false | Whether position is ongoing |
| `location` | String | Yes | max 200 chars | Geographic location or "Remote" |

**Business Rules**:
- If `isCurrent` is true, `endDate` must be null
- If `isCurrent` is false and `endDate` is null, set `endDate` to `startDate` (same-day position)
- `endDate` must be after or equal to `startDate`
- Dates stored as first day of month (YYYY-MM-01) for month precision

#### Content

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `description` | String | Yes | max 5000 chars | Rich description of responsibilities and achievements |
| `descriptionFormat` | Enum | Yes | 'rich-text' or 'markdown' | Content format type |

**Format Details**:
- `rich-text`: HTML content from TipTap editor
- `markdown`: MDX content for advanced formatting

#### Metadata

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `skills` | Array<String> | No | Each max 50 chars, max 20 skills | Associated skills/technologies |
| `displayOrder` | Number | Yes | Integer, default: 0 | Manual sort priority (lower = show first) |
| `published` | Boolean | Yes | Default: false | Whether visible to public |

#### Audit Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `createdAt` | Date | Auto | - | Document creation timestamp |
| `updatedAt` | Date | Auto | - | Last modification timestamp |

---

## Enumerations

### EmploymentType

Represents the classification of employment relationship.

```typescript
enum EmploymentType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  SELF_EMPLOYED = 'Self-employed',
  FREELANCE = 'Freelance',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship',
  APPRENTICESHIP = 'Apprenticeship',
  SEASONAL = 'Seasonal'
}
```

**Display**: Show as badge with appropriate styling (e.g., blue for Full-time, green for Current positions)

### ContentFormat

```typescript
enum ContentFormat {
  RICH_TEXT = 'rich-text',
  MARKDOWN = 'markdown'
}
```

---

## Relationships

### Asset Reference (Optional)

```
Experience ──> Asset (companyLogoAsset)
  Many to One (optional)
```

- Experience can reference one Asset document for company logo
- Asset document contains Cloudinary metadata (URL, publicId, dimensions)
- Relationship is optional (fallback to URL or placeholder)

**Foreign Key**: `companyLogoAsset` (ObjectId) references `Asset._id`

### Future Relationships (Not Implemented Initially)

Potential future enhancements:

```
Experience ──> Project (Many-to-Many)
  Link experiences to portfolio projects worked on during that time

Experience ──> BlogPost (One-to-Many)
  Link blog posts written about work during experience

Experience ──> Skill (Many-to-Many)
  Shared taxonomy with portfolio and blog
```

---

## Indexes

### Required Indexes

1. **Display Order & Date** (Compound)
   ```typescript
   { displayOrder: 1, startDate: -1 }
   ```
   - Purpose: Efficient sorting for admin list and public display
   - Use case: Manual order (displayOrder) with fallback to reverse chronological

2. **Published & Date** (Compound)
   ```typescript
   { published: 1, startDate: -1 }
   ```
   - Purpose: Fast public queries for published experiences
   - Use case: Homepage and `/experience` page

3. **Start Date** (Single)
   ```typescript
   { startDate: -1 }
   ```
   - Purpose: Reverse chronological ordering
   - Use case: Timeline view, recent experiences

### Optional Indexes (Add if needed)

4. **Company** (Text index)
   ```typescript
   { company: 'text', title: 'text' }
   ```
   - Purpose: Full-text search in admin panel
   - Use case: Search by company name or job title

---

## Validation Rules

### Model-Level Validation

1. **Date Range**
   ```typescript
   validate: {
     validator: function(this: IExperience) {
       if (this.endDate && this.startDate) {
         return this.endDate >= this.startDate;
       }
       return true;
     },
     message: 'End date must be after or equal to start date'
   }
   ```

2. **Current Position**
   ```typescript
   validate: {
     validator: function(this: IExperience) {
       if (this.isCurrent) {
         return this.endDate === null || this.endDate === undefined;
       }
       return true;
     },
     message: 'Current positions cannot have an end date'
   }
   ```

3. **URL Validation**
   ```typescript
   validate: {
     validator: function(url: string) {
       return /^https?:\/\/.+/.test(url);
     },
     message: 'Invalid URL format'
   }
   ```

### Application-Level Validation (Zod)

```typescript
import { z } from 'zod';

const ExperienceCreateSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  company: z.string().min(1).max(200).trim(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companyLogo: z.string().url().optional().or(z.literal('')),
  employmentType: z.enum([
    'Full-time', 'Part-time', 'Self-employed', 'Freelance',
    'Contract', 'Internship', 'Apprenticeship', 'Seasonal'
  ]),
  startDate: z.coerce.date().max(new Date(), 'Start date cannot be in the future'),
  endDate: z.coerce.date().max(new Date(), 'End date cannot be in the future').optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().min(1).max(200).trim(),
  description: z.string().min(10).max(5000),
  descriptionFormat: z.enum(['rich-text', 'markdown']).default('rich-text'),
  skills: z.array(z.string().max(50)).max(20).default([]),
  displayOrder: z.number().int().default(0),
  published: z.boolean().default(false)
}).refine(
  (data) => !data.isCurrent || !data.endDate,
  { message: 'Current positions cannot have an end date', path: ['endDate'] }
).refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  { message: 'End date must be after start date', path: ['endDate'] }
);
```

---

## Computed Properties

### Duration Calculation

Not stored in database, calculated on-read:

```typescript
function calculateDuration(startDate: Date, endDate: Date | null, isCurrent: boolean): string {
  const end = isCurrent || !endDate ? new Date() : endDate;
  const months = differenceInMonths(end, startDate);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
  }
  if (remainingMonths === 0) {
    return `${years} yr${years !== 1 ? 's' : ''}`;
  }
  return `${years} yr${years !== 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
}
```

### Date Display Format

```typescript
function formatDateRange(startDate: Date, endDate: Date | null, isCurrent: boolean): string {
  const start = format(startDate, 'MMM yyyy'); // "Jan 2023"
  const end = isCurrent ? 'Present' : endDate ? format(endDate, 'MMM yyyy') : 'Present';
  const duration = calculateDuration(startDate, endDate, isCurrent);
  
  return `${start} - ${end} · ${duration}`;
}
```

**Example**: "Jan 2023 - Present · 2 yrs 3 mos"

---

## Default Values

| Field | Default Value | Notes |
|-------|---------------|-------|
| `isCurrent` | `false` | User must explicitly mark as current |
| `descriptionFormat` | `'rich-text'` | Rich text is primary content type |
| `displayOrder` | `0` | Neutral sort position |
| `published` | `false` | Draft by default, requires explicit publish |
| `skills` | `[]` | Empty array if not provided |
| `createdAt` | Current timestamp | Auto-generated by Mongoose |
| `updatedAt` | Current timestamp | Auto-updated by Mongoose |

---

## Example Documents

### Example 1: Current Full-time Position

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Technical Head",
  "company": "Google Developer Groups UPES",
  "companyWebsite": "https://gdgupes.tech",
  "companyLogo": "https://gdgupes.tech/logo.png",
  "employmentType": "Part-time",
  "startDate": "2023-08-01T00:00:00.000Z",
  "endDate": null,
  "isCurrent": true,
  "location": "Dehradun, India",
  "description": "<p>Leading technical initiatives and mentoring 50+ developers...</p>",
  "descriptionFormat": "rich-text",
  "skills": ["Leadership", "Event Management", "Technical Mentoring", "JavaScript"],
  "displayOrder": 1,
  "published": true,
  "createdAt": "2025-01-04T10:00:00.000Z",
  "updatedAt": "2025-01-04T10:00:00.000Z"
}
```

### Example 2: Past Internship with MDX

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Software Engineering Intern",
  "company": "Microsoft",
  "companyWebsite": "https://microsoft.com",
  "companyLogoAsset": "507f1f77bcf86cd799439099",
  "employmentType": "Internship",
  "startDate": "2022-06-01T00:00:00.000Z",
  "endDate": "2022-08-31T00:00:00.000Z",
  "isCurrent": false,
  "location": "Redmond, WA (Hybrid)",
  "description": "# Key Achievements\n\n- Built scalable microservice\n- Reduced latency by 40%",
  "descriptionFormat": "markdown",
  "skills": ["TypeScript", "Azure", "Docker", "Kubernetes"],
  "displayOrder": 2,
  "published": true,
  "createdAt": "2025-01-04T09:00:00.000Z",
  "updatedAt": "2025-01-04T09:30:00.000Z"
}
```

### Example 3: Draft Self-Employed Position

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Freelance Web Developer",
  "company": "Self-Employed",
  "employmentType": "Self-employed",
  "startDate": "2021-01-01T00:00:00.000Z",
  "endDate": "2021-12-31T00:00:00.000Z",
  "isCurrent": false,
  "location": "Remote",
  "description": "<p>Developed custom websites for local businesses...</p>",
  "descriptionFormat": "rich-text",
  "skills": ["React", "Node.js", "MongoDB", "Tailwind CSS"],
  "displayOrder": 0,
  "published": false,
  "createdAt": "2025-01-04T08:00:00.000Z",
  "updatedAt": "2025-01-04T08:00:00.000Z"
}
```

---

## Migration Considerations

### Initial Data Population

For existing portfolio owners:

1. **Manual Entry**: Admin creates experiences through UI
2. **Import Script**: Optional script to import from LinkedIn export
3. **Seed Data**: Development seed with 3-5 sample experiences

### Schema Evolution

Future additions (backward compatible):

- `highlights: string[]` - Bullet points of key achievements
- `projects: ObjectId[]` - Link to portfolio projects
- `featured: boolean` - Highlight specific experiences
- `mediaAttachments: ObjectId[]` - Photos, documents, certificates
- `slug: string` - SEO-friendly URL for individual experience pages

---

## Summary

The Experience entity is designed to:
- ✅ Match LinkedIn's experience structure
- ✅ Support both simple (URL) and advanced (Asset) logo management
- ✅ Enable rich content via MDX or rich-text
- ✅ Provide flexible ordering (manual + chronological)
- ✅ Include comprehensive validation
- ✅ Optimize for read performance with proper indexing
- ✅ Support draft/published workflow
- ✅ Calculate human-readable durations dynamically
- ✅ Extend easily for future enhancements

Ready for API contract definition.
