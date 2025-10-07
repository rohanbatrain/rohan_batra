import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBraindump extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  userId: mongoose.Types.ObjectId;
  // Can be associated with multiple content types
  associations?: Array<{
    type:
      | 'blog'
      | 'project'
      | 'course'
      | 'book'
      | 'character'
      | 'portfolio'
      | 'social-post'
      | 'linkedin'
      | 'twitter'
      | 'experience'
      | 'flashcard'
      | 'documentation'
      | 'other';
    id?: string;
    title?: string;
    url?: string;
    note?: string;
  }>;
  metadata?: {
    source?: string; // e.g., 'quick-capture', 'mobile', 'api'
    relatedTo?: {
      type: 'blog' | 'project' | 'course' | 'book' | 'character' | 'other';
      id?: string;
    };
  };
  processedInto?: {
    type:
      | 'blog'
      | 'project'
      | 'course'
      | 'book'
      | 'character'
      | 'task'
      | 'other';
    id?: string;
    note?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const braindumpSchema = new Schema<IBraindump>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['captured', 'processed', 'archived'],
      default: 'captured',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    associations: [
      {
        type: {
          type: String,
          enum: [
            'blog',
            'project',
            'course',
            'book',
            'character',
            'portfolio',
            'social-post',
            'linkedin',
            'twitter',
            'experience',
            'flashcard',
            'documentation',
            'other',
          ],
          required: true,
        },
        id: { type: String },
        title: { type: String, maxlength: 200 },
        url: { type: String, maxlength: 500 },
        note: { type: String, maxlength: 500 },
      },
    ],
    metadata: {
      source: { type: String },
      relatedTo: {
        type: { type: String },
        id: { type: String },
      },
    },
    processedInto: {
      type: { type: String },
      id: { type: String },
      note: { type: String, maxlength: 500 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
braindumpSchema.index({ userId: 1, status: 1, createdAt: -1 });
braindumpSchema.index({ userId: 1, tags: 1 });
braindumpSchema.index({ userId: 1, priority: 1, status: 1 });

const BraindumpModel: Model<IBraindump> =
  mongoose.models.Braindump ||
  mongoose.model<IBraindump>('Braindump', braindumpSchema);

export default BraindumpModel;
