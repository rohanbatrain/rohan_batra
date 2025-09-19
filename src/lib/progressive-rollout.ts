import { env } from '@/lib/env';
import { FeatureFlagContext } from './feature-flags';

export interface RolloutRule {
  id: string;
  name: string;
  feature: string;
  enabled: boolean;
  percentage: number;
  conditions?: {
    userRoles?: string[];
    userEmails?: string[];
    environments?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  metadata?: Record<string, any>;
}

export interface RolloutMetrics {
  feature: string;
  totalUsers: number;
  enabledUsers: number;
  disabledUsers: number;
  enabledPercentage: number;
  lastUpdated: Date;
}

export class ProgressiveRolloutService {
  private static instance: ProgressiveRolloutService;
  private rolloutRules: Map<string, RolloutRule> = new Map();
  private userCache: Map<string, { features: Record<string, boolean>; expiry: Date }> = new Map();
  private metrics: Map<string, RolloutMetrics> = new Map();

  static getInstance(): ProgressiveRolloutService {
    if (!ProgressiveRolloutService.instance) {
      ProgressiveRolloutService.instance = new ProgressiveRolloutService();
    }
    return ProgressiveRolloutService.instance;
  }

  constructor() {
    this.initializeDefaultRules();
    this.startMetricsCollection();
  }

  /**
   * Initialize default rollout rules from environment
   */
  private initializeDefaultRules(): void {
    // Create rules for advanced features
    Object.keys(env.advancedFeatures).forEach((feature) => {
      const rule: RolloutRule = {
        id: `default-${feature}`,
        name: `Default rollout for ${feature}`,
        feature,
        enabled: env.advancedFeatures[feature as keyof typeof env.advancedFeatures],
        percentage: env.rollout.percentage,
        conditions: {
          userEmails: env.rollout.whitelist,
          environments: env.nodeEnv === 'production' ? ['production'] : ['development', 'test'],
        },
      };
      this.rolloutRules.set(rule.id, rule);
    });
  }

  /**
   * Check if a user should receive a feature based on rollout rules
   */
  shouldReceiveFeature(feature: string, context: FeatureFlagContext): boolean {
    // Check cache first
    const cacheKey = context.userEmail || context.userId || 'anonymous';
    const cached = this.userCache.get(cacheKey);
    
    if (cached && cached.expiry > new Date() && cached.features[feature] !== undefined) {
      return cached.features[feature];
    }

    // Calculate feature eligibility
    const eligible = this.calculateFeatureEligibility(feature, context);
    
    // Update cache
    const currentFeatures = cached?.features || {};
    currentFeatures[feature] = eligible;
    this.userCache.set(cacheKey, {
      features: currentFeatures,
      expiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes cache
    });

    // Update metrics
    this.updateMetrics(feature, eligible);

    return eligible;
  }

  /**
   * Calculate feature eligibility based on rules
   */
  private calculateFeatureEligibility(feature: string, context: FeatureFlagContext): boolean {
    // Find applicable rules for this feature
    const applicableRules = Array.from(this.rolloutRules.values())
      .filter(rule => rule.feature === feature && rule.enabled);

    if (applicableRules.length === 0) {
      return false;
    }

    // Check each rule
    for (const rule of applicableRules) {
      if (this.evaluateRule(rule, context)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate a single rollout rule against user context
   */
  private evaluateRule(rule: RolloutRule, context: FeatureFlagContext): boolean {
    // Check conditions
    if (rule.conditions) {
      // Environment check
      if (rule.conditions.environments && rule.conditions.environments.length > 0) {
        if (!rule.conditions.environments.includes(env.nodeEnv)) {
          return false;
        }
      }

      // User role check
      if (rule.conditions.userRoles && rule.conditions.userRoles.length > 0) {
        if (!context.userRole || !rule.conditions.userRoles.includes(context.userRole)) {
          return false;
        }
      }

      // Whitelist check (highest priority)
      if (rule.conditions.userEmails && rule.conditions.userEmails.length > 0) {
        if (context.userEmail && rule.conditions.userEmails.includes(context.userEmail)) {
          return true; // Whitelist overrides percentage
        }
      }

      // Date range check
      if (rule.conditions.dateRange) {
        const now = new Date();
        if (now < rule.conditions.dateRange.start || now > rule.conditions.dateRange.end) {
          return false;
        }
      }
    }

    // Percentage-based rollout
    return this.isUserInPercentage(context, rule.percentage);
  }

  /**
   * Check if user falls within percentage rollout
   */
  private isUserInPercentage(context: FeatureFlagContext, percentage: number): boolean {
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;

    const identifier = context.userEmail || context.userId || this.generateSessionId();
    const hash = this.deterministicHash(identifier);
    const userPercentile = hash % 100;
    
    return userPercentile < percentage;
  }

  /**
   * Generate a session-based identifier for anonymous users
   */
  private generateSessionId(): string {
    // In a real implementation, this would be a proper session ID
    return 'session-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Deterministic hash function for consistent rollout
   */
  private deterministicHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Add or update a rollout rule
   */
  addRule(rule: RolloutRule): void {
    this.rolloutRules.set(rule.id, rule);
    this.clearCacheForFeature(rule.feature);
  }

  /**
   * Remove a rollout rule
   */
  removeRule(ruleId: string): void {
    const rule = this.rolloutRules.get(ruleId);
    if (rule) {
      this.rolloutRules.delete(ruleId);
      this.clearCacheForFeature(rule.feature);
    }
  }

  /**
   * Update rollout percentage for a feature
   */
  updateRolloutPercentage(feature: string, percentage: number): void {
    this.rolloutRules.forEach((rule, id) => {
      if (rule.feature === feature) {
        rule.percentage = percentage;
        this.rolloutRules.set(id, rule);
      }
    });
    this.clearCacheForFeature(feature);
  }

  /**
   * Clear cache for a specific feature
   */
  private clearCacheForFeature(feature: string): void {
    this.userCache.forEach((cached, key) => {
      if (cached.features[feature] !== undefined) {
        delete cached.features[feature];
        this.userCache.set(key, cached);
      }
    });
  }

  /**
   * Get all rollout rules
   */
  getRules(): RolloutRule[] {
    return Array.from(this.rolloutRules.values());
  }

  /**
   * Get rules for a specific feature
   */
  getRulesForFeature(feature: string): RolloutRule[] {
    return Array.from(this.rolloutRules.values())
      .filter(rule => rule.feature === feature);
  }

  /**
   * Update metrics for feature usage
   */
  private updateMetrics(feature: string, enabled: boolean): void {
    const current = this.metrics.get(feature) || {
      feature,
      totalUsers: 0,
      enabledUsers: 0,
      disabledUsers: 0,
      enabledPercentage: 0,
      lastUpdated: new Date(),
    };

    current.totalUsers++;
    if (enabled) {
      current.enabledUsers++;
    } else {
      current.disabledUsers++;
    }
    current.enabledPercentage = (current.enabledUsers / current.totalUsers) * 100;
    current.lastUpdated = new Date();

    this.metrics.set(feature, current);
  }

  /**
   * Get metrics for all features
   */
  getMetrics(): RolloutMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics for a specific feature
   */
  getFeatureMetrics(feature: string): RolloutMetrics | undefined {
    return this.metrics.get(feature);
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Start background metrics collection
   */
  private startMetricsCollection(): void {
    // In a real implementation, this might persist metrics to a database
    // For now, just log metrics periodically in development
    if (env.nodeEnv === 'development') {
      setInterval(() => {
        const metrics = this.getMetrics();
        if (metrics.length > 0) {
          console.log('Progressive Rollout Metrics:', metrics);
        }
      }, 60000); // Log every minute
    }
  }

  /**
   * Get rollout status for debugging
   */
  getStatus(): {
    totalRules: number;
    activeRules: number;
    cachedUsers: number;
    features: string[];
    environment: string;
  } {
    const rules = Array.from(this.rolloutRules.values());
    const activeRules = rules.filter(rule => rule.enabled);
    const features = [...new Set(rules.map(rule => rule.feature))];

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      cachedUsers: this.userCache.size,
      features,
      environment: env.nodeEnv,
    };
  }
}

// Export singleton instance
export const progressiveRollout = ProgressiveRolloutService.getInstance();

// Convenience functions
export function shouldReceiveFeature(feature: string, context: FeatureFlagContext): boolean {
  return progressiveRollout.shouldReceiveFeature(feature, context);
}

export function updateFeatureRollout(feature: string, percentage: number): void {
  progressiveRollout.updateRolloutPercentage(feature, percentage);
}