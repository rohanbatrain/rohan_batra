import mongoose, { Schema, Document } from 'mongoose';
import { LottieAsset } from '@/types/lottie-asset';

export interface ILottieAsset
  extends Omit<LottieAsset, '_id' | 'uploadedBy'>,
    Document {
  _id: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
}

const LottieAssetSchema = new Schema<ILottieAsset>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['application/json', 'application/octet-stream'],
    },
    width: {
      type: Number,
      min: 1,
    },
    height: {
      type: Number,
      min: 1,
    },
    frameRate: {
      type: Number,
      min: 1,
      max: 120,
    },
    duration: {
      type: Number,
      min: 0,
    },
    loop: {
      type: Boolean,
      default: true,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      required: true,
      enum: ['hero', 'section', 'interactive', 'background', 'icon', 'other'],
      default: 'other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Soft delete support
    deletedAt: {
      type: Date,
      required: false,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: Document, ret: { [key: string]: unknown }) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
LottieAssetSchema.index({ name: 1 });
LottieAssetSchema.index({ category: 1 });
LottieAssetSchema.index({ isActive: 1 });
LottieAssetSchema.index({ uploadedBy: 1 });
LottieAssetSchema.index({ createdAt: -1 });
LottieAssetSchema.index({ updatedAt: -1 });

// Text index for search functionality
LottieAssetSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  fileName: 'text',
});

// Compound indexes for common queries
LottieAssetSchema.index({ category: 1, isActive: 1 });
LottieAssetSchema.index({ uploadedBy: 1, createdAt: -1 });
LottieAssetSchema.index({ isActive: 1, createdAt: -1 });

// Pre-save middleware for validation
LottieAssetSchema.pre<ILottieAsset>('save', function (next) {
  // Ensure file extension is valid for Lottie files
  if (
    !this.fileName.toLowerCase().endsWith('.json') &&
    !this.fileName.toLowerCase().endsWith('.lottie')
  ) {
    return next(
      new Error(
        'Invalid file extension. Only .json and .lottie files are allowed.'
      )
    );
  }
  next();
});

// Instance method to get file URL
LottieAssetSchema.methods.getFileUrl = function (): string {
  return `/api/assets/lottie/${this._id}`;
};

// Instance method to check if asset is optimized
LottieAssetSchema.methods.isOptimized = function (): boolean {
  // Consider optimized if file size is reasonable (< 500KB)
  return this.fileSize < 500 * 1024;
};

// Instance method to get asset metadata
LottieAssetSchema.methods.getMetadata = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    fileName: this.fileName,
    fileSize: this.fileSize,
    dimensions:
      this.width && this.height ? `${this.width}x${this.height}` : null,
    frameRate: this.frameRate,
    duration: this.duration,
    category: this.category,
    tags: this.tags,
    isActive: this.isActive,
    uploadedAt: this.createdAt,
  };
};

// Static method to find active assets by category
LottieAssetSchema.statics.findActiveByCategory = function (category: string) {
  return this.find({
    category,
    isActive: true,
  }).sort({ createdAt: -1 });
};

// Static method to find assets by tags
LottieAssetSchema.statics.findByTags = function (tags: string[]) {
  return this.find({
    tags: { $in: tags.map(tag => tag.toLowerCase()) },
    isActive: true,
  }).sort({ createdAt: -1 });
};

// Static method to search assets
LottieAssetSchema.statics.search = function (query: string, limit = 20) {
  return this.find(
    {
      $text: { $search: query },
      isActive: true,
    },
    {
      score: { $meta: 'textScore' },
    }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

// Static method to get assets by uploader
LottieAssetSchema.statics.findByUploader = function (userId: string) {
  return this.find({
    uploadedBy: new mongoose.Types.ObjectId(userId),
  }).sort({ createdAt: -1 });
};

// Static method to get asset statistics
LottieAssetSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAssets: { $sum: 1 },
        activeAssets: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
        totalSize: { $sum: '$fileSize' },
        categories: {
          $addToSet: '$category',
        },
        avgFileSize: { $avg: '$fileSize' },
      },
    },
  ]);
};

// Static method to deactivate asset
LottieAssetSchema.statics.deactivate = function (assetId: string) {
  return this.findByIdAndUpdate(
    new mongoose.Types.ObjectId(assetId),
    { isActive: false },
    { new: true }
  );
};

const LottieAssetModel =
  mongoose.models.LottieAsset ||
  mongoose.model<ILottieAsset>('LottieAsset', LottieAssetSchema);

export default LottieAssetModel;
