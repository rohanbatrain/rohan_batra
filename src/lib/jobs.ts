/**
 * Background Notification Job System
 * Processes notification digests and cleanup tasks
 */

import { Types } from 'mongoose';
import Notification from '@/models/Notification';
import User from '@/models/User';
import connectToDatabase from '@/lib/mongodb';

export interface NotificationDigest {
  userId: string;
  userEmail: string;
  userName: string;
  notifications: {
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    createdAt: Date;
  }[];
  period: 'daily' | 'weekly';
}

/**
 * Generate notification digest for a user
 */
export async function generateNotificationDigest(
  userId: string,
  period: 'daily' | 'weekly' = 'daily'
): Promise<NotificationDigest | null> {
  await connectToDatabase();

  // Calculate time range
  const now = new Date();
  const startDate = new Date(now);
  
  if (period === 'daily') {
    startDate.setDate(startDate.getDate() - 1);
  } else {
    startDate.setDate(startDate.getDate() - 7);
  }

  // Get user info
  const user = await User.findOne({ clerkId: userId }).lean() as any;
  if (!user) {
    console.warn(`User not found for digest: ${userId}`);
    return null;
  }

  // Get unread notifications in time range
  const notifications = await Notification.find({
    userId,
    read: false,
    createdAt: { $gte: startDate, $lte: now },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  if (notifications.length === 0) {
    console.log(`No unread notifications for user ${userId}`);
    return null;
  }

  return {
    userId,
    userEmail: (user.email as string) || '',
    userName: (user.name as string) || 'User',
    notifications: notifications.map(n => ({
      type: n.type,
      title: n.title,
      message: n.message,
      actionUrl: n.actionUrl,
      createdAt: n.createdAt,
    })),
    period,
  };
}

/**
 * Send notification digest email (placeholder)
 * In production, integrate with email service (SendGrid, Resend, etc.)
 */
export async function sendNotificationDigest(digest: NotificationDigest): Promise<boolean> {
  console.log(`Sending ${digest.period} digest to ${digest.userEmail}`);
  console.log(`- User: ${digest.userName}`);
  console.log(`- Notifications: ${digest.notifications.length}`);

  // TODO: Integrate with email service
  // Example with SendGrid:
  // const msg = {
  //   to: digest.userEmail,
  //   from: 'notifications@yourdomain.com',
  //   subject: `Your ${digest.period} notification digest`,
  //   html: generateDigestHTML(digest),
  // };
  // await sgMail.send(msg);

  return true;
}

/**
 * Process daily digests for all users
 */
export async function processDailyDigests(): Promise<number> {
  await connectToDatabase();

  console.log('Starting daily digest processing...');

  // Get all users who have unread notifications
  const usersWithNotifications = await Notification.distinct('userId', {
    read: false,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  console.log(`Processing digests for ${usersWithNotifications.length} users`);

  let sentCount = 0;

  for (const userId of usersWithNotifications) {
    try {
      const digest = await generateNotificationDigest(userId, 'daily');
      
      if (digest && digest.notifications.length >= 5) {
        // Only send if user has 5+ notifications (avoid spam)
        const sent = await sendNotificationDigest(digest);
        if (sent) sentCount++;
      }
    } catch (error) {
      console.error(`Error processing digest for user ${userId}:`, error);
    }
  }

  console.log(`Daily digests sent: ${sentCount}`);
  return sentCount;
}

/**
 * Process weekly digests for all users
 */
export async function processWeeklyDigests(): Promise<number> {
  await connectToDatabase();

  console.log('Starting weekly digest processing...');

  // Get all users who have unread notifications in past week
  const usersWithNotifications = await Notification.distinct('userId', {
    read: false,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  console.log(`Processing weekly digests for ${usersWithNotifications.length} users`);

  let sentCount = 0;

  for (const userId of usersWithNotifications) {
    try {
      const digest = await generateNotificationDigest(userId, 'weekly');
      
      if (digest) {
        const sent = await sendNotificationDigest(digest);
        if (sent) sentCount++;
      }
    } catch (error) {
      console.error(`Error processing weekly digest for user ${userId}:`, error);
    }
  }

  console.log(`Weekly digests sent: ${sentCount}`);
  return sentCount;
}

/**
 * Clean up old read notifications
 * Removes notifications older than 30 days that have been read
 */
export async function cleanupOldNotifications(): Promise<number> {
  await connectToDatabase();

  console.log('Starting notification cleanup...');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await Notification.deleteMany({
    read: true,
    createdAt: { $lt: thirtyDaysAgo },
  });

  console.log(`Deleted ${result.deletedCount} old notifications`);
  return result.deletedCount || 0;
}

/**
 * Pre-calculate and cache trending scores
 * Updates trending cache in Redis
 */
export async function updateTrendingCache(): Promise<void> {
  await connectToDatabase();

  console.log('Updating trending cache...');

  // Import dynamically to avoid circular dependencies
  const { default: Braindump } = await import('@/models/Braindump');
  const ratelimitModule = await import('@/lib/ratelimit');
  const redis = (ratelimitModule as any).redis;

  const periods = ['24h', '7d', '30d'] as const;

  for (const period of periods) {
    try {
      let hoursAgo = 24;
      if (period === '7d') hoursAgo = 168;
      if (period === '30d') hoursAgo = 720;

      const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      const trending = await Braindump.aggregate([
        {
          $match: {
            visibility: { $in: ['public', 'unlisted'] },
            createdAt: { $gte: since },
          },
        },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: ['$viewCount', 1] },
                { $multiply: ['$shareCount', 5] },
                { $multiply: ['$commentCount', 3] },
                { $multiply: ['$reactionCount', 2] },
              ],
            },
          },
        },
        { $sort: { trendingScore: -1, createdAt: -1 } },
        { $limit: 50 },
        {
          $project: {
            _id: 1,
            content: 1,
            slug: 1,
            viewCount: 1,
            shareCount: 1,
            commentCount: 1,
            reactionCount: 1,
            trendingScore: 1,
            createdAt: 1,
          },
        },
      ]);

      // Cache in Redis with 1 hour TTL
      await redis.setex(
        `trending:${period}`,
        3600,
        JSON.stringify(trending)
      );

      console.log(`Cached ${trending.length} trending items for ${period}`);
    } catch (error) {
      console.error(`Error updating trending cache for ${period}:`, error);
    }
  }

  console.log('Trending cache updated');
}

/**
 * Main job scheduler
 * Call this function from a cron job or scheduled task
 */
export async function runScheduledJobs(jobType: string): Promise<void> {
  console.log(`Running scheduled job: ${jobType}`);
  
  try {
    switch (jobType) {
      case 'daily-digest':
        await processDailyDigests();
        break;
        
      case 'weekly-digest':
        await processWeeklyDigests();
        break;
        
      case 'cleanup':
        await cleanupOldNotifications();
        break;
        
      case 'trending':
        await updateTrendingCache();
        break;
        
      case 'all':
        // Run all maintenance tasks
        await cleanupOldNotifications();
        await updateTrendingCache();
        break;
        
      default:
        console.error(`Unknown job type: ${jobType}`);
    }
  } catch (error) {
    console.error(`Error running job ${jobType}:`, error);
    throw error;
  }
  
  console.log(`Completed job: ${jobType}`);
}
