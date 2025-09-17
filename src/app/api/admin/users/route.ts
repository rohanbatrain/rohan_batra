import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

const UserCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'user']).default('user'),
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
      theme: z.enum(['light', 'dark', 'system']).default('system'),
      language: z.enum(['en', 'es']).default('en'),
      notifications: z
        .object({
          email: z.boolean().default(true),
          browser: z.boolean().default(true),
          marketing: z.boolean().default(false),
        })
        .optional(),
    })
    .optional(),
});

const BulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'change_role']),
  userIds: z.array(z.string()).min(1),
  newRole: z.enum(['admin', 'editor', 'user']).optional(),
});

export async function GET(request: NextRequest) {
  try {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      100
    );
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const includeActivity = url.searchParams.get('includeActivity') === 'true';

    const filter: Record<string, unknown> = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.company': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-clerkId -__v');

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    const summary = await User.aggregate([
      {
        $facet: {
          roleBreakdown: [
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          recentSignups: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: 'count' },
          ],
          activeUsers: [
            {
              $match: {
                lastLoginAt: {
                  $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const response = {
      success: true,
      users: users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        profile: u.profile,
        preferences: u.preferences,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        lastLoginAt: u.lastLoginAt,
        loginCount: u.loginCount,
        emailVerified: u.emailVerified,
        activity: includeActivity
          ? {
              postsCount: 0, // Would be calculated from BlogPost collection
              commentsCount: 0, // Would be calculated from Comment collection
              likesCount: 0, // Would be calculated from Like collection
            }
          : undefined,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        total: totalUsers,
        roleBreakdown: summary[0].roleBreakdown,
        statusBreakdown: summary[0].statusBreakdown,
        recentSignups: summary[0].recentSignups[0]?.count || 0,
        activeUsers: summary[0].activeUsers[0]?.count || 0,
      },
      filters: {
        role,
        status,
        search,
        sortBy,
        sortOrder,
        includeActivity,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();

    // Handle bulk actions
    if (body.action && body.userIds) {
      const bulkData = BulkActionSchema.parse(body);

      const updateData: Record<string, unknown> = {};
      const currentTime = new Date();

      switch (bulkData.action) {
        case 'activate':
          updateData.status = 'active';
          break;
        case 'deactivate':
          updateData.status = 'inactive';
          break;
        case 'change_role':
          if (!bulkData.newRole) {
            return NextResponse.json(
              {
                success: false,
                error: 'New role is required for role change action',
              },
              { status: 400 }
            );
          }
          updateData.role = bulkData.newRole;
          break;
        case 'delete':
          updateData.deletedAt = currentTime;
          updateData.deletedBy = user._id;
          updateData.status = 'deleted';
          break;
      }

      const result = await User.updateMany(
        { _id: { $in: bulkData.userIds } },
        { $set: updateData }
      );

      return NextResponse.json({
        success: true,
        action: bulkData.action,
        affectedUsers: result.modifiedCount,
        message: `Successfully ${bulkData.action}d ${result.modifiedCount} users`,
      });
    }

    // Handle single user creation
    const validatedData = UserCreateSchema.parse(body);

    // Check for duplicate email
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    const newUser = new User({
      ...validatedData,
      status: 'active',
      emailVerified: false,
      loginCount: 0,
      createdBy: user._id,
    });

    await newUser.save();

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          profile: newUser.profile,
          preferences: newUser.preferences,
          createdAt: newUser.createdAt,
          emailVerified: newUser.emailVerified,
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
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

    console.error('Admin users POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
