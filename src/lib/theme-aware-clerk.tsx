'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode, useEffect, useState } from 'react';

interface ThemeAwareClerkProviderProps {
  children: ReactNode;
}

export function ThemeAwareClerkProvider({
  children,
}: ThemeAwareClerkProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined, // Let CSS handle it
        variables: {
          colorPrimary: '#4f46e5',
          colorBackground: 'transparent',
          colorInputBackground: 'transparent',
          colorInputText: 'inherit',
          colorText: 'inherit',
          colorTextSecondary: 'inherit',
        },
        elements: {
          // Global overrides for better dark mode support with GitHub branding
          rootBox: 'text-gray-900 dark:text-[#f0f6fc]',
          card: 'bg-white dark:bg-[#0d1117] border-gray-200 dark:border-[#30363d]',
          headerTitle: 'text-gray-900 dark:text-[#f0f6fc]',
          headerSubtitle: 'text-gray-600 dark:text-[#8b949e]',
          socialButtonsBlockButton:
            'bg-white dark:bg-[#21262d] border-gray-200 dark:border-[#30363d] text-gray-700 dark:text-[#f0f6fc] hover:bg-gray-50 dark:hover:bg-[#30363d]',
          socialButtonsBlockButtonIcon: 'text-gray-700 dark:text-white',
          formFieldInput:
            'bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-[#30363d] text-gray-900 dark:text-[#f0f6fc]',
          formFieldLabel: 'text-gray-700 dark:text-[#f0f6fc]',
          footerActionLink: 'text-blue-600 dark:text-[#58a6ff]',
          dividerText: 'text-gray-500 dark:text-[#8b949e]',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
