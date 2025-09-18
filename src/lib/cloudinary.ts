import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
  file: string,
  options: {
    folder?: string;
    filename?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: Record<string, unknown>;
    tags?: string[];
  } = {}
) {
  try {
    const {
      folder = process.env.CLOUDINARY_FOLDER || 'portfolio',
      filename,
      resource_type = 'auto',
      transformation,
      tags = [],
    } = options;

    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type,
      tags: ['portfolio', ...tags],
      unique_filename: true,
      overwrite: false,
    };

    if (filename) {
      uploadOptions.public_id = `${folder}/${filename}`;
    }

    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      version: result.version,
      type: result.resource_type,
      tags: result.tags,
      created: new Date(result.created_at),
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(
      `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Get file info from Cloudinary
 */
export async function getCloudinaryAssetInfo(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'auto',
    });

    return {
      id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      version: result.version,
      type: result.resource_type,
      tags: result.tags,
      created: new Date(result.created_at),
    };
  } catch (error) {
    console.error('Cloudinary asset info error:', error);
    return null;
  }
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'crop' | 'scale';
    gravity?: 'center' | 'face' | 'auto';
  } = {}
) {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  const transformations = [];

  if (width || height) {
    let resize = `c_${crop}`;
    if (width) resize += `,w_${width}`;
    if (height) resize += `,h_${height}`;
    if (gravity && crop !== 'scale') resize += `,g_${gravity}`;
    transformations.push(resize);
  }

  if (quality) {
    transformations.push(`q_${quality}`);
  }

  if (format) {
    transformations.push(`f_${format}`);
  }

  const transformationString = transformations.join('/');
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  return transformationString
    ? `${baseUrl}/${transformationString}/${publicId}`
    : `${baseUrl}/${publicId}`;
}

/**
 * Upload multiple files
 */
export async function uploadMultipleToCloudinary(
  files: Array<{ file: string; filename?: string }>,
  options: {
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    tags?: string[];
  } = {}
) {
  try {
    const uploadPromises = files.map(({ file, filename }) =>
      uploadToCloudinary(file, { ...options, filename })
    );

    const results = await Promise.allSettled(uploadPromises);

    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
}

/**
 * Search assets in Cloudinary
 */
interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
  resource_type: string;
  tags: string[];
  created_at: string;
}

export async function searchCloudinaryAssets(
  query: string,
  options: {
    max_results?: number;
    next_cursor?: string;
    tags?: string[];
    resource_type?: string;
  } = {}
) {
  try {
    const { max_results = 20, next_cursor, tags, resource_type } = options;

    let searchQuery = query;
    if (tags?.length) {
      searchQuery += ` AND tags:(${tags.join(' OR ')})`;
    }
    if (resource_type) {
      searchQuery += ` AND resource_type:${resource_type}`;
    }

    const result = await cloudinary.search
      .expression(searchQuery)
      .max_results(max_results)
      .next_cursor(next_cursor || undefined)
      .execute();

    return {
      assets: result.resources.map((asset: CloudinaryAsset) => ({
        id: asset.public_id,
        url: asset.secure_url,
        width: asset.width,
        height: asset.height,
        format: asset.format,
        size: asset.bytes,
        type: asset.resource_type,
        tags: asset.tags,
        created: new Date(asset.created_at),
      })),
      next_cursor: result.next_cursor,
      total_count: result.total_count,
    };
  } catch (error) {
    console.error('Cloudinary search error:', error);
    throw error;
  }
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Asset type detection
 */
export function getAssetType(
  filename: string
): 'image' | 'video' | 'document' | 'lottie' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (!ext) return 'other';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'];
  const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const lottieExts = ['json', 'lottie'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (documentExts.includes(ext)) return 'document';
  if (lottieExts.includes(ext)) return 'lottie';

  return 'other';
}

export { cloudinary };
