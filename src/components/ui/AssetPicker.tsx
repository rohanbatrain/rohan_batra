'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image, 
  File, 
  Video, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';

// Asset types we support
export type AssetType = 'image' | 'document' | 'video' | 'any';

export interface AssetFile {
  id: string;
  file: File;
  type: AssetType;
  preview?: string;
  uploadProgress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  url?: string;
}

interface AssetPickerProps {
  assetType?: AssetType;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  onAssetsSelected: (assets: AssetFile[]) => void;
  onAssetRemoved?: (assetId: string) => void;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_FORMATS = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
  any: ['*/*']
};

export function AssetPicker({
  assetType = 'any',
  multiple = false,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  acceptedFormats,
  onAssetsSelected,
  onAssetRemoved,
  className = '',
  disabled = false
}: AssetPickerProps) {
  const { user } = useUser();
  const [assets, setAssets] = useState<AssetFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get feature flag context
  const featureFlagContext = {
    userId: user?.id,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    userRole: user?.publicMetadata?.role as string,
    environment: process.env.NODE_ENV,
  };

  // Check if enhanced asset features are enabled
  const enhancedFeaturesEnabled = featureFlags.getFeatureFlags(featureFlagContext);
  const hasAssetIntegration = enhancedFeaturesEnabled['advanced.assetIntegration']?.enabled;
  const hasEnhancedValidation = enhancedFeaturesEnabled['advanced.enhancedValidation']?.enabled;

  // Get accepted file types
  const getAcceptedTypes = () => {
    if (acceptedFormats) return acceptedFormats;
    return DEFAULT_ACCEPTED_FORMATS[assetType] || DEFAULT_ACCEPTED_FORMATS.any;
  };

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxFileSize}MB limit` };
    }

    // Check file type
    const acceptedTypes = getAcceptedTypes();
    if (!acceptedTypes.includes('*/*') && !acceptedTypes.some(type => file.type.match(type))) {
      return { valid: false, error: 'File type not supported' };
    }

    // Check max files limit
    if (!multiple && assets.length >= 1) {
      return { valid: false, error: 'Only one file allowed' };
    }

    if (assets.length >= maxFiles) {
      return { valid: false, error: `Maximum ${maxFiles} files allowed` };
    }

    return { valid: true };
  };

  // Get asset type from file
  const getAssetTypeFromFile = (file: File): AssetType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  // Create preview for file
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Process files
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const newAssets: AssetFile[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        console.warn(`File ${file.name} rejected:`, validation.error);
        continue;
      }

      const preview = await createPreview(file);
      const asset: AssetFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: getAssetTypeFromFile(file),
        preview,
        status: 'pending',
        uploadProgress: 0
      };

      newAssets.push(asset);
    }

    if (newAssets.length > 0) {
      const updatedAssets = multiple ? [...assets, ...newAssets] : newAssets;
      setAssets(updatedAssets);
      onAssetsSelected(updatedAssets);
      
      // Start upload simulation if enhanced features are enabled
      if (hasAssetIntegration) {
        simulateUpload(newAssets);
      }
    }
  };

  // Simulate file upload (in real implementation, this would call the upload API)
  const simulateUpload = async (assetsToUpload: AssetFile[]) => {
    setIsUploading(true);

    for (const asset of assetsToUpload) {
      // Update status to uploading
      setAssets(prev => prev.map(a => 
        a.id === asset.id ? { ...a, status: 'uploading' as const } : a
      ));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setAssets(prev => prev.map(a => 
          a.id === asset.id ? { ...a, uploadProgress: progress } : a
        ));
      }

      // Complete upload
      setAssets(prev => prev.map(a => 
        a.id === asset.id ? { 
          ...a, 
          status: 'completed' as const,
          uploadProgress: 100,
          url: `https://example.com/assets/${asset.file.name}`
        } : a
      ));
    }

    setIsUploading(false);
  };

  // Remove asset
  const removeAsset = (assetId: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    setAssets(updatedAssets);
    onAssetsSelected(updatedAssets);
    onAssetRemoved?.(assetId);
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [assets, multiple, maxFiles]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Get icon for asset type
  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: AssetFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enhanced features indicator */}
      {hasAssetIntegration && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Enhanced asset management enabled
        </div>
      )}

      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={getAcceptedTypes().join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop zone */}
      {hasAssetIntegration ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={disabled ? undefined : openFileDialog}
        >
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">
                {dragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
              </p>
              <p className="text-sm text-gray-500">
                {assetType !== 'any' && `${assetType} files only • `}
                Max {maxFileSize}MB per file
                {multiple && ` • Up to ${maxFiles} files`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Fallback for basic file input
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-gray-500" />
                <Label>Select Files</Label>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                disabled={disabled}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <p className="text-sm text-gray-500">
                {assetType !== 'any' && `${assetType} files only • `}
                Max {maxFileSize}MB per file
                {multiple && ` • Up to ${maxFiles} files`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected files list */}
      {assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Selected Files ({assets.length}/{multiple ? maxFiles : 1})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {/* Preview or icon */}
                <div className="flex-shrink-0">
                  {asset.preview ? (
                    <img
                      src={asset.preview}
                      alt={asset.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded">
                      {getAssetIcon(asset.type)}
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {asset.file.name}
                    </p>
                    {getStatusIcon(asset.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(asset.file.size)}
                    {asset.url && (
                      <span className="ml-2 text-green-600">Uploaded</span>
                    )}
                  </p>
                  
                  {/* Upload progress */}
                  {asset.status === 'uploading' && hasAssetIntegration && (
                    <div className="mt-2">
                      <Progress value={asset.uploadProgress || 0} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {asset.uploadProgress || 0}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Error message */}
                  {asset.status === 'error' && asset.errorMessage && (
                    <p className="text-xs text-red-500 mt-1">
                      {asset.errorMessage}
                    </p>
                  )}
                </div>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAsset(asset.id)}
                  disabled={disabled || asset.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Validation info */}
      {hasEnhancedValidation && assets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Size:</span>
                <span className="ml-2">
                  {formatFileSize(assets.reduce((total, asset) => total + asset.file.size, 0))}
                </span>
              </div>
              <div>
                <span className="font-medium">Files:</span>
                <span className="ml-2">{assets.length}</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">
                  {assets.every(a => a.status === 'completed') ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      All uploaded
                    </Badge>
                  ) : isUploading ? (
                    <Badge variant="secondary">Uploading...</Badge>
                  ) : (
                    <Badge variant="outline">Ready</Badge>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}