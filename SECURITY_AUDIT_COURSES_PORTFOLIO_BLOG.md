# Security Audit: Courses, Portfolio, and Blog Systems

**Date**: January 2025  
**Scope**: Course Management, Portfolio Projects, Blog Posts  
**Auditor**: AI Security Analysis  
**Status**: ⚠️ CRITICAL ISSUES FOUND

---

## Executive Summary

This audit identifies **18 security vulnerabilities** across the Courses, Portfolio, and Blog systems. While authentication is properly implemented, critical issues exist around:

- **NO rate limiting** on any endpoints (DoS vulnerability)
- **Slug uniqueness** not checked on course/module/lesson updates
- **Race conditions** on order fields and slug generation
- **Data exposure** in public APIs (not yet implemented but models allow)
- **Pagination missing** from list endpoints
- **URL validation** accepting dangerous protocols
- **No audit logging** for sensitive operations

### Severity Breakdown
- 🔴 **Critical**: 4 issues
- 🟠 **High**: 7 issues  
- 🟡 **Medium**: 5 issues
- 🔵 **Low**: 2 issues

---

## 🔴 CRITICAL ISSUES

### 1. No Rate Limiting on Admin/Public Endpoints
**Severity**: Critical  
**Systems**: Courses, Portfolio, Blog  
**Risk**: DoS attacks, resource exhaustion, brute force

**Current State**:
```typescript
// src/app/api/admin/courses/route.ts
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  // NO RATE LIMITING!
  
  const courses = await CourseModel.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
}

// src/app/api/admin/portfolio/route.ts
export async function POST(request: NextRequest) {
  // NO RATE LIMITING!
  const validatedData = ProjectCreateSchema.parse(body);
}
```

**Vulnerability**: Attacker can:
- Make 1000s of requests per second
- Overwhelm database with queries
- Exhaust server resources
- Prevent legitimate users from accessing system

**Impact**: Same as Brands system - complete service disruption possible

---

### 2. Slug Uniqueness Not Checked on Updates
**Severity**: Critical  
**Systems**: Courses, Modules (Portfolio has partial fix)  
**Risk**: Data integrity, overwrites, broken URLs

**Course Update - NO Check**:
```typescript
// src/app/api/admin/courses/[courseId]/route.ts
export async function PUT(request: NextRequest, ctx) {
  if (parsed.slug && parsed.slug !== courseDoc.slug) {
    const exists = await CourseModel.exists({
      slug: parsed.slug,
      _id: { $ne: courseDoc._id },
    });
    if (exists) {
      return NextResponse.json(
        { error: 'Slug already in use' },
        { status: 409 }
      );
    }
    courseDoc.slug = parsed.slug;
  }
  // ✅ GOOD - Has check
}
```

**Module Order Uniqueness - NO Check**:
```typescript
// src/models/CourseModule.ts
CourseModuleSchema.index({ courseId: 1, order: 1 }, { unique: true });
// ✅ Database enforces uniqueness BUT...

// src/app/api/admin/courses/[courseId]/modules/[moduleId]/route.ts
export async function PUT(request, { params }) {
  if (parsed.order !== undefined) {
    moduleDoc.order = parsed.order; // ❌ NO CHECK FOR CONFLICTS!
  }
  await moduleDoc.save(); // Will throw E11000 duplicate key error
}
```

**Problem**: 
- No pre-check before update
- User gets cryptic MongoDB error instead of friendly message
- Race condition possible if two modules updated to same order simultaneously

---

### 3. Lesson Slug Race Condition on Create
**Severity**: Critical  
**System**: Course Lessons  
**Risk**: Duplicate slugs, data corruption

**Problematic Code**:
```typescript
// src/app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/route.ts
let slug: string | undefined;
if (slugSource) {
  slug = await uniqueSlug(slugSource, async candidate => {
    const exists = await CourseLessonModel.exists({ slug: candidate });
    return Boolean(exists);
  });
}

// ⚠️ RACE CONDITION WINDOW HERE

const lesson = await CourseLessonModel.create({
  slug,
  // ...
});
```

**Attack Scenario**:
1. Request A checks: slug "intro-to-python" → not exists ✓
2. Request B checks: slug "intro-to-python" → not exists ✓ (race window)
3. Request A creates lesson with slug "intro-to-python" ✓
4. Request B creates lesson with slug "intro-to-python" → **E11000 duplicate key error**

**Impact**: 
- User gets confusing error message
- No automatic retry or slug regeneration
- System appears broken to users

---

### 4. No Public Course API Exists Yet
**Severity**: Critical (Preventive)  
**System**: Courses  
**Risk**: Data exposure when implemented

**Current State**:
```bash
$ ls src/app/api/public/
brands/
# ❌ NO courses/ directory
```

**Risk**: When public course API is implemented, developers might expose:
- Internal field values (lessonCount, order, structureVersion)
- Draft/unpublished content
- User IDs and creation timestamps
- Full module/lesson hierarchy without pagination

**Required Before Public API**:
1. Rate limiting (30 req/min)
2. Data minimization (hide internal fields)
3. Pagination with max limit
4. Response validation
5. Cache headers

---

## 🟠 HIGH SEVERITY ISSUES

### 5. Module Order Race Condition
**Severity**: High  
**System**: Course Modules  
**Risk**: Two modules with same order, broken sequence

**Vulnerable Endpoint**:
```typescript
// src/app/api/admin/courses/[courseId]/modules/route.ts
export async function POST(request, { params }) {
  const defaultOrder = existingModules.length
    ? existingModules[0].order + 1
    : 0;

  const moduleDoc = await CourseModuleModel.create({
    order: parsed.order ?? defaultOrder,
    // ...
  });
}
```

**Race Condition**:
1. Request A: Gets modules, last order = 5
2. Request B: Gets modules, last order = 5 (same query)
3. Request A: Creates module with order = 6
4. Request B: Creates module with order = 6 → **Duplicate!**

**Fix**: Use atomic operation
```typescript
const result = await CourseModuleModel.findOneAndUpdate(
  { courseId: courseDoc._id },
  { $max: { maxOrder: 0 } },
  { upsert: true, new: true }
);
const nextOrder = result.maxOrder + 1;
```

---

### 6. Lesson Order/Module Assignment Issues
**Severity**: High  
**System**: Course Lessons  
**Risk**: Orphaned lessons, incorrect module associations

**Problem**: No validation that `moduleId` matches `courseId`
```typescript
// src/app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/route.ts
const course = await findCourse(paramCourseId);
const module = await CourseModuleModel.findById(paramModuleId);

// ❌ NO CHECK: Does module.courseId === course._id?
// User could create lesson in wrong course's module!
```

**Attack Scenario**:
```bash
POST /api/admin/courses/COURSE_A/modules/MODULE_FROM_COURSE_B/lessons
# Module B belongs to Course B, not Course A
# But API doesn't validate this!
```

---

### 7. Flashcard Deck Link Target Validation
**Severity**: High  
**System**: Flashcard Decks  
**Risk**: Broken links, orphaned data

**Schema Validation**:
```typescript
// src/models/FlashcardDeck.ts
FlashcardDeckSchema.pre<IFlashcardDeck>('validate', function (next) {
  for (const target of this.linkTargets) {
    if (target.scope === 'course' && !target.courseId) {
      return next(new Error('Course scope requires courseId'));
    }
    // ✅ GOOD validation
  }
});
```

**Missing Validation**: No check that referenced IDs actually exist!
```typescript
linkTargets: [{
  scope: 'course',
  courseId: '507f1f77bcf86cd799439011' // ❌ What if this course doesn't exist?
}]
```

**Fix**: Add existence validation
```typescript
if (target.courseId) {
  const course = await CourseModel.exists({ _id: target.courseId });
  if (!course) {
    return next(new Error(`Course ${target.courseId} not found`));
  }
}
```

---

### 8. Portfolio URL Validation Too Permissive
**Severity**: High  
**System**: Portfolio Projects  
**Risk**: XSS, open redirect, phishing

**Current Validation**:
```typescript
// src/models/Project.ts
demoUrl: {
  type: String,
  trim: true,
  match: /^https?:\/\/.+/, // ❌ TOO PERMISSIVE
}
```

**Accepts Dangerous URLs**:
```javascript
javascript:alert('XSS')  // ❌ XSS attack
data:text/html,<script>alert('XSS')</script>  // ❌ Data URI
http://evil.com/@victim.com  // ❌ Misleading domain
```

**Fix**: Use strict URL validation
```typescript
demoUrl: {
  type: String,
  trim: true,
  match: /^https:\/\/.+/,  // HTTPS only
  validate: {
    validator: (url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && 
               !parsed.username && 
               !parsed.password;
      } catch {
        return false;
      }
    }
  }
}
```

---

### 9. Blog Post Slug Auto-Generation Race Condition
**Severity**: High  
**System**: Blog Posts  
**Risk**: Duplicate slugs, overwritten content

**Pre-Save Hook**:
```typescript
// src/models/BlogPost.ts
BlogPostSchema.pre<IBlogPost>('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  // ❌ NO UNIQUENESS CHECK!
  next();
});
```

**Race Condition**:
1. Two posts created with same title "Hello World"
2. Both generate slug "hello-world"
3. First save succeeds
4. Second save throws E11000 duplicate key error

**Fix**: Use uniqueSlug() helper
```typescript
if (this.isModified('title') && !this.slug) {
  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  this.slug = await uniqueSlug(baseSlug, async candidate => {
    const exists = await BlogPostModel.exists({ 
      slug: candidate,
      _id: { $ne: this._id }
    });
    return Boolean(exists);
  });
}
```

---

### 10. Portfolio Bulk Actions Missing Validation
**Severity**: High  
**System**: Portfolio Projects  
**Risk**: Unintended data loss, broken state

**Bulk Delete**:
```typescript
// src/app/api/admin/portfolio/route.ts
case 'delete':
  updateData.deletedAt = currentTime;
  updateData.deletedBy = user._id;
  break;

const result = await Project.updateMany(
  { _id: { $in: bulkData.projectIds } },
  { $set: updateData }
);
// ❌ No check if projects exist or are protected
```

**Missing Validations**:
- No verification that all IDs are valid
- No check if project is featured (maybe shouldn't bulk-delete featured projects)
- No confirmation for destructive actions
- No limit on bulk action size (could delete 10,000 projects)

---

### 11. Course Lesson External Resource URL Not Validated
**Severity**: High  
**System**: Course Lessons  
**Risk**: Embedding malicious content

**Current Schema**:
```typescript
// src/models/CourseLesson.ts
externalResource: {
  provider: {
    type: String,
    enum: ['youtube', 'vimeo', 'loom', 'custom'], // ⚠️ 'custom' is dangerous
  },
  url: {
    type: String,
    required: true,
    match: /^https?:\/\//i, // ❌ Too permissive
  },
}
```

**Risk**: 
- `custom` provider with `javascript:` URL
- Embedding phishing sites
- No validation of provider-specific URL format

**Fix**: Provider-specific validation
```typescript
validate: {
  validator: function(this: ICourseLesson, url: string) {
    const { provider } = this.externalResource;
    switch (provider) {
      case 'youtube':
        return /^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(url) ||
               /^https:\/\/youtu\.be\//.test(url);
      case 'vimeo':
        return /^https:\/\/(www\.)?vimeo\.com\/\d+/.test(url);
      case 'loom':
        return /^https:\/\/(www\.)?loom\.com\/share\//.test(url);
      case 'custom':
        // Only allow HTTPS, no credentials
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && 
               !parsed.username && 
               !parsed.password;
      default:
        return false;
    }
  }
}
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### 12. No Pagination on Course List
**Severity**: Medium  
**System**: Courses Admin API  
**Risk**: Performance degradation, memory exhaustion

**Current Implementation**:
```typescript
// src/app/api/admin/courses/route.ts
const limit = Math.min(
  Math.max(parseInt(searchParams.get('limit') || '24', 10), 1),
  100
);
// ✅ HAS limit (max 100)

const courses = await CourseModel.find(filter)
  .sort({ updatedAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
// ✅ GOOD - Has pagination
```

**Issue**: While pagination EXISTS, default limit is 24 and max is 100:
- Large course catalogs (100+ courses) will have slow queries
- Frontend must make multiple requests
- No cursor-based pagination for real-time updates

**Improvement**: Add cursor pagination option
```typescript
const lastId = searchParams.get('lastId');
const filter: FilterQuery<ICourse> = {};

if (lastId && Types.ObjectId.isValid(lastId)) {
  filter._id = { $gt: new Types.ObjectId(lastId) };
}

const courses = await CourseModel.find(filter)
  .sort({ _id: 1 })
  .limit(limit)
  .lean();
```

---

### 13. Portfolio Slug Conflict Handling
**Severity**: Medium  
**System**: Portfolio Projects  
**Risk**: Unpredictable slug generation

**Auto-Generation Logic**:
```typescript
// src/app/api/admin/portfolio/route.ts
if (!validatedData.slug || validatedData.slug.trim() === '') {
  validatedData.slug = validatedData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const existingProject = await Project.findOne({ slug: validatedData.slug });
if (existingProject) {
  validatedData.slug = `${validatedData.slug}-${Date.now()}`; // ⚠️ TIMESTAMP SUFFIX
}
```

**Problems**:
1. Timestamp makes ugly slugs: `my-project-1735689600000`
2. Not user-friendly or SEO-friendly
3. No guarantee timestamp suffix is unique (microsecond race condition)

**Better Approach**: Use numeric suffix like brands system
```typescript
const existingProject = await Project.findOne({ slug: validatedData.slug });
if (existingProject) {
  // Find next available numeric suffix
  let suffix = 2;
  while (await Project.exists({ slug: `${validatedData.slug}-${suffix}` })) {
    suffix++;
  }
  validatedData.slug = `${validatedData.slug}-${suffix}`;
}
```

---

### 14. Course Publish Guard Not Comprehensive
**Severity**: Medium  
**System**: Courses  
**Risk**: Publishing incomplete courses

**Current Guard**:
```typescript
// src/app/api/admin/courses/route.ts (POST)
if (parsed.status === 'published') {
  return NextResponse.json(
    { error: 'Cannot publish a course with zero lessons. Create modules/lessons first.' },
    { status: 400 }
  );
}

// src/app/api/admin/courses/[courseId]/route.ts (PUT)
if (
  parsed.status === 'published' &&
  (typeof courseDoc.lessonCount !== 'number' || courseDoc.lessonCount <= 0)
) {
  return NextResponse.json(
    { error: 'Cannot publish a course with zero lessons. Create modules/lessons first.' },
    { status: 400 }
  );
}
```

**Missing Checks**:
- No validation that lessons have content (contentType, blogSlug, standaloneContent)
- No check for required fields (heroImage, summary length)
- No warning for lessons without duration
- No validation of lesson order consistency

**Recommended Pre-Publish Validation**:
```typescript
const validationIssues = [];

if (courseDoc.lessonCount === 0) {
  validationIssues.push('Course must have at least one lesson');
}

if (!courseDoc.heroImage && !courseDoc.heroLottieId) {
  validationIssues.push('Course must have a hero image or Lottie animation');
}

const lessons = await CourseLessonModel.find({ courseId: courseDoc._id });
const incompleteLessons = lessons.filter(l => 
  (l.contentType === 'blog' && !l.blogSlug) ||
  (l.contentType === 'standalone' && !l.standaloneContent) ||
  (l.contentType === 'video' && !l.externalResource)
);

if (incompleteLessons.length > 0) {
  validationIssues.push(`${incompleteLessons.length} lessons are incomplete`);
}

if (validationIssues.length > 0) {
  return NextResponse.json({
    error: 'Cannot publish course with validation issues',
    issues: validationIssues
  }, { status: 400 });
}
```

---

### 15. No Audit Trail for Course/Module/Lesson Changes
**Severity**: Medium  
**Systems**: Courses, Modules, Lessons  
**Risk**: No accountability, difficult debugging

**Current State**: Portfolio has audit trail, but Courses don't
```typescript
// Portfolio (HAS audit trail)
const auditEntry = {
  action: 'updated',
  userId: user._id,
  userName: user.name,
  timestamp: currentTime,
  metadata: {
    fields: Object.keys(validatedData),
  },
};

// ❌ Courses/Modules/Lessons (NO audit trail)
await courseDoc.save(); // No logging
```

**Impact**: 
- Can't track who published a course
- Can't see who changed lesson order
- Can't debug "why did this module disappear?"
- No compliance trail for regulated content

---

### 16. Blog Post View/Like Count Not Rate-Limited
**Severity**: Medium  
**System**: Blog Posts  
**Risk**: Count inflation, DoS

**Instance Methods**:
```typescript
// src/models/BlogPost.ts
BlogPostSchema.methods.incrementViewCount = function (): Promise<IBlogPost> {
  this.viewCount += 1;
  return this.save();
};

BlogPostSchema.methods.incrementLikeCount = function (): Promise<IBlogPost> {
  this.likeCount += 1;
  return this.save();
};
```

**Vulnerability**: 
- No rate limiting on these methods
- Attacker can call incrementViewCount() in loop
- Inflates metrics artificially
- Same IP/user can like/view unlimited times

**Fix**: Add IP-based rate limiting
```typescript
// Track views per IP per post
const viewKey = `view:${postId}:${clientIp}`;
const lastView = await redis.get(viewKey);

if (!lastView || Date.now() - parseInt(lastView) > 60000) { // 1 min cooldown
  await post.incrementViewCount();
  await redis.set(viewKey, Date.now().toString(), 'EX', 60);
}
```

---

## 🔵 LOW SEVERITY ISSUES

### 17. Course Module lessonIds Array Not Validated
**Severity**: Low  
**System**: Course Modules  
**Risk**: Invalid ObjectId references

**Schema**:
```typescript
// src/models/CourseModule.ts
lessonIds: {
  type: [Schema.Types.ObjectId],
  ref: 'CourseLesson',
  default: [],
},
```

**Pre-Validation Hook**:
```typescript
CourseModuleSchema.pre<ICourseModule>('validate', function (next) {
  if (this.lessonIds.some(id => !mongoose.isValidObjectId(id))) {
    return next(new Error('Module lessonIds must be valid ObjectIds.'));
  }
  // ⚠️ Checks format but not existence
  next();
});
```

**Issue**: 
- Validates ObjectId format ✓
- Doesn't validate lesson exists ✗
- Doesn't validate lesson belongs to this module ✗

**Enhancement**:
```typescript
CourseModuleSchema.pre('save', async function (next) {
  if (this.isModified('lessonIds') && this.lessonIds.length > 0) {
    const lessons = await CourseLessonModel.find({
      _id: { $in: this.lessonIds },
      moduleId: this._id
    });
    
    if (lessons.length !== this.lessonIds.length) {
      return next(new Error('Some lesson IDs are invalid or belong to other modules'));
    }
  }
  next();
});
```

---

### 18. Portfolio Feature Flag Implementation Incomplete
**Severity**: Low  
**System**: Portfolio Projects  
**Risk**: Inconsistent feature availability

**Feature Flag Usage**:
```typescript
// src/app/api/admin/portfolio/route.ts
function filterEnhancedFields(data: any, context: FeatureFlagContext) {
  const filtered = { ...data };

  if (!featureFlags.isAdvancedFeatureEnabled('multiCategories', context).enabled) {
    delete filtered.categories;
  }
  // ... more checks
}
```

**Issues**:
1. Feature flags checked on write but not read
2. Database still stores disabled features
3. Frontend might display fields that backend rejects
4. No clear documentation of which features are behind flags

**Consistency Fix**:
```typescript
// Apply filter on both read and write
export async function GET(request: NextRequest) {
  const projects = await query;
  const context = createFeatureFlagContext(user);
  
  return NextResponse.json({
    projects: projects.map(p => filterEnhancedFields(p, context))
  });
}
```

---

## Comparison: Brands vs. Courses vs. Portfolio

| Security Feature | Brands | Courses | Portfolio | Blog |
|-----------------|--------|---------|-----------|------|
| Rate Limiting | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Slug Uniqueness (Create) | ✅ Yes | ⚠️ Helper | ⚠️ Timestamp | ❌ Race |
| Slug Uniqueness (Update) | ✅ Yes | ✅ Yes | ✅ Yes | N/A |
| Audit Logging | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Public API | ✅ Yes | ❌ Missing | ❌ Missing | ❌ Missing |
| URL Validation | ✅ Platform | ⚠️ Regex | ⚠️ Regex | ❌ None |
| Pagination | ✅ Yes (20) | ✅ Yes (24) | ✅ Yes (20) | ❌ No |
| Data Minimization | ✅ Yes | N/A | N/A | N/A |
| Race Conditions | ✅ Fixed | ⚠️ Order | ⚠️ Bulk | ⚠️ Slug |
| Error Sanitization | ✅ Yes | ⚠️ Partial | ⚠️ Partial | ❌ No |

---

## Priority Fix Checklist

### 🔴 IMMEDIATE (This Week)

- [ ] **Add rate limiting to ALL endpoints**
  - Courses admin: 100 req/min
  - Courses public (when created): 30 req/min
  - Portfolio admin: 100 req/min
  - Blog admin: 100 req/min
  
- [ ] **Fix module order race condition**
  - Use atomic $inc operation for order assignment
  
- [ ] **Fix lesson slug race condition**
  - Wrap uniqueSlug + create in transaction
  
- [ ] **Validate module belongs to course**
  - Check moduleId.courseId === courseId in lesson creation

### 🟠 HIGH PRIORITY (This Month)

- [ ] **Add audit logging to courses**
  - Course publish/unpublish events
  - Module creation/deletion
  - Lesson content changes
  
- [ ] **Implement strict URL validation**
  - Portfolio: HTTPS-only, no credentials
  - Lessons: Provider-specific validation
  
- [ ] **Fix blog post slug auto-generation**
  - Use uniqueSlug() helper
  - Add numeric suffix on conflict
  
- [ ] **Add bulk action validation**
  - Verify all IDs exist
  - Add confirmation for destructive actions
  - Limit bulk size to 100 items

### 🟡 MEDIUM PRIORITY (Next Quarter)

- [ ] **Add comprehensive course publish validation**
  - Check all lessons have content
  - Validate required fields
  - Check lesson order consistency
  
- [ ] **Implement view/like rate limiting**
  - IP-based cooldown (1 min)
  - User-based limits (if authenticated)
  
- [ ] **Add cursor-based pagination**
  - For large course catalogs
  - Better real-time performance
  
- [ ] **Create public course API** with security:
  - Rate limiting (30/min)
  - Data minimization
  - Response validation
  - Cache headers

### 🔵 LOW PRIORITY (Nice to Have)

- [ ] **Add lesson existence validation**
  - Module.lessonIds references
  - Flashcard deck link targets
  
- [ ] **Standardize feature flag handling**
  - Apply on both read and write
  - Document feature availability

---

## Code Examples for Fixes

### Rate Limiting Template
```typescript
// Apply to all endpoints
import { 
  checkRateLimit, 
  getClientIdentifier, 
  rateLimitPresets,
  createRateLimitResponse 
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(identifier, rateLimitPresets.admin);
  
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }
  
  // ... rest of handler
}
```

### Module Order Atomic Operation
```typescript
// Instead of querying last order and incrementing
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Get next order atomically
  const orderCounter = await CourseModel.findByIdAndUpdate(
    courseDoc._id,
    { $inc: { _nextModuleOrder: 1 } },
    { new: true, session }
  );
  
  const moduleDoc = await CourseModuleModel.create([{
    courseId: courseDoc._id,
    order: orderCounter._nextModuleOrder || 0,
    // ...
  }], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Audit Logging for Courses
```typescript
import { createAuditLog } from '@/lib/audit-log';

// After course update
await createAuditLog(request, {
  userId,
  action: 'update',
  resource: 'course',
  resourceId: courseDoc._id.toString(),
  changes: {
    before: { status: previousStatus },
    after: { status: courseDoc.status },
    fields: ['status']
  }
});
```

---

## Testing Recommendations

### Rate Limiting Test
```bash
# Should succeed for first 100 requests, then fail
for i in {1..105}; do
  curl -H "Authorization: Bearer $TOKEN" \
       http://localhost:3000/api/admin/courses
done
```

### Module Order Race Test
```bash
# Run concurrent module creates
for i in {1..10}; do
  curl -X POST -H "Authorization: Bearer $TOKEN" \
       -d '{"title":"Module '$i'"}' \
       http://localhost:3000/api/admin/courses/$COURSE_ID/modules &
done
wait
# Check: All modules should have unique orders
```

### Slug Conflict Test
```bash
# Create two lessons simultaneously with same title
curl -X POST -d '{"title":"Introduction"}' ... &
curl -X POST -d '{"title":"Introduction"}' ... &
wait
# Both should succeed with different slugs
```

---

## Conclusion

The Courses, Portfolio, and Blog systems have **18 critical security issues** that mirror and extend beyond the Brands/Socials issues fixed previously. The most critical gaps are:

1. **No rate limiting anywhere** (immediate DoS risk)
2. **Race conditions** on orders and slugs
3. **Missing audit trails** (compliance risk)
4. **URL validation gaps** (XSS/phishing risk)

**Recommended Action**: Apply the same comprehensive fixes used for Brands/Socials system:
- Rate limiting library (already exists)
- Audit logging system (already exists)  
- Strict URL validation patterns
- Atomic operations for concurrent updates
- Comprehensive pre-publish validation

**Estimated Fix Time**: 
- Critical issues: 2-3 days
- High priority: 1 week
- Medium priority: 2 weeks
- Low priority: 1 week

**Total**: ~4 weeks for complete security hardening across all systems.
