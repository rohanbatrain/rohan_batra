import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReactionEmoji = '👍' | '❤️' | '🎯' | '💡' | '🔥';

export interface IBraindumpReaction extends Document {
  _id: mongoose.Types.ObjectId;
  braindumpId: mongoose.Types.ObjectId;
  userId: string; // Clerk user ID
  emoji: ReactionEmoji;
  createdAt: Date;
}

// Static method types
export interface IBraindumpReactionModel extends Model<IBraindumpReaction> {
  getReactionCounts(braindumpId: mongoose.Types.ObjectId): Promise<Record<ReactionEmoji, number>>;
  getUserReactions(braindumpId: mongoose.Types.ObjectId, userId: string): Promise<ReactionEmoji[]>;
  toggle(braindumpId: mongoose.Types.ObjectId, userId: string, emoji: ReactionEmoji): Promise<{ action: 'added' | 'removed'; totalCount: number }>;
  getTopReactors(braindumpId: mongoose.Types.ObjectId, limit?: number): Promise<Array<{ userId: string; reactionCount: number }>>;
}

const braindumpReactionSchema = new Schema<IBraindumpReaction>(
  {
    braindumpId: {
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      required: true,
      index: true,
    },
    userId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },
    emoji: {
      type: String,
      enum: ['👍', '❤️', '🎯', '💡', '🔥'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one reaction per user per emoji per braindump
braindumpReactionSchema.index(
  { braindumpId: 1, userId: 1, emoji: 1 },
  { unique: true }
);

// Index for aggregation queries
braindumpReactionSchema.index({ braindumpId: 1, emoji: 1 });

// ===== Static Methods =====

/**
 * Get reaction counts for a braindump
 */
braindumpReactionSchema.statics.getReactionCounts = async function(
  braindumpId: mongoose.Types.ObjectId
): Promise<Record<ReactionEmoji, number>> {
  const reactions = await this.aggregate([
    { $match: { braindumpId } },
    { $group: { _id: '$emoji', count: { $sum: 1 } } },
  ]);
  
  // Initialize all emoji counts to 0
  const counts: Record<ReactionEmoji, number> = {
    '👍': 0,
    '❤️': 0,
    '🎯': 0,
    '💡': 0,
    '🔥': 0,
  };
  
  // Fill in actual counts
  reactions.forEach((r) => {
    counts[r._id as ReactionEmoji] = r.count;
  });
  
  return counts;
};

/**
 * Get user's reactions for a braindump
 */
braindumpReactionSchema.statics.getUserReactions = async function(
  braindumpId: mongoose.Types.ObjectId,
  userId: string
): Promise<ReactionEmoji[]> {
  const reactions = await this.find({ braindumpId, userId }).select('emoji');
  return reactions.map((r: IBraindumpReaction) => r.emoji);
};

/**
 * Toggle a reaction (add if doesn't exist, remove if exists)
 */
braindumpReactionSchema.statics.toggle = async function(
  braindumpId: mongoose.Types.ObjectId,
  userId: string,
  emoji: ReactionEmoji
): Promise<{ action: 'added' | 'removed'; totalCount: number }> {
  const existing = await this.findOne({ braindumpId, userId, emoji });
  
  if (existing) {
    // Remove reaction
    await this.deleteOne({ _id: existing._id });
    const totalCount = await this.countDocuments({ braindumpId, emoji });
    return { action: 'removed', totalCount };
  } else {
    // Add reaction
    await this.create({ braindumpId, userId, emoji });
    const totalCount = await this.countDocuments({ braindumpId, emoji });
    return { action: 'added', totalCount };
  }
};

/**
 * Get top reactors for a braindump
 */
braindumpReactionSchema.statics.getTopReactors = async function(
  braindumpId: mongoose.Types.ObjectId,
  limit = 5
): Promise<Array<{ userId: string; reactionCount: number }>> {
  return await this.aggregate([
    { $match: { braindumpId } },
    { $group: { _id: '$userId', reactionCount: { $sum: 1 } } },
    { $sort: { reactionCount: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        reactionCount: 1,
      },
    },
  ]);
};

const BraindumpReactionModel = (mongoose.models.BraindumpReaction ||
  mongoose.model<IBraindumpReaction>('BraindumpReaction', braindumpReactionSchema)) as IBraindumpReactionModel;

export default BraindumpReactionModel;
