import mongoose, { Schema, Document } from 'mongoose';
import { DashboardRecommendationItem } from '@/types/dashboard';

export interface IDashboardRecommendation extends Document {
  userId?: mongoose.Types.ObjectId | null;
  context: 'course' | 'blog' | 'book';
  sourceId: string;
  recommendations: DashboardRecommendationItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationItemSchema = new Schema<DashboardRecommendationItem>(
  {
    type: {
      type: String,
      enum: ['course', 'blog', 'book'],
      required: true,
    },
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const DashboardRecommendationSchema = new Schema<IDashboardRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    context: {
      type: String,
      enum: ['course', 'blog', 'book'],
      required: true,
      index: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
    },
    recommendations: {
      type: [recommendationItemSchema],
      required: true,
      default: [],
    },
    expiresAt: {
      type: Date,
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

DashboardRecommendationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type DashboardRecommendationModelType =
  mongoose.Model<IDashboardRecommendation>;

const DashboardRecommendationModel: DashboardRecommendationModelType =
  mongoose.models.DashboardRecommendation ||
  mongoose.model<IDashboardRecommendation>(
    'DashboardRecommendation',
    DashboardRecommendationSchema
  );

export default DashboardRecommendationModel;
