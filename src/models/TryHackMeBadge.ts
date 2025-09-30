import mongoose, { Schema, Document } from 'mongoose';
import { TryHackMeBadge } from '@/types/tryhackme';

export interface ITryHackMeBadge extends Omit<TryHackMeBadge, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const TryHackMeBadgeSchema = new Schema<ITryHackMeBadge>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    thmBadgeId: { type: String, trim: true, index: true },
    imageUrl: { type: String, trim: true },
    link: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    earnedAt: { type: Date },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const r = ret as any;
        r.id = r._id?.toString();
        delete r._id;
        delete r.__v;
        return r;
      },
    },
  }
);

TryHackMeBadgeSchema.index({ earnedAt: -1 });
TryHackMeBadgeSchema.index({ visibility: 1, earnedAt: -1 });

const TryHackMeBadgeModel =
  mongoose.models.TryHackMeBadge ||
  mongoose.model<ITryHackMeBadge>('TryHackMeBadge', TryHackMeBadgeSchema);

export default TryHackMeBadgeModel;
