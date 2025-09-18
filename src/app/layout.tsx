import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/lib/theme-provider';
import { LayoutWrapper } from '../components/LayoutWrapper';
import { Toaster } from '@/components/ui/toaster';
import {
  generateMetadata as generateSEOMetadata,
  generateWebsiteStructuredData,
} from '@/lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = generateSEOMetadata({
  title: 'Rohan Batra - Full-Stack Developer & Digital Creator',
  description:
    'Full-stack developer specializing in modern web applications with Next.js, TypeScript, and React. Building innovative solutions and sharing knowledge through code.',
  tags: [
    'Full-Stack Developer',
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Web Development',
    'Portfolio',
    'Blog',
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = generateWebsiteStructuredData();

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
