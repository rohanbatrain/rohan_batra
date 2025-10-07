import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import RepoSyncConfigModel from '@/models/RepoSyncConfig';

const SyncRequestSchema = z.object({
  repoUrl: z.string().url(),
  branch: z.string().default('main'),
  token: z.string().min(1),
  syncDirection: z.enum(['pull-only', 'push-pull']).default('pull-only'),
});

/**
 * POST /api/admin/flashcards/github/sync
 * Trigger GitHub sync (pull decks from repo)
 * 
 * Note: This is a placeholder for T010
 * Full implementation requires @octokit/rest and gray-matter packages
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check permissions
    const currentUser = await UserModel.findOne({ clerkId: userId });
    const userRole = (currentUser?.role as string) || 'user';

    if (!['editor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = SyncRequestSchema.parse(body);

    // Create or update sync config
    let syncConfig = await RepoSyncConfigModel.findOne({
      ownerId: currentUser?._id,
      repoUrl: parsed.repoUrl,
    });

    if (!syncConfig) {
      // Parse repo URL to extract owner/name
      const match = parsed.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid GitHub repo URL' },
          { status: 400 }
        );
      }

      syncConfig = new RepoSyncConfigModel({
        ownerId: currentUser?._id,
        repoUrl: parsed.repoUrl,
        repoOwner: match[1],
        repoName: match[2].replace('.git', ''),
        defaultBranch: parsed.branch,
        syncDirection: parsed.syncDirection,
        status: 'active',
        authType: 'oauth',
      });

      await syncConfig.save();
    }

    // TODO: Implement actual sync logic
    // This requires installing @octokit/rest package
    // See src/lib/github/sync-service.ts for full implementation
    
    return NextResponse.json({
      message: 'GitHub sync feature coming soon (T010)',
      syncConfig: {
        id: syncConfig._id.toString(),
        repoUrl: syncConfig.repoUrl,
        syncDirection: syncConfig.syncDirection,
        status: syncConfig.status,
      },
      note: 'Full implementation requires @octokit/rest and gray-matter packages',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GitHub sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/flashcards/github/sync
 * Get sync configurations
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const currentUser = await UserModel.findOne({ clerkId: userId });

    // Get all sync configs for user
    const syncConfigs = await RepoSyncConfigModel.find({
      ownerId: currentUser?._id,
    }).lean();

    return NextResponse.json({ syncConfigs });
  } catch (error) {
    console.error('Error fetching sync configs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
