/**
 * CSRF Token Management
 * Generates and validates CSRF tokens for state-changing requests
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_COOKIE_NAME = 'csrf-secret';
const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CSRFTokenData {
  token: string;
  expires: number;
}

/**
 * Generate a new CSRF token
 * Stores the token itself in httpOnly cookie (simple and reliable)
 */
export async function generateCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  
  // Generate random token
  const token = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  
  // Store token in httpOnly cookie
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/',
  });

  console.log('[CSRF] Generated new token:', token.substring(0, 20) + '...');
  console.log('[CSRF] Cookie set:', CSRF_COOKIE_NAME);
  
  // Return the same token to be included in forms/headers
  return token;
}

/**
 * Validate CSRF token from request
 * Compares provided token against stored token in cookie
 */
export async function validateCSRFToken(providedToken: string): Promise<boolean> {
  if (!providedToken) {
    console.warn('[CSRF] No token provided');
    return false;
  }
  
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!storedToken) {
    console.warn('[CSRF] No stored token found in cookie');
    console.warn('[CSRF] Available cookies:', cookieStore.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
    return false;
  }
  
  console.log('[CSRF] Comparing tokens:');
  console.log('[CSRF]   Provided:', providedToken.substring(0, 30) + '...');
  console.log('[CSRF]   Stored:  ', storedToken.substring(0, 30) + '...');
  console.log('[CSRF]   Same length?', providedToken.length === storedToken.length);
  console.log('[CSRF]   Exact match?', providedToken === storedToken);
  
  try {
    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedToken, 'hex'),
      Buffer.from(storedToken, 'hex')
    );
    
    if (!isValid) {
      console.warn('[CSRF] Token mismatch');
    } else {
      console.log('[CSRF] ✅ Tokens match!');
    }
    
    return isValid;
  } catch (error) {
    // Invalid token format (e.g., not hex)
    console.error('[CSRF] Token validation error:', error);
    return false;
  }
}

/**
 * Get CSRF token from request headers or body
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  // Check X-CSRF-Token header
  const headerToken = request.headers.get('X-CSRF-Token');
  
  console.log('[CSRF] Request headers check:');
  console.log('[CSRF]   X-CSRF-Token:', headerToken ? headerToken.substring(0, 20) + '...' : 'NOT FOUND');
  console.log('[CSRF]   All headers:', Array.from(request.headers.keys()));
  
  if (headerToken) {
    return headerToken;
  }
  
  // For form submissions, token might be in body
  // This is handled by the route that parses the body
  return null;
}

/**
 * Middleware to validate CSRF token on state-changing requests
 */
export async function requireCSRFToken(request: Request): Promise<boolean> {
  const method = request.method;
  
  // Only check CSRF on state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true;
  }
  
  const token = getCSRFTokenFromRequest(request);
  
  if (!token) {
    console.warn(`[CSRF] No token found in ${method} request to ${request.url}`);
    return false;
  }
  
  // Get cookie from request headers directly
  const cookieHeader = request.headers.get('cookie');
  console.log('[CSRF] Cookie header:', cookieHeader?.substring(0, 100) + '...');
  
  const isValid = await validateCSRFToken(token);
  
  if (!isValid) {
    console.warn(`[CSRF] Invalid token for ${method} request to ${request.url}`);
  } else {
    console.log(`[CSRF] Valid token for ${method} request to ${request.url}`);
  }
  
  return isValid;
}

/**
 * Generate CSRF error response
 */
export function csrfErrorResponse() {
  return Response.json(
    {
      success: false,
      error: 'Invalid or missing CSRF token',
    },
    { status: 403 }
  );
}
