# Duration System Cohesion - Quick Reference

## 📦 The Three-Tier System

```
┌────────────────────────────────────────────────────────────┐
│                     TIER 1: CALCULATION                     │
│         (Business Logic - Returns Numbers)                  │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  duration-calculator.ts                                     │
│  ├─ calculateLessonDuration(lesson) → 45                   │
│  ├─ calculateModuleDuration(module) → 180                  │
│  └─ calculateCourseDuration(course) → 2700                 │
│                                                              │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                     TIER 2: FORMATTING                      │
│         (Presentation Layer - Returns Strings)              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  format.ts                                                  │
│  └─ formatMinutes(45) → "45m"                              │
│     formatMinutes(90) → "1h 30m"                           │
│     formatMinutes(180) → "3h"                              │
│                                                              │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                      TIER 3: DISPLAY                        │
│              (UI Components - React JSX)                    │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Course Page                                                │
│  └─ <span>{formatMinutes(calculateLessonDuration(l))}</span>│
│                                                              │
│  Result: <span>45m</span>                                  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Example

### Parent Lesson with Sub-lessons

```typescript
// INPUT: Lesson Object
const lesson = {
  title: "Randomness and Uncertainty",
  estimatedDurationMinutes: 30,
  standaloneContent: "...", // Has content
  subLessons: [
    { title: "first", estimatedDurationMinutes: 15 }
  ]
};

// STEP 1: Calculate (Tier 1)
import { calculateLessonDuration } from '@/lib/courses/duration-calculator';
const minutes = calculateLessonDuration(lesson);
// Result: 30 + 15 = 45

// STEP 2: Format (Tier 2)
import { formatMinutes } from '@/lib/courses/format';
const display = formatMinutes(minutes);
// Result: "45m"

// STEP 3: Render (Tier 3)
<div>
  {lesson.title} • {display}
  {/* "Randomness and Uncertainty • 45m" */}
</div>
```

---

## 🎯 When to Use What

| Task | Use This | Returns | Example |
|------|----------|---------|---------|
| Get total duration | `calculateLessonDuration()` | `number` | `45` |
| Get breakdown | `getLessonDurationBreakdown()` | `object` | `{ parent: 30, subLessons: 15 }` |
| Check if has content | `hasOwnContent()` | `boolean` | `true` |
| Format for display | `formatMinutes()` | `string` | `"45m"` |
| Module total | `calculateModuleDuration()` | `number` | `180` |
| Course total | `calculateCourseDuration()` | `number` | `2700` |

---

## 📝 Import Patterns

### ✅ Correct Usage

```typescript
// Course page component
import { calculateLessonDuration } from '@/lib/courses/duration-calculator';
import { formatMinutes } from '@/lib/courses/format';

export default function CoursePage({ course }) {
  return (
    <div>
      {course.modules.map(m => (
        <div>
          {m.lessons.map(l => (
            <span>
              {l.title} • {formatMinutes(calculateLessonDuration(l))}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### ❌ Incorrect Usage

```typescript
// DON'T: Mix calculation and formatting
const display = calculateLessonDuration(lesson).toString() + "m";

// DON'T: Duplicate calculation
const total = lesson.estimatedDurationMinutes + 
  lesson.subLessons.reduce((sum, s) => sum + s.estimatedDurationMinutes, 0);

// DON'T: Format without calculating
const display = formatMinutes(lesson.estimatedDurationMinutes); // Wrong for parents!
```

---

## 🏗️ Architecture Benefits

### Separation of Concerns
```
calculation-logic  ≠  formatting  ≠  rendering
     (pure)           (pure)         (React)
```

### Testability
```typescript
// Easy to test - pure functions
test('calculates parent + sub-lessons', () => {
  const result = calculateLessonDuration(mockLesson);
  expect(result).toBe(45);
});

test('formats durations correctly', () => {
  expect(formatMinutes(45)).toBe('45m');
  expect(formatMinutes(90)).toBe('1h 30m');
});
```

### Reusability
```typescript
// Use in multiple places
- Course page display
- Admin panel breakdown
- Progress tracking
- Analytics reports
- Email notifications
```

---

## 🔗 Cross-Module Cohesion

### Courses Domain
```
src/lib/courses/
├── duration-calculator.ts   [NEW] Calculate hierarchical durations
├── format.ts                [EXISTING] Format minutes to strings
└── query.ts                 [EXISTING] Fetch course data
```

### Experience Domain (Separate)
```
src/lib/utils/
└── experience-utils.ts      [EXISTING] Calculate work experience
                             (Different: uses dates, returns "2 yrs 3 mos")
```

**Why Separate?**
- Different input types (Lessons vs. Dates)
- Different output formats (minutes vs. years/months)
- Different use cases (Learning vs. Career)

---

## 📊 Real-World Example

### Before (Incorrect Double-Counting)
```
Module: "Probability Fundamentals"
├─ Lesson 1: "Introduction" (30m)
├─ Lesson 2: "Randomness" (30m)        ← Parent shown as 30m
│   └─ Sub-lesson: "first" (15m)       ← Sub-lesson shown as 15m
└─ Lesson 3: "Models" (25m)

Displayed total: 30 + 30 + 15 + 25 = 100m ❌ WRONG!
```

### After (Correct with Calculator)
```
Module: "Probability Fundamentals"
├─ Lesson 1: "Introduction" (30m)
├─ Lesson 2: "Randomness" (45m total)  ← Shows 45m (30 + 15)
│   └─ Sub-lesson: "first" (15m)       ← Part of parent
└─ Lesson 3: "Models" (25m)

Calculated total: 30 + 45 + 25 = 100m ✅ CORRECT!
```

---

## 🎓 Developer Quick Start

### Adding Duration Display to New Component

```typescript
// 1. Import both utilities
import { calculateLessonDuration } from '@/lib/courses/duration-calculator';
import { formatMinutes } from '@/lib/courses/format';

// 2. Calculate duration
const durationInMinutes = calculateLessonDuration(lesson);

// 3. Format for display
const displayText = formatMinutes(durationInMinutes);

// 4. Render
return <span>{displayText}</span>;
```

### Showing Duration Breakdown

```typescript
import { 
  getLessonDurationBreakdown 
} from '@/lib/courses/duration-calculator';
import { formatMinutes } from '@/lib/courses/format';

const { parentDuration, subLessonsDuration, totalDuration, hasContent } = 
  getLessonDurationBreakdown(lesson);

return (
  <div>
    {hasContent && <div>Parent: {formatMinutes(parentDuration)}</div>}
    {subLessonsDuration > 0 && (
      <div>Sub-lessons: {formatMinutes(subLessonsDuration)}</div>
    )}
    <div className="font-bold">
      Total: {formatMinutes(totalDuration)}
    </div>
  </div>
);
```

---

## ✅ Cohesion Checklist

- [x] **No duplication** - Single `formatMinutes()` function
- [x] **Clear separation** - Calculate → Format → Display
- [x] **Type safety** - Interfaces match DB schema
- [x] **Domain isolation** - Courses vs. Experience separate
- [x] **Pure functions** - Easy to test and reason about
- [x] **Consistent naming** - `calculate*Duration()`, `format*`
- [x] **Documentation** - JSDoc with cross-references
- [x] **Import clarity** - `@/lib/courses/*` prefix

---

## 📚 Related Documentation

- `DURATION_CALCULATION_FIX.md` - Full implementation guide
- `DURATION_COHESION_ANALYSIS.md` - Detailed cohesion analysis
- `SUBLESSONS_IMPLEMENTATION_COMPLETE.md` - Sub-lesson feature

---

**Last Updated**: October 6, 2025  
**Status**: ✅ Production Ready
