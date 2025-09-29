import mongoose, { Schema, Document } from 'mongoose';
import { CourseEnrollment as CourseEnrollmentType } from '@/types/courses';

export interface ICourseEnrollment
  extends Omit<
      CourseEnrollmentType,
      '_id' | 'courseId' | 'userId' | 'certificateId'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  certificateId?: mongoose.Types.ObjectId | null;
}

const CourseEnrollmentSchema = new Schema<ICourseEnrollment>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'withdrawn'],
      default: 'enrolled',
    },
    origin: {
      type: String,
      enum: ['self_enroll', 'admin_grant', 'auto_bundle'],
      default: 'self_enroll',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
      validate: {
        validator(this: ICourseEnrollment, value: Date | undefined) {
          if (!value) {
            return true;
          }

          return this.status === 'completed';
        },
        message: 'completedAt can only be set when status is completed',
      },
    },
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
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

CourseEnrollmentSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export type CourseEnrollmentModelType = mongoose.Model<ICourseEnrollment>;

const CourseEnrollmentModel: CourseEnrollmentModelType =
  mongoose.models.CourseEnrollment ||
  mongoose.model<ICourseEnrollment>('CourseEnrollment', CourseEnrollmentSchema);

export default CourseEnrollmentModel;
