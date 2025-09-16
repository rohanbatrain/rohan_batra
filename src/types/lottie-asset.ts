export interface LottieAsset {
  _id?: string;
  name: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  frameRate?: number;
  duration?: number;
  loop?: boolean;
  autoplay?: boolean;
  tags: string[];
  category: string;
  isActive: boolean;
  uploadedBy: string; // User ID
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LottieAssetWithUploader
  extends Omit<LottieAsset, 'uploadedBy'> {
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface LottieAssetSummary {
  _id: string;
  name: string;
  fileName: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
}
