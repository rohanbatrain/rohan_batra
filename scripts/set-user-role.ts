import 'dotenv/config';
import { clerkClient as getClerkClient } from '@clerk/nextjs/server';

/**
 * Script to set user role in Clerk
 * Run this after creating your first user account
 */

async function setUserRole(userEmail: string, role: 'admin' | 'editor') {
  try {
    const client = await getClerkClient();
    // Find user by email
    const users = await client.users.getUserList({
      emailAddress: [userEmail],
      limit: 1,
    });

    if (!users.data || users.data.length === 0) {
      console.error(`User with email ${userEmail} not found`);
      return;
    }

    const user = users.data[0];

    // Update user metadata
    await client.users.updateUser(user.id, { publicMetadata: { role } });

    console.log(`✅ Successfully set role "${role}" for user ${userEmail}`);
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    console.error('Error setting user role:', error);
  }
}

// Execute when run as a script
// Note: requires CLERK_SECRET_KEY in env
setUserRole('github@rohanbatra.in', 'admin');

export { setUserRole };
