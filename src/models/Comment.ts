import mongoose, { Schema, Document } from 'mongoose';
import { Comment } from '@/types/comment';

export interface IComment
  extends Omit<
      Comment,
      '_id' | 'authorId' | 'postId' | 'parentId' | 'approvedBy'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  authorId?: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'spam'],
      default: 'pending',
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 5, // Limit reply depth
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    authorAvatar: {
      type: String,
      trim: true,
    },
    authorWebsite: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
CommentSchema.index({ postId: 1 });
CommentSchema.index({ authorId: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ status: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ approvedAt: -1 });

// Compound indexes for common queries
CommentSchema.index({ postId: 1, status: 1 });
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ postId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1, createdAt: 1 });

// Pre-save middleware to set isReply and depth
CommentSchema.pre<IComment>('save', function (next) {
  if (this.parentId) {
    this.isReply = true;
    // Note: depth would need to be calculated based on parent comment's depth + 1
    // This would require an async operation to fetch the parent
  } else {
    this.isReply = false;
    this.depth = 0;
  }

  // Set approvedAt when status changes to approved
  if (
    this.isModified('status') &&
    this.status === 'approved' &&
    !this.approvedAt
  ) {
    this.approvedAt = new Date();
  }

  next();
});

// Instance method to increment like count
CommentSchema.methods.incrementLikeCount = function (): Promise<IComment> {
  this.likeCount += 1;
  return this.save();
};

// Instance method to decrement like count
CommentSchema.methods.decrementLikeCount = function (): Promise<IComment> {
  if (this.likeCount > 0) {
    this.likeCount -= 1;
  }
  return this.save();
};

// Instance method to increment reply count
CommentSchema.methods.incrementReplyCount = function (): Promise<IComment> {
  this.replyCount += 1;
  return this.save();
};

// Instance method to decrement reply count
CommentSchema.methods.decrementReplyCount = function (): Promise<IComment> {
  if (this.replyCount > 0) {
    this.replyCount -= 1;
  }
  return this.save();
};

// Instance method to approve comment
CommentSchema.methods.approve = function (
  approvedBy: string
): Promise<IComment> {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = new mongoose.Types.ObjectId(approvedBy);
  return this.save();
};

// Instance method to reject comment
CommentSchema.methods.reject = function (): Promise<IComment> {
  this.status = 'rejected';
  return this.save();
};

// Instance method to mark as spam
CommentSchema.methods.markAsSpam = function (): Promise<IComment> {
  this.status = 'spam';
  return this.save();
};

// Instance method to check if comment is approved
CommentSchema.methods.isApproved = function (): boolean {
  return this.status === 'approved';
};

// Instance method to check if comment is pending
CommentSchema.methods.isPending = function (): boolean {
  return this.status === 'pending';
};

// Instance method to check if comment is a top-level comment
CommentSchema.methods.isTopLevel = function (): boolean {
  return !this.isReply && this.depth === 0;
};

// Static method to find approved comments for a post
CommentSchema.statics.findApprovedByPost = function (postId: string) {
  return this.find({
    postId: new mongoose.Types.ObjectId(postId),
    status: 'approved',
  }).sort({ createdAt: 1 });
};

// Static method to find pending comments
CommentSchema.statics.findPending = function () {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Static method to find comments by author
CommentSchema.statics.findByAuthor = function (authorId: string) {
  return this.find({ authorId: new mongoose.Types.ObjectId(authorId) }).sort({
    createdAt: -1,
  });
};

// Static method to find replies to a comment
CommentSchema.statics.findReplies = function (parentId: string) {
  return this.find({
    parentId: new mongoose.Types.ObjectId(parentId),
    status: 'approved',
  }).sort({ createdAt: 1 });
};

// Static method to count comments for a post
CommentSchema.statics.countByPost = function (postId: string) {
  return this.countDocuments({
    postId: new mongoose.Types.ObjectId(postId),
    status: 'approved',
  });
};

const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default CommentModel;
