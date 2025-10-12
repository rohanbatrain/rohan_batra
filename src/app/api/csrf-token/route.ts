/**
 * API Route: GET /api/csrf-token
 * Generates and returns a CSRF token for client-side requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  try {
    const token = await generateCSRFToken();
    
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
