import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { env } from '@/lib/env';

interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification?: {
    status: string;
  };
}

interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
  created_at: number;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(env.clerkWebhookSecret || '');

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Clerk webhook received: ${eventType}`);

  await connectToDatabase();

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error handling webhook ${eventType}:`, error);
    return new Response('Error processing webhook', { status: 500 });
  }

  return NextResponse.json({ message: 'Webhook processed successfully' });
}

async function handleUserCreated(userData: ClerkUserData) {
  try {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      username,
      image_url,
      created_at,
    } = userData;

    const primaryEmail = email_addresses?.find(
      (email: ClerkEmailAddress) => email.id === userData.primary_email_address_id
    );

    if (!primaryEmail) {
      console.error('No primary email found for user:', clerkId);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      console.log('User already exists:', clerkId);
      return;
    }

    const newUser = new User({
      clerkId,
      email: primaryEmail.email_address,
      firstName: first_name || '',
      lastName: last_name || '',
      username: username || '',
      avatar:
        image_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          (first_name || '') + ' ' + (last_name || '')
        )}&background=random`,
      role: 'user',
      emailVerified: primaryEmail.verification?.status === 'verified',
      isActive: true,
      preferences: {
        notifications: {
          email: true,
          browser: true,
          mobile: true,
        },
        theme: 'auto',
        language: 'en',
      },
      lastActiveAt: new Date(),
      loginCount: 0,
      createdAt: new Date(created_at),
      updatedAt: new Date(),
    });

    await newUser.save();
    console.log('User created successfully:', clerkId);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function handleUserUpdated(userData: ClerkUserData) {
  try {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      username,
      image_url,
    } = userData;

    const primaryEmail = email_addresses?.find(
      (email: ClerkEmailAddress) => email.id === userData.primary_email_address_id
    );

    if (!primaryEmail) {
      console.error('No primary email found for user update:', clerkId);
      return;
    }

    const updateData = {
      email: primaryEmail.email_address,
      firstName: first_name || '',
      lastName: last_name || '',
      username: username || '',
      emailVerified: primaryEmail.verification?.status === 'verified',
      updatedAt: new Date(),
      avatar: image_url || undefined,
    };

    // Generate fallback avatar if no avatar provided
    if (!image_url) {
      const name = (first_name || '') + ' ' + (last_name || '');
      if (name.trim()) {
        updateData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random`;
      }
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      {
        new: true,
        upsert: false,
      }
    );

    if (user) {
      console.log('User updated successfully:', clerkId);
    } else {
      console.log('User not found for update:', clerkId);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function handleUserDeleted(userData: ClerkUserData) {
  try {
    const { id: clerkId } = userData;

    const result = await User.findOneAndUpdate(
      { clerkId },
      {
        isActive: false,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (result) {
      console.log('User deactivated successfully:', clerkId);
    } else {
      console.log('User not found for deletion:', clerkId);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}