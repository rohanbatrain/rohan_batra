# MongoDB Connection Timeout Fix

**Error**: `MongoServerSelectionError: connection <monitor> to 159.41.188.36:27017 timed out`

**Date**: October 7, 2025  
**Location**: `/src/app/courses/[slug]/page.tsx:108`

---

## Root Cause

MongoDB Atlas connection is timing out when trying to connect to the remote server at `159.41.188.36:27017`.

### Possible Causes:
1. **Network Issue** - MongoDB Atlas server unreachable
2. **IP Whitelist** - Your current IP not whitelisted in MongoDB Atlas
3. **Cluster Paused** - Free tier Atlas cluster auto-paused after inactivity
4. **Connection Pool Exhausted** - Too many open connections
5. **Firewall Blocking** - Corporate/ISP firewall blocking MongoDB port (27017)
6. **DNS Resolution** - Unable to resolve MongoDB Atlas hostname

---

## Fixes Applied

### 1. ✅ Enhanced MongoDB Connection Options

**File**: `/src/lib/mongodb.ts`

**Changes**:
```typescript
// Before
const opts = {
  bufferCommands: false,
};

// After
const opts = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000,  // Fail fast (10s instead of 30s)
  socketTimeoutMS: 45000,            // Close idle sockets after 45s
  maxPoolSize: 10,                   // Max 10 connections
  minPoolSize: 2,                    // Keep 2 connections warm
  maxIdleTimeMS: 10000,              // Close idle connections after 10s
  retryWrites: true,                 // Retry writes on network errors
  retryReads: true,                  // Retry reads on network errors
};
```

**Benefits**:
- Faster failure detection (10s vs 30s)
- Better connection pool management
- Automatic retry on transient failures
- Prevents connection leaks

---

### 2. ✅ Error Handling in Page Component

**File**: `/src/app/courses/[slug]/page.tsx`

**Changes**:
```typescript
// Before
await connectToDatabase();

// After
try {
  await connectToDatabase();
} catch (error) {
  console.error('MongoDB connection failed:', error);
  throw new Error('Database connection unavailable. Please try again later.');
}
```

**Benefits**:
- Clearer error messages for users
- Proper error logging
- Graceful degradation

---

### 3. ✅ Custom Error Page

**File**: `/src/app/courses/[slug]/error.tsx` (NEW)

**Features**:
- User-friendly error message
- Retry button (calls Next.js reset)
- "Go Home" fallback
- Development mode: Shows error details + troubleshooting tips
- Production mode: Generic error message

---

## Immediate Solutions

### Option A: Check MongoDB Atlas (Most Common)

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Check Cluster Status**:
   - Is the cluster **paused**? → Resume it
   - Is it **suspended**? → Check billing/upgrade plan
3. **Network Access**:
   - Go to "Network Access" tab
   - Check if your current IP is whitelisted
   - Add your IP: `Add IP Address` → `Add Current IP Address`
   - Or allow all: `0.0.0.0/0` (⚠️ Not recommended for production)

### Option B: Verify Connection String

Check `.env.local`:
```bash
MONGODB_URI=mongodb+srv://rohanbatrain_mongodb:fdHrh2HiN9TqwGHtXhBkxJ6vs@rohanbatrain.f2hjd0m.mongodb.net/portfolio
```

**Verify**:
- ✅ Password is correct (no special characters breaking URI)
- ✅ Database name is correct (`portfolio`)
- ✅ Cluster hostname is correct (`rohanbatrain.f2hjd0m.mongodb.net`)

### Option C: Test Connection Locally

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌ Failed:', e.message));"
```

### Option D: Use Local MongoDB (Development)

If Atlas is down, use local MongoDB temporarily:

```bash
# Install MongoDB locally (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/portfolio_dev
```

---

## Long-Term Solutions

### 1. **Add Connection Retry Logic**

Already implemented in the fix above with:
- `retryWrites: true`
- `retryReads: true`
- `serverSelectionTimeoutMS: 10000`

### 2. **Add Health Check Endpoint**

Create `/src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    const state = mongoose.connection.readyState;
    
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      return NextResponse.json({ 
        status: 'healthy', 
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ 
      status: 'degraded', 
      database: 'connecting',
      state 
    }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    }, { status: 503 });
  }
}
```

### 3. **Monitor Connection Health**

Add monitoring to track connection issues:

```typescript
// In mongodb.ts
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});
```

### 4. **Implement Circuit Breaker Pattern**

Prevent cascading failures:

```typescript
let consecutiveFailures = 0;
const MAX_FAILURES = 3;
const CIRCUIT_BREAK_TIME = 60000; // 1 minute
let circuitBrokenUntil = 0;

async function connectToDatabase() {
  // Check if circuit is broken
  if (Date.now() < circuitBrokenUntil) {
    throw new Error('Circuit breaker open - database temporarily unavailable');
  }

  try {
    // ... existing connection logic
    consecutiveFailures = 0; // Reset on success
    return cached.conn;
  } catch (e) {
    consecutiveFailures++;
    
    if (consecutiveFailures >= MAX_FAILURES) {
      circuitBrokenUntil = Date.now() + CIRCUIT_BREAK_TIME;
      console.error('🔴 Circuit breaker opened - too many failures');
    }
    
    throw e;
  }
}
```

---

## Debugging Checklist

### Local Development Issues:
- [ ] Is MongoDB Atlas cluster **running** (not paused)?
- [ ] Is your **current IP whitelisted** in Network Access?
- [ ] Can you **ping** the MongoDB server? `ping rohanbatrain.f2hjd0m.mongodb.net`
- [ ] Is your **internet connection** stable?
- [ ] Are you behind a **firewall** blocking port 27017?
- [ ] Is the **connection string** correct in `.env.local`?
- [ ] Did you **restart** the dev server after changing `.env.local`?

### Production/Deployment Issues:
- [ ] Is the **deployment platform IP** whitelisted in Atlas?
- [ ] Are **environment variables** set correctly in deployment platform?
- [ ] Is the **database password** URL-encoded if it contains special chars?
- [ ] Is the **connection pool** properly configured for serverless?
- [ ] Are there **rate limits** on your Atlas plan?

### Atlas-Specific:
- [ ] **Free tier limits**: M0 has connection limits (~100 concurrent)
- [ ] **Auto-pause**: Free clusters pause after inactivity
- [ ] **Billing**: Check if payment method is valid
- [ ] **Cluster upgrade**: Consider upgrading from M0 to M2/M5

---

## Environment-Specific Solutions

### Vercel Deployment:
```bash
# Add to vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}

# Set environment variables in Vercel dashboard
MONGODB_URI=mongodb+srv://...
```

### Docker Deployment:
```dockerfile
# Ensure MongoDB can be reached from container
ENV MONGODB_URI=mongodb+srv://...

# Health check
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

---

## Monitoring & Alerts

### MongoDB Atlas Alerts:
1. Go to "Alerts" in Atlas dashboard
2. Create alert for:
   - Connection count > 80% of limit
   - CPU usage > 80%
   - Disk usage > 90%

### Application Monitoring:
```typescript
// Track connection failures
let failureCount = 0;
mongoose.connection.on('error', (err) => {
  failureCount++;
  if (failureCount > 10) {
    // Send alert (Slack, email, etc.)
    console.error('🚨 High failure rate detected:', failureCount);
  }
});
```

---

## Quick Test Commands

```bash
# 1. Test MongoDB connection
node -e "require('mongoose').connect('mongodb+srv://...').then(() => console.log('✅')).catch(e => console.error('❌', e.message))"

# 2. Check if port 27017 is accessible
nc -zv rohanbatrain.f2hjd0m.mongodb.net 27017

# 3. DNS lookup
nslookup rohanbatrain.f2hjd0m.mongodb.net

# 4. Test with mongo shell
mongosh "mongodb+srv://rohanbatrain.f2hjd0m.mongodb.net/portfolio" --username rohanbatrain_mongodb

# 5. Health check endpoint (after creating it)
curl http://localhost:3000/api/health
```

---

## Expected Behavior After Fix

### Before:
```
❌ Connection timeout after 30 seconds
❌ Generic error page with stack trace
❌ No retry mechanism
❌ Poor user experience
```

### After:
```
✅ Timeout after 10 seconds (fail fast)
✅ Custom error page with retry button
✅ Automatic retry on transient failures
✅ Proper error logging
✅ Connection pool management
✅ Graceful degradation
```

---

## Summary

**Changes Made**:
1. ✅ Enhanced MongoDB connection options (timeouts, retries, pool management)
2. ✅ Added error handling in page component
3. ✅ Created custom error page with retry functionality
4. ✅ Added development mode troubleshooting tips

**Immediate Action Required**:
1. **Check MongoDB Atlas** - Ensure cluster is running and your IP is whitelisted
2. **Test locally** - Verify connection works before deploying
3. **Monitor logs** - Watch for connection errors in console

**Next Steps**:
- Consider adding health check endpoint
- Implement circuit breaker for production
- Set up MongoDB Atlas alerts
- Consider upgrading from free tier if hitting limits
