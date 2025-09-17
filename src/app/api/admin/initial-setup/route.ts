import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// SECURE: Only allows initial admin setup for designated email
// This endpoint self-destructs after first use and only works for predetermined admin email

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if any admin already exists
    await connectToDatabase();
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. This endpoint is disabled.' },
        { status: 403 }
      );
    }

    // Only allow if user email matches environment variable
    const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL;
    
    if (!INITIAL_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Initial admin setup not configured' },
        { status: 403 }
      );
    }

    const { email } = await request.json();
    
    if (email !== INITIAL_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized: Not designated admin email' },
        { status: 403 }
      );
    }

    // Create initial admin user
    const adminUser = new User({
      clerkId: userId,
      email: email,
      name: 'Initial Admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await adminUser.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Initial admin created successfully. This endpoint is now disabled.'
    });
  } catch (error) {
    console.error('Error in initial admin setup:', error);
    return NextResponse.json(
      { error: 'Failed to create initial admin' },
      { status: 500 }
    );
  }
}