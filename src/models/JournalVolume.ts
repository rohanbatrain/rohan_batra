import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalVolume extends Document {
  _id: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  backCoverImage?: string;
  status: 'draft' | 'published' | 'archived';
  isPrivate: boolean;
  publishedAt?: Date;
  displayOrder?: number;
  tags: string[];
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JournalVolumeSchema = new Schema<IJournalVolume>(
  {
    characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: { type: String },
    coverImage: { type: String },
    backCoverImage: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isPrivate: { type: Boolean, default: false },
    publishedAt: { type: Date },
    displayOrder: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = ret as any;
        result.id = result._id?.toString();
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

JournalVolumeSchema.index({ characterId: 1 });
JournalVolumeSchema.index({ status: 1, publishedAt: -1 });
JournalVolumeSchema.index({ isPrivate: 1 });
JournalVolumeSchema.index({ characterId: 1, displayOrder: 1 });

const JournalVolumeModel =
  mongoose.models.JournalVolume ||
  mongoose.model<IJournalVolume>('JournalVolume', JournalVolumeSchema);

export default JournalVolumeModel;
