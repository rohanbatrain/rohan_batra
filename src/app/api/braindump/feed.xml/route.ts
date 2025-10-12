import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Braindump from '@/models/Braindump';

// GET /api/braindump/feed.xml - RSS feed for public braindumps
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get public braindumps (latest 50)
    const braindumps = await Braindump.find({
      visibility: 'public',
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('content slug tags createdAt updatedAt publicMetadata')
      .lean();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const buildDate = new Date().toUTCString();

    // Build RSS XML
    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Braindumps - Rohan Batra</title>
    <link>${baseUrl}/braindump</link>
    <description>Public braindumps and quick thoughts</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/api/braindump/feed.xml" rel="self" type="application/rss+xml" />
    ${braindumps
      .map((b) => {
        const link = `${baseUrl}/braindump/${b.slug || b._id}`;
        const contentPreview = b.content.substring(0, 500).replace(/[<>]/g, '');
        const pubDate = new Date(b.createdAt).toUTCString();
        
        return `
    <item>
      <title>${contentPreview.substring(0, 100)}...</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${contentPreview}...</description>
      <pubDate>${pubDate}</pubDate>
      ${b.tags?.map((tag: string) => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`;
      })
      .join('\n')}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
