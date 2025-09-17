import 'dotenv/config';
// SECURE Admin Setup Script
// Only run this in development with direct database access
// Never expose this as a public API endpoint

import connectToDatabase from '../src/lib/mongodb';
import User from '../src/models/User';

/**
 * Create admin user in database
 * This should be run manually in development only
 * In production, admin roles should be managed through secure admin interfaces
 */
async function createAdminUser() {
  try {
    await connectToDatabase();

    // Replace with your actual Clerk user ID and details
    const adminUser = {
      clerkId: 'user_31zWrVvro7cBm9rE0Jn6LzoNYsI',
      email: 'github@rohanbatra.in',
      firstName: 'Rohan',
      lastName: 'Batra',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingUser = await User.findOne({ clerkId: adminUser.clerkId });

    if (existingUser) {
      // Update existing user role and ensure required names are present
      existingUser.role = 'admin';
      if (!existingUser.firstName) existingUser.firstName = adminUser.firstName;
      if (!existingUser.lastName) existingUser.lastName = adminUser.lastName;
      await existingUser.save();
      console.log('✅ Updated existing user to admin');
    } else {
      // Create new admin user
      const newUser = new User(adminUser);
      await newUser.save();
      console.log('✅ Created new admin user');
    }

    console.log('Admin user setup complete');
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

// Execute when run as a script
createAdminUser();

export { createAdminUser };
