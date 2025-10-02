'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  Mail,
  Globe,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SocialProfile {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  displayName?: string;
  isVerified?: boolean;
  order: number;
  stats?: {
    followers?: number;
    following?: number;
    posts?: number;
  };
}

interface Brand {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  description?: string;
  type: 'professional' | 'creative' | 'personal' | 'other';
  isPrimary: boolean;
  order: number;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    icon?: string;
  };
  metadata?: {
    followers?: number;
    totalPosts?: number;
    websiteUrl?: string;
  };
  profiles: SocialProfile[];
}

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
  const iconMap: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    youtube: Youtube,
    facebook: Facebook,
    email: Mail,
    website: Globe,
  };
  return iconMap[platform.toLowerCase()] || Globe;
};

// Platform color mapping
const getPlatformColor = (platform: string) => {
  const colorMap: Record<string, string> = {
    instagram: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600',
    twitter: 'hover:bg-blue-400',
    linkedin: 'hover:bg-blue-700',
    github: 'hover:bg-gray-800',
    youtube: 'hover:bg-red-600',
    facebook: 'hover:bg-blue-600',
    email: 'hover:bg-red-500',
    website: 'hover:bg-green-600',
  };
  return colorMap[platform.toLowerCase()] || 'hover:bg-gray-600';
};

// Format follower count
const formatCount = (count?: number): string => {
  if (!count) return '';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export default function SocialsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/public/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError('Failed to load social profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
          <div className='text-center'>
            <div className='animate-pulse space-y-4'>
              <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto'></div>
              <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || brands.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
              Connect With Me
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-400'>
              {error || 'No social profiles available at the moment.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6'>
            Connect With Me 🌐
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            Find me across different platforms and stay connected with my work, creativity, and journey.
          </p>
        </motion.div>

        {/* Brands Grid */}
        <div className='space-y-12'>
          {brands.map((brand, brandIndex) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: brandIndex * 0.1 }}
            >
              <Card className='overflow-hidden border-2 hover:border-blue-500 transition-colors'>
                <CardHeader
                  className='pb-4'
                  style={{
                    background: brand.theme?.primaryColor
                      ? `linear-gradient(135deg, ${brand.theme.primaryColor}15, ${brand.theme.secondaryColor || brand.theme.primaryColor}15)`
                      : undefined,
                  }}
                >
                  <div className='flex items-center justify-between flex-wrap gap-4'>
                    <div className='flex items-center gap-3'>
                      {brand.theme?.icon && (
                        <span className='text-4xl'>{brand.theme.icon}</span>
                      )}
                      <div>
                        <CardTitle className='text-2xl flex items-center gap-2'>
                          {brand.displayName}
                          {brand.isPrimary && (
                            <Badge variant='default' className='ml-2'>
                              Primary
                            </Badge>
                          )}
                        </CardTitle>
                        {brand.description && (
                          <CardDescription className='mt-1'>
                            {brand.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className='capitalize'
                    >
                      {brand.type}
                    </Badge>
                  </div>

                  {/* Brand Metadata */}
                  {(brand.metadata?.followers || brand.metadata?.totalPosts) && (
                    <div className='flex gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400'>
                      {brand.metadata.followers && (
                        <div className='flex items-center gap-1'>
                          <Users className='h-4 w-4' />
                          <span>{formatCount(brand.metadata.followers)} followers</span>
                        </div>
                      )}
                      {brand.metadata.totalPosts && (
                        <div className='flex items-center gap-1'>
                          <ImageIcon className='h-4 w-4' />
                          <span>{formatCount(brand.metadata.totalPosts)} posts</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>

                <CardContent className='pt-6'>
                  {/* Social Profiles Grid */}
                  {brand.profiles.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {brand.profiles.map((profile, profileIndex) => {
                        const Icon = getPlatformIcon(profile.platform);
                        const platformColor = getPlatformColor(profile.platform);

                        return (
                          <motion.a
                            key={profile.id}
                            href={profile.profileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: profileIndex * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            className={`group relative p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:text-white transition-all ${platformColor}`}
                          >
                            <div className='flex items-start justify-between gap-2'>
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <Icon className='h-5 w-5 flex-shrink-0' />
                                  <span className='font-semibold capitalize truncate'>
                                    {profile.displayName || profile.platform}
                                  </span>
                                  {profile.isVerified && (
                                    <CheckCircle2 className='h-4 w-4 text-blue-500 flex-shrink-0' />
                                  )}
                                </div>
                                <p className='text-sm opacity-90 truncate'>
                                  @{profile.username}
                                </p>
                                {profile.stats?.followers && (
                                  <p className='text-xs mt-1 opacity-75'>
                                    {formatCount(profile.stats.followers)} followers
                                  </p>
                                )}
                              </div>
                              <ExternalLink className='h-4 w-4 opacity-50 group-hover:opacity-100 flex-shrink-0' />
                            </div>
                          </motion.a>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-center text-gray-500 dark:text-gray-400 py-8'>
                      No social profiles available
                    </p>
                  )}

                  {/* Brand Website Link */}
                  {brand.metadata?.websiteUrl && (
                    <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
                      <a
                        href={brand.metadata.websiteUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:underline'
                      >
                        <Globe className='h-4 w-4' />
                        Visit Website
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className='text-center mt-16'
        >
          <Link
            href='/contact'
            className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
          >
            <Mail className='h-5 w-5' />
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
