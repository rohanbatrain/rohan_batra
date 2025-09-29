import { NextResponse } from 'next/server';

// Minimal GET handler so the route file is a valid module for type imports.
export async function GET() {
  return NextResponse.json({ message: 'OK' });
}

export const dynamic = 'force-dynamic';
