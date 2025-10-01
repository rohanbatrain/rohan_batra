import mongoose, { Schema, Document } from 'mongoose';
import { FlashcardDeck as FlashcardDeckType } from '@/types/courses';

export interface IFlashcardDeck
  extends Omit<
      FlashcardDeckType,
      '_id' | 'linkTargets' | 'analytics' | 'createdBy'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  linkTargets: Array<{
    scope: 'standalone' | 'course' | 'module' | 'lesson';
    courseId?: mongoose.Types.ObjectId | null;
    moduleId?: mongoose.Types.ObjectId | null;
    lessonId?: mongoose.Types.ObjectId | null;
  }>;
  analytics?: {
    reviewCount: number;
    uniqueLearners: number;
    averageRating?: number | null;
    lastReviewedAt?: Date | null;
  };
  createdBy: mongoose.Types.ObjectId;
}

const flashcardMediaSchema = new Schema(
  {
    lottieIds: [{ type: Schema.Types.ObjectId, ref: 'LottieAsset' }],
    imageUrls: [{ type: String, trim: true }],
    audioUrl: { type: String, trim: true },
  },
  { _id: false }
);

const linkTargetSchema = new Schema(
  {
    scope: {
      type: String,
      enum: ['standalone', 'course', 'module', 'lesson'],
      required: true,
    },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    moduleId: { type: Schema.Types.ObjectId, ref: 'CourseModule' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'CourseLesson' },
  },
  { _id: false }
);

const analyticsSchema = new Schema(
  {
    reviewCount: { type: Number, default: 0, min: 0 },
    uniqueLearners: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, min: 0, max: 5 },
    lastReviewedAt: { type: Date },
  },
  { _id: false }
);

const FlashcardDeckSchema = new Schema<IFlashcardDeck>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'unlisted', 'private'],
      default: 'public',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    estimatedReviewMinutes: {
      type: Number,
      min: 0,
    },
    cardCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    linkTargets: {
      type: [linkTargetSchema],
      default: [],
    },
    analytics: {
      type: analyticsSchema,
      default: undefined,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        const json = ret as Record<string, unknown>;
        if (json._id) {
          json.id = json._id.toString();
          delete json._id;
        }
        if (json.createdBy instanceof mongoose.Types.ObjectId) {
          json.createdBy = json.createdBy.toString();
        }
        delete json.__v;
        return json;
      },
    },
  }
);

FlashcardDeckSchema.index({ status: 1, visibility: 1 });
FlashcardDeckSchema.index({ createdBy: 1 });

FlashcardDeckSchema.pre<IFlashcardDeck>('validate', function (next) {
  for (const target of this.linkTargets) {
    if (target.scope === 'course' && !target.courseId) {
      return next(new Error('Course scope requires courseId'));
    }
    if (target.scope === 'module' && !(target.courseId && target.moduleId)) {
      return next(new Error('Module scope requires courseId and moduleId'));
    }
    if (
      target.scope === 'lesson' &&
      !(target.courseId && target.moduleId && target.lessonId)
    ) {
      return next(
        new Error('Lesson scope requires courseId, moduleId, and lessonId')
      );
    }
  }

  next();
});

export type FlashcardDeckModelType = mongoose.Model<IFlashcardDeck>;

const FlashcardDeckModel: FlashcardDeckModelType =
  mongoose.models.FlashcardDeck ||
  mongoose.model<IFlashcardDeck>('FlashcardDeck', FlashcardDeckSchema);

export default FlashcardDeckModel;
