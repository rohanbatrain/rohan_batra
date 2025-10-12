import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'comment' | 'reply' | 'reaction' | 'share' | 'mention' | 'milestone';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string; // Clerk user ID
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedBraindumpId?: mongoose.Types.ObjectId;
  relatedCommentId?: mongoose.Types.ObjectId;
  actionUrl?: string;
  actor?: {
    userId: string;
    userName: string;
    userImage?: string;
  };
  createdAt: Date;
  
  // Methods
  markAsRead(): Promise<INotification>;
}

// Static method types
export interface INotificationModel extends Model<INotification> {
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      relatedBraindumpId?: mongoose.Types.ObjectId;
      relatedCommentId?: mongoose.Types.ObjectId;
      actionUrl?: string;
      actor?: {
        userId: string;
        userName: string;
        userImage?: string;
      };
    }
  ): Promise<INotification>;
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<number>;
  getPaginated(
    userId: string,
    page?: number,
    limit?: number,
    unreadOnly?: boolean
  ): Promise<{
    notifications: INotification[];
    total: number;
    pages: number;
  }>;
  deleteOldReadNotifications(daysOld?: number): Promise<number>;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['comment', 'reply', 'reaction', 'share', 'mention', 'milestone'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedBraindumpId: {
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      index: true,
    },
    relatedCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'BraindumpComment',
    },
    actionUrl: {
      type: String,
      maxlength: 500,
    },
    actor: {
      userId: { type: String },
      userName: { type: String, maxlength: 100 },
      userImage: { type: String, maxlength: 500 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

// ===== Methods =====

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = async function(): Promise<INotification> {
  this.read = true;
  return await this.save();
};

// ===== Static Methods =====

/**
 * Create a notification
 */
notificationSchema.statics.createNotification = async function(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    relatedBraindumpId?: mongoose.Types.ObjectId;
    relatedCommentId?: mongoose.Types.ObjectId;
    actionUrl?: string;
    actor?: {
      userId: string;
      userName: string;
      userImage?: string;
    };
  }
): Promise<INotification> {
  return await this.create({
    userId,
    type,
    title,
    message,
    ...options,
  });
};

/**
 * Get unread count for a user
 */
notificationSchema.statics.getUnreadCount = async function(
  userId: string
): Promise<number> {
  return await this.countDocuments({ userId, read: false });
};

/**
 * Mark all notifications as read for a user
 */
notificationSchema.statics.markAllAsRead = async function(
  userId: string
): Promise<number> {
  const result = await this.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );
  
  return result.modifiedCount;
};

/**
 * Get paginated notifications for a user
 */
notificationSchema.statics.getPaginated = async function(
  userId: string,
  page = 1,
  limit = 20,
  unreadOnly = false
): Promise<{
  notifications: INotification[];
  total: number;
  pages: number;
}> {
  const query: any = { userId };
  if (unreadOnly) {
    query.read = false;
  }
  
  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(query),
  ]);
  
  return {
    notifications,
    total,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Delete old read notifications (cleanup job)
 */
notificationSchema.statics.deleteOldReadNotifications = async function(
  daysOld = 90
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await this.deleteMany({
    read: true,
    createdAt: { $lt: cutoffDate },
  });
  
  return result.deletedCount || 0;
};

const NotificationModel = (mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema)) as INotificationModel;

export default NotificationModel;
