import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import LottieAsset from '@/models/LottieAsset';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const asset = await LottieAsset.findById(id).lean();
    if (!asset)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Prefer inlineData if present
    if ((asset as any).inlineData) {
      return new NextResponse(JSON.stringify((asset as any).inlineData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // If filePath is remote, proxy it
    const filePath = (asset as any).filePath as string;
    if (filePath && filePath.startsWith('remote://')) {
      const remoteUrl = filePath.replace('remote://', '');
      const resp = await fetch(remoteUrl);
      if (!resp.ok)
        return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
      const data = await resp.text();
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Not stored inline and not remote; no local storage handler configured
    return NextResponse.json(
      { error: 'Asset storage not available' },
      { status: 501 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to load asset' },
      { status: 500 }
    );
  }
}
