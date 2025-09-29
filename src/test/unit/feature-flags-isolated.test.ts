import { describe, it, expect } from 'vitest';

// Isolated feature flag implementation for testing
interface TestFeatureFlagContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  environment?: string;
}

interface TestFeatureFlagResult {
  enabled: boolean;
  source: 'environment' | 'rollout' | 'whitelist' | 'default';
  reason?: string;
}

class TestFeatureFlagService {
  constructor(
    private config: {
      features: Record<string, boolean>;
      advancedFeatures: Record<string, boolean>;
      rollout: { percentage: number; whitelist: string[] };
      environment: string;
    }
  ) {}

  isFeatureEnabled(
    feature: string,
    context?: TestFeatureFlagContext
  ): TestFeatureFlagResult {
    const baseEnabled = this.config.features[feature];

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

  isAdvancedFeatureEnabled(
    feature: string,
    context?: TestFeatureFlagContext
  ): TestFeatureFlagResult {
    const baseEnabled = this.config.advancedFeatures[feature];

    if (!baseEnabled) {
      return {
        enabled: false,
        source: 'environment',
        reason: `Advanced feature ${feature} is disabled in environment configuration`,
      };
    }

    // If user is in whitelist, enable immediately
    if (
      context?.userEmail &&
      this.config.rollout.whitelist.includes(context.userEmail)
    ) {
      return {
        enabled: true,
        source: 'whitelist',
        reason: 'User is in feature whitelist',
      };
    }

    // Check progressive rollout
    if (context?.userId) {
      const rolloutEnabled = this.isUserInRollout(context.userId);
      return {
        enabled: rolloutEnabled,
        source: 'rollout',
        reason: rolloutEnabled
          ? `User included in ${this.config.rollout.percentage}% rollout`
          : 'User not included in rollout',
      };
    }

    return {
      enabled: false,
      source: 'rollout',
      reason: `User not included in ${this.config.rollout.percentage}% rollout`,
    };
  }

  getFeatureFlags(
    context?: TestFeatureFlagContext
  ): Record<string, TestFeatureFlagResult> {
    const results: Record<string, TestFeatureFlagResult> = {};

    // Core features
    Object.keys(this.config.features).forEach(feature => {
      results[feature] = this.isFeatureEnabled(feature, context);
    });

    // Advanced features (with 'advanced.' prefix)
    Object.keys(this.config.advancedFeatures).forEach(feature => {
      results[`advanced.${feature}`] = this.isAdvancedFeatureEnabled(
        feature,
        context
      );
    });

    return results;
  }

  getConfiguration() {
    return this.config;
  }

  private isUserInRollout(userId: string): boolean {
    // Simple hash function for testing
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const userPercentile = Math.abs(hash) % 100;
    return userPercentile < this.config.rollout.percentage;
  }
}

describe('Feature Flag Service', () => {
  it('should return correct feature flag status', () => {
    const featureFlags = new TestFeatureFlagService({
      features: {
        blog: true,
        portfolio: true,
        comments: true,
        likes: true,
        auth: true,
        admin: true,
      },
      advancedFeatures: {
        assetIntegration: false,
        enhancedValidation: false,

        analyticsTracking: false,
        aiSuggestions: false,
        realTimeCollaboration: false,
      },
      rollout: {
        percentage: 0,
        whitelist: [],
      },
      environment: 'test',
    });

    const context = {
      userId: 'test-user-123',
      userEmail: 'test@example.com',
      userRole: 'admin',
      environment: 'development',
    };

    // Test core features (should be enabled by default)
    const blogResult = featureFlags.isFeatureEnabled('blog', context);
    expect(blogResult.enabled).toBe(true);
    expect(blogResult.source).toBe('environment');

    // Test advanced features (should be disabled by default)
    const assetResult = featureFlags.isAdvancedFeatureEnabled(
      'assetIntegration',
      context
    );
    expect(assetResult.enabled).toBe(false);
    expect(assetResult.source).toBe('environment');
  });

  it('should handle progressive rollout correctly', () => {
    const featureFlags = new TestFeatureFlagService({
      features: {
        blog: true,
        portfolio: true,
        comments: true,
        likes: true,
        auth: true,
        admin: true,
      },
      advancedFeatures: {
        assetIntegration: true, // Enabled
        enhancedValidation: false,

        analyticsTracking: false,
        aiSuggestions: false,
        realTimeCollaboration: false,
      },
      rollout: {
        percentage: 0, // 0% rollout
        whitelist: [],
      },
      environment: 'test',
    });

    const context = {
      userId: 'test-user-123',
      userEmail: 'regular@example.com',
      userRole: 'user',
      environment: 'development',
    };

    const result = featureFlags.isAdvancedFeatureEnabled(
      'assetIntegration',
      context
    );
    expect(result.enabled).toBe(false);
    expect(result.source).toBe('rollout');
  });

  it('should respect whitelist users', () => {
    const featureFlags = new TestFeatureFlagService({
      features: {
        blog: true,
        portfolio: true,
        comments: true,
        likes: true,
        auth: true,
        admin: true,
      },
      advancedFeatures: {
        assetIntegration: true, // Enabled
        enhancedValidation: false,

        analyticsTracking: false,
        aiSuggestions: false,
        realTimeCollaboration: false,
      },
      rollout: {
        percentage: 0, // 0% rollout
        whitelist: ['admin@example.com', 'whitelisted@example.com'],
      },
      environment: 'test',
    });

    const whitelistedContext = {
      userId: 'admin-user-123',
      userEmail: 'admin@example.com',
      userRole: 'admin',
      environment: 'development',
    };

    const result = featureFlags.isAdvancedFeatureEnabled(
      'assetIntegration',
      whitelistedContext
    );
    expect(result.enabled).toBe(true);
    expect(result.source).toBe('whitelist');
  });

  it('should enable features for high rollout percentage', () => {
    const featureFlags = new TestFeatureFlagService({
      features: {
        blog: true,
        portfolio: true,
        comments: true,
        likes: true,
        auth: true,
        admin: true,
      },
      advancedFeatures: {
        assetIntegration: true, // Enabled
        enhancedValidation: false,

        analyticsTracking: false,
        aiSuggestions: false,
        realTimeCollaboration: false,
      },
      rollout: {
        percentage: 100, // 100% rollout
        whitelist: [],
      },
      environment: 'test',
    });

    const context = {
      userId: 'test-user-123',
      userEmail: 'regular@example.com',
      userRole: 'user',
      environment: 'development',
    };

    const result = featureFlags.isAdvancedFeatureEnabled(
      'assetIntegration',
      context
    );
    expect(result.enabled).toBe(true);
    expect(result.source).toBe('rollout');
  });

  it('should return all feature flags configuration', () => {
    const featureFlags = new TestFeatureFlagService({
      features: {
        blog: true,
        portfolio: true,
        comments: true,
        likes: true,
        auth: true,
        admin: true,
      },
      advancedFeatures: {
        assetIntegration: false,
        enhancedValidation: false,

        analyticsTracking: false,
        aiSuggestions: false,
        realTimeCollaboration: false,
      },
      rollout: {
        percentage: 0,
        whitelist: [],
      },
      environment: 'test',
    });

    const context = {
      userId: 'test-user-123',
      userEmail: 'test@example.com',
      userRole: 'user',
      environment: 'development',
    };

    const flags = featureFlags.getFeatureFlags(context);

    // Should include core features
    expect(flags).toHaveProperty('blog');
    expect(flags).toHaveProperty('portfolio');
    expect(flags).toHaveProperty('comments');

    // Should include advanced features with 'advanced.' prefix
    expect(flags).toHaveProperty('advanced.assetIntegration');
    expect(flags).toHaveProperty('advanced.enhancedValidation');
    // 'richEditor' advanced feature removed from codebase

    // All results should have enabled and source properties
    Object.values(flags).forEach(flag => {
      expect(flag).toHaveProperty('enabled');
      expect(flag).toHaveProperty('source');
      expect(typeof flag.enabled).toBe('boolean');
      expect(['environment', 'rollout', 'whitelist', 'default']).toContain(
        flag.source
      );
    });
  });

  it('should provide feature configuration for debugging', () => {
    const featureFlags = new TestFeatureFlagService({
      features: {
        blog: true,
        portfolio: true,
        comments: true,
        likes: true,
        auth: true,
        admin: true,
      },
      advancedFeatures: {
        assetIntegration: false,
        enhancedValidation: false,

        analyticsTracking: false,
        aiSuggestions: false,
        realTimeCollaboration: false,
      },
      rollout: {
        percentage: 0,
        whitelist: [],
      },
      environment: 'test',
    });

    const config = featureFlags.getConfiguration();

    expect(config).toHaveProperty('features');
    expect(config).toHaveProperty('advancedFeatures');
    expect(config).toHaveProperty('rollout');
    expect(config).toHaveProperty('environment');

    expect(config.environment).toBe('test');
  });
});
