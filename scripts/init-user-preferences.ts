/**
 * Initialize preferences for existing users who don't have them
 * Run this once to fix users created before the preferences field was added
 */

import connectToDatabase from '../src/lib/mongodb';
import UserModel from '../src/models/User';

async function initUserPreferences() {
  try {
    await connectToDatabase();
    
    console.log('\n=== Initializing User Preferences ===\n');
    
    // Find users without preferences or without preferences.editor
    const usersWithoutPrefs = await UserModel.find({
      $or: [
        { preferences: { $exists: false } },
        { 'preferences.editor': { $exists: false } }
      ]
    }).select('email clerkId preferences');
    
    console.log(`Found ${usersWithoutPrefs.length} users needing preference initialization\n`);
    
    for (const user of usersWithoutPrefs) {
      console.log(`Updating user: ${user.email}`);
      console.log(`  Current preferences:`, user.preferences || 'NONE');
      
      // Initialize preferences with defaults
      const result = await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            'preferences.editor': 'rich-html',
            'preferences.theme': user.preferences?.theme || 'auto',
            'preferences.language': user.preferences?.language || 'en',
            'preferences.notifications.email': user.preferences?.notifications?.email ?? true,
            'preferences.notifications.browser': user.preferences?.notifications?.browser ?? true,
            'preferences.notifications.mobile': user.preferences?.notifications?.mobile ?? false,
          }
        }
      );
      
      console.log(`  Updated: ${result.modifiedCount} document(s)`);
      
      // Verify the update
      const updated = await UserModel.findById(user._id).select('preferences');
      console.log(`  New preferences:`, updated?.preferences);
      console.log('---\n');
    }
    
    console.log('✅ Preference initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initUserPreferences();
