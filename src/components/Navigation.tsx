'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  User,
  Code,
  FileText,
  LogIn,
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

interface NavigationProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Portfolio', href: '/portfolio', icon: Code },
  { name: 'Blog', href: '/blog', icon: FileText },
  { name: 'About', href: '/about', icon: User },
];

export function Navigation({
  isDarkMode = false,
  toggleDarkMode,
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/20'
            : 'bg-transparent'
        }`}
      >
        <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link
                href='/'
                className='flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>RB</span>
                </div>
                <span>Rohan Batra</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='hidden md:flex items-center space-x-8'
            >
              {navigationItems.map(item => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId='activeTab'
                        className='absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400'
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </motion.div>

            {/* Auth, Theme Toggle & Mobile Menu Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='flex items-center space-x-4'
            >
              {/* Auth Controls (Desktop) */}
              <div className='hidden md:flex items-center'>
                <SignedOut>
                  <SignInButton mode='modal' forceRedirectUrl='/admin'>
                    <button className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-sm hover:from-blue-700 hover:to-purple-700 transition-colors'>
                      <LogIn className='h-4 w-4' />
                      <span>Sign in</span>
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className='ml-2'>
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonBox:
                            'ring-1 ring-gray-200 dark:ring-gray-700 rounded-full',
                          userButtonPopoverCard:
                            'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden',
                          userButtonPopoverActionButton:
                            'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200',
                          userButtonPopoverFooter: 'hidden',
                          userButtonPopover:
                            '[data-test-id="dev-mode"]:hidden [data-cl-component="Footer"]:hidden',
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              </div>

              {/* Theme Toggle */}
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className='p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
                  aria-label='Toggle dark mode'
                >
                  {isDarkMode ? (
                    <Sun className='h-5 w-5' />
                  ) : (
                    <Moon className='h-5 w-5' />
                  )}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
                aria-label='Toggle menu'
              >
                {isMenuOpen ? (
                  <X className='h-5 w-5' />
                ) : (
                  <Menu className='h-5 w-5' />
                )}
              </button>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 bg-black/50 z-40 md:hidden'
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className='fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 md:hidden'
            >
              <div className='px-4 py-6 space-y-4'>
                {navigationItems.map((item, index) => {
                  const isActive = isActiveRoute(item.href);
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className='h-5 w-5' />
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Auth Controls */}
                <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                  <SignedOut>
                    <SignInButton mode='modal' forceRedirectUrl='/admin'>
                      <button className='w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-sm hover:from-blue-700 hover:to-purple-700 transition-colors'>
                        <LogIn className='h-5 w-5' />
                        <span>Sign in</span>
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className='flex items-center justify-between px-2'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Account
                      </span>
                      <UserButton
                        appearance={{
                          elements: {
                            userButtonPopoverCard:
                              'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden',
                            userButtonPopoverActionButton:
                              'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200',
                            userButtonPopoverFooter: 'hidden',
                            userButtonPopover:
                              '[data-test-id="dev-mode"]:hidden [data-cl-component="Footer"]:hidden',
                          },
                        }}
                      />
                    </div>
                  </SignedIn>
                </div>

                {/* Mobile Theme Toggle */}
                {toggleDarkMode && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: navigationItems.length * 0.1,
                    }}
                    className='pt-4 border-t border-gray-200 dark:border-gray-700'
                  >
                    <button
                      onClick={toggleDarkMode}
                      className='flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full'
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className='h-5 w-5' />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className='h-5 w-5' />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navigation;
