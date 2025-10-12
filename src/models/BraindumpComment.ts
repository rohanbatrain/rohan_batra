import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBraindumpComment extends Document {
  _id: mongoose.Types.ObjectId;
  braindumpId: mongoose.Types.ObjectId;
  authorId: string; // Clerk user ID
  content: string;
  parentId?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'flagged' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  getReplies(): Promise<IBraindumpComment[]>;
}

const braindumpCommentSchema = new Schema<IBraindumpComment>(
  {
    braindumpId: {
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      required: true,
      index: true,
    },
    authorId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'BraindumpComment',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'flagged', 'deleted'],
      default: 'approved', // Auto-approve by default
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
braindumpCommentSchema.index({ braindumpId: 1, status: 1, createdAt: -1 });
braindumpCommentSchema.index({ braindumpId: 1, parentId: 1 });
braindumpCommentSchema.index({ authorId: 1, createdAt: -1 });

// ===== Methods =====

/**
 * Get all replies to this comment
 */
braindumpCommentSchema.methods.getReplies = async function(): Promise<IBraindumpComment[]> {
  return await mongoose.model('BraindumpComment').find({
    parentId: this._id,
    status: { $ne: 'deleted' },
  }).sort({ createdAt: 1 });
};

// ===== Static Methods =====

/**
 * Get all comments for a braindump with threaded structure
 */
braindumpCommentSchema.statics.getThreaded = async function(
  braindumpId: mongoose.Types.ObjectId,
  includeDeleted = false
): Promise<IBraindumpComment[]> {
  const query: any = {
    braindumpId,
    parentId: null, // Top-level comments only
  };
  
  if (!includeDeleted) {
    query.status = { $ne: 'deleted' };
  }
  
  const topLevelComments = await this.find(query).sort({ createdAt: -1 });
  
  // Fetch replies for each top-level comment
  for (const comment of topLevelComments) {
    (comment as any).replies = await comment.getReplies();
  }
  
  return topLevelComments;
};

/**
 * Get comment count for a braindump
 */
braindumpCommentSchema.statics.getCount = async function(
  braindumpId: mongoose.Types.ObjectId
): Promise<number> {
  return await this.countDocuments({
    braindumpId,
    status: { $ne: 'deleted' },
  });
};

const BraindumpCommentModel: Model<IBraindumpComment> =
  mongoose.models.BraindumpComment ||
  mongoose.model<IBraindumpComment>('BraindumpComment', braindumpCommentSchema);

export default BraindumpCommentModel;
