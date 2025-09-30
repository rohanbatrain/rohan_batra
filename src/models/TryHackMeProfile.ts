import mongoose, { Schema, Document } from 'mongoose';
import { TryHackMeProfile } from '@/types/tryhackme';

export interface ITryHackMeProfile
  extends Omit<TryHackMeProfile, '_id'>,
    Document {
  _id: mongoose.Types.ObjectId;
}

const TryHackMeProfileSchema = new Schema<ITryHackMeProfile>(
  {
    username: { type: String, required: true, trim: true, lowercase: true, unique: true },
    displayName: { type: String, trim: true },
    rank: { type: String, trim: true },
    points: { type: Number, default: 0 },
    badgesCount: { type: Number, default: 0 },
    roomsCount: { type: Number, default: 0 },
    profileUrl: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    lastSyncedAt: { type: Date },
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

TryHackMeProfileSchema.index({ username: 1 });

const TryHackMeProfileModel =
  mongoose.models.TryHackMeProfile ||
  mongoose.model<ITryHackMeProfile>('TryHackMeProfile', TryHackMeProfileSchema);

export default TryHackMeProfileModel;
