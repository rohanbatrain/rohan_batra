import { NextRequest, NextResponse } from 'next/server';

// This is a mock auth endpoint for contract testing
// In production, Clerk handles user registration on the frontend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'user' } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          error: 'Email, password, and name are required',
          message: 'Missing required registration fields',
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Invalid email format',
          message: 'Please provide a valid email address',
        },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        {
          error: 'Password too weak',
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // Name validation
    if (name.length < 2) {
      return NextResponse.json(
        {
          error: 'Invalid name',
          message: 'Name must be at least 2 characters long',
        },
        { status: 400 }
      );
    }

    // Role validation
    const validRoles = ['user', 'admin', 'editor'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: 'Invalid role',
          message: 'Role must be one of: user, admin, editor',
        },
        { status: 400 }
      );
    }

    // Mock existing users check
    const existingEmails = [
      'existing@example.com',
      'user@example.com',
      'admin@example.com',
      'editor@example.com',
    ];

    if (existingEmails.includes(email)) {
      return NextResponse.json(
        {
          error: 'User already exists',
          message: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    // Mock user creation
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      role,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
    };

    // Mock token generation
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Return user data and token
    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
          createdAt: newUser.createdAt,
        },
        token,
        expiresAt: expiresAt.toISOString(),
        message: 'User registered successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Auth register error:', error);
    return NextResponse.json(
      {
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
