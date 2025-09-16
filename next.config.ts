import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimize images and prevent memory issues
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack optimizations for memory management
  webpack: (config, { isServer }) => {
    // Optimize memory usage
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Prevent memory leaks in development
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    
    return config;
  },
};

export default nextConfig;
