import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route matchers for different protection levels
const isPublicRoute = createRouteMatcher([
  '/',
  '/blog(.*)',
  '/portfolio(.*)',
  '/api/blog/posts',
  '/api/portfolio/projects',
  '/api/comments',
  '/api/likes',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

const isAPIAdminRoute = createRouteMatcher(['/api/admin(.*)']);

const isEditorRoute = createRouteMatcher([
  '/admin/blog(.*)',
  '/admin/portfolio(.*)',
  '/admin/comments(.*)',
  '/admin/assets(.*)',
  '/admin/books(.*)',
  '/api/admin/blog(.*)',
  '/api/admin/portfolio(.*)',
  '/api/admin/comments(.*)',
  '/api/admin/assets(.*)',
  '/api/admin/books(.*)',
]);

const isAdminOnlyRoute = createRouteMatcher([
  '/admin/users(.*)',
  '/admin/settings(.*)',
  '/api/admin/users(.*)',
  '/api/admin/settings(.*)',
  '/api/admin/stats',
  '/api/admin/activity',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Only protect admin routes and API admin routes - require authentication
  const needsAuth =
    isAdminRoute(req) ||
    isAPIAdminRoute(req) ||
    isEditorRoute(req) ||
    isAdminOnlyRoute(req);

  if (!needsAuth) {
    return NextResponse.next();
  }

  // Protect admin routes - require authentication
  const authResult = await auth();
  const { userId } = authResult;

  if (!userId) {
    // Redirect to sign-in for unauthenticated users trying to access admin
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Get user role from database via internal API call
  let userRole = 'user';
  
  try {
    // Use internal API to check user role (works in Edge Runtime)
    const baseUrl = req.nextUrl.origin;
    const response = await fetch(
      `${baseUrl}/api/internal/user-role?userId=${userId}`,
      {
        headers: { 'x-internal-request': 'true' },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      userRole = data.role || 'user';
    }
  } catch (error) {
    console.error('[MIDDLEWARE] Error fetching user role:', error);
    // Default to 'user' role on error
  }

  console.log(
    `[MIDDLEWARE] Path: ${req.nextUrl.pathname}, UserID: ${userId}, Role: ${userRole}`
  );

  // Check admin-only routes
  if (isAdminOnlyRoute(req)) {
    if (userRole !== 'admin') {
      const redirectUrl = new URL('/access-denied', req.url);
      redirectUrl.searchParams.set('return_url', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check editor/admin routes
  if (isEditorRoute(req)) {
    if (!['editor', 'admin'].includes(userRole)) {
      const redirectUrl = new URL('/access-denied', req.url);
      redirectUrl.searchParams.set('return_url', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check general admin routes (requires at least editor role)
  if (isAdminRoute(req) || isAPIAdminRoute(req)) {
    if (!['editor', 'admin'].includes(userRole)) {
      const redirectUrl = new URL('/access-denied', req.url);
      redirectUrl.searchParams.set('return_url', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
