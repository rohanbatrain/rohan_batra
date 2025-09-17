import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Denied | Rohan Batra',
  description:
    'You do not have permission to access this resource. Please sign in with an account that has the required permissions.',
  robots: 'noindex, nofollow', // Don't index access denied pages
};

export default function AccessDeniedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='access-denied-layout'>{children}</div>;
}
