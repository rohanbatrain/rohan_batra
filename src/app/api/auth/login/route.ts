import { NextRequest, NextResponse } from 'next/server';

// This is a mock auth endpoint for contract testing
// In production, Clerk handles authentication on the frontend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
          message: 'Missing required authentication fields',
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

    // Mock authentication logic for testing
    // In real implementation, this would integrate with Clerk
    const testUsers = [
      {
        id: 'user_123',
        email: 'user@example.com',
        password: 'validpassword123',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        role: 'user',
      },
      {
        id: 'admin_456',
        email: 'admin@example.com',
        password: 'adminpassword123',
        name: 'Admin User',
        avatar: 'https://example.com/admin-avatar.jpg',
        role: 'admin',
      },
      {
        id: 'editor_789',
        email: 'editor@example.com',
        password: 'editorpassword123',
        name: 'Editor User',
        avatar: 'https://example.com/editor-avatar.jpg',
        role: 'editor',
      },
    ];

    const user = testUsers.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        },
        { status: 401 }
      );
    }

    // Mock token generation
    const token = `mock_token_${user.id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      token,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      {
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
