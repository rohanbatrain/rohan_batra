import mongoose, { Schema, Document } from 'mongoose';
import { CourseProgress as CourseProgressType } from '@/types/courses';

export interface ICourseProgress
  extends Omit<
      CourseProgressType,
      | '_id'
      | 'courseId'
      | 'userId'
      | 'enrollmentId'
      | 'completedLessonIds'
      | 'incompleteLessonIds'
      | 'currentLessonId'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  completedLessonIds: mongoose.Types.ObjectId[];
  incompleteLessonIds: mongoose.Types.ObjectId[];
  currentLessonId?: mongoose.Types.ObjectId | null;
}

const moduleProgressSchema = new Schema(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseModule',
      required: true,
    },
    completedWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseLesson',
      required: true,
    },
    attempts: {
      type: [
        {
          score: { type: Number, min: 0, max: 100 },
          passed: { type: Boolean, required: true },
          attemptedAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const checkpointSchema = new Schema(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseLesson',
      required: true,
    },
    cursor: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const streakSchema = new Schema(
  {
    currentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const CourseProgressSchema = new Schema<ICourseProgress>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseEnrollment',
      required: true,
      unique: true,
    },
    completedLessonIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CourseLesson',
      default: [],
    },
    incompleteLessonIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CourseLesson',
      default: [],
    },
    currentLessonId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseLesson',
    },
    moduleProgress: {
      type: [moduleProgressSchema],
      default: [],
    },
    percentageComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      type: streakSchema,
      default: undefined,
    },
    quizAttempts: {
      type: [quizAttemptSchema],
      default: [],
    },
    checkpoints: {
      type: [checkpointSchema],
      default: undefined,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
      required: true,
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

CourseProgressSchema.index({ courseId: 1, userId: 1 }, { unique: true });

CourseProgressSchema.pre<ICourseProgress>('validate', function (next) {
  if (this.percentageComplete < 0 || this.percentageComplete > 100) {
    return next(new Error('percentageComplete must be between 0 and 100.'));
  }

  for (const snapshot of this.moduleProgress) {
    if (snapshot.percentage < 0 || snapshot.percentage > 100) {
      return next(
        new Error('Module progress percentage must be between 0 and 100.')
      );
    }
  }

  next();
});

export type CourseProgressModelType = mongoose.Model<ICourseProgress>;

const CourseProgressModel: CourseProgressModelType =
  mongoose.models.CourseProgress ||
  mongoose.model<ICourseProgress>('CourseProgress', CourseProgressSchema);

export default CourseProgressModel;
