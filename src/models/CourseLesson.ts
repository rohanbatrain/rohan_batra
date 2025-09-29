import mongoose, { Schema, Document } from 'mongoose';
import { CourseLesson as CourseLessonType } from '@/types/courses';

export interface ICourseLesson
  extends Omit<
      CourseLessonType,
      | '_id'
      | 'courseId'
      | 'moduleId'
      | 'quizId'
      | 'assets'
      | 'prerequisiteLessonIds'
      | 'flashcardDeckIds'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  quizId?: mongoose.Types.ObjectId | null;
  assets?: {
    lottieIds?: mongoose.Types.ObjectId[];
    imageUrls?: string[];
  };
  prerequisiteLessonIds: mongoose.Types.ObjectId[];
  flashcardDeckIds?: mongoose.Types.ObjectId[];
}

const externalResourceSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ['youtube', 'vimeo', 'loom', 'custom'],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      match: /^https?:\/\//i,
    },
    durationSeconds: {
      type: Number,
      min: 0,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const assetsSchema = new Schema(
  {
    lottieIds: [{ type: Schema.Types.ObjectId, ref: 'LottieAsset' }],
    imageUrls: [{ type: String, trim: true }],
  },
  { _id: false }
);

const CourseLessonSchema = new Schema<ICourseLesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseModule',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    contentType: {
      type: String,
      enum: ['blog', 'standalone', 'video', 'quiz', 'flashcards'],
      required: true,
    },
    blogSlug: {
      type: String,
      trim: true,
      required: function (this: ICourseLesson) {
        return this.contentType === 'blog';
      },
    },
    standaloneContent: {
      type: String,
      required: function (this: ICourseLesson) {
        return this.contentType === 'standalone';
      },
      minlength: 1,
    },
    standaloneFormat: {
      type: String,
      enum: ['mdx', 'novelsh'],
      default: 'mdx',
    },
    externalResource: {
      type: externalResourceSchema,
      required: function (this: ICourseLesson) {
        return this.contentType === 'video';
      },
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseQuiz',
      required: function (this: ICourseLesson) {
        return this.contentType === 'quiz';
      },
    },
    assets: {
      type: assetsSchema,
      default: undefined,
    },
    estimatedDurationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    isPreviewable: {
      type: Boolean,
      default: false,
    },
    progressWeight: {
      type: Number,
      default: 1,
      min: 0,
    },
    prerequisiteLessonIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CourseLesson',
      default: [],
    },
    flashcardDeckIds: {
      type: [Schema.Types.ObjectId],
      ref: 'FlashcardDeck',
      default: [],
    },
    releaseAt: {
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

CourseLessonSchema.index(
  { courseId: 1, moduleId: 1, title: 1 },
  { unique: false }
);
CourseLessonSchema.index({ slug: 1 }, { unique: true, sparse: true });

export type CourseLessonModelType = mongoose.Model<ICourseLesson>;

const CourseLessonModel: CourseLessonModelType =
  mongoose.models.CourseLesson ||
  mongoose.model<ICourseLesson>('CourseLesson', CourseLessonSchema);

export default CourseLessonModel;
