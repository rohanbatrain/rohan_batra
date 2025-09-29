import mongoose, { Schema, Document } from 'mongoose';
import { CourseModule as CourseModuleType } from '@/types/courses';

export interface ICourseModule
  extends Omit<
      CourseModuleType,
      '_id' | 'courseId' | 'lessonIds' | 'flashcardDeckIds'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonIds: mongoose.Types.ObjectId[];
  flashcardDeckIds?: mongoose.Types.ObjectId[];
}

const CourseModuleSchema = new Schema<ICourseModule>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDurationMinutes: {
      type: Number,
      min: 0,
    },
    lessonIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CourseLesson',
      default: [],
    },
    flashcardDeckIds: {
      type: [Schema.Types.ObjectId],
      ref: 'FlashcardDeck',
      default: [],
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

CourseModuleSchema.index({ courseId: 1, order: 1 }, { unique: true });

CourseModuleSchema.pre<ICourseModule>('validate', function (next) {
  if (this.order < 0) {
    return next(new Error('Module order cannot be negative.'));
  }

  if (this.lessonIds.some(id => !mongoose.isValidObjectId(id))) {
    return next(new Error('Module lessonIds must be valid ObjectIds.'));
  }

  next();
});

export type CourseModuleModelType = mongoose.Model<ICourseModule>;

const CourseModuleModel: CourseModuleModelType =
  mongoose.models.CourseModule ||
  mongoose.model<ICourseModule>('CourseModule', CourseModuleSchema);

export default CourseModuleModel;
