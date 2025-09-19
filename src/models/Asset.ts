import mongoose, { Schema, Document } from 'mongoose';

export type AssetType = 'image' | 'video' | 'document' | 'lottie' | 'other';

export interface FindAssetOptions {
  category?: string;
  tags?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IAsset extends Document {
  _id: string;
  filename: string;
  originalFilename: string;
  url: string;
  cloudinaryId?: string;
  driveFileId?: string;
  type: 'image' | 'video' | 'document' | 'lottie' | 'other';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // for videos
  description?: string;
  altText?: string;
  tags: string[];
  folder: string;
  version: number;
  isPublic: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  usageCount: number;
  lastUsed?: Date;
  metadata: Record<string, unknown>;
  storageBackend: 'cloudinary' | 'google_drive';
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    filename: {
      type: String,
      required: true,
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    cloudinaryId: {
      type: String,
      required: function (this: any) {
        return this.storageBackend === 'cloudinary';
      },
      unique: true,
      sparse: true,
      index: true,
    },
    driveFileId: {
      type: String,
      required: function (this: any) {
        return this.storageBackend === 'google_drive';
      },
      unique: true,
      sparse: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'lottie', 'other'],
      required: true,
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    width: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    duration: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    altText: {
      type: String,
      maxlength: 200,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    folder: {
      type: String,
      required: true,
      default: 'portfolio',
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsed: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    storageBackend: {
      type: String,
      enum: ['cloudinary', 'google_drive'],
      required: true,
      default: 'cloudinary',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
AssetSchema.index({ createdAt: -1 });
AssetSchema.index({ uploadedBy: 1, createdAt: -1 });
AssetSchema.index({ type: 1, createdAt: -1 });
AssetSchema.index({ folder: 1, createdAt: -1 });
AssetSchema.index({ tags: 1, createdAt: -1 });
AssetSchema.index({ isPublic: 1, createdAt: -1 });
AssetSchema.index({ usageCount: -1 });
AssetSchema.index({ storageBackend: 1, createdAt: -1 });

// Text search index
AssetSchema.index({
  filename: 'text',
  originalFilename: 'text',
  description: 'text',
  altText: 'text',
  tags: 'text',
});

// Virtual for formatted size
AssetSchema.virtual('formattedSize').get(function () {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for usage statistics
AssetSchema.virtual('isActive').get(function () {
  if (!this.lastUsed) return false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.lastUsed > thirtyDaysAgo;
});

// Pre-save middleware
AssetSchema.pre('save', function (next) {
  if (this.isModified('usageCount') && this.usageCount > 0) {
    this.lastUsed = new Date();
  }
  next();
});

// Static methods
AssetSchema.statics = {
  /**
   * Find assets by type with pagination
   */
  async findByType(type: AssetType, options: FindAssetOptions = {}) {
    const query: Record<string, unknown> = { type };

    if (options.category) {
      query.category = options.category;
    }

    if (options.tags && options.tags.length > 0) {
      query.tags = { $in: options.tags };
    }

    if (options.search) {
      query.$or = [
        { filename: { $regex: options.search, $options: 'i' } },
        { title: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    if (options.sortBy) {
      sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const skip = ((options.page || 1) - 1) * (options.limit || 10);

    return this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(options.limit || 10)
      .populate('uploadedBy', 'name email');
  },

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgUsage: { $avg: '$usageCount' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const totalStats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgUsage: { $avg: '$usageCount' },
        },
      },
    ]);

    return {
      byType: stats,
      total: totalStats[0] || {
        totalAssets: 0,
        totalSize: 0,
        avgUsage: 0,
      },
    };
  },

  /**
   * Increment usage count
   */
  async incrementUsage(assetId: string) {
    return this.findByIdAndUpdate(
      assetId,
      {
        $inc: { usageCount: 1 },
        $set: { lastUsed: new Date() },
      },
      { new: true }
    );
  },
};

// Instance methods
AssetSchema.methods = {
  /**
   * Get optimized URL for different sizes
   */
  getOptimizedUrl(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    } = {}
  ) {
    if (this.type !== 'image') return this.url;

    // Implement Cloudinary transformation logic here
    // This would use the cloudinary utility functions
    // For now, just return the original URL
    return this.url;
  },

  /**
   * Check if asset can be deleted
   */
  canDelete() {
    return this.usageCount === 0;
  },

  /**
   * Get asset info for API response
   */
  toAPIResponse() {
    return {
      _id: this._id,
      filename: this.filename,
      originalFilename: this.originalFilename,
      url: this.url,
      type: this.type,
      mimeType: this.mimeType,
      size: this.size,
      formattedSize: this.formattedSize,
      width: this.width,
      height: this.height,
      duration: this.duration,
      description: this.description,
      altText: this.altText,
      tags: this.tags,
      folder: this.folder,
      isPublic: this.isPublic,
      usageCount: this.usageCount,
      isActive: this.isActive,
      uploadedBy: this.uploadedBy,
      storageBackend: this.storageBackend,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

export interface IAssetModel extends mongoose.Model<IAsset> {
  findByType(type: AssetType, options?: FindAssetOptions): Promise<IAsset[]>;
  getUsageStats(): Promise<{
    byType: Array<{
      _id: string;
      count: number;
      totalSize: number;
      avgUsage: number;
    }>;
    total: { totalAssets: number; totalSize: number; avgUsage: number };
  }>;
  incrementUsage(assetId: string): Promise<IAsset | null>;
}

const Asset = (mongoose.models.Asset ||
  mongoose.model<IAsset>('Asset', AssetSchema)) as unknown as IAssetModel;

export default Asset;
