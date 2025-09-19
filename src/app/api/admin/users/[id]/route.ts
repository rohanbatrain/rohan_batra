import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

const UserUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'editor', 'user']).optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  profile: z
    .object({
      bio: z.string().max(500).optional(),
      avatar: z.string().url().optional(),
      website: z.string().url().optional(),
      location: z.string().max(100).optional(),
      company: z.string().max(100).optional(),
      jobTitle: z.string().max(100).optional(),
    })
    .optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      language: z.enum(['en', 'es']).optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          browser: z.boolean().optional(),
          marketing: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(id).select('-clerkId -__v');

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
        profile: targetUser.profile,
        preferences: targetUser.preferences,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
        lastLoginAt: targetUser.lastLoginAt,
        loginCount: targetUser.loginCount,
        emailVerified: targetUser.emailVerified,
        activity: {
          postsCount: 0, // Would be calculated from BlogPost collection
          commentsCount: 0, // Would be calculated from Comment collection
          likesCount: 0, // Would be calculated from Like collection
          lastActivity: targetUser.lastLoginAt,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin user GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = UserUpdateSchema.parse(body);

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check email conflicts if email is being updated
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const conflictingUser = await User.findOne({
        email: validatedData.email,
        _id: { $ne: id },
      });

      if (conflictingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Role change validation
    if (validatedData.role && validatedData.role !== existingUser.role) {
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Only admins can change user roles' },
          { status: 403 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: { ...validatedData, updatedAt: new Date() },
      },
      { new: true, runValidators: true }
    ).select('-clerkId -__v');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        status: updatedUser.status,
        profile: updatedUser.profile,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        lastLoginAt: updatedUser.lastLoginAt,
        emailVerified: updatedUser.emailVerified,
      },
      changes: {
        fieldsModified: Object.keys(validatedData),
        roleChanged:
          validatedData.role && validatedData.role !== existingUser.role,
        previousRole: existingUser.role,
        newRole: updatedUser.role,
      },
      message: 'User updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin user PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // For PATCH, we only validate the fields that are provided
    const validatedData = UserUpdateSchema.partial().parse(body);

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check email conflicts if email is being updated
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const conflictingUser = await User.findOne({
        email: validatedData.email,
        _id: { $ne: id },
      });

      if (conflictingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Role change validation
    if (validatedData.role && validatedData.role !== existingUser.role) {
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Only admins can change user roles' },
          { status: 403 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: { ...validatedData, updatedAt: new Date() },
      },
      { new: true, runValidators: true }
    ).select('-clerkId -__v');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          status: updatedUser.status,
          profile: updatedUser.profile,
          preferences: updatedUser.preferences,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          lastLoginAt: updatedUser.lastLoginAt,
          emailVerified: updatedUser.emailVerified,
        },
        message: 'User updated successfully',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin user PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (targetUser._id.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    if (permanent) {
      await User.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'User permanently deleted',
        deletedUser: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
        permanent: true,
      });
    } else {
      const deletedUser = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            deletedAt: new Date(),
            deletedBy: user._id,
            status: 'deleted',
          },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'User moved to trash',
        deletedUser: {
          _id: deletedUser._id,
          name: deletedUser.name,
          email: deletedUser.email,
          deletedAt: deletedUser.deletedAt,
        },
        permanent: false,
        canRestore: true,
      });
    }
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
