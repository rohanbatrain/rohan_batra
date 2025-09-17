// SECURE Admin Setup Script
// Only run this in development with direct database access
// Never expose this as a public API endpoint

import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

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
      clerkId: 'YOUR_CLERK_USER_ID', // Get this from Clerk dashboard after signing up
      email: 'your-email@example.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const existingUser = await User.findOne({ clerkId: adminUser.clerkId });
    
    if (existingUser) {
      // Update existing user role
      existingUser.role = 'admin';
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

// Uncomment to run (only in development!)
// createAdminUser();

export { createAdminUser };