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

// Configuration types
interface FeatureFlagConfig {
  features: Record<string, boolean>;
  advancedFeatures: Record<string, boolean>;
  rollout: {
    percentage: number;
    whitelist: string[];
  };
  environment: string;
}

// Type for environment configuration
interface EnvConfig {
  features: {
    blog: boolean;
    portfolio: boolean;
    comments: boolean;
    likes: boolean;
    auth: boolean;
    admin: boolean;
  };
  advancedFeatures: {
    assetIntegration: boolean;
    enhancedValidation: boolean;
    richEditor: boolean;
    analyticsTracking: boolean;
    aiSuggestions: boolean;
    realTimeCollaboration: boolean;
  };
  rollout: {
    percentage: number;
    whitelist: string[];
  };
  environment: string;
}

export class FeatureFlagService {
  private _config: EnvConfig | null = null;

  constructor(private testConfig?: EnvConfig) {
    if (testConfig) {
      this._config = testConfig;
    }
  }

  /**
   * Lazy load environment configuration
   */
  private getConfig(): EnvConfig {
    if (!this._config) {
      try {
        const { env } = require('./env');
        this._config = {
          features: env.features,
          advancedFeatures: env.advancedFeatures,
          rollout: env.rollout,
          environment: env.environment,
        };
      } catch (error) {
        // Fallback for testing environment
        this._config = {
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
            richEditor: false,
            analyticsTracking: false,
            aiSuggestions: false,
            realTimeCollaboration: false,
          },
          rollout: {
            percentage: 0,
            whitelist: [],
          },
          environment: 'test',
        };
      }
    }
    return this._config;
  }

  /**
   * Check if a core feature is enabled
   */
  isFeatureEnabled(feature: keyof EnvConfig['features'], context?: FeatureFlagContext): FeatureFlagResult {
    const config = this.getConfig();
    const baseEnabled = config.features[feature];
    
    if (!baseEnabled) {
      return {
        enabled: false,
        source: 'environment',
        reason: `Feature ${String(feature)} is disabled in environment configuration`,
      };
    }
    
    return {
      enabled: true,
      source: 'environment',
      reason: `Feature ${String(feature)} is enabled in environment configuration`,
    };
  }

  /**
   * Check if an advanced feature is enabled (with progressive rollout)
   */
  isAdvancedFeatureEnabled(
    feature: keyof EnvConfig['advancedFeatures'],
    context?: FeatureFlagContext
  ): FeatureFlagResult {
    const config = this.getConfig();
    const baseEnabled = config.advancedFeatures[feature];
    
    if (!baseEnabled) {
      return {
        enabled: false,
        source: 'environment',
        reason: `Advanced feature ${String(feature)} is disabled in environment configuration`,
      };
    }

    // If user is in whitelist, enable immediately
    if (context?.userEmail && this.isUserInWhitelist(context.userEmail)) {
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
          ? `User included in ${config.rollout.percentage}% rollout`
          : 'User not included in rollout',
      };
    }

    return {
      enabled: false,
      source: 'rollout',
      reason: `User not included in ${config.rollout.percentage}% rollout`,
    };
  }

  /**
   * Get all feature flags for a context
   */
  getFeatureFlags(context?: FeatureFlagContext): Record<string, FeatureFlagResult> {
    const config = this.getConfig();
    const results: Record<string, FeatureFlagResult> = {};
    
    // Core features
    Object.keys(config.features).forEach((feature) => {
      results[feature] = this.isFeatureEnabled(feature as keyof EnvConfig['features'], context);
    });
    
    // Advanced features (with 'advanced.' prefix)
    Object.keys(config.advancedFeatures).forEach((feature) => {
      results[`advanced.${feature}`] = this.isAdvancedFeatureEnabled(
        feature as keyof EnvConfig['advancedFeatures'],
        context
      );
    });
    
    return results;
  }

  /**
   * Convenience method for checking core features with boolean return
   */
  is(
    feature: keyof EnvConfig['features'],
    context?: FeatureFlagContext
  ): boolean {
    return this.isFeatureEnabled(feature, context).enabled;
  }

  /**
   * Convenience method for checking advanced features with boolean return
   */
  isAdvanced(
    feature: keyof EnvConfig['advancedFeatures'],
    context?: FeatureFlagContext
  ): boolean {
    return this.isAdvancedFeatureEnabled(feature, context).enabled;
  }

  /**
   * Check if user is in feature whitelist
   */
  private isUserInWhitelist(userEmail: string): boolean {
    const config = this.getConfig();
    return config.rollout.whitelist.includes(userEmail);
  }

  /**
   * Check if user is included in percentage-based rollout
   */
  private isUserInRollout(userId: string): boolean {
    const config = this.getConfig();
    
    // For testing environments, use deterministic rollout based on userId
    if (config.environment === 'test') {
      // Simple hash function for testing
      let hash = 0;
      for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      const userPercentile = Math.abs(hash) % 100;
      return userPercentile < config.rollout.percentage;
    }
    
    // Use progressive rollout service for production
    try {
      return progressiveRollout.shouldReceiveFeature('rollout', { userId });
    } catch (error) {
      // Fallback to simple percentage-based rollout
      const userPercentile = parseInt(userId.slice(-2), 36) % 100;
      return userPercentile < config.rollout.percentage;
    }
  }

  /**
   * Get current configuration for debugging
   */
  getConfiguration(): FeatureFlagConfig {
    const config = this.getConfig();
    return {
      features: config.features,
      advancedFeatures: config.advancedFeatures,
      rollout: config.rollout,
      environment: config.environment,
    };
  }
}

// Create singleton instance for production use
let globalFeatureFlags: FeatureFlagService | null = null;

export function getFeatureFlags(testConfig?: EnvConfig): FeatureFlagService {
  if (testConfig) {
    return new FeatureFlagService(testConfig);
  }
  
  if (!globalFeatureFlags) {
    globalFeatureFlags = new FeatureFlagService();
  }
  
  return globalFeatureFlags;
}

// Export default instance for convenience
export const featureFlags = getFeatureFlags();