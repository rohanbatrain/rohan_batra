'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Upload, Trash2, Download, Search, FileImage, ExternalLink, Copy } from 'lucide-react';
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

interface ImageAsset {
  _id: string;
  filename: string;
  originalFilename: string;
  url: string;
  type: 'image';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy?: { name?: string; email?: string };
  createdAt: string;
}

export default function AssetsManagementPage() {
  const [assets, setAssets] = useState<LottieAsset[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [imageAssets, setImageAssets] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();
  const [importUrl, setImportUrl] = useState('');
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lottie'|'images'|'links'>('lottie');
  const [typeFilter, setTypeFilter] = useState<'all'|'image'|'video'|'other'>('all');
  const [newLink, setNewLink] = useState({ type: 'image', name: '', url: '', thumbnailUrl: '', description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);

  // Load Lottie player once for previews
  useEffect(() => {
    const ensureLottiePlayer = async () => {
      if (typeof window === 'undefined') return;
      if (typeof window.customElements !== 'undefined' && window.customElements.get('lottie-player')) return;
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      script.async = true;
      document.body.appendChild(script);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ensureLottiePlayer();
  }, []);

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
    // Preload links
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const res = await fetch('/api/admin/assets/links', { credentials: 'include' });
        const body = await res.json();
        setLinks(body?.data?.links || []);
      } catch {}
    })();
    // Preload images
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const res = await fetch('/api/admin/assets?type=image&limit=50', { credentials: 'include' });
        if (res.ok) {
          const body = await res.json();
          setImageAssets((body?.data?.assets || []) as ImageAsset[]);
        }
      } catch {}
    })();
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
      toast({ title: 'Deleted', description: result?.message || 'Asset deleted' });

      await fetchAssets();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete asset',
        variant: 'destructive',
      });
    }
  };

  const moveToTrash = async (assetId: string) => {
    if (!confirm('Move this asset to trash? You can permanently delete later.')) return;
    try {
      const response = await fetch(`/api/admin/lottie/${assetId}?trash=true`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to move to trash');
      toast({ title: 'Trashed', description: data.message || 'Moved to trash' });
      await fetchAssets();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to move to trash',
        variant: 'destructive',
      });
    }
  };

  const importFromUrl = async () => {
    if (!importUrl) return;
    try {
      const response = await fetch('/api/admin/lottie/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: importUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Import failed');
      toast({ title: 'Imported', description: data.message || 'Lottie imported' });
      setImportUrl('');
      fetchAssets();
    } catch (e) {
      toast({
        title: 'Import error',
        description: e instanceof Error ? e.message : 'Failed to import from URL',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      toast({ title: 'Uploaded', description: result?.message || 'Upload complete' });

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

  const addLink = async () => {
    try {
      const res = await fetch('/api/admin/assets/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...newLink, tags: [] }),
      });
      const body = await res.json();
      if (!res.ok || body?.success === false) throw new Error(body?.error || 'Failed to add link');
      toast({ title: 'Added', description: 'Asset link added' });
      setNewLink({ type: 'image', name: '', url: '', thumbnailUrl: '', description: '' });
      const refreshed = await fetch('/api/admin/assets/links', { credentials: 'include' }).then(r => r.json());
      setLinks(refreshed?.data?.links || []);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to add link', variant: 'destructive' });
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/assets/links?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const body = await res.json();
      if (!res.ok || body?.success === false) throw new Error(body?.error || 'Failed to delete link');
      toast({ title: 'Deleted', description: 'Link removed' });
      setLinks(prev => prev.filter(l => l._id !== id));
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to delete link', variant: 'destructive' });
    }
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

        <div className='flex flex-wrap gap-2 items-center'>
          <Button onClick={fetchAssets} variant='outline'>
            <Search className='h-4 w-4 mr-2' />
            Refresh
          </Button>

          <div className='relative'>
            <Button onClick={() => { setUploadMenuOpen(v => !v); setImportMenuOpen(false); }}>
              <Upload className='h-4 w-4 mr-2' />
              Upload
            </Button>
            {uploadMenuOpen && (
              <div className='absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg z-10'>
                <button className='w-full text-left px-4 py-2 hover:bg-gray-50' onClick={() => {
                  setUploadMenuOpen(false);
                  (document.getElementById('file-upload') as HTMLInputElement | null)?.click();
                }}>Upload Lottie JSON</button>
                <button className='w-full text-left px-4 py-2 hover:bg-gray-50' onClick={() => {
                  setUploadMenuOpen(false);
                  (document.getElementById('image-upload') as HTMLInputElement | null)?.click();
                }}>Upload Image</button>
              </div>
            )}
          </div>

          <div className='relative'>
            <Button variant='secondary' onClick={() => { setImportMenuOpen(v => !v); setUploadMenuOpen(false); }}>
              <Download className='h-4 w-4 mr-2' />
              Import
            </Button>
            {importMenuOpen && (
              <div className='absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg z-10'>
                <button className='w-full text-left px-4 py-2 hover:bg-gray-50' onClick={() => {
                  setImportMenuOpen(false);
                  setShowUrlModal(true);
                }}>Import Lottie from URL</button>
                <button className='w-full text-left px-4 py-2 hover:bg-gray-50' onClick={() => {
                  setImportMenuOpen(false);
                  setShowAddLinkModal(true);
                }}>Add Remote Link</button>
              </div>
            )}
          </div>
        </div>
          <input
            id='file-upload'
            type='file'
            accept='.json,application/json'
            onChange={handleFileUpload}
            className='hidden'
          />
          <input id='image-upload' type='file' accept='image/*' className='hidden' onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setUploadingImage(true);
              const fd = new FormData();
              fd.append('file', file);
              const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd, credentials: 'include' });
              const body = await res.json().catch(() => ({}));
              if (!res.ok || body?.error) throw new Error(body?.error || 'Upload failed');
              toast({ title: 'Uploaded', description: body?.data ? 'Image uploaded' : 'Upload complete' });
              // refresh images list
              const refreshed = await fetch('/api/admin/assets?type=image&limit=50', { credentials: 'include' });
              const refreshedBody = await refreshed.json().catch(() => ({}));
              if (refreshed.ok) setImageAssets((refreshedBody?.data?.assets || []) as ImageAsset[]);
              if (activeTab !== 'images') setActiveTab('images');
            } catch (err) {
              toast({ title: 'Error', description: err instanceof Error ? err.message : 'Upload failed', variant: 'destructive' });
            } finally {
              setUploadingImage(false);
              e.currentTarget.value = '';
            }
          }} />
        </div>

      {/* Import URL Modal */}
      {showUrlModal && (
        <div className='fixed inset-0 z-20 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4'>
            <h3 className='text-lg font-semibold'>Import Lottie from URL</h3>
            <Input
              placeholder='Paste GitHub raw URL (https://raw.githubusercontent.com/...)'
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
            />
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setShowUrlModal(false)}>Cancel</Button>
              <Button onClick={async () => { await importFromUrl(); setShowUrlModal(false); }} disabled={!importUrl}>Import</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Remote Link Modal */}
      {showAddLinkModal && (
        <div className='fixed inset-0 z-20 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4'>
            <h3 className='text-lg font-semibold'>Add Remote Asset Link</h3>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-2'>
              <select className='border rounded px-3 py-2' value={newLink.type} onChange={e => setNewLink(v => ({ ...v, type: e.target.value }))}>
                <option value='image'>Image</option>
                <option value='video'>Video</option>
                <option value='other'>Other</option>
              </select>
              <Input placeholder='Name' value={newLink.name} onChange={e => setNewLink(v => ({ ...v, name: e.target.value }))} />
              <Input placeholder='https://...' value={newLink.url} onChange={e => setNewLink(v => ({ ...v, url: e.target.value }))} />
              <Input placeholder='Thumbnail URL (optional)' value={newLink.thumbnailUrl} onChange={e => setNewLink(v => ({ ...v, thumbnailUrl: e.target.value }))} />
              <Input placeholder='Description (optional)' value={newLink.description} onChange={e => setNewLink(v => ({ ...v, description: e.target.value }))} />
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setShowAddLinkModal(false)}>Cancel</Button>
              <Button onClick={async () => { await addLink(); setShowAddLinkModal(false); }}>Add Link</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className='flex items-center gap-2 mb-2'>
        <Button variant={activeTab==='lottie'?'default':'outline'} onClick={() => setActiveTab('lottie')}>Lottie</Button>
        <Button variant={activeTab==='images'?'default':'outline'} onClick={() => setActiveTab('images')}>Images</Button>
        <Button variant={activeTab==='links'?'default':'outline'} onClick={() => setActiveTab('links')}>Links</Button>
        {activeTab==='links' && (
          <div className='ml-auto flex items-center gap-2'>
            <span className='text-sm text-gray-500'>Filter:</span>
            {(['all','image','video','other'] as const).map(t => (
              <Button key={t} size='sm' variant={typeFilter===t?'secondary':'outline'} onClick={() => setTypeFilter(t)} className='capitalize'>
                {t}
              </Button>
            ))}
          </div>
        )}
      </div>

  {/* Stats (for Lottie tab) */}
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

      {activeTab === 'links' ? (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {links
              .filter(l => typeFilter==='all' ? true : l.type===typeFilter)
              .map(link => (
                <Card key={link._id} className='overflow-hidden'>
                  <div className='aspect-video bg-gray-50 flex items-center justify-center'>
                    {link.type === 'image' && (
                      <img src={link.thumbnailUrl || link.url} alt={link.name} className='h-full w-full object-cover' />
                    )}
                    {link.type === 'video' && (
                      <video src={link.url} className='h-full w-full object-cover' controls preload='metadata' />
                    )}
                    {link.type === 'other' && (
                      <div className='text-gray-500 text-sm p-4 break-all'>{link.url}</div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between text-lg'>
                      <span className='truncate'>{link.name}</span>
                      <Badge variant='outline' className='capitalize'>{link.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between gap-2'>
                      <a href={link.url} target='_blank' rel='noreferrer' className='flex items-center gap-2 min-w-0 truncate text-blue-600 hover:underline'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://www.google.com/s2/favicons?sz=32&domain_url=${(() => { let o=link.url; try { o = new URL(link.url).origin; } catch {} return encodeURIComponent(o); })()}`}
                          alt='favicon'
                          className='h-4 w-4 rounded'
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className='truncate'>{link.url}</span>
                        <ExternalLink className='h-3 w-3 shrink-0' />
                      </a>
                      <button
                        className='px-2 py-1 text-xs border rounded hover:bg-gray-50'
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(link.url);
                            toast({ title: 'Copied', description: 'URL copied to clipboard' });
                          } catch {
                            toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
                          }
                        }}
                        aria-label='Copy URL'
                      >
                        <Copy className='h-3 w-3' />
                      </button>
                    </div>
                    <div className='flex gap-2'>
                      <Button size='sm' variant='outline' onClick={() => window.open(link.url, '_blank')}>Open</Button>
                      <Button size='sm' variant='destructive' onClick={() => deleteLink(link._id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {links.filter(l => typeFilter==='all' ? true : l.type===typeFilter).length === 0 && (
              <div className='col-span-full text-center py-8 text-gray-500'>
                No asset links yet. Add your first remote image/video URL.
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'images' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {imageAssets.map(img => (
            <Card key={img._id} className='overflow-hidden'>
              <div className='aspect-video bg-gray-50 flex items-center justify-center'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.filename} className='h-full w-full object-cover' />
              </div>
              <CardHeader>
                <CardTitle className='flex items-center justify-between text-lg'>
                  <span className='truncate'>{img.originalFilename}</span>
                  <Badge variant='outline'>Image</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex justify-between'><span className='text-gray-500'>Dimensions:</span><span>{img.width || '?'}×{img.height || '?'}</span></div>
                <div className='flex justify-between'><span className='text-gray-500'>Size:</span><span>{Math.round(img.size/1024)} KB</span></div>
                <div className='flex justify-between'><span className='text-gray-500'>Uploaded:</span><span>{new Date(img.createdAt).toLocaleDateString()}</span></div>
                <div className='flex gap-2'>
                  <Button size='sm' variant='outline' onClick={() => window.open(img.url, '_blank')}>Open</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {imageAssets.length === 0 && (
            <div className='col-span-full text-center py-8 text-gray-500'>No images yet. Use Add Asset → Upload Image.</div>
          )}
        </div>
      ) : loading ? (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredAssets.map(asset => (
            <Card key={asset.id} className='overflow-hidden'>
              <div className='aspect-video bg-gray-50 flex items-center justify-center'>
                {/* Lottie preview via web component */}
                {/* @ts-expect-error web component */}
                <lottie-player
                  autoplay
                  loop
                  mode="normal"
                  background="transparent"
                  src={asset.url}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <CardHeader>
                <CardTitle className='flex items-center justify-between text-lg'>
                  <span className='truncate'>{asset.name}</span>
                  <Badge variant='outline'>Lottie</Badge>
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
                  <Button size='sm' variant='outline' onClick={() => moveToTrash(asset.id)}>
                    <Trash2 className='h-4 w-4 mr-1' />
                    Move to Trash
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
