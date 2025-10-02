'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Heart,
  Code,
  FileText,
  Home,
  User,
  Instagram,
} from 'lucide-react';
import { useCurrentYear } from '@/hooks/use-client-safe';

interface SocialProfile {
  platform: string;
  username: string;
  profileUrl: string;
}

// Default fallback links (if API fails)
const defaultSocialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/rohanbatrain',
    icon: Github,
    color: 'hover:text-gray-900 dark:hover:text-white',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/rohan-batra',
    icon: Linkedin,
    color: 'hover:text-blue-600',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/rohanbatrain',
    icon: Twitter,
    color: 'hover:text-blue-400',
  },
  {
    name: 'Email',
    href: 'mailto:hello@rohanbatra.dev',
    icon: Mail,
    color: 'hover:text-red-500',
  },
];

const quickLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Portfolio', href: '/portfolio', icon: Code },
  { name: 'Blog', href: '/blog', icon: FileText },
  { name: 'About', href: '/about', icon: User },
];

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@rohanbatra.dev',
    href: 'mailto:hello@rohanbatra.dev',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'San Francisco, CA',
    href: null,
  },
];

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
  const iconMap: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    email: Mail,
  };
  return iconMap[platform.toLowerCase()] || ExternalLink;
};

// Platform color mapping
const getPlatformColor = (platform: string) => {
  const colorMap: Record<string, string> = {
    instagram: 'hover:text-pink-600',
    twitter: 'hover:text-blue-400',
    linkedin: 'hover:text-blue-600',
    github: 'hover:text-gray-900 dark:hover:text-white',
    email: 'hover:text-red-500',
  };
  return colorMap[platform.toLowerCase()] || 'hover:text-blue-600';
};

export function Footer() {
  const currentYear = useCurrentYear();
  const [socialLinks, setSocialLinks] = useState(defaultSocialLinks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrimaryBrandProfiles = async () => {
      try {
        const response = await fetch('/api/public/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        
        const data = await response.json();
        const primaryBrand = data.brands?.find((brand: any) => brand.isPrimary);
        
        if (primaryBrand && primaryBrand.profiles?.length > 0) {
          // Convert profiles to footer social links format
          const dynamicLinks = primaryBrand.profiles.map((profile: SocialProfile) => {
            const Icon = getPlatformIcon(profile.platform);
            const color = getPlatformColor(profile.platform);
            
            return {
              name: profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1),
              href: profile.profileUrl,
              icon: Icon,
              color: color,
            };
          });
          
          setSocialLinks(dynamicLinks);
        }
      } catch (error) {
        console.error('Error fetching social profiles:', error);
        // Keep default fallback links
      } finally {
        setLoading(false);
      }
    };

    fetchPrimaryBrandProfiles();
  }, []);

  return (
    <footer className='bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='col-span-1 md:col-span-2 lg:col-span-1'
          >
            <Link
              href='/'
              className='flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>RB</span>
              </div>
              <span>Rohan Batra</span>
            </Link>
            <p className='text-gray-600 dark:text-gray-400 mb-6 leading-relaxed'>
              Full-stack developer passionate about creating modern web
              applications and sharing knowledge through code and writing.
            </p>
            {/* Social Links */}
            <div className='flex space-x-4'>
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 ${social.color} transition-colors shadow-sm hover:shadow-md`}
                    aria-label={social.name}
                  >
                    <Icon className='h-5 w-5' />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Quick Links
            </h3>
            <nav className='space-y-3'>
              {quickLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className='flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                  >
                    <Icon className='h-4 w-4' />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Get in Touch
            </h3>
            <div className='space-y-3'>
              {contactInfo.map(contact => {
                const Icon = contact.icon;
                const content = (
                  <div className='flex items-center space-x-2 text-gray-600 dark:text-gray-400'>
                    <Icon className='h-4 w-4' />
                    <div>
                      <div className='text-sm font-medium'>{contact.label}</div>
                      <div className='text-sm'>{contact.value}</div>
                    </div>
                  </div>
                );

                if (contact.href) {
                  return (
                    <a
                      key={contact.label}
                      href={contact.href}
                      className='block hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={contact.label} className='block'>
                    {content}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Newsletter/Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Stay Updated
            </h3>
            <p className='text-gray-600 dark:text-gray-400 text-sm mb-4'>
              Get notified about new blog posts and project updates.
            </p>
            <div className='space-y-3'>
              <input
                type='email'
                placeholder='Enter your email'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm'
              />
              <button className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                Subscribe
              </button>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
              No spam, unsubscribe at any time.
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className='pt-8 border-t border-gray-200 dark:border-gray-700'
        >
          <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0'>
            {/* Copyright */}
            <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
              <span>© {currentYear} Rohan Batra. Made with</span>
              <Heart className='h-4 w-4 text-red-500 fill-current' />
              <span>and</span>
              <Code className='h-4 w-4 text-blue-500' />
            </div>

            {/* Additional Links */}
            <div className='flex items-center space-x-6 text-sm'>
              <Link
                href='/privacy'
                className='text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                Terms of Service
              </Link>
              <a
                href='/sitemap.xml'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                <span>Sitemap</span>
                <ExternalLink className='h-3 w-3' />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
