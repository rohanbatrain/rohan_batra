import { NextResponse } from 'next/server';
import { getTryHackMeSummary } from '@/lib/tryhackme-service';

export async function GET() {
  try {
    const data = await getTryHackMeSummary(6);
    return NextResponse.json(data);
  } catch (err) {
    console.error('THM summary error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
