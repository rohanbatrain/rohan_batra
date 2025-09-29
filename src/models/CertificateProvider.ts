import mongoose, { Schema, Document } from 'mongoose';
import { CertificateProvider as CertificateProviderType } from '@/types/courses';

export interface ICertificateProvider
  extends Omit<CertificateProviderType, '_id'>,
    Document {
  _id: mongoose.Types.ObjectId;
}

const brandingSchema = new Schema(
  {
    logoUrl: { type: String, trim: true },
    accentColor: { type: String, trim: true },
    signatureUrl: { type: String, trim: true },
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    email: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    version: { type: Number, required: true, default: 1 },
    format: {
      type: String,
      enum: ['landscape', 'portrait'],
      default: 'landscape',
    },
    primaryFont: { type: String, trim: true },
    backgroundAssetId: { type: Schema.Types.ObjectId, ref: 'Asset' },
  },
  { _id: false }
);

const CertificateProviderSchema = new Schema<ICertificateProvider>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['internal', 'sbd', 'external'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    branding: {
      type: brandingSchema,
      default: undefined,
    },
    contact: {
      type: contactSchema,
      default: undefined,
    },
    template: {
      type: templateSchema,
      default: undefined,
    },
    delivery: {
      type: Schema.Types.Mixed,
      default: {},
    },
    verificationBaseUrl: {
      type: String,
      trim: true,
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

CertificateProviderSchema.pre<ICertificateProvider>(
  'validate',
  function (next) {
    if (this.type === 'sbd') {
      const hasEndpoint = typeof this.delivery?.issueEndpoint === 'string';
      const hasApiKey = typeof this.delivery?.apiKey === 'string';

      if (!hasEndpoint || !hasApiKey) {
        return next(
          new Error(
            'SBD providers must include delivery.issueEndpoint and delivery.apiKey.'
          )
        );
      }
    }

    next();
  }
);

export type CertificateProviderModelType = mongoose.Model<ICertificateProvider>;

const CertificateProviderModel: CertificateProviderModelType =
  mongoose.models.CertificateProvider ||
  mongoose.model<ICertificateProvider>(
    'CertificateProvider',
    CertificateProviderSchema
  );

export default CertificateProviderModel;
