import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkUserPayload = {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  image_url?: string | null;
};

type ClerkSessionPayload = {
  id: string;
  user_id: string;
  created_at?: number;
};

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const headerList = await headers();
  const svixId = headerList.get('svix-id');
  const svixTimestamp = headerList.get('svix-timestamp');
  const svixSignature = headerList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing Svix headers' },
      { status: 400 }
    );
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Missing CLERK_WEBHOOK_SECRET' },
      { status: 500 }
    );
  }

  const payload = await req.text();

  let evt: { type: string; data: unknown };
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: unknown };
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    switch (evt.type) {
      case 'user.created': {
        const data = evt.data as ClerkUserPayload;
        const emails = data.email_addresses || [];
        const primary = emails.find(
          e => e.id === data.primary_email_address_id
        );
        const fallback = emails[0]?.email_address;
        const email = primary?.email_address || fallback || '';

        if (!email) break;

        // Upsert user with Clerk data
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            $setOnInsert: {
              clerkId: data.id,
              email,
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              username: data.username || undefined,
              avatar: data.image_url || undefined,
              role: 'user',
              loginCount: 0,
              isActive: true,
              createdAt: new Date(),
            },
          },
          { new: true, upsert: true }
        );
        break;
      }

      case 'user.updated': {
        const data = evt.data as ClerkUserPayload;
        const emails = data.email_addresses || [];
        const primary = emails.find(
          e => e.id === data.primary_email_address_id
        );
        const fallback = emails[0]?.email_address;
        const email = primary?.email_address || fallback;

        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            $set: {
              ...(email ? { email } : {}),
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              username: data.username || undefined,
              avatar: data.image_url || undefined,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
        break;
      }

      case 'session.created': {
        const data = evt.data as ClerkSessionPayload;
        const when = data.created_at
          ? new Date(data.created_at * 1000)
          : new Date();
        await User.findOneAndUpdate(
          { clerkId: data.user_id },
          {
            $inc: { loginCount: 1 },
            $set: { lastLoginAt: when, lastActiveAt: new Date() },
          },
          { new: true }
        );
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[CLERK WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handling failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
