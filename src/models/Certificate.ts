import mongoose, { Schema, Document } from 'mongoose';
import { Certificate as CertificateType } from '@/types/courses';

export interface ICertificate
  extends Omit<
      CertificateType,
      '_id' | 'courseId' | 'userId' | 'enrollmentId' | 'shareable' | 'metadata'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  shareable?: {
    title?: string | null;
    description?: string | null;
    ogImage?: string | null;
  };
  metadata?: Record<string, unknown>;
}

const shareableSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    ogImage: { type: String, trim: true },
  },
  { _id: false }
);

const CertificateSchema = new Schema<ICertificate>(
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
    providerKey: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'issued', 'failed', 'revoked'],
      default: 'pending',
    },
    issuedAt: {
      type: Date,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      trim: true,
    },
    pdfUrl: {
      type: String,
      trim: true,
      required: [
        function (this: ICertificate) {
          return this.status === 'issued';
        },
        'Issued certificates require pdfUrl and pngUrl',
      ],
    },
    pngUrl: {
      type: String,
      trim: true,
      required: [
        function (this: ICertificate) {
          return this.status === 'issued';
        },
        'Issued certificates require pdfUrl and pngUrl',
      ],
    },
    verificationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    sbdReferenceId: {
      type: String,
      trim: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shareable: {
      type: shareableSchema,
      default: undefined,
    },
    metadata: {
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

CertificateSchema.index({ courseId: 1, userId: 1 });

CertificateSchema.pre<ICertificate>('validate', function (next) {
  if (this.status === 'issued' && !this.issuedAt) {
    this.issuedAt = new Date();
  }

  next();
});

export type CertificateModelType = mongoose.Model<ICertificate>;

const CertificateModel: CertificateModelType =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default CertificateModel;
