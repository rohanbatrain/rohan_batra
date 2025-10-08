# 🚀 Quick Start Guide - New Utilities

**Last Updated**: 8 October 2025  
**Purpose**: Guide for using newly created utilities

---

## 📦 New Utilities Overview

Two powerful utilities were added to improve code quality and consistency:

1. **Pagination Utility** (`src/lib/pagination.ts`)
2. **Cache Monitoring** (`src/lib/cache/monitoring.ts`)

---

## 1️⃣ Pagination Utility

### 📖 Purpose
Standardize pagination across all API endpoints with type-safe, reusable functions.

### 📍 Import
```typescript
import { 
  getPaginationParams, 
  createPaginationResponse,
  validatePaginationParams,
  generatePaginationLinks
} from '@/lib/pagination';
```

---

### 🔧 Basic Usage

#### In API Route Handler
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPaginationParams, createPaginationResponse } from '@/lib/pagination';
import Model from '@/models/Model';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 1. Extract pagination params (with defaults and max limits)
  const { page, limit, skip } = getPaginationParams(
    searchParams,
    10,  // default limit
    100  // max limit
  );
  
  // 2. Query database with pagination
  const [data, total] = await Promise.all([
    Model.find().skip(skip).limit(limit).lean(),
    Model.countDocuments()
  ]);
  
  // 3. Create standardized response
  return NextResponse.json(
    createPaginationResponse(data, total, page, limit)
  );
}
```

---

### 📤 Response Format
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "pages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 🎯 Advanced Usage

#### With Validation
```typescript
import { validatePaginationParams } from '@/lib/pagination';

const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '10');

const validation = validatePaginationParams(page, limit, 100);
if (!validation.valid) {
  return NextResponse.json(
    { error: validation.error },
    { status: 400 }
  );
}
```

#### With HATEOAS Links
```typescript
import { generatePaginationLinks } from '@/lib/pagination';

const links = generatePaginationLinks(
  'https://api.example.com/posts',
  page,
  totalPages,
  limit
);

return NextResponse.json({
  data,
  pagination,
  links  // { first, prev, next, last }
});
```

---

### 🎨 Complete Example

```typescript
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getPaginationParams, 
  createPaginationResponse,
  generatePaginationLinks 
} from '@/lib/pagination';
import Post from '@/models/Post';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, { max: 100, windowMs: 60000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const { page, limit, skip } = getPaginationParams(searchParams, 10, 50);
    
    // Filters
    const category = searchParams.get('category');
    const query = category ? { category } : {};
    
    // Database queries
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query)
    ]);
    
    // Response with links
    const baseUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}`;
    const response = createPaginationResponse(posts, total, page, limit);
    const links = generatePaginationLinks(baseUrl, page, response.pagination.pages, limit);
    
    return NextResponse.json({
      ...response,
      links
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
```

---

## 2️⃣ Cache Monitoring

### 📖 Purpose
Monitor Redis cache health, track statistics, and manage cache clearing.

### 📍 Import
```typescript
import { 
  getCacheHealth, 
  getCacheStats, 
  clearCache,
  cacheMonitor 
} from '@/lib/cache/monitoring';
```

---

### 🔧 Basic Usage

#### Check Cache Health
```typescript
const health = await getCacheHealth();

console.log(health);
// {
//   connected: true,
//   totalKeys: 1234,
//   memoryUsage: "15.2M",
//   hitRate: 87.5
// }

if (!health.connected) {
  console.error('Redis is down!', health.error);
}
```

#### Get Cache Statistics
```typescript
const stats = getCacheStats();

console.log(stats);
// {
//   hits: 1000,
//   misses: 150,
//   sets: 500,
//   deletes: 50,
//   errors: 0,
//   lastReset: Date
// }

const hitRate = (stats.hits / (stats.hits + stats.misses)) * 100;
console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);
```

#### Clear Cache by Pattern
```typescript
// Clear all asset cache
await clearCache('asset:*');

// Clear all blog cache
await clearCache('blog:*');

// Clear specific key
await clearCache('course:123');

// Clear everything (use carefully!)
await clearCache('*');
```

---

### 🎯 Advanced Usage

#### In Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { getCacheHealth, getCacheStats } from '@/lib/cache/monitoring';

export async function GET() {
  const [cacheHealth, cacheStats] = await Promise.all([
    getCacheHealth(),
    Promise.resolve(getCacheStats())
  ]);
  
  return NextResponse.json({
    status: cacheHealth.connected ? 'healthy' : 'degraded',
    cache: {
      ...cacheHealth,
      stats: cacheStats
    }
  });
}
```

#### In Admin Dashboard
```typescript
// src/app/admin/cache/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function CacheDashboard() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    async function loadCacheInfo() {
      const res = await fetch('/api/admin/cache');
      const data = await res.json();
      setHealth(data.health);
      setStats(data.stats);
    }
    
    loadCacheInfo();
    const interval = setInterval(loadCacheInfo, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h1>Cache Dashboard</h1>
      
      {health && (
        <div>
          <h2>Health</h2>
          <p>Status: {health.connected ? '✅ Connected' : '❌ Disconnected'}</p>
          <p>Total Keys: {health.totalKeys}</p>
          <p>Memory: {health.memoryUsage}</p>
          {health.hitRate && <p>Hit Rate: {health.hitRate.toFixed(2)}%</p>}
        </div>
      )}
      
      {stats && (
        <div>
          <h2>Statistics</h2>
          <p>Hits: {stats.hits}</p>
          <p>Misses: {stats.misses}</p>
          <p>Sets: {stats.sets}</p>
          <p>Deletes: {stats.deletes}</p>
          <p>Errors: {stats.errors}</p>
        </div>
      )}
      
      <button onClick={() => clearCache('*')}>
        Clear All Cache
      </button>
    </div>
  );
}
```

#### Recording Cache Operations
```typescript
import { cacheMonitor } from '@/lib/cache/monitoring';

// In your cache service
async function getCachedData(key: string) {
  const cached = await redis.get(key);
  
  if (cached) {
    cacheMonitor.recordHit();
    return JSON.parse(cached);
  }
  
  cacheMonitor.recordMiss();
  
  // Fetch from database
  const data = await fetchFromDB();
  
  // Cache for future
  await redis.setex(key, 3600, JSON.stringify(data));
  cacheMonitor.recordSet();
  
  return data;
}
```

---

### 🎨 Complete Example

```typescript
// src/lib/cache/asset-cache.ts
import Redis from 'ioredis';
import { cacheMonitor } from './monitoring';

const redis = new Redis(process.env.REDIS_URL!);

export class AssetCache {
  private prefix = 'asset:';
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.prefix + key;
      const cached = await redis.get(fullKey);
      
      if (cached) {
        cacheMonitor.recordHit();
        return JSON.parse(cached) as T;
      }
      
      cacheMonitor.recordMiss();
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      await redis.setex(fullKey, ttl, JSON.stringify(value));
      cacheMonitor.recordSet();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      await redis.del(fullKey);
      cacheMonitor.recordDelete();
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  async clear(): Promise<number> {
    try {
      return await clearCache(this.prefix + '*');
    } catch (error) {
      console.error('Cache clear error:', error);
      return 0;
    }
  }
}

export const assetCache = new AssetCache();
```

---

## 🔗 Integration Examples

### Using Both Utilities Together

```typescript
// src/app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPaginationParams, createPaginationResponse } from '@/lib/pagination';
import { getCacheHealth } from '@/lib/cache/monitoring';
import { assetCache } from '@/lib/cache/asset-cache';
import Asset from '@/models/Asset';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    
    // Create cache key based on pagination
    const cacheKey = `assets:page:${page}:limit:${limit}`;
    
    // Try to get from cache first
    const cached = await assetCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // Not in cache, fetch from database
    const [assets, total] = await Promise.all([
      Asset.find().skip(skip).limit(limit).lean(),
      Asset.countDocuments()
    ]);
    
    // Create response
    const response = createPaginationResponse(assets, total, page, limit);
    
    // Cache the response (5 minutes)
    await assetCache.set(cacheKey, response, 300);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}
```

---

## 📊 Monitoring in Production

### Health Check Integration
```typescript
// src/app/api/health/route.ts
import { getCacheHealth, getCacheStats } from '@/lib/cache/monitoring';

export async function GET() {
  const [cache, stats] = await Promise.all([
    getCacheHealth(),
    Promise.resolve(getCacheStats())
  ]);
  
  const overallStatus = cache.connected ? 'healthy' : 'degraded';
  
  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      cache: {
        status: cache.connected ? 'healthy' : 'unhealthy',
        details: cache,
        stats
      }
    }
  });
}
```

### Metrics Dashboard
```typescript
// Components to show in admin
{
  "cache": {
    "connected": true,
    "totalKeys": 1234,
    "memoryUsage": "15.2M",
    "hitRate": 87.5,
    "operations": {
      "hits": 10000,
      "misses": 1500,
      "ratio": "87%"
    }
  }
}
```

---

## 🎯 Best Practices

### Pagination
1. ✅ Always use `getPaginationParams()` for consistency
2. ✅ Set reasonable `maxLimit` (usually 100)
3. ✅ Include pagination metadata in responses
4. ✅ Use parallel queries for data + count
5. ✅ Add HATEOAS links for better API navigation

### Cache Monitoring
1. ✅ Record all cache operations (hit/miss/set/delete)
2. ✅ Monitor hit rates (aim for > 80%)
3. ✅ Check memory usage regularly
4. ✅ Clear cache by pattern, not everything
5. ✅ Handle Redis failures gracefully

---

## 🐛 Troubleshooting

### Pagination Issues

**Problem**: Page returns no data  
**Solution**: Check if `page * limit > total`
```typescript
if (page > totalPages) {
  return NextResponse.json(
    { error: 'Page out of range' },
    { status: 400 }
  );
}
```

**Problem**: Limit too large  
**Solution**: Use `maxLimit` parameter
```typescript
const { page, limit, skip } = getPaginationParams(
  searchParams,
  10,   // default
  100   // max (prevents abuse)
);
```

---

### Cache Issues

**Problem**: Redis not connecting  
**Solution**: Check environment variables
```bash
# .env.local
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
```

**Problem**: Cache not updating  
**Solution**: Clear cache after mutations
```typescript
// After creating/updating/deleting
await clearCache('asset:*');
```

**Problem**: High memory usage  
**Solution**: Check TTL and clear old keys
```typescript
const health = await getCacheHealth();
if (health.memoryUsage > '1G') {
  await clearCache('*:old:*');
}
```

---

## 📚 Additional Resources

- **Pagination Docs**: `src/lib/pagination.ts` (inline comments)
- **Cache Monitoring Docs**: `src/lib/cache/monitoring.ts` (inline comments)
- **Existing Implementation**: `src/app/api/public/brands/route.ts` (pagination example)
- **Cache API**: `src/app/api/admin/cache/route.ts` (management example)

---

## 🎉 Quick Wins

### Replace Old Pagination Code
```typescript
// ❌ Before (manual)
const page = Math.max(1, parseInt(req.query.page || '1'));
const limit = Math.min(50, parseInt(req.query.limit || '10'));
const skip = (page - 1) * limit;

// ✅ After (utility)
const { page, limit, skip } = getPaginationParams(searchParams, 10, 50);
```

### Add Cache Monitoring
```typescript
// ❌ Before (no visibility)
const data = await redis.get(key);

// ✅ After (tracked)
const data = await redis.get(key);
if (data) {
  cacheMonitor.recordHit();
} else {
  cacheMonitor.recordMiss();
}
```

---

**Happy Coding!** 🚀

For questions or issues, check:
- `IMPLEMENTATION_SUMMARY.md` - Full implementation details
- `SPRINT_1_COMPLETE.md` - What was done
- `COMPREHENSIVE_AUDIT_REPORT.md` - Original audit findings
