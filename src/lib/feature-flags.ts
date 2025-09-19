import { progressiveRollout } from './progressive-rollout';

export interface FeatureFlagContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  environment?: string;
  timestamp?: Date;
}

export interface FeatureFlagResult {
  enabled: boolean;
  source: 'environment' | 'rollout' | 'whitelist' | 'default';
  reason?: string;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Check if a core feature is enabled
   */
  isFeatureEnabled(feature: keyof typeof env.features, context?: FeatureFlagContext): FeatureFlagResult {
    const baseEnabled = env.features[feature];
    
    if (!baseEnabled) {
      return {
        enabled: false,
        source: 'environment',
        reason: `Feature ${feature} is disabled in environment configuration`,
      };
    }

    return {
      enabled: true,
      source: 'environment',
      reason: `Feature ${feature} is enabled in environment configuration`,
    };
  }

  /**
   * Check if an advanced feature is enabled with progressive rollout
   */
  isAdvancedFeatureEnabled(
    feature: keyof typeof env.advancedFeatures,
    context?: FeatureFlagContext
  ): FeatureFlagResult {
    const baseEnabled = env.advancedFeatures[feature];
    
    // If disabled at environment level, return early
    if (!baseEnabled) {
      return {
        enabled: false,
        source: 'environment',
        reason: `Advanced feature ${feature} is disabled in environment configuration`,
      };
    }

    // Check whitelist (takes priority)
    if (context?.userEmail && this.isUserWhitelisted(context.userEmail)) {
      return {
        enabled: true,
        source: 'whitelist',
        reason: `User ${context.userEmail} is whitelisted for all features`,
      };
    }

    // Check rollout percentage
    if (this.isUserInRollout(context)) {
      return {
        enabled: true,
        source: 'rollout',
        reason: `User included in ${env.rollout.percentage}% rollout`,
      };
    }

    return {
      enabled: false,
      source: 'rollout',
      reason: `User not included in ${env.rollout.percentage}% rollout`,
    };
  }

  /**
   * Check multiple features at once
   */
  getFeatureFlags(context?: FeatureFlagContext): Record<string, FeatureFlagResult> {
    const results: Record<string, FeatureFlagResult> = {};

    // Core features
    Object.keys(env.features).forEach((feature) => {
      results[feature] = this.isFeatureEnabled(feature as keyof typeof env.features, context);
    });

    // Advanced features
    Object.keys(env.advancedFeatures).forEach((feature) => {
      results[`advanced.${feature}`] = this.isAdvancedFeatureEnabled(
        feature as keyof typeof env.advancedFeatures,
        context
      );
    });

    return results;
  }

  /**
   * Execute code conditionally based on feature flag
   */
  async withFeature<T>(
    feature: keyof typeof env.features,
    enabledFn: () => Promise<T>,
    disabledFn: () => Promise<T>,
    context?: FeatureFlagContext
  ): Promise<T> {
    const result = this.isFeatureEnabled(feature, context);
    return result.enabled ? enabledFn() : disabledFn();
  }

  /**
   * Execute code conditionally based on advanced feature flag
   */
  async withAdvancedFeature<T>(
    feature: keyof typeof env.advancedFeatures,
    enabledFn: () => Promise<T>,
    disabledFn: () => Promise<T>,
    context?: FeatureFlagContext
  ): Promise<T> {
    const result = this.isAdvancedFeatureEnabled(feature, context);
    return result.enabled ? enabledFn() : disabledFn();
  }

  /**
   * Check if user is in whitelist
   */
  private isUserWhitelisted(userEmail: string): boolean {
    return env.rollout.whitelist.includes(userEmail);
  }

  /**
   * Check if user is included in percentage rollout
   */
  private isUserInRollout(context?: FeatureFlagContext): boolean {
    if (!context?.userEmail) {
      // For anonymous users, use a deterministic approach based on session or random
      return Math.random() * 100 < env.rollout.percentage;
    }

    // Use deterministic hash of user email to ensure consistent experience
    const hash = this.simpleHash(context.userEmail);
    const userPercentile = hash % 100;
    return userPercentile < env.rollout.percentage;
  }

  /**
   * Simple hash function for deterministic rollout
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get feature flag configuration for debugging
   */
  getConfiguration(): {
    features: typeof env.features;
    advancedFeatures: typeof env.advancedFeatures;
    rollout: typeof env.rollout;
    environment: string;
  } {
    return {
      features: env.features,
      advancedFeatures: env.advancedFeatures,
      rollout: env.rollout,
      environment: env.nodeEnv,
    };
  }

  /**
   * Override feature flag for testing (development only)
   */
  overrideFeature(feature: string, enabled: boolean): void {
    if (env.nodeEnv !== 'development') {
      console.warn('Feature flag overrides are only allowed in development environment');
      return;
    }

    // Store override in memory (this is simplified for demo)
    console.log(`Feature flag override: ${feature} = ${enabled}`);
  }

  /**
   * Log feature flag usage for analytics
   */
  private logFeatureUsage(feature: string, enabled: boolean, context?: FeatureFlagContext): void {
    if (env.advancedFeatures.auditTrail) {
      console.log('Feature flag usage:', {
        feature,
        enabled,
        userId: context?.userId,
        userEmail: context?.userEmail,
        timestamp: new Date(),
        environment: env.nodeEnv,
      });
    }
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagService.getInstance();

// Convenience functions for common usage patterns
export function isFeatureEnabled(
  feature: keyof typeof env.features,
  context?: FeatureFlagContext
): boolean {
  return featureFlags.isFeatureEnabled(feature, context).enabled;
}

export function isAdvancedFeatureEnabled(
  feature: keyof typeof env.advancedFeatures,
  context?: FeatureFlagContext
): boolean {
  return featureFlags.isAdvancedFeatureEnabled(feature, context).enabled;
}

// Feature-specific helper functions
export function hasAssetIntegration(context?: FeatureFlagContext): boolean {
  return isAdvancedFeatureEnabled('assetIntegration', context);
}

export function hasEnhancedValidation(context?: FeatureFlagContext): boolean {
  return isAdvancedFeatureEnabled('enhancedValidation', context);
}

export function hasRichEditor(context?: FeatureFlagContext): boolean {
  return isAdvancedFeatureEnabled('richEditor', context);
}

export function hasAdvancedAnalytics(context?: FeatureFlagContext): boolean {
  return isAdvancedFeatureEnabled('advancedAnalytics', context);
}

export function hasMultiCategories(context?: FeatureFlagContext): boolean {
  return isAdvancedFeatureEnabled('multiCategories', context);
}

export function hasUrlValidation(context?: FeatureFlagContext): boolean {
  return isAdvancedFeatureEnabled('urlValidation', context);
}

export function hasAuditTrail(context?: FeatureFlagContext): boolean {
  return isAdvancedFeatureEnabled('auditTrail', context);
}