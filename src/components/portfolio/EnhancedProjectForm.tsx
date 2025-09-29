'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Save,
  Plus,
  X,
  Calendar,
  Users,
  Star,
  Globe,
  Github,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';
import { AssetPicker, AssetFile } from '@/components/ui/AssetPicker';

// Enhanced project interface matching our model
interface EnhancedProject {
  _id?: string;
  title: string;
  description: string;
  shortDescription: string;
  slug: string;
  technologies: string[];
  featured: boolean;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';

  // Basic links
  liveUrl?: string;
  githubUrl?: string;

  // Enhanced fields (progressive)
  timeline?: {
    startDate?: Date;
    endDate?: Date;
    duration?: string;
    milestones?: Array<{
      title: string;
      date: Date;
      completed: boolean;
      description?: string;
    }>;
  };
  collaboration?: {
    teamSize?: number;
    role?: string;
    responsibilities?: string[];
    collaborators?: Array<{
      name: string;
      role: string;
      githubUrl?: string;
    }>;
  };
  assets?: {
    images?: string[];
    videos?: string[];
    documents?: string[];
    screenshots?: string[];
  };
  analytics?: {
    viewCount?: number;
    starCount?: number;
    forkCount?: number;
    downloadCount?: number;
  };
  validation?: {
    complexityRating?: number; // 1-5
    maintainabilityScore?: number; // 1-100
    testCoverage?: number; // 0-100
    performanceScore?: number; // 1-100
  };
  categories?: string[];
  links?: Array<{
    title: string;
    url: string;
    type: 'demo' | 'documentation' | 'blog' | 'video' | 'other';
  }>;
}

interface EnhancedProjectFormProps {
  initialProject?: Partial<EnhancedProject>;
  onSave: (project: EnhancedProject) => Promise<void>;
  onPreview?: (project: EnhancedProject) => void;
  className?: string;
}

// Common technology options
const TECHNOLOGY_OPTIONS = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Django',
  'Flask',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'AWS',
  'Vercel',
  'Tailwind CSS',
  'CSS',
  'HTML',
  'Vue.js',
  'Angular',
  'Svelte',
  'GraphQL',
  'REST API',
  'Jest',
  'Vitest',
  'Cypress',
  'Playwright',
  'Figma',
  'Git',
  'GitHub Actions',
  'CI/CD',
];

const PROJECT_CATEGORIES = [
  'Web Application',
  'Mobile App',
  'Desktop App',
  'Library/Package',
  'Tool/Utility',
  'Game',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Open Source',
  'Client Work',
  'Personal Project',
  'Educational',
  'Prototype',
  'API',
  'Website',
  'E-commerce',
];

const PROJECT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const LINK_TYPES = [
  { value: 'demo', label: 'Demo' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'video', label: 'Video' },
  { value: 'other', label: 'Other' },
];

export function EnhancedProjectForm({
  initialProject,
  onSave,
  onPreview,
  className = '',
}: EnhancedProjectFormProps) {
  const { user } = useUser();
  const [project, setProject] = useState<EnhancedProject>(() => ({
    title: '',
    description: '',
    shortDescription: '',
    slug: '',
    technologies: [],
    featured: false,
    status: 'draft',
    ...initialProject,
  }));

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTechnology, setNewTechnology] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<AssetFile[]>([]);

  // Get feature flag context
  const featureFlagContext = {
    userId: user?.id,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    userRole: user?.publicMetadata?.role as string,
    environment: process.env.NODE_ENV,
  };

  // Check which features are enabled
  const enhancedFeaturesEnabled =
    featureFlags.getFeatureFlags(featureFlagContext);
  const hasAssetIntegration =
    enhancedFeaturesEnabled['advanced.assetIntegration']?.enabled;
  const hasEnhancedValidation =
    enhancedFeaturesEnabled['advanced.enhancedValidation']?.enabled;

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Update project data
  const updateProject = (updates: Partial<EnhancedProject>) => {
    setProject(prev => ({ ...prev, ...updates }));

    // Auto-generate slug from title
    if (updates.title && !project.slug) {
      const newSlug = generateSlug(updates.title);
      setProject(prev => ({ ...prev, slug: newSlug }));
    }
  };

  // Add technology
  const addTechnology = (tech: string) => {
    const trimmedTech = tech.trim();
    if (trimmedTech && !project.technologies.includes(trimmedTech)) {
      updateProject({ technologies: [...project.technologies, trimmedTech] });
      setNewTechnology('');
    }
  };

  // Remove technology
  const removeTechnology = (techToRemove: string) => {
    updateProject({
      technologies: project.technologies.filter(tech => tech !== techToRemove),
    });
  };

  // Add category
  const addCategory = (category: string) => {
    const trimmedCategory = category.trim();
    if (
      trimmedCategory &&
      !(project.categories || []).includes(trimmedCategory)
    ) {
      updateProject({
        categories: [...(project.categories || []), trimmedCategory],
      });
      setNewCategory('');
    }
  };

  // Remove category
  const removeCategory = (categoryToRemove: string) => {
    updateProject({
      categories: (project.categories || []).filter(
        cat => cat !== categoryToRemove
      ),
    });
  };

  // Add link
  const addLink = () => {
    const newLink = {
      title: '',
      url: '',
      type: 'other' as const,
    };
    updateProject({
      links: [...(project.links || []), newLink],
    });
  };

  // Update link
  const updateLink = (
    index: number,
    updates: Partial<NonNullable<EnhancedProject['links']>[0]>
  ) => {
    const updatedLinks = [...(project.links || [])];
    updatedLinks[index] = { ...updatedLinks[index], ...updates };
    updateProject({ links: updatedLinks });
  };

  // Remove link
  const removeLink = (index: number) => {
    const updatedLinks = (project.links || []).filter((_, i) => i !== index);
    updateProject({ links: updatedLinks });
  };

  // Add milestone
  const addMilestone = () => {
    const newMilestone = {
      title: '',
      date: new Date(),
      completed: false,
      description: '',
    };
    updateProject({
      timeline: {
        ...project.timeline,
        milestones: [...(project.timeline?.milestones || []), newMilestone],
      },
    });
  };

  // Update milestone
  const updateMilestone = (
    index: number,
    updates: Partial<
      NonNullable<NonNullable<EnhancedProject['timeline']>['milestones']>[0]
    >
  ) => {
    const updatedMilestones = [...(project.timeline?.milestones || [])];
    updatedMilestones[index] = { ...updatedMilestones[index], ...updates };
    updateProject({
      timeline: {
        ...project.timeline,
        milestones: updatedMilestones,
      },
    });
  };

  // Remove milestone
  const removeMilestone = (index: number) => {
    const updatedMilestones = (project.timeline?.milestones || []).filter(
      (_, i) => i !== index
    );
    updateProject({
      timeline: {
        ...project.timeline,
        milestones: updatedMilestones,
      },
    });
  };

  // Handle asset selection
  const handleAssetsSelected = (assets: AssetFile[]) => {
    setSelectedAssets(assets);
    // In a real implementation, you would update the project with asset URLs
    const assetUrls = assets.filter(a => a.url).map(a => a.url!);
    updateProject({
      assets: {
        ...project.assets,
        images: assetUrls,
      },
    });
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    try {
      // Basic validation
      const newErrors: Record<string, string> = {};
      if (!project.title.trim()) newErrors.title = 'Title is required';
      if (!project.description.trim())
        newErrors.description = 'Description is required';
      if (!project.shortDescription.trim())
        newErrors.shortDescription = 'Short description is required';
      if (project.technologies.length === 0)
        newErrors.technologies = 'At least one technology is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await onSave(project);
    } catch (error) {
      console.error('Save failed:', error);
      setErrors({ general: 'Failed to save project. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error alerts */}
      {errors.general && (
        <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <span className='text-sm text-red-800'>{errors.general}</span>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>Title*</Label>
            <Input
              id='title'
              value={project.title}
              onChange={e => updateProject({ title: e.target.value })}
              placeholder='Enter project title...'
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className='text-sm text-red-500'>{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div className='space-y-2'>
            <Label htmlFor='slug'>URL Slug</Label>
            <Input
              id='slug'
              value={project.slug}
              onChange={e => updateProject({ slug: e.target.value })}
              placeholder='url-friendly-slug'
            />
          </div>

          {/* Short Description */}
          <div className='space-y-2'>
            <Label htmlFor='shortDescription'>Short Description*</Label>
            <Textarea
              id='shortDescription'
              value={project.shortDescription}
              onChange={e =>
                updateProject({ shortDescription: e.target.value })
              }
              placeholder='Brief project summary...'
              className={`resize-none ${errors.shortDescription ? 'border-red-500' : ''}`}
              rows={2}
            />
            {errors.shortDescription && (
              <p className='text-sm text-red-500'>{errors.shortDescription}</p>
            )}
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description*</Label>
            <Textarea
              id='description'
              value={project.description}
              onChange={e => updateProject({ description: e.target.value })}
              placeholder='Detailed project description...'
              className={`min-h-[150px] resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>{errors.description}</p>
            )}
          </div>

          {/* Status and Featured */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Status</Label>
              <Select
                value={project.status}
                onValueChange={value => updateProject({ status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Featured Project</Label>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='featured'
                  checked={project.featured}
                  onChange={e => updateProject({ featured: e.target.checked })}
                  className='rounded border-gray-300'
                />
                <Label htmlFor='featured'>Mark as featured</Label>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='liveUrl'>Live URL</Label>
              <div className='relative'>
                <Globe className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='liveUrl'
                  value={project.liveUrl || ''}
                  onChange={e => updateProject({ liveUrl: e.target.value })}
                  placeholder='https://example.com'
                  className='pl-10'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='githubUrl'>GitHub URL</Label>
              <div className='relative'>
                <Github className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='githubUrl'
                  value={project.githubUrl || ''}
                  onChange={e => updateProject({ githubUrl: e.target.value })}
                  placeholder='https://github.com/user/repo'
                  className='pl-10'
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card>
        <CardHeader>
          <CardTitle>Technologies*</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Selected technologies */}
          <div className='flex flex-wrap gap-2'>
            {project.technologies.map(tech => (
              <Badge
                key={tech}
                variant='secondary'
                className='flex items-center gap-1'
              >
                {tech}
                <button
                  onClick={() => removeTechnology(tech)}
                  className='ml-1 hover:text-red-500'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add technology */}
          <div className='flex gap-2'>
            <Input
              value={newTechnology}
              onChange={e => setNewTechnology(e.target.value)}
              placeholder='Add a technology...'
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTechnology(newTechnology);
                }
              }}
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => addTechnology(newTechnology)}
              disabled={!newTechnology.trim()}
            >
              Add
            </Button>
          </div>

          {/* Quick add buttons */}
          <div className='space-y-2'>
            <Label className='text-sm text-gray-600'>Quick add:</Label>
            <div className='flex flex-wrap gap-2'>
              {TECHNOLOGY_OPTIONS.filter(
                tech => !project.technologies.includes(tech)
              )
                .slice(0, 8)
                .map(tech => (
                  <Button
                    key={tech}
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => addTechnology(tech)}
                  >
                    <Plus className='h-3 w-3 mr-1' />
                    {tech}
                  </Button>
                ))}
            </div>
          </div>

          {errors.technologies && (
            <p className='text-sm text-red-500'>{errors.technologies}</p>
          )}
        </CardContent>
      </Card>

      {/* Categories (Enhanced Feature) */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            Categories
            {hasEnhancedValidation && (
              <Badge variant='secondary'>Enhanced</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Selected categories */}
          <div className='flex flex-wrap gap-2'>
            {(project.categories || []).map(category => (
              <Badge
                key={category}
                variant='outline'
                className='flex items-center gap-1'
              >
                {category}
                <button
                  onClick={() => removeCategory(category)}
                  className='ml-1 hover:text-red-500'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add category */}
          <Select value='' onValueChange={addCategory}>
            <SelectTrigger>
              <SelectValue placeholder='Select a category...' />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_CATEGORIES.filter(
                cat => !(project.categories || []).includes(cat)
              ).map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Asset Integration */}
      {hasAssetIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              Project Assets
              <Badge variant='secondary'>Enhanced</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssetPicker
              assetType='image'
              multiple={true}
              maxFiles={10}
              maxFileSize={5}
              onAssetsSelected={handleAssetsSelected}
            />
          </CardContent>
        </Card>
      )}

      {/* Enhanced Validation Metrics */}
      {hasEnhancedValidation && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              Project Metrics
              <Badge variant='secondary'>Enhanced</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Complexity Rating (1-5)</Label>
                <Select
                  value={project.validation?.complexityRating?.toString() || ''}
                  onValueChange={value =>
                    updateProject({
                      validation: {
                        ...project.validation,
                        complexityRating: parseInt(value),
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select complexity...' />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className='flex items-center gap-2'>
                          <div className='flex'>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span>Level {rating}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Maintainability Score (1-100)</Label>
                <Input
                  type='number'
                  min='1'
                  max='100'
                  value={project.validation?.maintainabilityScore || ''}
                  onChange={e =>
                    updateProject({
                      validation: {
                        ...project.validation,
                        maintainabilityScore: parseInt(e.target.value),
                      },
                    })
                  }
                  placeholder='85'
                />
              </div>
            </div>

            {/* Display current metrics */}
            <div className='grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {project.validation?.complexityRating || 'N/A'}
                </div>
                <div className='text-sm text-gray-600'>Complexity</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {project.validation?.maintainabilityScore || 'N/A'}
                </div>
                <div className='text-sm text-gray-600'>Maintainability</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {project.technologies.length}
                </div>
                <div className='text-sm text-gray-600'>Technologies</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          {hasEnhancedValidation && (
            <div className='flex items-center gap-2 text-sm text-green-600'>
              <CheckCircle className='h-4 w-4' />
              Enhanced validation enabled
            </div>
          )}
        </div>

        <div className='flex gap-2'>
          {onPreview && (
            <Button variant='outline' onClick={() => onPreview(project)}>
              Preview
            </Button>
          )}

          <Button onClick={handleSave} disabled={saving}>
            <Save className='h-4 w-4 mr-2' />
            {saving ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </div>
    </div>
  );
}
