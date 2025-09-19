import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  description: string;
  genre: string;
  targetWordCount?: number;
  currentWordCount: number;
  status: 'planning' | 'drafting' | 'editing' | 'completed' | 'published';
  visibility: 'private' | 'public' | 'shared';
  coverImage?: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  startedAt?: Date;
  completedAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    targetWordCount: {
      type: Number,
      min: 0,
    },
    currentWordCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['planning', 'drafting', 'editing', 'completed', 'published'],
      default: 'planning',
    },
    visibility: {
      type: String,
      enum: ['private', 'public', 'shared'],
      default: 'private',
    },
    coverImage: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const result = ret as Record<string, unknown>;
        result.id = result._id?.toString();
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Indexes for performance
BookSchema.index({ authorId: 1 });
BookSchema.index({ status: 1 });
BookSchema.index({ visibility: 1 });
BookSchema.index({ genre: 1 });
BookSchema.index({ tags: 1 });
BookSchema.index({ createdAt: -1 });
BookSchema.index({ collaborators: 1 });

// Instance methods
BookSchema.methods.calculateProgress = function (): number {
  if (!this.targetWordCount || this.targetWordCount === 0) return 0;
  return Math.min((this.currentWordCount / this.targetWordCount) * 100, 100);
};

BookSchema.methods.isCompleted = function (): boolean {
  return this.status === 'completed' || this.status === 'published';
};

BookSchema.methods.isPublic = function (): boolean {
  return this.visibility === 'public';
};

// Static methods
BookSchema.statics.findByAuthor = function (authorId: string) {
  return this.find({ authorId }).sort({ updatedAt: -1 });
};

BookSchema.statics.findPublic = function () {
  return this.find({ visibility: 'public' }).sort({ publishedAt: -1 });
};

const BookModel =
  mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default BookModel;
