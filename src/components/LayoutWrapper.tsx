'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import { useTheme } from '@/lib/theme-provider';
import { useAuth } from '@clerk/nextjs';

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, sessionId } = useAuth();

  // Hide header and footer on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  // Increment login count once per session (fallback when webhooks are not configured)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !sessionId) return;
    const key = `login-tracked:${sessionId}`;
    if (sessionStorage.getItem(key)) return;
    fetch('/api/auth/track-login', { method: 'POST', credentials: 'include' })
      .then(() => sessionStorage.setItem(key, '1'))
      .catch(() => {
        // ignore tracking failures
      });
  }, [isLoaded, isSignedIn, sessionId]);

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
