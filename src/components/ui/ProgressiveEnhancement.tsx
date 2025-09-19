'use client';

import React, { ComponentType, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Zap, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';
import { getCircuitBreaker } from '@/lib/circuit-breaker';

// Progressive enhancement configuration
interface ProgressiveEnhancementConfig {
  // Feature flags to check
  requiredFeatures?: string[];
  advancedFeatures?: string[];
  
  // Fallback behavior
  fallbackComponent?: ComponentType<any>;
  gracefulDegradation?: boolean;
  
  // Loading and error states
  showLoadingState?: boolean;
  showFeatureIndicators?: boolean;
  showDegradationWarning?: boolean;
  
  // Circuit breaker configuration
  enableCircuitBreaker?: boolean;
  circuitBreakerKey?: string;
  
  // Development options
  allowFeatureToggle?: boolean; // Only in development
}

// Context for feature availability
interface FeatureContext {
  availableFeatures: Record<string, boolean>;
  degradedMode: boolean;
  circuitBreakerOpen: boolean;
  featureFlagContext: any;
}

// Props passed to enhanced components
interface ProgressiveEnhancementProps {
  featureContext: FeatureContext;
  isEnhanced: boolean;
  degradedMode: boolean;
}

// HOC for progressive enhancement
export function withProgressiveEnhancement<P extends object>(
  EnhancedComponent: ComponentType<P & ProgressiveEnhancementProps>,
  config: ProgressiveEnhancementConfig = {}
) {
  return function ProgressiveEnhancementWrapper(props: P) {
    const { user } = useUser();
    const [loading, setLoading] = useState(config.showLoadingState ?? true);
    const [degradedMode, setDegradedMode] = useState(false);
    const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [availableFeatures, setAvailableFeatures] = useState<Record<string, boolean>>({});

    // Get feature flag context
    const featureFlagContext = {
      userId: user?.id,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      userRole: user?.publicMetadata?.role as string,
      environment: process.env.NODE_ENV,
    };

    // Check features and circuit breaker status
    useEffect(() => {
      const checkFeatures = async () => {
        try {
          // Check circuit breaker if enabled
          if (config.enableCircuitBreaker && config.circuitBreakerKey) {
            const cb = getCircuitBreaker(config.circuitBreakerKey);
            const cbStatus = cb.getState();
            setCircuitBreakerOpen(cbStatus.state !== 'closed');
            
            if (cbStatus.state === 'open') {
              setDegradedMode(true);
              setLoading(false);
              return;
            }
          }

          // Get all feature flags
          const allFeatures = featureFlags.getFeatureFlags(featureFlagContext);
          const features: Record<string, boolean> = {};
          
          // Check required features
          let hasAllRequired = true;
          if (config.requiredFeatures) {
            for (const feature of config.requiredFeatures) {
              const isEnabled = allFeatures[feature]?.enabled ?? false;
              features[feature] = isEnabled;
              if (!isEnabled) hasAllRequired = false;
            }
          }
          
          // Check advanced features
          let hasAnyAdvanced = false;
          if (config.advancedFeatures) {
            for (const feature of config.advancedFeatures) {
              const featureKey = feature.startsWith('advanced.') ? feature : `advanced.${feature}`;
              const isEnabled = allFeatures[featureKey]?.enabled ?? false;
              features[feature] = isEnabled;
              if (isEnabled) hasAnyAdvanced = true;
            }
          }

          setAvailableFeatures(features);
          
          // Determine if we should use degraded mode
          if (!hasAllRequired || (!hasAnyAdvanced && config.advancedFeatures?.length)) {
            setDegradedMode(config.gracefulDegradation ?? true);
          }

        } catch (error) {
          console.error('Error checking features:', error);
          setDegradedMode(true);
        } finally {
          setLoading(false);
        }
      };

      checkFeatures();
    }, [user, config]);

    // Loading state
    if (loading && config.showLoadingState) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading enhanced features...</span>
          </div>
        </div>
      );
    }

    // Circuit breaker is open - render fallback
    if (circuitBreakerOpen && config.fallbackComponent) {
      const FallbackComponent = config.fallbackComponent;
      return (
        <div className="space-y-4">
          {config.showDegradationWarning && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <ShieldCheck className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Enhanced features temporarily unavailable. Using fallback mode.
              </span>
            </div>
          )}
          <FallbackComponent {...props} />
        </div>
      );
    }

    // Prepare feature context
    const featureContext: FeatureContext = {
      availableFeatures,
      degradedMode,
      circuitBreakerOpen,
      featureFlagContext,
    };

    // Determine if enhanced mode is available
    const isEnhanced = !degradedMode && !circuitBreakerOpen;

    // Render fallback component if degraded and fallback is provided
    if (degradedMode && config.fallbackComponent && !config.gracefulDegradation) {
      const FallbackComponent = config.fallbackComponent;
      return (
        <div className="space-y-4">
          {config.showDegradationWarning && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Some advanced features are not available. Using basic mode.
              </span>
            </div>
          )}
          <FallbackComponent {...props} />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Feature indicators */}
        {config.showFeatureIndicators && (
          <div className="flex items-center gap-2 flex-wrap">
            {isEnhanced ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                Enhanced Mode
              </Badge>
            ) : (
              <Badge variant="outline" className="border-orange-300 text-orange-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Basic Mode
              </Badge>
            )}
            
            {Object.entries(availableFeatures).map(([feature, enabled]) => (
              <Badge 
                key={feature} 
                variant={enabled ? "secondary" : "outline"}
                className={enabled ? "bg-blue-100 text-blue-800" : "text-gray-500"}
              >
                {feature.replace('advanced.', '')}
              </Badge>
            ))}
          </div>
        )}

        {/* Degradation warning */}
        {degradedMode && config.showDegradationWarning && config.gracefulDegradation && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Running in enhanced mode with some features disabled.
            </span>
          </div>
        )}

        {/* Debug panel for development */}
        {config.allowFeatureToggle && process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Feature Debug Panel</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {showDebugPanel ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </div>
            </CardHeader>
            {showDebugPanel && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong>User Context:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(featureFlagContext, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <strong>Available Features:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(availableFeatures, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <strong>Mode:</strong>
                    <p className="mt-1">
                      {isEnhanced ? 'Enhanced' : 'Degraded'} 
                      {circuitBreakerOpen && ' (Circuit Breaker Open)'}
                    </p>
                  </div>
                  <div>
                    <strong>Circuit Breaker:</strong>
                    <p className="mt-1">
                      {config.enableCircuitBreaker 
                        ? `Enabled (${config.circuitBreakerKey})`
                        : 'Disabled'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Render the enhanced component */}
        <EnhancedComponent
          {...props}
          featureContext={featureContext}
          isEnhanced={isEnhanced}
          degradedMode={degradedMode}
        />
      </div>
    );
  };
}

// Hook to use feature context in components
export function useFeatureContext(): FeatureContext | null {
  // This would typically use React Context, but for simplicity we'll return null
  // In a real implementation, you'd wrap components with a FeatureProvider
  return null;
}

// Utility component for conditional feature rendering
interface FeatureGateProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FeatureGate({ 
  feature, 
  fallback = null, 
  children, 
  className = '' 
}: FeatureGateProps) {
  const { user } = useUser();
  
  const featureFlagContext = {
    userId: user?.id,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    userRole: user?.publicMetadata?.role as string,
    environment: process.env.NODE_ENV,
  };

  const allFeatures = featureFlags.getFeatureFlags(featureFlagContext);
  const isEnabled = allFeatures[feature]?.enabled ?? false;

  if (!isEnabled) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return <div className={className}>{children}</div>;
}

// Utility component for progressive loading
interface ProgressiveLoaderProps {
  features: string[];
  children: (context: { enabledFeatures: string[]; hasAllFeatures: boolean }) => React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function ProgressiveLoader({ 
  features, 
  children, 
  fallback = null, 
  className = '' 
}: ProgressiveLoaderProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);

  const featureFlagContext = {
    userId: user?.id,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    userRole: user?.publicMetadata?.role as string,
    environment: process.env.NODE_ENV,
  };

  useEffect(() => {
    const checkFeatures = async () => {
      try {
        const allFeatures = featureFlags.getFeatureFlags(featureFlagContext);
        const enabled = features.filter(feature => allFeatures[feature]?.enabled ?? false);
        setEnabledFeatures(enabled);
      } catch (error) {
        console.error('Error checking features:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFeatures();
  }, [user, features]);

  if (loading) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  const hasAllFeatures = enabledFeatures.length === features.length;

  return (
    <div className={className}>
      {children({ enabledFeatures, hasAllFeatures })}
    </div>
  );
}