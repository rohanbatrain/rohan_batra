'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface BrandForm {
  name: string;
  displayName: string;
  slug: string;
  description: string;
  type: string;
  visibility: string;
  isPrimary: boolean;
  isActive: boolean;
  order: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  websiteUrl: string;
  followers: string;
  totalPosts: string;
}

export default function NewBrandPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const [form, setForm] = useState<BrandForm>({
    name: '',
    displayName: '',
    slug: '',
    description: '',
    type: 'professional',
    visibility: 'public',
    isPrimary: false,
    isActive: true,
    order: '0',
    icon: '',
    primaryColor: '',
    secondaryColor: '',
    websiteUrl: '',
    followers: '',
    totalPosts: '',
  });

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (key: keyof BrandForm, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      // Auto-generate slug from displayName if auto mode is on
      if (key === 'displayName' && autoSlug && typeof value === 'string') {
        next.slug = generateSlug(value);
        // Also generate name if empty
        if (!prev.name) {
          next.name = generateSlug(value);
        }
      }

      // Auto-generate name from displayName if empty
      if (key === 'displayName' && typeof value === 'string' && !prev.name) {
        next.name = generateSlug(value);
      }

      return next;
    });
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setForm(prev => ({ ...prev, slug: value }));
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.displayName.trim()) return 'Display name is required';
    if (form.name.length < 2) return 'Name must be at least 2 characters';
    if (form.displayName.length < 2)
      return 'Display name must be at least 2 characters';
    if (form.slug && !/^[a-z0-9-_]+$/.test(form.slug)) {
      return 'Slug must contain only lowercase letters, numbers, dashes, and underscores';
    }
    if (form.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(form.primaryColor)) {
      return 'Primary color must be a valid hex color (e.g., #FF5733)';
    }
    if (form.secondaryColor && !/^#[0-9A-Fa-f]{6}$/.test(form.secondaryColor)) {
      return 'Secondary color must be a valid hex color (e.g., #FF5733)';
    }
    if (form.websiteUrl && !form.websiteUrl.startsWith('https://')) {
      return 'Website URL must use HTTPS';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (validation) {
      toast({
        title: 'Validation Error',
        description: validation,
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    try {
      const payload: any = {
        name: form.name.trim(),
        displayName: form.displayName.trim(),
        type: form.type,
        visibility: form.visibility,
        isPrimary: form.isPrimary,
        isActive: form.isActive,
        order: parseInt(form.order) || 0,
      };

      if (form.slug.trim()) payload.slug = form.slug.trim();
      if (form.description.trim())
        payload.description = form.description.trim();

      // Theme object
      const theme: any = {};
      if (form.icon.trim()) theme.icon = form.icon.trim();
      if (form.primaryColor.trim())
        theme.primaryColor = form.primaryColor.trim();
      if (form.secondaryColor.trim())
        theme.secondaryColor = form.secondaryColor.trim();
      if (Object.keys(theme).length > 0) payload.theme = theme;

      // Metadata object
      const metadata: any = {};
      if (form.websiteUrl.trim()) metadata.websiteUrl = form.websiteUrl.trim();
      if (form.followers.trim())
        metadata.followers = parseInt(form.followers) || 0;
      if (form.totalPosts.trim())
        metadata.totalPosts = parseInt(form.totalPosts) || 0;
      if (Object.keys(metadata).length > 0) payload.metadata = metadata;

      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create brand');
      }

      const data = await response.json();

      toast({
        title: 'Brand created',
        description: 'Your brand has been created successfully.',
      });

      router.push('/admin/brands');
    } catch (error) {
      console.error('Error creating brand:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create brand',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <Button variant='ghost' asChild className='mb-4'>
          <Link href='/admin/brands'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Brands
          </Link>
        </Button>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Create New Brand
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-2'>
          Add a new brand identity to manage your social profiles
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                The fundamental details of your brand
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='displayName'>
                  Display Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='displayName'
                  value={form.displayName}
                  onChange={e => handleChange('displayName', e.target.value)}
                  placeholder='My Brand'
                  required
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  The public-facing name of your brand
                </p>
              </div>

              <div>
                <Label htmlFor='name'>
                  Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder='my-brand'
                  required
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Internal identifier (lowercase, no spaces)
                </p>
              </div>

              <div>
                <Label htmlFor='slug'>Slug</Label>
                <Input
                  id='slug'
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder='my-brand'
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  URL-friendly identifier (auto-generated from display name)
                </p>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder='A brief description of your brand...'
                  rows={3}
                  maxLength={500}
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  {form.description.length}/500 characters
                </p>
              </div>

              <div>
                <Label htmlFor='type'>
                  Type <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={form.type}
                  onValueChange={value => handleChange('type', value)}
                >
                  <SelectTrigger id='type'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='professional'>Professional</SelectItem>
                    <SelectItem value='creative'>Creative</SelectItem>
                    <SelectItem value='personal'>Personal</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme & Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>Customize how your brand looks</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='icon'>Icon/Emoji</Label>
                <Input
                  id='icon'
                  value={form.icon}
                  onChange={e => handleChange('icon', e.target.value)}
                  placeholder='🚀'
                  maxLength={50}
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  An emoji or short text to represent your brand
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='primaryColor'>Primary Color</Label>
                  <Input
                    id='primaryColor'
                    value={form.primaryColor}
                    onChange={e => handleChange('primaryColor', e.target.value)}
                    placeholder='#FF5733'
                    pattern='^#[0-9A-Fa-f]{6}$'
                  />
                </div>

                <div>
                  <Label htmlFor='secondaryColor'>Secondary Color</Label>
                  <Input
                    id='secondaryColor'
                    value={form.secondaryColor}
                    onChange={e =>
                      handleChange('secondaryColor', e.target.value)
                    }
                    placeholder='#33FF57'
                    pattern='^#[0-9A-Fa-f]{6}$'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure brand visibility and status
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='visibility'>Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={value => handleChange('visibility', value)}
                >
                  <SelectTrigger id='visibility'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='public'>Public</SelectItem>
                    <SelectItem value='private'>Private</SelectItem>
                    <SelectItem value='unlisted'>Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='order'>Display Order</Label>
                <Input
                  id='order'
                  type='number'
                  value={form.order}
                  onChange={e => handleChange('order', e.target.value)}
                  min='0'
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Lower numbers appear first
                </p>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='isPrimary'>Primary Brand</Label>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Mark as your main brand identity
                  </p>
                </div>
                <Switch
                  id='isPrimary'
                  checked={form.isPrimary}
                  onCheckedChange={checked =>
                    handleChange('isPrimary', checked)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='isActive'>Active</Label>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Show this brand publicly
                  </p>
                </div>
                <Switch
                  id='isActive'
                  checked={form.isActive}
                  onCheckedChange={checked => handleChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Additional information about your brand
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='websiteUrl'>Website URL</Label>
                <Input
                  id='websiteUrl'
                  type='url'
                  value={form.websiteUrl}
                  onChange={e => handleChange('websiteUrl', e.target.value)}
                  placeholder='https://example.com'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='followers'>Followers</Label>
                  <Input
                    id='followers'
                    type='number'
                    value={form.followers}
                    onChange={e => handleChange('followers', e.target.value)}
                    min='0'
                    placeholder='0'
                  />
                </div>

                <div>
                  <Label htmlFor='totalPosts'>Total Posts</Label>
                  <Input
                    id='totalPosts'
                    type='number'
                    value={form.totalPosts}
                    onChange={e => handleChange('totalPosts', e.target.value)}
                    min='0'
                    placeholder='0'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex items-center justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/admin/brands')}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={creating}>
              {creating && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              {creating ? 'Creating...' : 'Create Brand'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
