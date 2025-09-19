'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FolderOpen,
  Upload,
  Trash2,
  Download,
  Search,
  FileImage,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/nextjs';

interface LottieAsset {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  cloudinaryPublicId?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    frames?: number;
  };
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AssetsManagementPage() {
  const [assets, setAssets] = useState<LottieAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();

  const fetchAssets = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/lottie?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to fetch assets';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      const assetsArray = (result?.data?.assets ?? result?.assets ?? []) as LottieAsset[];
      setAssets(Array.isArray(assetsArray) ? assetsArray : []);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to fetch assets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, searchTerm, toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lottie/${assetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to delete asset';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      fetchAssets();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete asset',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      toast({
        title: 'Error',
        description: 'Please select a Lottie JSON file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace('.json', ''));
      formData.append('description', `Uploaded Lottie animation: ${file.name}`);

      const response = await fetch('/api/admin/lottie', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to upload asset';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      fetchAssets();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to upload asset',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAssets = assets.filter(
    asset =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.description &&
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isLoaded || !isSignedIn) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <FolderOpen className='h-8 w-8' />
            Assets Management
          </h1>
          <p className='text-gray-600 mt-2'>
            Manage Lottie animations and media assets
          </p>
        </div>

        <div className='flex gap-2'>
          <Button onClick={fetchAssets} variant='outline'>
            <Search className='h-4 w-4 mr-2' />
            Refresh
          </Button>

          <label htmlFor='file-upload'>
            <Button disabled={uploading} asChild>
              <span>
                <Upload className='h-4 w-4 mr-2' />
                {uploading ? 'Uploading...' : 'Upload Asset'}
              </span>
            </Button>
          </label>
          <input
            id='file-upload'
            type='file'
            accept='.json,application/json'
            onChange={handleFileUpload}
            className='hidden'
          />
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{assets.length}</p>
            <p className='text-sm text-gray-600'>Total Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>
              {formatFileSize(
                assets.reduce((total, asset) => total + asset.fileSize, 0)
              )}
            </p>
            <p className='text-sm text-gray-600'>Total Size</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>
              {assets.reduce((total, asset) => total + asset.usageCount, 0)}
            </p>
            <p className='text-sm text-gray-600'>Total Usage</p>
          </CardContent>
        </Card>
      </div>

      <div className='flex gap-2 mb-6'>
        <Input
          placeholder='Search assets...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='w-64'
        />
      </div>

      {loading ? (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredAssets.map(asset => (
            <Card key={asset.id}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <FileImage className='h-5 w-5' />
                  {asset.name}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {asset.description && (
                  <p className='text-sm text-gray-600'>{asset.description}</p>
                )}

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>File:</span>
                    <span className='font-mono'>{asset.fileName}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Size:</span>
                    <span>{formatFileSize(asset.fileSize)}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Usage:</span>
                    <Badge variant='outline'>{asset.usageCount} times</Badge>
                  </div>
                  {asset.metadata && (
                    <>
                      {asset.metadata.width && asset.metadata.height && (
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-500'>Dimensions:</span>
                          <span>
                            {asset.metadata.width}x{asset.metadata.height}
                          </span>
                        </div>
                      )}
                      {asset.metadata.duration && (
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-500'>Duration:</span>
                          <span>{asset.metadata.duration}s</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Created:</span>
                    <span>
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => window.open(asset.url, '_blank')}
                  >
                    <Download className='h-4 w-4 mr-1' />
                    View
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => deleteAsset(asset.id)}
                  >
                    <Trash2 className='h-4 w-4 mr-1' />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAssets.length === 0 && (
            <div className='col-span-full text-center py-8 text-gray-500'>
              {assets.length === 0
                ? 'No assets found. Upload your first Lottie animation!'
                : 'No assets match your search criteria'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
