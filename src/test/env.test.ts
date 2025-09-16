import { describe, it, expect, beforeEach } from 'vitest';
import {
  env,
  validateEnvironment,
  isDevelopment,
  isProduction,
  isTest,
} from '@/lib/env';

// Mock environment variables
const mockEnv = {
  MONGODB_URI: 'mongodb://localhost:27017/test',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
  CLERK_SECRET_KEY: 'sk_test_123',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
};

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset environment
    Object.keys(process.env).forEach(key => {
      if (
        key.startsWith('MONGODB_') ||
        key.startsWith('CLERK_') ||
        key.startsWith('NEXT_PUBLIC_')
      ) {
        delete process.env[key];
      }
    });

    // Set mock environment
    Object.assign(process.env, mockEnv);
  });

  describe('env configuration', () => {
    it('should load required environment variables', () => {
      expect(env.mongodbUri).toBe('mongodb://localhost:27017/test');
      expect(env.clerkPublishableKey).toBe('pk_test_123');
      expect(env.clerkSecretKey).toBe('sk_test_123');
      expect(env.siteUrl).toBe('http://localhost:3000');
      expect(env.nodeEnv).toBe('test');
    });

    it('should use default values for optional variables', () => {
      expect(env.mongodbDbName).toBe('portfolio');
      expect(env.postsPerPage).toBe(10);
      expect(env.projectsPerPage).toBe(12);
      expect(env.enableComments).toBe(true);
      expect(env.enableLikes).toBe(true);
    });

    it('should handle boolean environment variables', () => {
      // Test that env object is loaded correctly
      expect(typeof env.enableComments).toBe('boolean');
      expect(typeof env.enableLikes).toBe('boolean');
    });

    it('should handle number environment variables', () => {
      // Test that env object parses numbers correctly
      expect(typeof env.postsPerPage).toBe('number');
      expect(typeof env.projectsPerPage).toBe('number');
      expect(env.postsPerPage).toBeGreaterThan(0);
      expect(env.projectsPerPage).toBeGreaterThan(0);
    });

    it('should handle feature flags', () => {
      expect(env.features.blog).toBe(true);
      expect(env.features.portfolio).toBe(true);
      expect(env.features.comments).toBe(true);
      expect(env.features.analytics).toBe(true);
      expect(env.features.search).toBe(true);
    });

    it('should handle rate limiting configuration', () => {
      expect(env.rateLimit.max).toBe(100);
      expect(env.rateLimit.windowMs).toBe(900000);
    });

    it('should handle cache configuration', () => {
      expect(env.cacheTtl).toBe(3600);
      expect(env.enableIsr).toBe(true);
      expect(env.isrRevalidate).toBe(3600);
    });
  });

  describe('validateEnvironment', () => {
    it('should pass validation with all required variables', () => {
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw error when required variables are missing', () => {
      delete process.env.MONGODB_URI;

      expect(() => validateEnvironment()).toThrow(
        'Missing required environment variables: MONGODB_URI'
      );
    });

    it('should throw error for multiple missing variables', () => {
      delete process.env.MONGODB_URI;
      delete process.env.CLERK_SECRET_KEY;

      expect(() => validateEnvironment()).toThrow(
        'Missing required environment variables: MONGODB_URI, CLERK_SECRET_KEY'
      );
    });

    it('should validate URL format', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'invalid-url';

      expect(() => validateEnvironment()).toThrow(
        'Invalid URL format in environment variables'
      );
    });
  });

  describe('environment helpers', () => {
    it('should correctly identify environment types', () => {
      // Test that environment helper constants are properly exported
      expect(typeof isDevelopment).toBe('boolean');
      expect(typeof isProduction).toBe('boolean');
      expect(typeof isTest).toBe('boolean');

      // Only one should be true at a time
      const environments = [isDevelopment, isProduction, isTest];
      const trueCount = environments.filter(Boolean).length;
      expect(trueCount).toBe(1);
    });
  });
});
