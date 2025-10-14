/**
 * API Route: GET /api/csrf-token
 * Generates and returns a CSRF token for client-side requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  try {
    // Check if we already have a valid token in the cookie
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const existingToken = cookieStore.get('csrf-secret')?.value;
    
    let token: string;
    
    if (existingToken && existingToken.length === 64) {
      // Reuse existing token
      console.log('[CSRF-API] Reusing existing token:', existingToken.substring(0, 30) + '...');
      token = existingToken;
    } else {
      // Generate new token
      console.log('[CSRF-API] Generating new token');
      token = await generateCSRFToken();
    }
    
    return NextResponse.json({
      success: true,
      data: {
        token,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      },
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CSRF token',
      },
      { status: 500 }
    );
  }
}
