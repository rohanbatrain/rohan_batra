import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssetLink extends Document {
  type: 'image' | 'video' | 'other';
  name: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssetLinkSchema = new Schema<IAssetLink>(
  {
    type: { type: String, enum: ['image', 'video', 'other'], required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    mimeType: { type: String },
    size: { type: Number },
    width: { type: Number },
    height: { type: Number },
  },
  { timestamps: true }
);

const AssetLink: Model<IAssetLink> =
  (mongoose.models.AssetLink as Model<IAssetLink>) ||
  mongoose.model<IAssetLink>('AssetLink', AssetLinkSchema);

export default AssetLink;
