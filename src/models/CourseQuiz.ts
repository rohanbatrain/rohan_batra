import mongoose, { Schema, Document } from 'mongoose';
import { CourseQuiz as CourseQuizType } from '@/types/courses';

export interface ICourseQuiz
  extends Omit<CourseQuizType, '_id' | 'courseId' | 'moduleId' | 'lessonId'>,
    Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
}

const questionSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'free_text'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [
        {
          value: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true },
        },
      ],
      default: undefined,
      required: [
        function (this: { type: string }) {
          return ['single_choice', 'multiple_choice'].includes(this.type);
        },
        'Choice-based questions require options while free-text questions must omit options',
      ],
      validate: {
        validator(
          this: { type: string },
          value: Array<{ value: string; label: string }> | undefined
        ) {
          const requiresOptions = ['single_choice', 'multiple_choice'].includes(
            this.type
          );

          if (requiresOptions) {
            return Array.isArray(value) && value.length > 0;
          }

          return !value || value.length === 0;
        },
        message:
          'Choice-based questions require options while free-text questions must omit options',
      },
    },
    correctAnswers: {
      type: [String],
      required: true,
      validate: {
        validator: (answers: string[]) =>
          Array.isArray(answers) && answers.length > 0,
        message: 'Each question must include at least one correct answer.',
      },
    },
    explanation: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const CourseQuizSchema = new Schema<ICourseQuiz>(
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
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseLesson',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },
    timeLimitSeconds: {
      type: Number,
      min: 0,
    },
    attemptLimit: {
      type: Number,
      min: 1,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (questions: unknown[]) =>
          Array.isArray(questions) && questions.length > 0,
        message: 'Quiz must contain at least one question.',
      },
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

CourseQuizSchema.index({ courseId: 1, moduleId: 1 });

export type CourseQuizModelType = mongoose.Model<ICourseQuiz>;

const CourseQuizModel: CourseQuizModelType =
  (mongoose.models.CourseQuiz as CourseQuizModelType) ||
  mongoose.model<ICourseQuiz>('CourseQuiz', CourseQuizSchema);

export default CourseQuizModel;
