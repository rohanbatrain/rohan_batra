import mongoose, { Schema, Document } from 'mongoose';
import { TryHackMeRoom } from '@/types/tryhackme';

export interface ITryHackMeRoom extends Omit<TryHackMeRoom, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const TryHackMeRoomSchema = new Schema<ITryHackMeRoom>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    thmRoomId: { type: String, trim: true, index: true },
    slug: { type: String, trim: true, lowercase: true },
    link: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'insane', 'unknown'],
      default: 'unknown',
    },
    points: { type: Number, default: 0 },
    completedAt: { type: Date },
    tags: [{ type: String, trim: true, lowercase: true }],
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

TryHackMeRoomSchema.pre<ITryHackMeRoom>('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

TryHackMeRoomSchema.index({ completedAt: -1 });
TryHackMeRoomSchema.index({ difficulty: 1, completedAt: -1 });

const TryHackMeRoomModel =
  mongoose.models.TryHackMeRoom ||
  mongoose.model<ITryHackMeRoom>('TryHackMeRoom', TryHackMeRoomSchema);

export default TryHackMeRoomModel;
