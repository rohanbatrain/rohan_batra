import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import SiteSetting from '@/models/SiteSetting';
import User from '@/models/User';
import { z } from 'zod';

const SettingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  // Accept legacy 'array'|'object' but normalize to 'json' when persisting
  type: z.enum(['string', 'number', 'boolean', 'json', 'array', 'object']),
  category: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  validation: z
    .object({
      required: z.boolean().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      ui: z.enum(['toggle', 'select']).optional(),
      options: z
        .array(
          z.union([
            z.string(),
            z.number(),
            z.object({ label: z.string(), value: z.any() }),
          ])
        )
        .optional(),
    })
    .optional(),
});

const BulkSettingsSchema = z.object({
  settings: z.array(SettingUpdateSchema),
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
    const category = url.searchParams.get('category');
    const isPublic = url.searchParams.get('isPublic');
    const search = url.searchParams.get('search');
    const includeHistory = url.searchParams.get('includeHistory') === 'true';

    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = category;
    }

    if (isPublic !== null) {
      filter.isPublic = isPublic === 'true';
    }

    if (search) {
      filter.$or = [
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const projection = includeHistory ? {} : { history: 0 };

    const settings = await SiteSetting.find(filter, projection).sort({
      category: 1,
      key: 1,
    });

    const summary = await SiteSetting.aggregate([
      {
        $facet: {
          categoryBreakdown: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          typeBreakdown: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          publicCount: [{ $match: { isPublic: true } }, { $count: 'count' }],
          recentlyUpdated: [
            { $sort: { updatedAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                key: 1,
                category: 1,
                updatedAt: 1,
                'history.action': { $arrayElemAt: ['$history.action', -1] },
                'history.userId': { $arrayElemAt: ['$history.userId', -1] },
              },
            },
          ],
        },
      },
    ]);

    const response = {
      success: true,
      settings: settings.map(setting => ({
        _id: setting._id,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        category: setting.category,
        description: setting.description,
        isPublic: setting.isPublic,
        validation: setting.validation,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
        history: includeHistory
          ? setting.history
          : setting.history?.slice(-1) || [],
      })),
      summary: {
        total: settings.length,
        categoryBreakdown: summary[0].categoryBreakdown,
        typeBreakdown: summary[0].typeBreakdown,
        publicCount: summary[0].publicCount[0]?.count || 0,
        recentlyUpdated: summary[0].recentlyUpdated,
      },
      filters: {
        category,
        isPublic,
        search,
        includeHistory,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: user.name,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
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
        {
          success: false,
          error: 'Admin access required for settings management',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Helper to normalize type
    const normalizeType = (t: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'object') =>
      t === 'array' || t === 'object' ? 'json' : t;

    // Handle bulk settings update
    if (body.settings) {
      const bulkData = BulkSettingsSchema.parse(body);
      const results = [];
      const errors = [];

      for (const settingData of bulkData.settings) {
        try {
          const existing = await SiteSetting.findOne({ key: settingData.key });
          const currentTime = new Date();

          const historyEntry = {
            action: existing ? 'updated' : 'created',
            userId: user._id,
            userName: user.name,
            timestamp: currentTime,
            previousValue: existing?.value,
            newValue: settingData.value,
          };

          if (existing) {
            // Update existing setting
            const updated = await SiteSetting.findByIdAndUpdate(
              existing._id,
              {
                $set: {
                  value: settingData.value,
                  type: normalizeType(settingData.type as any),
                  category: settingData.category || existing.category,
                  description: settingData.description || existing.description,
                  isPublic: settingData.isPublic ?? existing.isPublic,
                  validation: settingData.validation || existing.validation,
                  updatedAt: currentTime,
                },
                $push: { history: historyEntry },
              },
              { new: true }
            );
            results.push({
              key: settingData.key,
              action: 'updated',
              _id: updated._id,
            });
          } else {
            // Create new setting
            const newSetting = new SiteSetting({
              key: settingData.key,
              value: settingData.value,
              type: normalizeType(settingData.type as any),
              category: settingData.category || 'general',
              description: settingData.description,
              isPublic: settingData.isPublic ?? false,
              validation: settingData.validation,
              history: [historyEntry],
            });
            await newSetting.save();
            results.push({
              key: settingData.key,
              action: 'created',
              _id: newSetting._id,
            });
          }
        } catch (error) {
          errors.push({
            key: settingData.key,
            error: String(error),
          });
        }
      }

      return NextResponse.json({
        success: errors.length === 0,
        results,
        errors,
        message: `Processed ${results.length} settings successfully${
          errors.length > 0 ? `, ${errors.length} failed` : ''
        }`,
      });
    }

    // Handle single setting creation/update
  const validatedData = SettingUpdateSchema.parse(body);
    const existing = await SiteSetting.findOne({ key: validatedData.key });
    const currentTime = new Date();

    const historyEntry = {
      action: existing ? 'updated' : 'created',
      userId: user._id,
      userName: user.name,
      timestamp: currentTime,
      previousValue: existing?.value,
      newValue: validatedData.value,
    };

    if (existing) {
      // Update existing setting
      const updated = await SiteSetting.findByIdAndUpdate(
        existing._id,
        {
          $set: {
            value: validatedData.value,
            type: normalizeType(validatedData.type as any),
            category: validatedData.category || existing.category,
            description: validatedData.description || existing.description,
            isPublic: validatedData.isPublic ?? existing.isPublic,
            validation: validatedData.validation || existing.validation,
            updatedAt: currentTime,
          },
          $push: { history: historyEntry },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        setting: {
          _id: updated._id,
          key: updated.key,
          value: updated.value,
          type: updated.type,
          category: updated.category,
          description: updated.description,
          isPublic: updated.isPublic,
          validation: updated.validation,
          updatedAt: updated.updatedAt,
        },
        message: 'Setting updated successfully',
      });
    } else {
      // Create new setting
      const newSetting = new SiteSetting({
        key: validatedData.key,
        value: validatedData.value,
        type: normalizeType(validatedData.type as any),
        category: validatedData.category || 'general',
        description: validatedData.description,
        isPublic: validatedData.isPublic ?? false,
        validation: validatedData.validation,
        history: [historyEntry],
      });

      await newSetting.save();

      return NextResponse.json(
        {
          success: true,
          setting: {
            _id: newSetting._id,
            key: newSetting.key,
            value: newSetting.value,
            type: newSetting.type,
            category: newSetting.category,
            description: newSetting.description,
            isPublic: newSetting.isPublic,
            validation: newSetting.validation,
            createdAt: newSetting.createdAt,
          },
          message: 'Setting created successfully',
        },
        { status: 201 }
      );
    }
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

    console.error('Admin settings POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to manage settings',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
