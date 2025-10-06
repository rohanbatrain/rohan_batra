# Code Cohesion Analysis - Duration System

## Overview
This document analyzes how the new duration calculation system integrates with existing codebase utilities to maintain consistency and avoid duplication.

---

## Existing Duration/Time Utilities

### 1. **`src/lib/courses/format.ts`** - Course Duration Formatting
```typescript
export function formatMinutes(total?: number | null): string {
  if (!total || total <= 0) return '—';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
```

**Purpose**: Format course lesson/module/course durations
**Input**: Minutes (number)
**Output**: Human-readable string ("1h 30m", "45m", "—")
**Used in**: Course pages, lesson displays, module summaries

**Decision**: ✅ **KEEP AND USE** - This is the standard formatter for course durations

---

### 2. **`src/lib/utils/experience-utils.ts`** - Work Experience Duration
```typescript
export function calculateDuration(
  startDate: Date,
  endDate: Date | null | undefined
): string {
  // ...
  return parts.join(' '); // e.g., "2 yrs 3 mos"
}
```

**Purpose**: Calculate work experience duration in years/months
**Input**: Start and end dates
**Output**: Human-readable string ("2 yrs 3 mos", "6 mos")
**Used in**: Portfolio experience section, LinkedIn-style work history

**Decision**: ✅ **KEEP SEPARATE** - Different domain (work experience vs. course content)

---

### 3. **`src/lib/courses/duration-calculator.ts`** - NEW (This PR)
```typescript
export function calculateLessonDuration(lesson: LessonDuration): number;
export function calculateModuleDuration(module: ModuleDuration): number;
export function calculateCourseDuration(course: CourseDuration): number;
export function hasOwnContent(lesson: LessonDuration): boolean;
export function getLessonDurationBreakdown(lesson: LessonDuration): {...};
```

**Purpose**: Hierarchical duration calculation for courses with sub-lessons
**Input**: Lesson/Module/Course objects
**Output**: Duration in minutes (number)
**Used in**: Course page, admin panel, progress tracking

**Decision**: ✅ **NEW UTILITY** - Handles calculation logic, uses `formatMinutes()` for display

---

## Cohesion Strategy

### Clear Separation of Concerns

```
┌─────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  COURSES                          EXPERIENCE             │
│  ├─ duration-calculator.ts       ├─ experience-utils.ts │
│  │  (Calculate duration)          │  (Calculate years)  │
│  │                                 │                     │
│  └─ format.ts                     └─ (Uses date-fns)    │
│     (Format duration)                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘

PATTERN:
  Calculation → Formatting → Display
  (Logic)       (Presentation) (UI)
```

---

## Usage Patterns

### Course Duration Flow

```typescript
// 1. CALCULATION (duration-calculator.ts)
import { calculateLessonDuration } from '@/lib/courses/duration-calculator';
const durationInMinutes = calculateLessonDuration(lesson);

// 2. FORMATTING (format.ts)
import { formatMinutes } from '@/lib/courses/format';
const formatted = formatMinutes(durationInMinutes);

// 3. DISPLAY (UI Component)
<span>{formatted}</span>  // "1h 30m"
```

### Experience Duration Flow

```typescript
// 1. CALCULATION + FORMATTING (experience-utils.ts)
import { calculateDuration } from '@/lib/utils/experience-utils';
const formatted = calculateDuration(startDate, endDate);

// 2. DISPLAY (UI Component)
<span>{formatted}</span>  // "2 yrs 3 mos"
```

---

## Why This Cohesion Works

### 1. **Domain-Driven Separation**
- **Courses domain** (`lib/courses/`)
  - `duration-calculator.ts` - Business logic for hierarchical durations
  - `format.ts` - Presentation layer for course times
  - `query.ts` - Data fetching utilities

- **Experience domain** (`lib/utils/`)
  - `experience-utils.ts` - Work experience calculations

### 2. **Single Responsibility**
- **`duration-calculator.ts`**: Calculates durations (returns numbers)
- **`format.ts`**: Formats durations (returns strings)
- **`experience-utils.ts`**: Handles date-based durations (different use case)

### 3. **No Duplication**
- Removed `formatDuration()` from `duration-calculator.ts`
- Uses existing `formatMinutes()` for all course duration formatting
- Maintains separate `calculateDuration()` for experience (different domain)

---

## Integration Points

### Where New Calculator Is Used

#### 1. **Course Page** (`src/app/courses/[slug]/page.tsx`)
```typescript
import { calculateLessonDuration } from '@/lib/courses/duration-calculator';
import { formatMinutes } from '@/lib/courses/format';

// Display lesson duration
<span>
  {formatMinutes(calculateLessonDuration(lesson))}
  {lesson.subLessons?.length > 0 && ' total'}
</span>
```

#### 2. **Admin Panel** (Future)
```typescript
import { getLessonDurationBreakdown } from '@/lib/courses/duration-calculator';
import { formatMinutes } from '@/lib/courses/format';

const { parentDuration, subLessonsDuration, totalDuration } = 
  getLessonDurationBreakdown(lesson);

// Show breakdown
<div>
  Parent: {formatMinutes(parentDuration)}
  Sub-lessons: {formatMinutes(subLessonsDuration)}
  Total: {formatMinutes(totalDuration)}
</div>
```

#### 3. **Progress Tracking** (Future)
```typescript
import { calculateModuleDuration, calculateCourseDuration } from '@/lib/courses/duration-calculator';

// Calculate remaining time
const totalMinutes = calculateCourseDuration(course);
const completedMinutes = calculateCompletedDuration(progress);
const remainingMinutes = totalMinutes - completedMinutes;
```

---

## File Structure Consistency

```
src/lib/
├── courses/
│   ├── duration-calculator.ts  ← NEW: Calculation logic
│   ├── format.ts               ← EXISTING: Formatting utilities
│   └── query.ts                ← EXISTING: Data fetching
│
├── utils/
│   ├── experience-utils.ts     ← EXISTING: Experience domain
│   └── ... (other utilities)
│
└── services/
    └── dashboard-service.ts    ← EXISTING: Uses course.estimatedDurationMinutes
```

---

## Type Safety & Interfaces

### Shared Duration Types

```typescript
// CourseLesson model (database)
interface ICourseLesson {
  estimatedDurationMinutes: number;  // Database field
  parentLessonId?: ObjectId | null;
  // ...
}

// LessonDuration interface (calculator)
interface LessonDuration {
  estimatedDurationMinutes: number;  // Matches DB field
  parentLessonId?: string | null;    // Stringified for frontend
  subLessons?: LessonDuration[];     // Nested structure
  // ...
}
```

**Cohesion**: Type names and field names align with database schema

---

## Backwards Compatibility

### Old Code (Before Sub-lessons)
```typescript
// Still works - uses raw duration
<span>{formatMinutes(lesson.estimatedDurationMinutes)}</span>
```

### New Code (With Sub-lessons)
```typescript
// Smart calculation - handles hierarchy
<span>{formatMinutes(calculateLessonDuration(lesson))}</span>
```

### Migration Path
1. ✅ Old code continues to work
2. ✅ New code adds smart calculation
3. ✅ Gradually update displays to use `calculateLessonDuration()`
4. ✅ No breaking changes

---

## Testing Cohesion

### Unit Tests Should Cover

```typescript
// duration-calculator.test.ts
describe('calculateLessonDuration', () => {
  it('matches formatMinutes output range', () => {
    const duration = calculateLessonDuration(lesson);
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(formatMinutes(duration)).toMatch(/^\d+h?\s?\d*m?$/);
  });
});

// format.test.ts (existing)
describe('formatMinutes', () => {
  it('handles calculator output correctly', () => {
    expect(formatMinutes(0)).toBe('—');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(90)).toBe('1h 30m');
  });
});
```

---

## Documentation Cross-References

### Related Docs
- `DURATION_CALCULATION_FIX.md` - Implementation details
- `SUBLESSONS_IMPLEMENTATION_COMPLETE.md` - Sub-lesson feature
- `COURSE_PAGE_COMPLETION_INDICATORS.md` - UI integration

### API Documentation
```typescript
/**
 * Calculate lesson duration with sub-lesson support
 * 
 * @see {@link formatMinutes} for formatting output
 * @see {@link hasOwnContent} to check if parent has content
 * 
 * @param lesson - Lesson object with optional sub-lessons
 * @returns Duration in minutes (use formatMinutes() to display)
 */
export function calculateLessonDuration(lesson: LessonDuration): number
```

---

## Anti-Patterns Avoided

### ❌ What We DIDN'T Do

1. **Duplicate Formatting**
   ```typescript
   // BAD: Duplicate in duration-calculator.ts
   export function formatDuration(minutes: number): string { ... }
   ```
   ✅ **GOOD**: Use existing `formatMinutes()` from `format.ts`

2. **Mix Calculation & Formatting**
   ```typescript
   // BAD: Returns formatted string
   export function calculateLessonDuration(lesson): string { 
     return "1h 30m";
   }
   ```
   ✅ **GOOD**: Returns number, format separately

3. **Domain Mixing**
   ```typescript
   // BAD: Merge course and experience durations
   export function calculateDuration(...) { // What duration? }
   ```
   ✅ **GOOD**: Separate files per domain

4. **Inline Calculation**
   ```typescript
   // BAD: Repeat calculation logic in every component
   const total = lesson.estimatedDurationMinutes + 
     lesson.subLessons.reduce(...)
   ```
   ✅ **GOOD**: Centralized in `duration-calculator.ts`

---

## Future Enhancements

### Potential Additions (Maintain Cohesion)

1. **Progress Duration**
   ```typescript
   // src/lib/courses/progress-calculator.ts
   export function calculateCompletedDuration(progress, course): number;
   export function calculateRemainingDuration(progress, course): number;
   ```

2. **Duration Validation**
   ```typescript
   // src/lib/validators/duration.ts
   export const durationSchema = z.number().min(0).max(600); // 10 hours max
   ```

3. **Duration Analytics**
   ```typescript
   // src/lib/analytics/duration-tracker.ts
   export function trackLessonDuration(lessonId, actualMinutes): void;
   ```

---

## Summary: Cohesion Achieved ✅

| Aspect | Status | Rationale |
|--------|--------|-----------|
| **No Duplication** | ✅ | Removed `formatDuration()`, use `formatMinutes()` |
| **Domain Separation** | ✅ | Courses vs. Experience in separate files |
| **Single Responsibility** | ✅ | Calculate vs. Format vs. Display |
| **Type Consistency** | ✅ | Interfaces match database schema |
| **Backwards Compatible** | ✅ | Old code still works |
| **Clear Naming** | ✅ | `calculateLessonDuration`, not generic `getDuration` |
| **Import Clarity** | ✅ | `@/lib/courses/*` for course utilities |
| **Documentation** | ✅ | Clear JSDoc with cross-references |

---

## Developer Guidelines

### When Adding Duration Features

1. **Calculation logic** → `duration-calculator.ts`
2. **Formatting logic** → Use existing `formatMinutes()`
3. **New domain** → Create separate file (e.g., `progress-calculator.ts`)
4. **Always return numbers** from calculators, format in components
5. **Document cross-references** in JSDoc comments

### Import Pattern
```typescript
// ✅ GOOD: Clear, explicit imports
import { calculateLessonDuration } from '@/lib/courses/duration-calculator';
import { formatMinutes } from '@/lib/courses/format';

// ❌ BAD: Ambiguous imports
import { calculate } from '@/lib/utils';
import { format } from '@/lib/helpers';
```

---

## Status

✅ **COHESIVE** - New duration calculator integrates cleanly with existing utilities while maintaining clear separation of concerns and avoiding duplication.
