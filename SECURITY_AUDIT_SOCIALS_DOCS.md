# Security Audit & Bug Analysis: Socials & Docs Systems

**Date**: January 2, 2025  
**Systems Analyzed**: Brand/Socials Management System & Documentation System  
**Severity Levels**: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | ✅ Info

---

## 🔴 CRITICAL ISSUES

### 1. **Missing Slug Uniqueness Check on Brand Updates** 
**Location**: `/src/app/api/admin/brands/[id]/route.ts` (PUT handler)  
**Severity**: 🔴 Critical

**Issue**: When updating a brand's slug, there's no check to ensure the new slug isn't already taken by another brand.

```typescript
// Current Code (line ~145)
const parsed = updateBrandSchema.parse(body);
await connectToDatabase();

// If setting as primary, unset other primary brands
if (parsed.isPrimary) {
  await BrandModel.updateMany({ _id: { $ne: id }, isPrimary: true }, { isPrimary: false });
}

const brand = await BrandModel.findByIdAndUpdate(id, parsed, {
  new: true,
  runValidators: true,
});
```

**Impact**: 
- Duplicate slugs can break the unique index, causing 500 errors
- Multiple brands with same slug cause routing conflicts
- Data integrity violation

**Comparison**: The Docs system DOES have this check:
```typescript
// /src/app/api/admin/docs/projects/[id]/route.ts (line ~207)
if (parsed.slug && parsed.slug !== project.slug) {
  const existing = await DocProjectModel.exists({
    slug: parsed.slug,
    _id: { $ne: project._id },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'Slug already in use' },
      { status: 409 }
    );
  }
  project.slug = parsed.slug;
}
```

**Fix Required**: Add slug conflict check before updating brand.

---

### 2. **Missing Slug Uniqueness Check on Brand Creation**
**Location**: `/src/app/api/admin/brands/route.ts` (POST handler)  
**Severity**: 🔴 Critical

**Issue**: Auto-generated slugs (via pre-save hook) can collide if two brands have similar names.

```typescript
// Current Code (line ~115)
const brand = await BrandModel.create(parsed);
```

**Scenario**:
1. Create brand "Rohan Batra" → slug: "rohan-batra"
2. Create brand "Rohan-Batra" → slug: "rohan-batra" (duplicate!)
3. Mongoose throws duplicate key error → 500 Internal Server Error

**Impact**: 
- Poor user experience (generic error instead of helpful message)
- No chance to retry with different name
- Logs clutter with expected validation errors

**Fix Required**: Manually check slug before creation or catch duplicate key errors gracefully.

---

### 3. **No Rate Limiting on Any API Endpoints**
**Location**: All API routes in `/src/app/api/admin/*` and `/src/app/api/public/*`  
**Severity**: 🔴 Critical

**Issue**: Zero rate limiting implementation across the entire codebase.

**Search Result**: No matches for "rate", "limit", "throttle", or "ratelimit" in API routes.

**Attack Vectors**:
- **Admin APIs**: Authenticated attacker can spam create/update/delete operations
- **Public APIs**: Anonymous attacker can:
  - DoS the `/api/public/brands` endpoint (database exhaustion)
  - Scrape all public social profiles
  - Exhaust MongoDB connection pool

**Impact**:
- Database overload
- Increased hosting costs
- Service degradation for legitimate users
- Potential data exfiltration

**Fix Required**: Implement rate limiting using:
- Next.js middleware + Redis (recommended)
- `@upstash/ratelimit` package
- Per-IP and per-user limits

---

### 4. **Public API Returns Sensitive Internal Structure**
**Location**: `/src/app/api/public/brands/route.ts`  
**Severity**: 🟠 High

**Issue**: Public endpoint leaks internal database structure and metadata.

```typescript
// Current Code (line ~22-48)
return {
  id: brand._id.toString(),
  name: brand.name,
  displayName: brand.displayName,
  slug: brand.slug,
  description: brand.description,
  type: brand.type,           // ⚠️ Reveals categorization
  isPrimary: brand.isPrimary, // ⚠️ Reveals internal priority
  order: brand.order,         // ⚠️ Reveals ordering logic
  theme: brand.theme,
  metadata: brand.metadata,   // ⚠️ Could contain sensitive stats
  profiles: profiles.map((profile: any) => ({
    id: profile._id.toString(),
    platform: profile.platform,
    username: profile.username,
    profileUrl: profile.profileUrl,
    displayName: profile.displayName,
    isVerified: profile.isVerified,
    order: profile.order,     // ⚠️ Reveals ordering logic
    stats: profile.stats,
  })),
};
```

**Information Leakage**:
- `isPrimary`: Reveals which brand is your "main" one
- `order`: Reveals prioritization strategy
- `type`: Reveals internal categorization (professional/creative/personal)
- `metadata.followers`: Could reveal stats you want private

**Impact**:
- Competitor intelligence gathering
- Understanding of your brand strategy
- Privacy concerns (some stats should be admin-only)

**Fix Required**: Create a whitelist of public-safe fields.

---

## 🟠 HIGH SEVERITY ISSUES

### 5. **Missing Input Sanitization for URLs**
**Location**: Multiple routes accepting `profileUrl`, `logoUrl`, `websiteUrl`  
**Severity**: 🟠 High

**Issue**: URL validation only checks format, not content.

```typescript
// /src/app/api/admin/brands/[id]/profiles/[profileId]/route.ts
profileUrl: z.string().url().optional(),

// /src/models/Brand.ts
websiteUrl: {
  type: String,
  trim: true,
  match: /^https?:\/\/.+/,
}
```

**Attack Vectors**:
- **Open Redirect**: `javascript:alert(document.cookie)`
- **SSRF**: `file:///etc/passwd` or internal IPs like `http://192.168.1.1/admin`
- **XSS via data URLs**: `data:text/html,<script>alert('XSS')</script>`

**Current Protection**: Zod's `.url()` validator accepts:
- ✅ `https://example.com` (safe)
- ✅ `javascript:alert(1)` (DANGEROUS)
- ✅ `data:text/html,...` (DANGEROUS)
- ✅ `file:///etc/passwd` (DANGEROUS)

**Impact**:
- XSS if URLs are rendered unsafely in frontend
- SSRF if URLs are fetched server-side (future feature risk)
- Phishing attacks via malicious links

**Fix Required**: 
```typescript
// Whitelist only http/https protocols
const safeUrl = z.string().url().refine(
  (url) => url.startsWith('http://') || url.startsWith('https://'),
  { message: 'Only HTTP/HTTPS URLs are allowed' }
);
```

---

### 6. **Race Condition on isPrimary Flag**
**Location**: `/src/app/api/admin/brands/route.ts` (POST) and `[id]/route.ts` (PUT)  
**Severity**: 🟠 High

**Issue**: Non-atomic operation can result in multiple primary brands.

```typescript
// Step 1: Unset all primary brands
if (parsed.isPrimary) {
  await BrandModel.updateMany({ isPrimary: true }, { isPrimary: false });
}

// Step 2: Create/update new primary brand
const brand = await BrandModel.create(parsed);
// OR
const brand = await BrandModel.findByIdAndUpdate(id, parsed, {...});
```

**Race Condition Scenario**:
```
Time | Request A                              | Request B
-----|----------------------------------------|----------------------------------------
T1   | Check isPrimary = true                 | Check isPrimary = true
T2   | Update all isPrimary = false           | -
T3   | -                                      | Update all isPrimary = false
T4   | Create brand A with isPrimary = true   | -
T5   | -                                      | Create brand B with isPrimary = true
T6   | RESULT: TWO PRIMARY BRANDS! ❌         | -
```

**Impact**:
- Footer shows inconsistent data
- Unpredictable behavior when fetching primary brand
- Data integrity violation

**Fix Required**: Use MongoDB transactions or application-level locking.

---

### 7. **No Pagination on Public Brands Endpoint**
**Location**: `/src/app/api/public/brands/route.ts`  
**Severity**: 🟠 High

**Issue**: Returns ALL public brands and ALL their profiles in one request.

```typescript
// Current Code (line ~13)
const brands = await BrandModel.find({
  isActive: true,
  visibility: 'public',
})
  .sort({ order: 1, createdAt: -1 })
  .lean();

// Fetch public profiles for each brand
const brandsWithProfiles = await Promise.all(
  brands.map(async (brand: any) => {
    const profiles = await SocialProfileModel.find({...}).lean();
    return {...};
  })
);
```

**Performance Impact**:
- **Current Scale**: 2 brands × 6 profiles = ~2KB response (OK)
- **Future Scale**: 100 brands × 10 profiles = ~100KB response (SLOW)
- N+1 query problem: 1 query for brands + N queries for profiles

**Attack Vector**:
- Attacker creates many brands to slow down the endpoint
- DoS by requesting repeatedly (no caching)

**Fix Required**: 
1. Add pagination (`?page=1&limit=10`)
2. Implement caching with Redis (TTL: 5 minutes)
3. Use aggregation pipeline to avoid N+1 queries

---

### 8. **Client-Side Only Error Handling in Frontend**
**Location**: `/src/app/socials/page.tsx` and `/src/components/Footer.tsx`  
**Severity**: 🟡 Medium

**Issue**: Failed API calls silently fail or show generic errors.

```typescript
// /src/app/socials/page.tsx (line ~111)
} catch (err) {
  console.error('Error fetching brands:', err);
  setError('Failed to load brands. Please try again later.');
  setLoading(false);
}
```

**Problems**:
- No retry logic
- No specific error messages (network vs. 500 vs. 404)
- No logging to backend monitoring
- Poor UX (just says "try again later")

**Fix Required**: 
- Add exponential backoff retry
- Show specific error messages
- Send errors to monitoring service (Sentry, etc.)

---

## 🟡 MEDIUM SEVERITY ISSUES

### 9. **Missing Index on DocProject.slug**
**Location**: `/src/models/DocProject.ts`  
**Severity**: 🟡 Medium

**Issue**: DocProject has unique slug but no standalone index.

```typescript
// Current Code (line ~227)
DocProjectSchema.index({ slug: 1, status: 1 });
```

**Problem**: Compound index `{slug: 1, status: 1}` is NOT used for queries like:
```javascript
DocProjectModel.findOne({ slug: 'my-project' }); // ❌ No index match
```

MongoDB will use the compound index ONLY if the query includes `slug` as the first field, but it's inefficient compared to a dedicated index.

**Comparison**: Brand model has BOTH:
```typescript
BrandSchema.index({ slug: 1 }); // ✅ Standalone index
BrandSchema.index({ type: 1, isActive: 1 }); // ✅ Compound index
```

**Fix Required**: Add standalone slug index to DocProject.

---

### 10. **No Validation for Profile URL Domains**
**Location**: `/src/app/api/admin/brands/[id]/profiles/route.ts`  
**Severity**: 🟡 Medium

**Issue**: Users can set any URL for any platform.

**Examples**:
- Instagram profile pointing to Twitter: `https://twitter.com/fake`
- GitHub profile pointing to malicious site: `https://evil.com/malware`
- Email with invalid format: `profileUrl: "mailto:not-an-email"`

**Current Validation**: Only checks if it's a valid URL format.

**Fix Required**: Platform-specific URL validation:
```typescript
const platformUrlPatterns = {
  instagram: /^https:\/\/(www\.)?instagram\.com\/.+/,
  twitter: /^https:\/\/(www\.)?(twitter|x)\.com\/.+/,
  github: /^https:\/\/(www\.)?github\.com\/.+/,
  linkedin: /^https:\/\/(www\.)?linkedin\.com\/in\/.+/,
  email: /^mailto:.+@.+\..+/,
  // ... more patterns
};
```

---

### 11. **Inconsistent Error Messages Leak Implementation Details**
**Location**: Multiple API routes  
**Severity**: 🟡 Medium

**Examples**:
```typescript
// ❌ Leaks MongoDB internals
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
console.error('Error fetching brands:', error); // Full stack trace in logs

// ❌ Reveals database structure
return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
// Attacker now knows the resource is called "Brand"

// ❌ Reveals business logic
return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
// vs. generic "Access denied"
```

**Information Leakage**:
- Stack traces in console logs (accessible in dev mode)
- Model names in error messages
- Validation error details expose field names

**Fix Required**: Sanitize all error messages before sending to client.

---

### 12. **No Audit Trail for Brand/Profile Changes**
**Location**: All admin API routes  
**Severity**: 🟡 Medium

**Issue**: No logging of who changed what and when.

**Missing Information**:
- Who deleted a brand?
- What was the old value before update?
- When did isPrimary flag change?
- Who added a social profile?

**Impact**:
- Cannot debug issues ("Why is this profile gone?")
- No accountability for admin actions
- Cannot rollback malicious changes
- Compliance issues (GDPR audit requirements)

**Fix Required**: 
1. Add `lastModifiedBy` field to models
2. Create separate `AuditLog` collection
3. Log all CUD operations (Create, Update, Delete)

---

## 🔵 LOW SEVERITY ISSUES

### 13. **No HTTPS Enforcement on URL Fields**
**Location**: All URL validations  
**Severity**: 🔵 Low

**Issue**: HTTP URLs are allowed, exposing users to MITM attacks.

```typescript
// Current regex allows HTTP
match: /^https?:\/\/.+/,
```

**Fix**: Change to HTTPS-only:
```typescript
match: /^https:\/\/.+/,
```

---

### 14. **Missing Metadata Limits Could Allow DoS**
**Location**: `/src/models/Brand.ts` and `/src/models/SocialProfile.ts`  
**Severity**: 🔵 Low

**Issue**: Some optional fields have no length limits.

```typescript
// Brand model - description has limit (good)
description: { type: String, maxlength: 500 }

// SocialProfile model - description has limit (good)
description: { type: String, maxlength: 300 }

// BUT: customIcon has no validation
customIcon: { type: String, maxlength: 50 }
```

**Potential Attack**: Store massive strings in optional fields to bloat database.

**Fix**: Review all optional string fields and add reasonable limits.

---

### 15. **Frontend Doesn't Validate API Response Structure**
**Location**: `/src/app/socials/page.tsx` and `/src/components/Footer.tsx`  
**Severity**: 🔵 Low

**Issue**: Assumes API response is well-formed without checking.

```typescript
// /src/app/socials/page.tsx (line ~108)
const data = await response.json();
setBrands(data.brands); // What if data.brands is undefined?
```

**Scenarios**:
- API returns `{ error: 'Something' }` but code expects `{ brands: [...] }`
- API returns `{ brands: null }` instead of empty array
- Malicious proxy modifies response

**Fix**: Add runtime type validation with Zod on client side.

---

## ✅ GOOD PRACTICES FOUND

### ✅ 1. Proper Authorization Checks
All admin routes check user roles correctly:
```typescript
const { authorized } = await getAuthorizedUser(userId);
if (!authorized) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

### ✅ 2. ObjectId Validation
All routes validate MongoDB IDs before queries:
```typescript
if (!Types.ObjectId.isValid(id)) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
}
```

### ✅ 3. Input Validation with Zod
Comprehensive schemas for all inputs:
```typescript
const createBrandSchema = z.object({
  name: z.string().min(2).max(50),
  displayName: z.string().min(2).max(100),
  // ... more validation
});
```

### ✅ 4. Cascade Deletion
Brand deletion properly cleans up associated profiles:
```typescript
await SocialProfileModel.deleteMany({ brandId: id });
```

### ✅ 5. Proper Indexing (Mostly)
Models have appropriate indexes for query performance:
```typescript
BrandSchema.index({ slug: 1 });
BrandSchema.index({ type: 1, isActive: 1 });
SocialProfileSchema.index({ brandId: 1, platform: 1, username: 1 }, { unique: true });
```

---

## 📊 COMPARISON: Socials vs. Docs Systems

| Feature | Socials System | Docs System | Winner |
|---------|---------------|-------------|--------|
| Slug uniqueness check on update | ❌ Missing | ✅ Implemented | Docs |
| Slug uniqueness check on create | ❌ Missing | ⚠️ Partial (catches error) | Docs |
| Rate limiting | ❌ None | ❌ None | Tie (both bad) |
| Public API data exposure | ⚠️ Leaks internal fields | ✅ No public API | Docs |
| Input sanitization | ⚠️ URL validation weak | ✅ Better validation | Docs |
| Race condition protection | ❌ isPrimary flag | N/A | Docs |
| Pagination | ❌ None | ✅ Implemented | Docs |
| Audit logging | ❌ None | ❌ None | Tie (both missing) |
| Authorization | ✅ Proper | ✅ Proper | Tie (both good) |
| ObjectId validation | ✅ Proper | ✅ Proper | Tie (both good) |

**Overall**: Docs system is slightly more mature, but both need significant security improvements.

---

## 🔧 PRIORITY FIX CHECKLIST

### Must Fix Before Production (P0)
- [ ] Add rate limiting to all API endpoints
- [ ] Fix slug uniqueness checks in Brand system
- [ ] Sanitize URLs to prevent XSS/SSRF
- [ ] Fix isPrimary race condition
- [ ] Add pagination to public brands endpoint

### Should Fix Soon (P1)
- [ ] Reduce data exposure in public API
- [ ] Add audit logging for all admin actions
- [ ] Implement proper error handling with retries
- [ ] Add platform-specific URL validation
- [ ] Enforce HTTPS-only URLs

### Nice to Have (P2)
- [ ] Add caching layer with Redis
- [ ] Client-side response validation
- [ ] Standalone slug index for DocProject
- [ ] Metadata field limits review
- [ ] Monitoring/alerting integration

---

## 📝 RECOMMENDATIONS

1. **Security First**: Implement rate limiting IMMEDIATELY
2. **Data Integrity**: Fix all slug-related bugs
3. **Performance**: Add caching and pagination before user base grows
4. **Observability**: Add audit logs and error monitoring
5. **Testing**: Write integration tests for race conditions
6. **Documentation**: Document all security decisions

---

**End of Audit** | Generated: January 2, 2025 | Audited by: GitHub Copilot
