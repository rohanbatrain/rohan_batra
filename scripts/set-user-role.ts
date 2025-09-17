import { clerkClient } from '@clerk/nextjs/server';

/**
 * Script to set user role in Clerk
 * Run this after creating your first user account
 */

async function setUserRole(userEmail: string, role: 'admin' | 'editor') {
  try {
    // Find user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [userEmail],
    });

    if (users.length === 0) {
      console.error(`User with email ${userEmail} not found`);
      return;
    }

    const user = users[0];

    // Update user metadata
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: role,
      },
    });

    console.log(`✅ Successfully set role "${role}" for user ${userEmail}`);
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    console.error('Error setting user role:', error);
  }
}

// Example usage:
// setUserRole('your-email@example.com', 'admin');

export { setUserRole };