'use client';
import { useEffect, useRef } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClientSignUp() {
  const { openSignUp } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openedRef = useRef(false);

  const redirectUrl = searchParams?.get('redirect_url') ?? '/admin';

  useEffect(() => {
    if (isSignedIn) router.replace(redirectUrl);
  }, [isSignedIn, router, redirectUrl]);

  useEffect(() => {
    if (!openedRef.current) {
      openedRef.current = true;
      try {
        openSignUp({
          afterSignUpUrl: redirectUrl,
          afterSignInUrl: redirectUrl,
          signInUrl: `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`,
          appearance: {
            elements: {
              // Social buttons with GitHub dark theme
              socialButtonsBlockButton:
                'w-full h-12 bg-white dark:bg-[#21262d] border-2 border-gray-200 dark:border-[#30363d] text-gray-700 dark:text-[#f0f6fc] hover:bg-gray-50 dark:hover:bg-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff] rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md',
              socialButtonsBlockButtonText:
                'font-semibold text-base dark:text-[#f0f6fc]',
              socialButtonsBlockButtonIcon: 'text-gray-700 dark:text-white',
              // Form fields
              formFieldInput:
                'w-full h-12 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-base font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500',
              // Primary button
              formButtonPrimary:
                'w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-base transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg shadow-md',
            },
          },
        });
      } catch {
        // no-op
      }
    }
  }, [openSignUp, redirectUrl]);

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {process.env.NODE_ENV !== 'production' ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-cl-component="CardFooter"],
              .cl-cardFooter,
              [data-cl-footer],
              .cl-footer,
              [data-test-id="dev-mode"],
              [data-cl-component="Footer"] {
                display: none !important;
              }
            `,
          }}
        />
      ) : null}
      {/* Always-on CSS: force GitHub provider icon white in dark mode for Clerk modals */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Force GitHub provider icon white in dark mode - comprehensive selectors */
            .dark [data-cl-provider="github"] svg,
            .dark [data-cl-provider="oauth_github"] svg,
            .dark [data-cl-component="SocialButtonsProviderIcon"] svg,
            .dark .cl-socialButtonsProviderIcon svg,
            .dark .cl-socialButtonsBlockButton svg,
            .dark [data-cl-component="SocialButtonsBlockButton"] svg,
            .dark .cl-providerIcon svg,
            .dark [data-cl-component="ProviderIcon"] svg,
            .dark .cl-internal-icon svg,
            .dark svg[data-cl-component="Icon"],
            html.dark [data-cl-provider="github"] svg,
            html.dark [data-cl-provider="oauth_github"] svg,
            .dark .cl-socialButtonsBlockButton__github svg,
            .dark .cl-button__github svg,
            .dark button[class*="cl-socialButtonsBlockButton__github"] svg,
            .dark button[class*="cl-button__github"] svg {
              color: #ffffff !important;
              fill: #ffffff !important;
              stroke: #ffffff !important;
              filter: brightness(0) invert(1) !important;
            }
            
            /* Target the specific GitHub button classes */
            .dark .cl-socialButtonsBlockButton__github,
            .dark .cl-button__github,
            .dark button[class*="cl-socialButtonsBlockButton__github"],
            .dark button[class*="cl-button__github"] {
              background-color: #21262d !important;
              border-color: #30363d !important;
              color: #f0f6fc !important;
            }
            
            .dark .cl-socialButtonsBlockButton__github:hover,
            .dark .cl-button__github:hover,
            .dark button[class*="cl-socialButtonsBlockButton__github"]:hover,
            .dark button[class*="cl-button__github"]:hover {
              background-color: #30363d !important;
              border-color: #58a6ff !important;
            }
            
            /* Force all SVGs inside GitHub buttons to be white */
            .dark button[class*="github"] svg,
            .dark [class*="github"] svg {
              color: #ffffff !important;
              fill: #ffffff !important;
              stroke: #ffffff !important;
              filter: brightness(0) invert(1) !important;
            }
          `,
        }}
      />
      {/* Animated Background Elements */}
      <div className='absolute inset-0'>
        {/* Primary gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50' />

        {/* Floating orbs */}
        <div className='absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse' />
        <div className='absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-2000' />

        {/* Grid pattern */}
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.05)_1px,transparent_0)] bg-[length:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.03)_1px,transparent_0)]' />
      </div>

      <div className='relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md space-y-8'>
          {/* Header Section */}
          <div className='text-center'>
            {/* Logo */}
            <div className='inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300'>
              <span className='text-2xl font-bold text-white tracking-wider'>
                RB
              </span>
            </div>

            {/* Title */}
            <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3'>
              Create your account
            </h1>

            {/* Subtitle */}
            <p className='text-lg text-gray-600 dark:text-gray-300 font-medium'>
              Join to access exclusive content and features
            </p>
          </div>

          {/* CTA Card to trigger modal (fallback if auto-open fails) */}
          <div className='relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-sm opacity-20 dark:opacity-10' />
            <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-2xl'>
              <div className='p-8 space-y-6 text-center'>
                <p className='text-gray-600 dark:text-gray-300'>
                  Create your account to continue
                </p>
                <button
                  onClick={() => {
                    try {
                      openSignUp({
                        afterSignUpUrl: redirectUrl,
                        afterSignInUrl: redirectUrl,
                        signInUrl: `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`,
                        appearance: {
                          elements: {
                            // Social buttons with GitHub dark theme
                            socialButtonsBlockButton:
                              'w-full h-12 bg-white dark:bg-[#21262d] border-2 border-gray-200 dark:border-[#30363d] text-gray-700 dark:text-[#f0f6fc] hover:bg-gray-50 dark:hover:bg-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff] rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md',
                            socialButtonsBlockButtonText:
                              'font-semibold text-base dark:text-[#f0f6fc]',
                            socialButtonsBlockButtonIcon:
                              'text-gray-700 dark:text-white',
                          },
                        },
                      });
                    } catch {}
                  }}
                  className='inline-flex items-center justify-center w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-base transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg shadow-md'
                >
                  Open Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='text-center'>
            <p className='text-gray-600 dark:text-gray-400 font-medium'>
              Already have an account?{' '}
              <a
                href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
                className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors duration-200 hover:underline'
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
