import Asset from '@/models/Asset';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getAssetType,
} from '@/lib/cloudinary';
import { AssetCacheService } from '@/lib/cache-service';
import { connectToMongoDB } from '@/lib/mongodb';

export class AssetService {
  static async uploadAsset(
    fileUrl: string,
    metadata: {
      filename: string;
      originalFilename: string;
      mimeType: string;
      size: number;
      uploadedBy: string;
      description?: string;
      tags?: string[];
      folder?: string;
    }
  ) {
    await connectToMongoDB();

    try {
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(fileUrl, {
        folder: metadata.folder || 'portfolio',
        filename: metadata.filename,
        tags: metadata.tags,
      });

      // Create asset record
      const asset = new Asset({
        filename: metadata.filename,
        originalFilename: metadata.originalFilename,
        url: cloudinaryResult.url,
        cloudinaryId: cloudinaryResult.id,
        type: getAssetType(metadata.filename),
        mimeType: metadata.mimeType,
        size: metadata.size,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        description: metadata.description,
        tags: metadata.tags || [],
        folder: metadata.folder || 'portfolio',
        uploadedBy: metadata.uploadedBy,
        version: cloudinaryResult.version,
      });

      const savedAsset = await asset.save();

      // Invalidate cache
      await AssetCacheService.invalidateAllAssets();

      return savedAsset;
    } catch (error) {
      console.error('Asset upload error:', error);
      throw new Error('Failed to upload asset');
    }
  }

  static async getAssets(
    page = 1,
    limit = 20,
    filters: {
      type?: string;
      folder?: string;
      uploadedBy?: string;
      search?: string;
      isPublic?: boolean;
    } = {}
  ) {
    await connectToMongoDB();

    try {
      // Check cache first
      // const cacheKey = `assets:${page}:${limit}:${JSON.stringify(filters)}`;
      const cached = await AssetCacheService.getAssets(page, limit);
      if (cached) return cached;

      const query: Record<string, unknown> = {};

      if (filters.type) query.type = filters.type;
      if (filters.folder) query.folder = filters.folder;
      if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy;
      if (filters.isPublic !== undefined) query.isPublic = filters.isPublic;
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const skip = (page - 1) * limit;

      const [assets, total] = await Promise.all([
        Asset.find(query)
          .populate('uploadedBy', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Asset.countDocuments(query),
      ]);

      const result = {
        assets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Cache result
      await AssetCacheService.setAssets(page, limit, result);

      return result;
    } catch (error) {
      console.error('Get assets error:', error);
      throw new Error('Failed to get assets');
    }
  }

  static async getAssetById(id: string) {
    await connectToMongoDB();

    try {
      // Check cache first
      const cached = await AssetCacheService.getAsset(id);
      if (cached) return cached;

      const asset = await Asset.findById(id)
        .populate('uploadedBy', 'firstName lastName email')
        .lean();

      if (!asset) {
        throw new Error('Asset not found');
      }

      // Cache result
      await AssetCacheService.setAsset(id, asset);

      return asset;
    } catch (error) {
      console.error('Get asset error:', error);
      throw new Error('Failed to get asset');
    }
  }

  static async updateAsset(
    id: string,
    updates: {
      filename?: string;
      description?: string;
      altText?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ) {
    await connectToMongoDB();

    try {
      const asset = await Asset.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('uploadedBy', 'firstName lastName email');

      if (!asset) {
        throw new Error('Asset not found');
      }

      // Invalidate cache
      await AssetCacheService.invalidateAsset(id);
      await AssetCacheService.invalidateAllAssets();

      return asset;
    } catch (error) {
      console.error('Update asset error:', error);
      throw new Error('Failed to update asset');
    }
  }

  static async deleteAsset(id: string) {
    await connectToMongoDB();

    try {
      const asset = await Asset.findById(id);
      if (!asset) {
        throw new Error('Asset not found');
      }

      // Check if asset can be deleted
      // if (!asset.canDelete()) {
      //   throw new Error('Asset is in use and cannot be deleted');
      // }

      // Delete from Cloudinary
      await deleteFromCloudinary(
        asset.cloudinaryId,
        asset.type as 'image' | 'video' | 'raw'
      );

      // Delete from database
      await Asset.findByIdAndDelete(id);

      // Invalidate cache
      await AssetCacheService.invalidateAsset(id);
      await AssetCacheService.invalidateAllAssets();

      return true;
    } catch (error) {
      console.error('Delete asset error:', error);
      throw new Error('Failed to delete asset');
    }
  }

  static async incrementUsage(id: string) {
    await connectToMongoDB();

    try {
      const asset = await Asset.incrementUsage(id);
      if (asset) {
        await AssetCacheService.invalidateAsset(id);
      }
      return asset;
    } catch (error) {
      console.error('Increment usage error:', error);
      return null;
    }
  }

  static async getUsageStats() {
    await connectToMongoDB();

    try {
      return Asset.getUsageStats();
    } catch (error) {
      console.error('Get usage stats error:', error);
      throw new Error('Failed to get usage statistics');
    }
  }
}
