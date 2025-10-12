import mongoose, { Schema, Document, Model } from 'mongoose';

export type AnalyticsEventType =
  | 'view'
  | 'share_twitter'
  | 'share_linkedin'
  | 'share_facebook'
  | 'share_email'
  | 'share_copy'
  | 'comment'
  | 'reaction'
  | 'search'
  | 'export';

export interface IAnalyticsEvent extends Document {
  _id: mongoose.Types.ObjectId;
  type: AnalyticsEventType;
  braindumpId?: mongoose.Types.ObjectId;
  userId?: string; // Clerk user ID (optional for anonymous)
  metadata?: Record<string, any>;
  timestamp: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    type: {
      type: String,
      enum: [
        'view',
        'share_twitter',
        'share_linkedin',
        'share_facebook',
        'share_email',
        'share_copy',
        'comment',
        'reaction',
        'search',
        'export',
      ],
      required: true,
      index: true,
    },
    braindumpId: {
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      index: true,
    },
    userId: {
      type: String, // Clerk user ID
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false, // Using timestamp field instead
  }
);

// Compound indexes for common queries
analyticsEventSchema.index({ braindumpId: 1, timestamp: -1 });
analyticsEventSchema.index({ braindumpId: 1, type: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });

// TTL index: auto-delete events older than 2 years
analyticsEventSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 63072000 } // 2 years in seconds
);

// ===== Static Methods =====

/**
 * Track an analytics event
 */
analyticsEventSchema.statics.track = async function(
  type: AnalyticsEventType,
  braindumpId?: mongoose.Types.ObjectId,
  userId?: string,
  metadata?: Record<string, any>
): Promise<IAnalyticsEvent> {
  return await this.create({
    type,
    braindumpId,
    userId,
    metadata,
    timestamp: new Date(),
  });
};

/**
 * Get event counts for a braindump by type
 */
analyticsEventSchema.statics.getEventCounts = async function(
  braindumpId: mongoose.Types.ObjectId,
  startDate?: Date
): Promise<Record<AnalyticsEventType, number>> {
  const match: any = { braindumpId };
  if (startDate) {
    match.timestamp = { $gte: startDate };
  }
  
  const events = await this.aggregate([
    { $match: match },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  
  // Initialize all event types to 0
  const counts: any = {
    view: 0,
    share_twitter: 0,
    share_linkedin: 0,
    share_facebook: 0,
    share_email: 0,
    share_copy: 0,
    comment: 0,
    reaction: 0,
    search: 0,
    export: 0,
  };
  
  // Fill in actual counts
  events.forEach((e) => {
    counts[e._id] = e.count;
  });
  
  return counts;
};

/**
 * Get unique view count for a braindump
 */
analyticsEventSchema.statics.getUniqueViewCount = async function(
  braindumpId: mongoose.Types.ObjectId,
  startDate?: Date
): Promise<number> {
  const match: any = { braindumpId, type: 'view' };
  if (startDate) {
    match.timestamp = { $gte: startDate };
  }
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$userId', // Group by user (null for anonymous)
      },
    },
    { $count: 'uniqueViews' },
  ]);
  
  return result[0]?.uniqueViews || 0;
};

/**
 * Get timeline data (daily counts)
 */
analyticsEventSchema.statics.getTimeline = async function(
  braindumpId: mongoose.Types.ObjectId,
  type: AnalyticsEventType,
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: string; count: number }>> {
  const results = await this.aggregate([
    {
      $match: {
        braindumpId,
        type,
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      },
    },
  ]);
  
  return results;
};

/**
 * Get top referrers for a braindump
 */
analyticsEventSchema.statics.getTopReferrers = async function(
  braindumpId: mongoose.Types.ObjectId,
  limit = 10
): Promise<Array<{ source: string; count: number }>> {
  return await this.aggregate([
    {
      $match: {
        braindumpId,
        type: 'view',
        'metadata.referrer': { $exists: true },
      },
    },
    {
      $group: {
        _id: '$metadata.referrer',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        source: '$_id',
        count: 1,
      },
    },
  ]);
};

const AnalyticsEventModel: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);

export default AnalyticsEventModel;
