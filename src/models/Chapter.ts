import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  _id: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string; // Rich HTML content
  markdown?: string; // Optional: store original markdown if pasted
  orderIndex: number;
  wordCount: number;
  status: 'outline' | 'draft' | 'review' | 'complete';
  notes?: string; // Author notes about the chapter
  targetWordCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    content: {
      type: String,
      required: true,
    },
    markdown: {
      type: String,
      trim: true,
    },
    orderIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['outline', 'draft', 'review', 'complete'],
      default: 'outline',
    },
    notes: {
      type: String,
      trim: true,
    },
    targetWordCount: {
      type: Number,
      min: 0,
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
ChapterSchema.index({ bookId: 1, slug: 1 }, { unique: true });
ChapterSchema.index({ bookId: 1 });
ChapterSchema.index({ bookId: 1, orderIndex: 1 });
ChapterSchema.index({ status: 1 });

// Pre-save middleware to calculate word count
ChapterSchema.pre<IChapter>('save', function (next) {
  if (this.isModified('content')) {
    // Remove HTML tags and count words
    const textContent = this.content.replace(/<[^>]*>/g, '');
    this.wordCount = textContent
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }
  next();
});

// Instance methods
ChapterSchema.methods.calculateProgress = function (): number {
  if (!this.targetWordCount || this.targetWordCount === 0) return 0;
  return Math.min((this.wordCount / this.targetWordCount) * 100, 100);
};

ChapterSchema.methods.isComplete = function (): boolean {
  return this.status === 'complete';
};

// Static methods
ChapterSchema.statics.findByBook = function (bookId: string) {
  return this.find({ bookId }).sort({ orderIndex: 1 });
};

const ChapterModel =
  mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema);

export default ChapterModel;
