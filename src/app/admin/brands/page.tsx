'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Brand {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  description?: string;
  type: string;
  visibility: string;
  isPrimary: boolean;
  isActive: boolean;
  order: number;
  theme?: {
    icon?: string;
  };
}

export default function BrandsListPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/admin/brands');
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async () => {
    if (!brandToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/brands/${brandToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete brand');

      setBrands(brands.filter(b => b.id !== brandToDelete.id));
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (brand: Brand) => {
    try {
      const response = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !brand.isActive }),
      });

      if (!response.ok) throw new Error('Failed to update brand');

      await fetchBrands();
    } catch (error) {
      console.error('Error toggling brand active status:', error);
      alert('Failed to update brand');
    }
  };

  if (loading) {
    return (
      <div className='p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-64'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Brand Management</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>
            Manage your brand identities and social profiles
          </p>
        </div>
        <div className='flex gap-3'>
          <Button variant='outline' asChild>
            <Link href='/socials' target='_blank'>
              <ExternalLink className='h-4 w-4 mr-2' />
              View Public Page
            </Link>
          </Button>
          <Button asChild>
            <Link href='/admin/brands/new'>
              <Plus className='h-4 w-4 mr-2' />
              Add Brand
            </Link>
          </Button>
        </div>
      </div>

      {/* Brands List */}
      {brands.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <p className='text-gray-500 dark:text-gray-400 mb-4'>
              No brands created yet. Create your first brand to get started.
            </p>
            <Button asChild>
              <Link href='/admin/brands/new'>
                <Plus className='h-4 w-4 mr-2' />
                Create Brand
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {brands.map(brand => (
            <Card key={brand.id} className={!brand.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3 flex-1'>
                    <GripVertical className='h-5 w-5 text-gray-400 cursor-move' />
                    {brand.theme?.icon && (
                      <span className='text-2xl'>{brand.theme.icon}</span>
                    )}
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <CardTitle>{brand.displayName}</CardTitle>
                        {brand.isPrimary && (
                          <Badge variant='default' className='gap-1'>
                            <Star className='h-3 w-3' />
                            Primary
                          </Badge>
                        )}
                        <Badge variant='outline' className='capitalize'>
                          {brand.type}
                        </Badge>
                        <Badge
                          variant={brand.visibility === 'public' ? 'default' : 'secondary'}
                          className='capitalize'
                        >
                          {brand.visibility}
                        </Badge>
                      </div>
                      {brand.description && (
                        <CardDescription className='mt-1'>{brand.description}</CardDescription>
                      )}
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        @{brand.name} • /{brand.slug}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleActive(brand)}
                      title={brand.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {brand.isActive ? (
                        <Eye className='h-4 w-4' />
                      ) : (
                        <EyeOff className='h-4 w-4' />
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                    >
                      <Link href={`/admin/brands/${brand.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setBrandToDelete(brand);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{brandToDelete?.displayName}"? This will also delete
              all associated social profiles. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
