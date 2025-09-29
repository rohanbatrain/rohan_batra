import mongoose, { Schema, Document } from 'mongoose';
import { Course as CourseType } from '@/types/courses';

export interface ICourse
  extends Omit<
      CourseType,
      | '_id'
      | 'createdBy'
      | 'prerequisiteCourseIds'
      | 'recommendedBookIds'
      | 'flashcardDeckIds'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  prerequisiteCourseIds: mongoose.Types.ObjectId[];
  recommendedBookIds: mongoose.Types.ObjectId[];
  flashcardDeckIds: mongoose.Types.ObjectId[];
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const cdnRegex =
  /^(https?:\/\/)(?:[^\s]+\.)?(?:cloudinary|vercel|rohanbatra)\.[^\s]+/i;

const CourseSchema = new Schema<ICourse>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: slugRegex,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      minlength: 50,
      maxlength: 400,
    },
    heroImage: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string | undefined) =>
          !value || cdnRegex.test(value),
        message: 'heroImage must reference an approved CDN asset',
      },
    },
    heroLottieId: {
      type: Schema.Types.ObjectId,
      ref: 'LottieAsset',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    categories: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    estimatedDurationMinutes: {
      type: Number,
      min: 0,
    },
    lessonCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator(this: ICourse, value: number) {
          if (this.status !== 'published') {
            return true;
          }

          return value > 0;
        },
        message: 'Published courses must include at least one lesson',
      },
    },
    prerequisiteCourseIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Course',
      default: [],
    },
    prerequisiteBlogSlugs: {
      type: [String],
      default: [],
    },
    recommendedBlogSlugs: {
      type: [String],
      default: [],
    },
    recommendedBookIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Book',
      default: [],
    },
    flashcardDeckIds: {
      type: [Schema.Types.ObjectId],
      ref: 'FlashcardDeck',
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'unlisted'],
      default: 'public',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    seo: {
      title: { type: String, trim: true, maxlength: 70 },
      description: { type: String, trim: true, maxlength: 160 },
      image: { type: String, trim: true },
    },
    releaseSchedule: {
      publishAt: { type: Date },
      timezone: { type: String },
    },
    structureVersion: {
      type: Number,
      default: 1,
      min: 1,
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
        delete json.__v;
        return json;
      },
    },
  }
);

CourseSchema.index({ status: 1, publishedAt: -1 });
CourseSchema.index({ categories: 1, status: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ isFeatured: 1, publishedAt: -1 });
CourseSchema.index({ visibility: 1, status: 1 });

export type CourseModelType = mongoose.Model<ICourse>;

const CourseModel: CourseModelType =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default CourseModel;
