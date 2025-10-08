# Knowledge Graph Toggle & Sub-Lessons - Quick Reference

## 🎯 What Changed

### 1. Admin Toggle Added
```
Course Manager → Settings Section → "Enable Knowledge Graph" Switch
Default: OFF (false)
```

### 2. Sub-Lessons Repositioned

**Before:**
```
┌─────────────────────────────────────────────┐
│ SIDEBAR (left)          │ CONTENT (right)   │
├─────────────────────────┼───────────────────┤
│ • Course Overview       │ Lesson Header     │
│ • Knowledge Graph       │ Lesson Content    │
│ • Sub-Lessons (cramped) │ Flashcards        │
│                         │ Navigation        │
└─────────────────────────┴───────────────────┘
```

**After:**
```
┌─────────────────────────────────────────────┐
│ SIDEBAR (left)          │ CONTENT (right)   │
├─────────────────────────┼───────────────────┤
│ • Course Overview       │ Lesson Header     │
│ • Knowledge Graph*      │ Lesson Content    │
│   (*if enabled)         │ Flashcards        │
│                         │ Sub-Lessons ✨     │
│                         │ Navigation        │
└─────────────────────────┴───────────────────┘
```

---

## 📋 Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/models/Course.ts` | Schema | Added `showKnowledgeGraph: Boolean` field |
| `src/types/courses.ts` | Types | Added field to `Course` interface |
| `src/components/admin/courses/CourseManagerContent.tsx` | UI | Admin toggle switch + form state |
| `src/app/api/admin/courses/route.ts` | API | Schema validation + POST handler |
| `src/app/api/admin/courses/[courseId]/route.ts` | API | GET + PUT handlers |
| `src/app/courses/[slug]/page.tsx` | Frontend | Conditional render graph |
| `src/app/courses/[slug]/lesson/[lessonId]/page.tsx` | Frontend | Conditional + reposition sub-lessons |

---

## 🔧 Admin Instructions

### Enable Knowledge Graph for a Course

1. Go to `/admin/courses`
2. Click course to edit
3. Scroll to Settings section (below hero image)
4. Toggle **"Enable Knowledge Graph"** switch
5. Click **"Save Course"**
6. Verify on course public page

### Default Behavior
- ✅ New courses: Graph **OFF** by default
- ✅ Existing courses: Graph **OFF** (MongoDB default)
- ✅ Per-course control (not global setting)

---

## 🧪 Testing Quick Checks

```bash
# 1. Check admin toggle renders
Open: /admin/courses/[courseId]
Look for: "Enable Knowledge Graph" switch below "Feature this course"

# 2. Test conditional rendering (OFF)
Set toggle: OFF
Visit: /courses/[slug]
Expect: No Knowledge Graph component

# 3. Test conditional rendering (ON)
Set toggle: ON
Visit: /courses/[slug]
Expect: Knowledge Graph appears below modules

# 4. Test lesson page (OFF)
Visit: /courses/[slug]/lesson/[lessonId]
Expect: No sidebar graph, sub-lessons in content area

# 5. Test lesson page (ON)
Visit: /courses/[slug]/lesson/[lessonId]
Expect: Sidebar graph visible, sub-lessons still in content area
```

---

## 🎨 UI Location - Admin Toggle

```tsx
// In Course Manager Settings
<section>
  <!-- Other settings -->
  
  <div className="border-dashed px-3 py-2">
    <Label>Feature this course</Label>
    <Switch checked={isFeatured} />
  </div>
  
  <div className="border-dashed px-3 py-2">  ← NEW
    <Label>Enable Knowledge Graph</Label>
    <p>Show visual relationship graph (experimental)</p>
    <Switch checked={showKnowledgeGraph} />
  </div>
</section>
```

---

## 📐 Layout Changes - Lesson Page

### Sidebar (Left Column)
```
┌────────────────────┐
│ Course Overview    │ ← Always shows
│ • Progress bar     │
│ • Back to course   │
├────────────────────┤
│ Knowledge Graph    │ ← Only if enabled
│ • Mini graph       │
│ • Depth controls   │
└────────────────────┘
```

### Content (Right Column)
```
┌─────────────────────────────┐
│ Lesson Header + Metadata    │
├─────────────────────────────┤
│ Lesson Content              │
│ (blog/video/standalone)     │
├─────────────────────────────┤
│ Mark Complete Button        │
├─────────────────────────────┤
│ Flashcard Study Section     │ ← If decks exist
├─────────────────────────────┤
│ SUB-LESSONS ✨               │ ← MOVED HERE
│ 1. First sub-lesson         │
│ 2. Second sub-lesson        │
│ 3. Third sub-lesson         │
├─────────────────────────────┤
│ [Previous] [Next] Buttons   │
└─────────────────────────────┘
```

---

## 🔒 Security & Performance

### Security
- ✅ Admin-only toggle (requires `editor` or `admin` role)
- ✅ Validated via Zod schema
- ✅ Boolean type prevents injection attacks

### Performance
- ✅ No graph API calls when disabled
- ✅ No D3.js library loaded when disabled
- ✅ Smaller bundle size for users without feature
- ✅ Per-course control reduces unnecessary computation

---

## 🚀 Deployment Checklist

- [ ] All TypeScript errors resolved ✅
- [ ] Database schema updated (MongoDB default: `false`)
- [ ] Admin UI toggle functional
- [ ] Course detail page conditionally renders
- [ ] Lesson viewer page conditionally renders
- [ ] Sub-lessons repositioned to content area
- [ ] API endpoints handle new field
- [ ] Documentation created

---

## 🐛 Troubleshooting

### Graph not showing (enabled = true)
1. Hard refresh page (Cmd/Ctrl + Shift + R)
2. Check browser console for errors
3. Verify course has modules/lessons
4. Check API response includes `showKnowledgeGraph: true`

### Toggle not saving
1. Check admin role (must be `editor` or `admin`)
2. Verify network request succeeds
3. Check MongoDB field exists
4. Clear API cache if using Redis

### Sub-lessons in wrong place
1. Clear browser cache
2. Check lesson has `parentLessonId` set
3. Verify component rendering order in page.tsx
4. Inspect DOM - should be in main content `<div>`

---

## 📊 Database Query Examples

```javascript
// Enable for all published courses
db.courses.updateMany(
  { status: 'published' },
  { $set: { showKnowledgeGraph: true } }
);

// Disable for all draft courses
db.courses.updateMany(
  { status: 'draft' },
  { $set: { showKnowledgeGraph: false } }
);

// Check which courses have it enabled
db.courses.find(
  { showKnowledgeGraph: true },
  { title: 1, slug: 1, showKnowledgeGraph: 1 }
);

// Count enabled vs disabled
db.courses.aggregate([
  { $group: {
    _id: '$showKnowledgeGraph',
    count: { $sum: 1 }
  }}
]);
```

---

## ✨ Summary

| Feature | Status | Impact |
|---------|--------|--------|
| Admin Toggle | ✅ Complete | Per-course control |
| Default State | ✅ OFF | Safe rollout |
| Conditional Render | ✅ Complete | Performance win |
| Sub-Lessons Move | ✅ Complete | Better UX |
| API Support | ✅ Complete | Full CRUD |
| TypeScript | ✅ 0 Errors | Type-safe |
| Backward Compat | ✅ Yes | No breaking changes |

**Result:** Knowledge Graph is now opt-in with improved sub-lessons layout! 🎉
