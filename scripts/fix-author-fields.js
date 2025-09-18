const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function fixExistingContent() {
  try {
    await connectToDatabase();

    // Use raw schemas to get existing models
    const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', new mongoose.Schema({}, { strict: false }));
    const Project = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find the existing user
    const user = await User.findOne({ email: 'github@rohanbatra.in' });
    if (!user) {
      console.log('❌ No user found with email github@rohanbatra.in');
      return;
    }
    console.log('✅ Found user:', user.firstName, user.lastName);

    // Fix blog posts - update author field to authorId
    const blogPosts = await BlogPost.find({ author: { $exists: true, $ne: null } });
    console.log('Found', blogPosts.length, 'blog posts with author field');
    
    for (const post of blogPosts) {
      await BlogPost.updateOne(
        { _id: post._id },
        { 
          $set: { authorId: user._id },
          $unset: { author: "" }
        }
      );
      console.log('✅ Fixed blog post:', post.title);
    }

    // Fix projects - update author field to authorId
    const projects = await Project.find({ author: { $exists: true, $ne: null } });
    console.log('Found', projects.length, 'projects with author field');
    
    for (const project of projects) {
      await Project.updateOne(
        { _id: project._id },
        { 
          $set: { authorId: user._id },
          $unset: { author: "" }
        }
      );
      console.log('✅ Fixed project:', project.title);
    }

    console.log('\n🎉 Content field fix complete! All documents now use authorId field.');
  } catch (error) {
    console.error('❌ Error fixing content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
fixExistingContent();