import { env } from '@/lib/env';

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: Date;
  successCount: number;
  nextAttemptTime?: Date;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number; // in milliseconds
  monitoringPeriod: number; // in milliseconds
  halfOpenMaxCalls: number;
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name;
    this.config = {
      failureThreshold: env.circuitBreaker.failureThreshold,
      resetTimeout: env.circuitBreaker.resetTimeout,
      monitoringPeriod: env.circuitBreaker.monitoringPeriod,
      halfOpenMaxCalls: env.circuitBreaker.halfOpenMaxCalls,
      ...config,
    };

    this.state = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!env.circuitBreaker.enabled) {
      return operation();
    }

    // Check if circuit should transition from open to half-open
    if (this.state.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state.state = 'half-open';
        this.state.successCount = 0;
        console.log(`Circuit breaker ${this.name} transitioning to half-open`);
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker ${this.name} is open. Next attempt at ${this.state.nextAttemptTime}`
        );
      }
    }

    // Execute operation based on current state
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.successCount++;

    if (this.state.state === 'half-open') {
      if (this.state.successCount >= this.config.halfOpenMaxCalls) {
        this.state.state = 'closed';
        this.state.failureCount = 0;
        this.state.successCount = 0;
        console.log(`Circuit breaker ${this.name} reset to closed state`);
      }
    } else if (this.state.state === 'closed') {
      // Reset failure count on success
      this.state.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = new Date();

    if (this.state.state === 'half-open') {
      // Any failure in half-open state returns to open
      this.state.state = 'open';
      this.state.nextAttemptTime = new Date(
        Date.now() + this.config.resetTimeout
      );
      console.log(
        `Circuit breaker ${this.name} failed in half-open, returning to open`
      );
    } else if (
      this.state.state === 'closed' &&
      this.state.failureCount >= this.config.failureThreshold
    ) {
      // Too many failures, open the circuit
      this.state.state = 'open';
      this.state.nextAttemptTime = new Date(
        Date.now() + this.config.resetTimeout
      );
      console.log(
        `Circuit breaker ${this.name} opened due to ${this.state.failureCount} failures`
      );
    }
  }

  private shouldAttemptReset(): boolean {
    return (
      this.state.nextAttemptTime !== undefined &&
      new Date() >= this.state.nextAttemptTime
    );
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  getMetrics() {
    return {
      name: this.name,
      state: this.state.state,
      failureCount: this.state.failureCount,
      successCount: this.state.successCount,
      lastFailureTime: this.state.lastFailureTime,
      nextAttemptTime: this.state.nextAttemptTime,
      config: this.config,
    };
  }

  reset(): void {
    this.state = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
    };
    console.log(`Circuit breaker ${this.name} manually reset`);
  }

  forceOpen(): void {
    this.state.state = 'open';
    this.state.nextAttemptTime = new Date(
      Date.now() + this.config.resetTimeout
    );
    console.log(`Circuit breaker ${this.name} manually opened`);
  }
}

// Global circuit breaker instances
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config));
  }
  return circuitBreakers.get(name)!;
}

export function getAllCircuitBreakers(): CircuitBreaker[] {
  return Array.from(circuitBreakers.values());
}

export function resetAllCircuitBreakers(): void {
  circuitBreakers.forEach(breaker => breaker.reset());
}

// Specific circuit breakers for different operations
export const blogPostCircuitBreaker = getCircuitBreaker('blog-posts');
export const projectCircuitBreaker = getCircuitBreaker('projects');
export const databaseCircuitBreaker = getCircuitBreaker('database');
export const assetCircuitBreaker = getCircuitBreaker('assets');

// Health check function for circuit breakers
export function getCircuitBreakerHealth() {
  const breakers = getAllCircuitBreakers();
  const metrics = breakers.map(breaker => breaker.getMetrics());

  const overallStatus = breakers.every(
    breaker => breaker.getState().state === 'closed'
  )
    ? 'healthy'
    : breakers.some(breaker => breaker.getState().state === 'open')
      ? 'degraded'
      : 'warning';

  return {
    status: overallStatus,
    circuitBreakers: metrics,
    timestamp: new Date(),
  };
}
