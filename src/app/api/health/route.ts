import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { featureFlags } from '@/lib/feature-flags';
import { getCircuitBreakerHealth, getAllCircuitBreakers } from '@/lib/circuit-breaker';
import { progressiveRollout } from '@/lib/progressive-rollout';
import mongoose from 'mongoose';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  environment: string;
  responseTime: number;
  features: Record<string, boolean>;
  services: {
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      connectionState: string;
      responseTime?: number;
    };
    circuitBreakers: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      breakers: Array<{
        name: string;
        state: string;
        failureCount: number;
        successCount: number;
      }>;
    };
    rollout: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      activeRules: number;
      cachedUsers: number;
      features: string[];
    };
  };
  performance: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
  };
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    duration: number;
    error?: string;
  }>;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheckResponse['checks'] = [];
  
  try {
    // Check database connection
    const dbCheckStart = Date.now();
    let dbStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let dbConnectionState = 'unknown';
    let dbResponseTime = 0;
    
    try {
      dbConnectionState = mongoose.connection.readyState.toString();
      const dbTestStart = Date.now();
      
      // Simple ping to test database responsiveness
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db?.admin().ping();
        dbResponseTime = Date.now() - dbTestStart;
        
        if (dbResponseTime > 1000) {
          dbStatus = 'degraded';
        }
      } else {
        dbStatus = 'unhealthy';
      }
      
      checks.push({
        name: 'database',
        status: dbStatus === 'healthy' ? 'pass' : dbStatus === 'degraded' ? 'warn' : 'fail',
        duration: Date.now() - dbCheckStart,
      });
    } catch (error) {
      dbStatus = 'unhealthy';
      checks.push({
        name: 'database',
        status: 'fail',
        duration: Date.now() - dbCheckStart,
        error: error instanceof Error ? error.message : 'Unknown database error',
      });
    }

    // Check circuit breakers
    const circuitBreakerCheckStart = Date.now();
    const circuitBreakerHealth = getCircuitBreakerHealth();
    const allBreakers = getAllCircuitBreakers();
    
    checks.push({
      name: 'circuit-breakers',
      status: circuitBreakerHealth.status === 'healthy' ? 'pass' : 'warn',
      duration: Date.now() - circuitBreakerCheckStart,
    });

    // Check rollout service
    const rolloutCheckStart = Date.now();
    const rolloutStatus = progressiveRollout.getStatus();
    
    checks.push({
      name: 'progressive-rollout',
      status: 'pass',
      duration: Date.now() - rolloutCheckStart,
    });

    // Get feature flags status
    const featureCheckStart = Date.now();
    let allFeatures: Record<string, boolean> = {};
    
    try {
      const featureConfig = featureFlags.getConfiguration();
      const coreFeatures = Object.keys(featureConfig.features).reduce((acc, key) => {
        acc[key] = featureConfig.features[key as keyof typeof featureConfig.features];
        return acc;
      }, {} as Record<string, boolean>);
      
      const advancedFeatures = Object.keys(featureConfig.advancedFeatures).reduce((acc, key) => {
        acc[`advanced.${key}`] = featureConfig.advancedFeatures[key as keyof typeof featureConfig.advancedFeatures];
        return acc;
      }, {} as Record<string, boolean>);
      
      allFeatures = { ...coreFeatures, ...advancedFeatures };
      
      checks.push({
        name: 'feature-flags',
        status: 'pass',
        duration: Date.now() - featureCheckStart,
      });
    } catch (error) {
      checks.push({
        name: 'feature-flags',
        status: 'fail',
        duration: Date.now() - featureCheckStart,
        error: error instanceof Error ? error.message : 'Feature flag system error',
      });
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Overall status calculation
    const failedChecks = checks.filter(check => check.status === 'fail');
    const warnChecks = checks.filter(check => check.status === 'warn');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (warnChecks.length > 0 || memoryPercentage > 90) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const responseTime = Date.now() - startTime;

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime,
      features: allFeatures,
      services: {
        database: {
          status: dbStatus,
          connectionState: dbConnectionState,
          responseTime: dbResponseTime,
        },
        circuitBreakers: {
          status: circuitBreakerHealth.status as 'healthy' | 'degraded' | 'unhealthy',
          breakers: allBreakers.map(breaker => {
            const metrics = breaker.getMetrics();
            return {
              name: metrics.name,
              state: metrics.state,
              failureCount: metrics.failureCount,
              successCount: metrics.successCount,
            };
          }),
        },
        rollout: {
          status: 'healthy',
          activeRules: rolloutStatus.totalRules,
          cachedUsers: rolloutStatus.cachedUsers,
          features: rolloutStatus.features,
        },
      },
      performance: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: Math.round(memoryPercentage * 100) / 100,
        },
        uptime: process.uptime(),
      },
      checks,
    };

    // Set appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(response, { status: httpStatus });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime,
      features: {},
      services: {
        database: {
          status: 'unhealthy',
          connectionState: 'unknown',
        },
        circuitBreakers: {
          status: 'unhealthy',
          breakers: [],
        },
        rollout: {
          status: 'unhealthy',
          activeRules: 0,
          cachedUsers: 0,
          features: [],
        },
      },
      performance: {
        memory: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        uptime: process.uptime(),
      },
      checks: [
        {
          name: 'health-check',
          status: 'fail',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}