import { SignIn } from '@clerk/nextjs';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign In | Rohan Batra',
  description: 'Sign in to access your account and manage your content.',
};

async function SignInContent({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  // Await the search params
  const params = await searchParams;
  // Get the redirect URL from search params, default to home page
  const redirectUrl = params.redirect_url || '/';

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* Dev-only: hide Clerk's dev footer stripe to reduce visual noise */}
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
              /* Force GitHub provider icon to white in dark mode */
              .dark [data-cl-provider="github"] svg,
              .dark [data-cl-provider="oauth_github"] svg,
              .dark [data-cl-component="SocialButtonsProviderIcon"] svg,
              .dark .cl-socialButtonsProviderIcon svg {
                color: #fff !important;
                fill: #fff !important;
                stroke: #fff !important;
              }
            `,
          }}
        />
      ) : null}
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
              Welcome back
            </h1>

            {/* Subtitle */}
            <p className='text-lg text-gray-600 dark:text-gray-300 font-medium'>
              Sign in to your account to continue
            </p>
          </div>

          {/* Sign In Card */}
          <div className='relative'>
            {/* Card glow effect */}
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-sm opacity-20 dark:opacity-10' />

            {/* Main card */}
            <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-2xl'>
              <div className='p-8 space-y-6'>
                <SignIn
                  appearance={{
                    baseTheme: undefined, // Let it inherit from the page
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none border-none p-0 w-full',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      // Hide embedded footer area entirely
                      footer: 'hidden',
                      cardFooter: 'hidden',

                      // Social buttons with enhanced dark mode and GitHub branding
                      socialButtonsBlockButton:
                        'w-full h-12 bg-white dark:bg-[#21262d] border-2 border-gray-200 dark:border-[#30363d] text-gray-700 dark:text-[#f0f6fc] hover:bg-gray-50 dark:hover:bg-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff] rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md',
                      socialButtonsBlockButtonText:
                        'font-semibold text-base dark:text-[#f0f6fc]',
                      socialButtonsBlockButtonArrow: 'dark:text-[#f0f6fc]',
                      socialButtonsBlockButtonIcon:
                        'text-gray-700 dark:text-white',

                      // Divider
                      dividerLine:
                        'bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent h-px',
                      dividerText:
                        'text-gray-500 dark:text-gray-400 text-sm font-medium bg-white dark:bg-gray-800 px-4',

                      // Form fields with better dark mode support
                      formFieldInput:
                        'w-full h-12 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-base font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500',
                      formFieldLabel:
                        'text-gray-700 dark:text-gray-300 font-semibold text-sm mb-2',
                      formFieldAction:
                        'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',

                      // Primary button
                      formButtonPrimary:
                        'w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-base transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg shadow-md',

                      // Links and text
                      footerActionLink:
                        'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-200',
                      identityPreviewText:
                        'text-gray-700 dark:text-gray-300 font-medium',
                      identityPreviewEditButton:
                        'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold',

                      // Error and success states
                      formFieldErrorText:
                        'text-red-600 dark:text-red-400 font-medium text-sm mt-1',
                      alertClerkError:
                        'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm font-medium',
                      formFieldSuccessText:
                        'text-green-600 dark:text-green-400 font-medium text-sm mt-1',
                      formFieldWarningText:
                        'text-amber-600 dark:text-amber-400 font-medium text-sm mt-1',

                      // Password visibility toggle
                      formFieldInputShowPasswordButton:
                        'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200',

                      // OTP inputs
                      otpCodeFieldInput:
                        'w-12 h-12 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200',

                      // Form headers (when shown)
                      formHeaderTitle:
                        'text-gray-900 dark:text-white font-bold text-2xl mb-2',
                      formHeaderSubtitle:
                        'text-gray-600 dark:text-gray-400 font-medium',

                      // Loading states
                      spinner: 'border-blue-600 dark:border-blue-400',
                      spinnerIcon: 'text-blue-600 dark:text-blue-400',

                      // Additional text elements
                      modalCloseButton:
                        'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                      backButton:
                        'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
                      formResendCodeLink:
                        'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
                    },
                    variables: {
                      colorPrimary: '#4f46e5',
                      colorBackground: 'transparent',
                      colorInputBackground: 'transparent',
                      colorInputText: 'inherit',
                      colorText: 'inherit',
                      colorTextSecondary: 'inherit',
                      borderRadius: '0.75rem',
                      fontSize: '16px',
                    },
                  }}
                  signUpUrl='/sign-up'
                  afterSignInUrl={redirectUrl}
                  redirectUrl={redirectUrl}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='text-center'>
            <p className='text-gray-600 dark:text-gray-400 font-medium'>
              Don&apos;t have an account?{' '}
              <a
                href={`/sign-up${params.redirect_url ? `?redirect_url=${encodeURIComponent(params.redirect_url)}` : ''}`}
                className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors duration-200 hover:underline'
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}
