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
 * Stores a secret in httpOnly cookie and returns a token derived from it
 */
export async function generateCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  
  // Generate random secret
  const secret = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  
  // Create token by hashing secret with timestamp
  const timestamp = Date.now();
  const token = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}`)
    .digest('hex');
  
  // Store secret in httpOnly cookie
  cookieStore.set(CSRF_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/',
  });
  
  // Return token to be included in forms/headers
  return token;
}

/**
 * Validate CSRF token from request
 * Compares provided token against one generated from stored secret
 */
export async function validateCSRFToken(providedToken: string): Promise<boolean> {
  if (!providedToken) {
    return false;
  }
  
  const cookieStore = await cookies();
  const secret = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!secret) {
    return false;
  }
  
  try {
    // Extract timestamp from token (we don't validate timestamp for now)
    // In production, you might want to add timestamp validation
    
    // Generate expected token from secret
    const timestamp = Date.now();
    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}`)
      .digest('hex');
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(providedToken, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  } catch (error) {
    // Invalid token format
    return false;
  }
}

/**
 * Get CSRF token from request headers or body
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  // Check X-CSRF-Token header
  const headerToken = request.headers.get('X-CSRF-Token');
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
    return false;
  }
  
  return await validateCSRFToken(token);
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
