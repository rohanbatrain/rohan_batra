'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { useTheme } from '@/lib/theme-provider';

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className='min-h-screen flex flex-col'>
      <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className='flex-1 pt-16'>{children}</main>
      <Footer />
    </div>
  );
}
