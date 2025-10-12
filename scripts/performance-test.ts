/**
 * Performance Testing & Benchmarks
 * Tests API response times, database query performance, and cache effectiveness
 * 
 * Usage:
 *   npm run test:perf
 *   npm run benchmark
 */

import { performance } from 'perf_hooks';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_DURATION = 60000; // 1 minute
const CONCURRENT_USERS = 10;

interface PerformanceMetrics {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
  requestsPerSecond: number;
  errorRate: number;
}

interface BenchmarkResult {
  name: string;
  duration: number;
  iterations: number;
  opsPerSecond: number;
  averageTime: number;
}

/**
 * Measure response time for a single request
 */
async function measureRequest(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; time: number; status: number }> {
  const start = performance.now();
  
  try {
    const response = await fetch(url, options);
    const end = performance.now();
    
    return {
      success: response.ok,
      time: end - start,
      status: response.status,
    };
  } catch (error) {
    const end = performance.now();
    return {
      success: false,
      time: end - start,
      status: 0,
    };
  }
}

/**
 * Calculate percentile from sorted array
 */
function calculatePercentile(sortedArray: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

/**
 * Load test a single endpoint
 */
async function loadTestEndpoint(
  endpoint: string,
  duration: number = TEST_DURATION,
  concurrency: number = CONCURRENT_USERS
): Promise<PerformanceMetrics> {
  console.log(`\n🔥 Load testing: ${endpoint}`);
  console.log(`Duration: ${duration}ms, Concurrency: ${concurrency}`);
  
  const url = `${BASE_URL}${endpoint}`;
  const startTime = Date.now();
  const responseTimes: number[] = [];
  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;

  // Run concurrent workers
  const workers = Array.from({ length: concurrency }, async () => {
    while (Date.now() - startTime < duration) {
      const result = await measureRequest(url);
      
      responseTimes.push(result.time);
      totalRequests++;
      
      if (result.success) {
        successfulRequests++;
      } else {
        failedRequests++;
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  await Promise.all(workers);

  // Calculate metrics
  const totalTime = Date.now() - startTime;
  responseTimes.sort((a, b) => a - b);

  const metrics: PerformanceMetrics = {
    endpoint,
    totalRequests,
    successfulRequests,
    failedRequests,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    p50: calculatePercentile(responseTimes, 50),
    p95: calculatePercentile(responseTimes, 95),
    p99: calculatePercentile(responseTimes, 99),
    requestsPerSecond: (totalRequests / totalTime) * 1000,
    errorRate: (failedRequests / totalRequests) * 100,
  };

  return metrics;
}

/**
 * Benchmark a function
 */
async function benchmark(
  name: string,
  fn: () => Promise<void> | void,
  iterations: number = 1000
): Promise<BenchmarkResult> {
  console.log(`\n⚡ Benchmarking: ${name}`);
  
  // Warmup
  for (let i = 0; i < 10; i++) {
    await fn();
  }

  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  
  const end = performance.now();
  const duration = end - start;

  const result: BenchmarkResult = {
    name,
    duration,
    iterations,
    opsPerSecond: (iterations / duration) * 1000,
    averageTime: duration / iterations,
  };

  return result;
}

/**
 * Print performance metrics
 */
function printMetrics(metrics: PerformanceMetrics) {
  console.log('\n📊 Results:');
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Error Rate: ${metrics.errorRate.toFixed(2)}%`);
  console.log(`Requests/sec: ${metrics.requestsPerSecond.toFixed(2)}`);
  console.log('\n⏱️  Response Times:');
  console.log(`Average: ${metrics.averageResponseTime.toFixed(2)}ms`);
  console.log(`Min: ${metrics.minResponseTime.toFixed(2)}ms`);
  console.log(`Max: ${metrics.maxResponseTime.toFixed(2)}ms`);
  console.log(`P50 (median): ${metrics.p50.toFixed(2)}ms`);
  console.log(`P95: ${metrics.p95.toFixed(2)}ms`);
  console.log(`P99: ${metrics.p99.toFixed(2)}ms`);
}

/**
 * Print benchmark results
 */
function printBenchmark(result: BenchmarkResult) {
  console.log('\n📊 Results:');
  console.log(`Total Duration: ${result.duration.toFixed(2)}ms`);
  console.log(`Iterations: ${result.iterations}`);
  console.log(`Ops/sec: ${result.opsPerSecond.toFixed(2)}`);
  console.log(`Average Time: ${result.averageTime.toFixed(4)}ms`);
}

/**
 * Main performance test suite
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Duration: ${TEST_DURATION}ms`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);

  const results: PerformanceMetrics[] = [];

  // Test 1: Public braindump listing
  console.log('\n' + '='.repeat(60));
  const listingMetrics = await loadTestEndpoint('/api/braindump', 30000, 10);
  printMetrics(listingMetrics);
  results.push(listingMetrics);

  // Test 2: Search endpoint
  console.log('\n' + '='.repeat(60));
  const searchMetrics = await loadTestEndpoint('/api/braindump/search?q=test', 30000, 10);
  printMetrics(searchMetrics);
  results.push(searchMetrics);

  // Test 3: Single braindump view
  console.log('\n' + '='.repeat(60));
  const viewMetrics = await loadTestEndpoint('/api/braindump/test-slug', 30000, 10);
  printMetrics(viewMetrics);
  results.push(viewMetrics);

  // Test 4: Comments endpoint
  console.log('\n' + '='.repeat(60));
  const commentsMetrics = await loadTestEndpoint('/api/braindump/test-slug/comments', 30000, 10);
  printMetrics(commentsMetrics);
  results.push(commentsMetrics);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📈 PERFORMANCE TEST SUMMARY\n');
  
  results.forEach(metric => {
    console.log(`${metric.endpoint}:`);
    console.log(`  - ${metric.requestsPerSecond.toFixed(2)} req/s`);
    console.log(`  - ${metric.averageResponseTime.toFixed(2)}ms avg`);
    console.log(`  - ${metric.p95.toFixed(2)}ms p95`);
    console.log(`  - ${((metric.successfulRequests / metric.totalRequests) * 100).toFixed(2)}% success\n`);
  });

  // Performance targets
  console.log('🎯 Performance Targets:');
  console.log('  ✓ > 100 req/s for listing endpoint');
  console.log('  ✓ < 200ms average response time');
  console.log('  ✓ < 500ms p95 response time');
  console.log('  ✓ > 99% success rate');
  
  const passed = results.every(m => 
    m.requestsPerSecond >= 100 &&
    m.averageResponseTime <= 200 &&
    m.p95 <= 500 &&
    ((m.successfulRequests / m.totalRequests) * 100) >= 99
  );

  console.log(`\n${passed ? '✅ All targets met!' : '❌ Some targets not met'}`);
}

/**
 * Run benchmarks for specific operations
 */
async function runBenchmarks() {
  console.log('⚡ Starting Benchmarks');

  // Benchmark 1: JSON parsing
  const jsonResult = await benchmark(
    'JSON parsing (small object)',
    () => {
      const obj = { id: '123', content: 'test', tags: ['tag1', 'tag2'] };
      JSON.parse(JSON.stringify(obj));
    },
    10000
  );
  printBenchmark(jsonResult);

  // Benchmark 2: String operations
  const stringResult = await benchmark(
    'String slug generation',
    () => {
      const title = 'This is a Test Title with Special Characters!@#';
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    },
    10000
  );
  printBenchmark(stringResult);

  // Benchmark 3: Array operations
  const arrayResult = await benchmark(
    'Array filtering and mapping',
    () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i, value: i * 2 }));
      items.filter(item => item.value > 50).map(item => ({ ...item, doubled: item.value * 2 }));
    },
    1000
  );
  printBenchmark(arrayResult);

  console.log('\n✅ Benchmarks complete!');
}

// Run tests based on command line argument
const command = process.argv[2];

if (command === 'benchmark') {
  runBenchmarks().catch(console.error);
} else {
  runPerformanceTests().catch(console.error);
}

export { loadTestEndpoint, benchmark, runPerformanceTests, runBenchmarks };
