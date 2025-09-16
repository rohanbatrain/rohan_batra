import { env, validateEnvironment } from './env';

export interface DeploymentConfig {
  name: string;
  description: string;
  siteUrl: string;
  database: {
    uri: string;
    name: string;
  };
  features: {
    analytics: boolean;
    errorTracking: boolean;
    caching: boolean;
    rateLimit: boolean;
  };
  performance: {
    enableISR: boolean;
    revalidateTime: number;
    enableCompression: boolean;
    enableOptimization: boolean;
  };
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableCORS: boolean;
  };
}

export const deploymentConfigs: Record<string, DeploymentConfig> = {
  development: {
    name: 'Development',
    description: 'Local development environment',
    siteUrl: 'http://localhost:3000',
    database: {
      uri: env.mongodbUri,
      name: env.mongodbDbName,
    },
    features: {
      analytics: false,
      errorTracking: false,
      caching: false,
      rateLimit: false,
    },
    performance: {
      enableISR: false,
      revalidateTime: 0,
      enableCompression: false,
      enableOptimization: false,
    },
    security: {
      enableCSP: false,
      enableHSTS: false,
      enableCORS: true,
    },
  },

  staging: {
    name: 'Staging',
    description: 'Pre-production testing environment',
    siteUrl: 'https://staging.rohanbatra.dev',
    database: {
      uri: env.mongodbUri,
      name: `${env.mongodbDbName}-staging`,
    },
    features: {
      analytics: false,
      errorTracking: true,
      caching: true,
      rateLimit: true,
    },
    performance: {
      enableISR: true,
      revalidateTime: 300, // 5 minutes
      enableCompression: true,
      enableOptimization: true,
    },
    security: {
      enableCSP: true,
      enableHSTS: true,
      enableCORS: false,
    },
  },

  production: {
    name: 'Production',
    description: 'Live production environment',
    siteUrl: 'https://rohanbatra.dev',
    database: {
      uri: env.mongodbUri,
      name: env.mongodbDbName,
    },
    features: {
      analytics: true,
      errorTracking: true,
      caching: true,
      rateLimit: true,
    },
    performance: {
      enableISR: true,
      revalidateTime: 3600, // 1 hour
      enableCompression: true,
      enableOptimization: true,
    },
    security: {
      enableCSP: true,
      enableHSTS: true,
      enableCORS: false,
    },
  },
};

export function getCurrentDeploymentConfig(): DeploymentConfig {
  const environment = env.nodeEnv;
  const config = deploymentConfigs[environment];

  if (!config) {
    throw new Error(
      `No deployment configuration found for environment: ${environment}`
    );
  }

  return config;
}

export function initializeApp(): void {
  try {
    // Validate environment variables
    validateEnvironment();

    const config = getCurrentDeploymentConfig();
    console.log(`🚀 Initializing ${config.name} environment`);
    console.log(`📍 Site URL: ${config.siteUrl}`);
    console.log(`🗄️  Database: ${config.database.name}`);

    // Log feature flags
    const enabledFeatures = Object.entries(config.features)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);

    if (enabledFeatures.length > 0) {
      console.log(`🎛️  Enabled features: ${enabledFeatures.join(', ')}`);
    }

    // Performance settings
    if (config.performance.enableISR) {
      console.log(
        `⚡ ISR enabled with ${config.performance.revalidateTime}s revalidation`
      );
    }

    // Security settings
    const securityFeatures = Object.entries(config.security)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);

    if (securityFeatures.length > 0) {
      console.log(`🔒 Security features: ${securityFeatures.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    if (env.nodeEnv === 'production') {
      process.exit(1);
    }
  }
}

export { env };
