import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import SiteSetting from '@/models/SiteSetting';
import { isCloudinaryConfigured } from '@/lib/cloudinary';
import { isDriveConfigured } from '@/lib/google-drive';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    let driveToggle = false;
    try {
      const s = await SiteSetting.findOne({ key: 'features.googledrive' });
      driveToggle = Boolean(s?.value === true || s?.value === 'true');
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        cloudinary: { configured: isCloudinaryConfigured() },
        googleDrive: { configured: isDriveConfigured(), enabled: driveToggle },
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
