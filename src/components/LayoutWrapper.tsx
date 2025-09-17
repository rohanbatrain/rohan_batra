'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import { useTheme } from '@/lib/theme-provider';

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  
  // Hide header and footer on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className='min-h-screen flex flex-col'>
      {!isAdminRoute && (
        <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      )}
      <main className={`flex-1 ${!isAdminRoute ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}
