import connectToDatabase from '../src/lib/mongodb';
import UserModel from '../src/models/User';

async function checkUserPreferences() {
  try {
    await connectToDatabase();
    
    // Get all users with their preferences
    const users = await UserModel.find({}).select('email clerkId preferences').lean();
    
    console.log('\n=== User Preferences Check ===\n');
    
    for (const user of users) {
      console.log(`User: ${(user as any).email}`);
      console.log(`Clerk ID: ${(user as any).clerkId}`);
      console.log(`Preferences:`, JSON.stringify((user as any).preferences, null, 2));
      console.log('---\n');
    }
    
    console.log(`Total users: ${users.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserPreferences();
