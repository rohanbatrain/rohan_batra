import mongoose, { Schema, Document } from 'mongoose';
import { Like } from '@/types/like';

export interface ILike extends Omit<Like, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'comment'],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = ret as any;
        result.id = result._id?.toString();
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Indexes for performance
LikeSchema.index({ userId: 1 });
LikeSchema.index({ targetId: 1 });
LikeSchema.index({ targetType: 1 });
LikeSchema.index({ createdAt: -1 });

// Compound indexes for common queries
LikeSchema.index({ userId: 1, targetId: 1 }, { unique: true }); // Prevent duplicate likes
LikeSchema.index({ targetId: 1, targetType: 1 });
LikeSchema.index({ userId: 1, targetType: 1 });
LikeSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to prevent duplicate likes
LikeSchema.pre<ILike>('save', function (next) {
  // The unique compound index will handle duplicate prevention
  // This middleware is here for additional validation if needed
  next();
});

// Instance method to check if like is for a post
LikeSchema.methods.isForPost = function (): boolean {
  return this.targetType === 'post';
};

// Instance method to check if like is for a comment
LikeSchema.methods.isForComment = function (): boolean {
  return this.targetType === 'comment';
};

// Static method to find likes by user
LikeSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({
    createdAt: -1,
  });
};

// Static method to find likes for a target
LikeSchema.statics.findByTarget = function (
  targetId: string,
  targetType: 'post' | 'comment'
) {
  return this.find({
    targetId: new mongoose.Types.ObjectId(targetId),
    targetType,
  }).sort({ createdAt: -1 });
};

// Static method to check if user has liked a target
LikeSchema.statics.hasUserLiked = function (
  userId: string,
  targetId: string,
  targetType: 'post' | 'comment'
): Promise<boolean> {
  return this.exists({
    userId: new mongoose.Types.ObjectId(userId),
    targetId: new mongoose.Types.ObjectId(targetId),
    targetType,
  }).then((result: mongoose.Types.ObjectId | null) => !!result);
};

// Static method to count likes for a target
LikeSchema.statics.countByTarget = function (
  targetId: string,
  targetType: 'post' | 'comment'
) {
  return this.countDocuments({
    targetId: new mongoose.Types.ObjectId(targetId),
    targetType,
  });
};

// Static method to remove like
LikeSchema.statics.removeLike = function (
  userId: string,
  targetId: string,
  targetType: 'post' | 'comment'
) {
  return this.deleteOne({
    userId: new mongoose.Types.ObjectId(userId),
    targetId: new mongoose.Types.ObjectId(targetId),
    targetType,
  });
};

// Static method to toggle like (add if not exists, remove if exists)
LikeSchema.statics.toggleLike = async function (
  userId: string,
  targetId: string,
  targetType: 'post' | 'comment'
) {
  const existingLike = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    targetId: new mongoose.Types.ObjectId(targetId),
    targetType,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return { action: 'removed', like: null };
  } else {
    const newLike = new this({
      userId: new mongoose.Types.ObjectId(userId),
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
    });
    await newLike.save();
    return { action: 'added', like: newLike };
  }
};

// Add type for LikeModel to include static methods
export interface LikeModelType extends mongoose.Model<ILike> {
  toggleLike: (
    userId: string,
    targetId: string,
    targetType: 'post' | 'comment'
  ) => Promise<{ action: string; like: ILike | null }>;
}

const LikeModel =
  (mongoose.models.Like as LikeModelType) ||
  mongoose.model<ILike, LikeModelType>('Like', LikeSchema);

export default LikeModel;
