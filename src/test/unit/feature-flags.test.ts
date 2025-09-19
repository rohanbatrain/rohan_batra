import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getFeatureFlags } from '@/lib/feature-flags-testable';

describe('Feature Flag Service', () => {
  it('should return correct feature flag status', () => {
    const featureFlags = getFeatureFlags({
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
    const assetResult = featureFlags.isAdvancedFeatureEnabled('assetIntegration', context);
    expect(assetResult.enabled).toBe(false);
    expect(assetResult.source).toBe('environment');
  });

  it('should handle progressive rollout correctly', () => {
    const featureFlags = getFeatureFlags({
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

    const result = featureFlags.isAdvancedFeatureEnabled('assetIntegration', context);
    expect(result.enabled).toBe(false);
    expect(result.source).toBe('rollout');
  });

  it('should respect whitelist users', () => {
    const featureFlags = getFeatureFlags({
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

    const result = featureFlags.isAdvancedFeatureEnabled('assetIntegration', whitelistedContext);
    expect(result.enabled).toBe(true);
    expect(result.source).toBe('whitelist');
  });

  it('should return all feature flags configuration', () => {
    const featureFlags = getFeatureFlags({
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
    Object.values(flags).forEach((flag) => {
      expect(flag).toHaveProperty('enabled');
      expect(flag).toHaveProperty('source');
      expect(typeof flag.enabled).toBe('boolean');
      expect(['environment', 'rollout', 'whitelist', 'default']).toContain(flag.source);
    });
  });

  it('should provide feature configuration for debugging', () => {
    const featureFlags = getFeatureFlags({
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