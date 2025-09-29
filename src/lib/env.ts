// Environment configuration utility
// Validates and provides type-safe access to environment variables

interface EnvConfig {
  // Site
  siteUrl: string;
  siteName: string;
  nodeEnv: 'development' | 'production' | 'test';

  // Database
  mongodbUri: string;
  mongodbDbName: string;

  // Authentication
  clerkPublishableKey: string;
  clerkSecretKey: string;
  clerkWebhookSecret?: string;

  // API
  apiBaseUrl: string;

  // Content
  postsPerPage: number;
  projectsPerPage: number;
  enableComments: boolean;
  enableLikes: boolean;

  // Upload
  uploadMaxSize: number;
  uploadAllowedTypes: string[];

  // Feature Flags
  features: {
    blog: boolean;
    portfolio: boolean;
    comments: boolean;
    analytics: boolean;
    search: boolean;
  };

  // Advanced Feature Flags (Safe Integration)
  advancedFeatures: {
    assetIntegration: boolean;
    enhancedValidation: boolean;
    advancedAnalytics: boolean;
    multiCategories: boolean;
    urlValidation: boolean;
    auditTrail: boolean;
  };

  // Rollout Configuration
  rollout: {
    percentage: number;
    whitelist: string[];
  };

  // Circuit Breaker Configuration
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
    halfOpenMaxCalls: number;
  };

  // Cache
  cacheTtl: number;
  enableIsr: boolean;
  isrRevalidate: number;

  // Rate Limiting
  rateLimit: {
    max: number;
    windowMs: number;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getOptionalEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`);
  }
  return parsed;
}

export const env: EnvConfig = {
  // Site
  siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  siteName: getEnvVar('NEXT_PUBLIC_SITE_NAME', 'Rohan Batra Portfolio'),
  nodeEnv: getEnvVar('NODE_ENV', 'development') as EnvConfig['nodeEnv'],

  // Database
  mongodbUri: getEnvVar('MONGODB_URI'),
  mongodbDbName: getEnvVar('MONGODB_DB_NAME', 'portfolio'),

  // Authentication
  clerkPublishableKey: getEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  clerkSecretKey: getEnvVar('CLERK_SECRET_KEY'),
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET,

  // API
  apiBaseUrl: getEnvVar(
    'NEXT_PUBLIC_API_BASE_URL',
    'http://localhost:3000/api'
  ),

  // Content
  postsPerPage: getNumberEnvVar('POSTS_PER_PAGE', 10),
  projectsPerPage: getNumberEnvVar('PROJECTS_PER_PAGE', 12),
  enableComments: getBooleanEnvVar('ENABLE_COMMENTS', true),
  enableLikes: getBooleanEnvVar('ENABLE_LIKES', true),

  // Upload
  uploadMaxSize: getNumberEnvVar('UPLOAD_MAX_SIZE', 10485760), // 10MB
  uploadAllowedTypes: getEnvVar(
    'UPLOAD_ALLOWED_TYPES',
    'image/jpeg,image/png,image/webp,image/gif'
  ).split(','),

  // Feature Flags
  features: {
    blog: getBooleanEnvVar('FEATURE_BLOG', true),
    portfolio: getBooleanEnvVar('FEATURE_PORTFOLIO', true),
    comments: getBooleanEnvVar('FEATURE_COMMENTS', true),
    analytics: getBooleanEnvVar('FEATURE_ANALYTICS', true),
    search: getBooleanEnvVar('FEATURE_SEARCH', true),
  },

  // Advanced Feature Flags (Safe Integration)
  advancedFeatures: {
    assetIntegration: getBooleanEnvVar('FEATURE_ASSET_INTEGRATION', false),
    enhancedValidation: getBooleanEnvVar('FEATURE_ENHANCED_VALIDATION', false),
    advancedAnalytics: getBooleanEnvVar('FEATURE_ADVANCED_ANALYTICS', false),
    multiCategories: getBooleanEnvVar('FEATURE_MULTI_CATEGORIES', false),
    urlValidation: getBooleanEnvVar('FEATURE_URL_VALIDATION', false),
    auditTrail: getBooleanEnvVar('FEATURE_AUDIT_TRAIL', false),
  },

  // Rollout Configuration
  rollout: {
    percentage: getNumberEnvVar('ROLLOUT_PERCENTAGE', 0),
    whitelist: getOptionalEnvVar('ROLLOUT_ADMIN_USERS', '')
      .split(',')
      .filter(Boolean),
  },

  // Circuit Breaker Configuration
  circuitBreaker: {
    enabled: getBooleanEnvVar('CIRCUIT_BREAKER_ENABLED', false),
    failureThreshold: getNumberEnvVar('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5),
    resetTimeout: getNumberEnvVar('CIRCUIT_BREAKER_RESET_TIMEOUT', 60000),
    monitoringPeriod: getNumberEnvVar(
      'CIRCUIT_BREAKER_MONITORING_PERIOD',
      300000
    ),
    halfOpenMaxCalls: getNumberEnvVar('CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS', 3),
  },

  // Cache
  cacheTtl: getNumberEnvVar('CACHE_TTL', 3600),
  enableIsr: getBooleanEnvVar('ENABLE_ISR', true),
  isrRevalidate: getNumberEnvVar('ISR_REVALIDATE', 3600),

  // Rate Limiting
  rateLimit: {
    max: getNumberEnvVar('RATE_LIMIT_MAX', 100),
    windowMs: getNumberEnvVar('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  },
};

// Validation function to run at startup
export function validateEnvironment(): void {
  const requiredVars = [
    'MONGODB_URI',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate URL format
  try {
    new URL(env.siteUrl);
    new URL(env.apiBaseUrl);
  } catch {
    throw new Error('Invalid URL format in environment variables');
  }

  console.log('✅ Environment validation passed');
}

// Helper functions for common environment checks
export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';

export default env;
