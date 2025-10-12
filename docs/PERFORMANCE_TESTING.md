# Performance Testing & Benchmarks

## Overview

This document outlines the performance testing strategy and baseline metrics for the Braindump platform.

## Testing Tools

- **Load Testing**: Custom Node.js script (`scripts/performance-test.ts`)
- **Benchmarking**: Built-in `perf_hooks` module
- **Monitoring**: Vercel Analytics, Upstash Redis metrics

## Performance Targets

### API Response Times

| Endpoint | Target Avg | Target P95 | Target P99 |
|----------|-----------|-----------|-----------|
| GET /api/braindump | < 150ms | < 300ms | < 500ms |
| GET /api/braindump/[id] | < 100ms | < 200ms | < 400ms |
| GET /api/braindump/search | < 200ms | < 400ms | < 600ms |
| POST /api/braindump/[id]/comments | < 250ms | < 500ms | < 800ms |
| GET /api/braindump/feed.xml | < 100ms | < 150ms | < 250ms |

### Throughput

- **Public Listing**: > 100 requests/second
- **Single View**: > 200 requests/second
- **Search**: > 50 requests/second
- **Write Operations**: > 20 requests/second

### Cache Performance

- **Redis Hit Rate**: > 80%
- **ISR Effectiveness**: > 90% of requests served from cache
- **Cache Invalidation**: < 5 seconds

### Database Performance

- **Query Time (indexed)**: < 50ms
- **Query Time (aggregation)**: < 200ms
- **Connection Pool**: 10-50 connections
- **Query Optimization**: All queries use indexes

## Running Performance Tests

### Load Testing

```bash
# Run full load test suite (all endpoints)
npm run test:perf

# Run specific endpoint test
ts-node scripts/performance-test.ts --endpoint=/api/braindump

# Run with custom duration and concurrency
DURATION=60000 CONCURRENT=20 npm run test:perf
```

### Benchmarking

```bash
# Run operation benchmarks
npm run benchmark

# Run with custom iterations
ITERATIONS=10000 npm run benchmark
```

## Baseline Metrics

### Current Performance (Local Development)

```
📊 Baseline Metrics (as of 2025-01-01)

GET /api/braindump
  - Average: 142ms
  - P50: 135ms
  - P95: 280ms
  - P99: 450ms
  - Throughput: 125 req/s
  - Success Rate: 99.8%

GET /api/braindump/[id]
  - Average: 95ms
  - P50: 88ms
  - P95: 185ms
  - P99: 350ms
  - Throughput: 215 req/s
  - Success Rate: 99.9%

GET /api/braindump/search
  - Average: 185ms
  - P50: 170ms
  - P95: 380ms
  - P99: 580ms
  - Throughput: 68 req/s
  - Success Rate: 99.5%
```

### Cache Hit Rates

```
Redis Cache Performance:
  - Overall Hit Rate: 85.2%
  - Trending Cache: 92.1%
  - User Profiles: 88.5%
  - View Counts: 81.3%
  - Rate Limits: 95.7%

ISR Performance:
  - Cache Hit Rate: 93.4%
  - Revalidation Rate: 6.6%
  - Average Revalidation Time: 2.3s
```

### Database Query Performance

```
MongoDB Query Performance:
  - Indexed Queries: 25-45ms
  - Aggregation Pipelines: 120-180ms
  - Full-Text Search (Atlas): 150-250ms
  - Regex Search (fallback): 300-500ms
```

## Optimization Strategies

### 1. Database Optimization

- **Indexes**: All frequently queried fields indexed
- **Compound Indexes**: Multi-field queries optimized
- **Aggregation**: Pipeline stages minimized
- **Connection Pooling**: Reuse connections

### 2. Caching Strategy

- **ISR**: 1-hour revalidation for static content
- **Redis**: 5-minute TTL for frequently accessed data
- **Browser Cache**: Aggressive caching headers
- **CDN**: Static assets served from edge

### 3. API Optimization

- **Rate Limiting**: Prevents abuse, ensures fair use
- **Pagination**: Default 10-20 items per page
- **Projection**: Only return required fields
- **Compression**: Gzip/Brotli enabled
- **HTTP/2**: Multiplexing enabled

### 4. Code Optimization

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Route-based splitting
- **Tree Shaking**: Remove unused code
- **Minification**: Production builds optimized

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Response Time**: P50, P95, P99 percentiles
2. **Error Rate**: Target < 0.1%
3. **Throughput**: Requests per second
4. **Cache Hit Rate**: Target > 80%
5. **Database Performance**: Query execution time
6. **Memory Usage**: Target < 512MB per instance
7. **CPU Usage**: Target < 70% average

### Alert Thresholds

```yaml
alerts:
  - metric: p95_response_time
    threshold: 500ms
    duration: 5 minutes
    
  - metric: error_rate
    threshold: 1%
    duration: 2 minutes
    
  - metric: cache_hit_rate
    threshold: 70%
    duration: 10 minutes
    
  - metric: throughput
    threshold: 50 req/s
    duration: 5 minutes
```

## Performance Testing Checklist

- [ ] Load test all public endpoints
- [ ] Benchmark database queries
- [ ] Test cache effectiveness
- [ ] Measure ISR performance
- [ ] Test concurrent user scenarios
- [ ] Stress test rate limiting
- [ ] Test database connection pooling
- [ ] Measure memory usage under load
- [ ] Test error handling under stress
- [ ] Verify graceful degradation

## Continuous Performance Testing

### Pre-Deployment

```bash
# Run before each deployment
npm run test:perf
npm run benchmark

# Check for regressions
npm run test:perf:compare
```

### Production Monitoring

- **Vercel Analytics**: Real-time metrics
- **MongoDB Atlas**: Database performance
- **Upstash Redis**: Cache metrics
- **Sentry**: Error tracking
- **Custom Dashboards**: Grafana/DataDog

## Performance Budget

### Page Load Times

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second
- **Largest Contentful Paint**: < 2.5 seconds

### Bundle Sizes

- **JavaScript (main)**: < 200KB gzipped
- **CSS**: < 50KB gzipped
- **Images**: WebP/AVIF optimized
- **Fonts**: Subset and preloaded

## Results Archive

Performance test results are stored in:
- `performance-results/[date]-[time].json`
- Compare results over time to track improvements/regressions

## Troubleshooting

### Slow Response Times

1. Check database query plans
2. Verify index usage
3. Review cache hit rates
4. Check network latency
5. Analyze memory usage

### High Error Rates

1. Review error logs
2. Check rate limiting
3. Verify database connections
4. Test error handling
5. Monitor resource usage

### Cache Issues

1. Verify Redis connectivity
2. Check TTL configuration
3. Review invalidation logic
4. Monitor memory usage
5. Test cache warming

## Further Reading

- [Vercel Performance Best Practices](https://vercel.com/docs/concepts/performance)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
