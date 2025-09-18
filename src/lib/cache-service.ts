import { cache, CacheKeys } from '@/lib/redis';

/**
 * Cache service for blog posts
 */
export class BlogCacheService {
  static async getPost(slug: string) {
    const key = CacheKeys.blogPost(slug);
    return cache.get(key);
  }

  static async setPost(slug: string, post: unknown, ttl = 3600) {
    const key = CacheKeys.blogPost(slug);
    return cache.set(key, post, ttl);
  }

  static async getPosts(page = 1, limit = 10) {
    const key = CacheKeys.blogPosts(page, limit);
    return cache.get(key);
  }

  static async setPosts(
    page: number,
    limit: number,
    posts: unknown,
    ttl = 1800
  ) {
    const key = CacheKeys.blogPosts(page, limit);
    return cache.set(key, posts, ttl);
  }

  static async getPostsByTag(tag: string, page = 1) {
    const key = CacheKeys.blogPostsByTag(tag, page);
    return cache.get(key);
  }

  static async setPostsByTag(
    tag: string,
    page: number,
    posts: unknown,
    ttl = 1800
  ) {
    const key = CacheKeys.blogPostsByTag(tag, page);
    return cache.set(key, posts, ttl);
  }

  static async invalidatePost(slug: string) {
    const key = CacheKeys.blogPost(slug);
    return cache.del(key);
  }

  static async invalidateAllPosts() {
    return cache.delPattern('blog:*');
  }
}

/**
 * Cache service for portfolio projects
 */
export class PortfolioCacheService {
  static async getProject(slug: string) {
    const key = CacheKeys.project(slug);
    return cache.get(key);
  }

  static async setProject(slug: string, project: unknown, ttl = 3600) {
    const key = CacheKeys.project(slug);
    return cache.set(key, project, ttl);
  }

  static async getProjects(page = 1, limit = 12) {
    const key = CacheKeys.projects(page, limit);
    return cache.get(key);
  }

  static async setProjects(
    page: number,
    limit: number,
    projects: unknown,
    ttl = 1800
  ) {
    const key = CacheKeys.projects(page, limit);
    return cache.set(key, projects, ttl);
  }

  static async getProjectsByTech(tech: string, page = 1) {
    const key = CacheKeys.projectsByTech(tech, page);
    return cache.get(key);
  }

  static async setProjectsByTech(
    tech: string,
    page: number,
    projects: unknown,
    ttl = 1800
  ) {
    const key = CacheKeys.projectsByTech(tech, page);
    return cache.set(key, projects, ttl);
  }

  static async invalidateProject(slug: string) {
    const key = CacheKeys.project(slug);
    return cache.del(key);
  }

  static async invalidateAllProjects() {
    return cache.delPattern('portfolio:*');
  }
}

/**
 * Cache service for user data
 */
export class UserCacheService {
  static async getUser(id: string) {
    const key = CacheKeys.user(id);
    return cache.get(key);
  }

  static async setUser(id: string, user: unknown, ttl = 3600) {
    const key = CacheKeys.user(id);
    return cache.set(key, user, ttl);
  }

  static async getUserProfile(id: string) {
    const key = CacheKeys.userProfile(id);
    return cache.get(key);
  }

  static async setUserProfile(id: string, profile: unknown, ttl = 3600) {
    const key = CacheKeys.userProfile(id);
    return cache.set(key, profile, ttl);
  }

  static async invalidateUser(id: string) {
    const userKey = CacheKeys.user(id);
    const profileKey = CacheKeys.userProfile(id);
    await Promise.all([cache.del(userKey), cache.del(profileKey)]);
  }
}

/**
 * Cache service for comments
 */
export class CommentCacheService {
  static async getComments(postId: string, page = 1) {
    const key = CacheKeys.comments(postId, page);
    return cache.get(key);
  }

  static async setComments(
    postId: string,
    page: number,
    comments: unknown,
    ttl = 1800
  ) {
    const key = CacheKeys.comments(postId, page);
    return cache.set(key, comments, ttl);
  }

  static async getCommentsCount(postId: string) {
    const key = CacheKeys.commentsCount(postId);
    return cache.get(key);
  }

  static async setCommentsCount(postId: string, count: number, ttl = 1800) {
    const key = CacheKeys.commentsCount(postId);
    return cache.set(key, count, ttl);
  }

  static async invalidateComments(postId: string) {
    return cache.delPattern(`comments:post:${postId}:*`);
  }
}

/**
 * Cache service for assets
 */
export class AssetCacheService {
  static async getAssets(page = 1, limit = 20) {
    const key = CacheKeys.assets(page, limit);
    return cache.get(key);
  }

  static async setAssets(
    page: number,
    limit: number,
    assets: unknown,
    ttl = 1800
  ) {
    const key = CacheKeys.assets(page, limit);
    return cache.set(key, assets, ttl);
  }

  static async getAsset(id: string) {
    const key = CacheKeys.asset(id);
    return cache.get(key);
  }

  static async setAsset(id: string, asset: unknown, ttl = 3600) {
    const key = CacheKeys.asset(id);
    return cache.set(key, asset, ttl);
  }

  static async invalidateAsset(id: string) {
    const key = CacheKeys.asset(id);
    return cache.del(key);
  }

  static async invalidateAllAssets() {
    return cache.delPattern('assets:*');
  }
}

/**
 * Cache service for site settings
 */
export class SettingsCacheService {
  static async getSettings() {
    const key = CacheKeys.settings();
    return cache.get(key);
  }

  static async setSettings(settings: unknown, ttl = 7200) {
    const key = CacheKeys.settings();
    return cache.set(key, settings, ttl);
  }

  static async invalidateSettings() {
    const key = CacheKeys.settings();
    return cache.del(key);
  }
}

/**
 * Rate limiting cache service
 */
export class RateLimitCacheService {
  static async checkRateLimit(
    ip: string,
    endpoint: string,
    maxRequests = 100,
    windowMs = 900000
  ) {
    const key = CacheKeys.rateLimit(ip, endpoint);
    const current = (await cache.get<number>(key)) || 0;

    if (current >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: await cache.ttl(key) };
    }

    const newCount = await cache.incr(key);
    if (newCount === 1) {
      await cache.expire(key, Math.floor(windowMs / 1000));
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - newCount),
      resetTime: await cache.ttl(key),
    };
  }

  static async resetRateLimit(ip: string, endpoint: string) {
    const key = CacheKeys.rateLimit(ip, endpoint);
    return cache.del(key);
  }
}

/**
 * Analytics cache service
 */
export class AnalyticsCacheService {
  static async getAnalytics(period: string) {
    const key = CacheKeys.analytics(period);
    return cache.get(key);
  }

  static async setAnalytics(period: string, data: unknown, ttl = 3600) {
    const key = CacheKeys.analytics(period);
    return cache.set(key, data, ttl);
  }

  static async invalidateAnalytics() {
    return cache.delPattern('analytics:*');
  }
}

/**
 * Global cache management
 */
export class CacheManager {
  static async clearAll() {
    return cache.delPattern('*');
  }

  static async clearByPattern(pattern: string) {
    return cache.delPattern(pattern);
  }

  static async warmup() {
    // Implement cache warming strategies here
    console.log('Cache warmup initiated');
  }

  static async getStats() {
    // Get cache statistics if available
    return {
      connected: await cache.exists('health:check'),
      timestamp: new Date().toISOString(),
    };
  }
}
