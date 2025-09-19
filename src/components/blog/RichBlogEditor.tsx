'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Save, FileText, Eye, Upload, X } from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';

// Enhanced blog post interface matching our model
interface EnhancedBlogPost {
  _id?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  publishedAt?: Date;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  
  // Enhanced fields (progressive)
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  assets?: {
    featuredImage?: string;
    gallery?: string[];
    documents?: string[];
    videos?: string[];
  };
  analytics?: {
    viewCount?: number;
    engagementScore?: number;
    averageReadTime?: number;
    shareCount?: number;
  };
  collaboration?: {
    editors?: string[];
    reviewers?: string[];
    comments?: Array<{
      userId: string;
      content: string;
      timestamp: Date;
      resolved?: boolean;
    }>;
  };
  validation?: {
    readabilityScore?: number;
    seoScore?: number;
    accessibilityScore?: number;
    contentLength?: number;
    imageAltTexts?: boolean;
  };
}

interface RichBlogEditorProps {
  initialPost?: Partial<EnhancedBlogPost>;
  onSave: (post: EnhancedBlogPost) => Promise<void>;
  onPreview?: (post: EnhancedBlogPost) => void;
  className?: string;
}

export function RichBlogEditor({ 
  initialPost, 
  onSave, 
  onPreview, 
  className = '' 
}: RichBlogEditorProps) {
  const { user } = useUser();
  const [post, setPost] = useState<EnhancedBlogPost>(() => ({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    published: false,
    author: {
      id: user?.id || '',
      name: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
    },
    tags: [],
    ...initialPost,
  }));

  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRichEditorLoaded, setIsRichEditorLoaded] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Get feature flag context
  const featureFlagContext = {
    userId: user?.id,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    userRole: user?.publicMetadata?.role as string,
    environment: process.env.NODE_ENV,
  };

  // Check which features are enabled
  const enhancedFeaturesEnabled = featureFlags.getFeatureFlags(featureFlagContext);
  const hasRichEditor = enhancedFeaturesEnabled['advanced.richEditor']?.enabled;
  const hasAssetIntegration = enhancedFeaturesEnabled['advanced.assetIntegration']?.enabled;
  const hasEnhancedValidation = enhancedFeaturesEnabled['advanced.enhancedValidation']?.enabled;

  // Load rich editor dynamically if feature is enabled
  useEffect(() => {
    if (hasRichEditor && !isRichEditorLoaded) {
      // Simulate loading a rich editor (in reality this would be dynamic import)
      const timer = setTimeout(() => {
        setIsRichEditorLoaded(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasRichEditor, isRichEditorLoaded]);

  // Auto-save functionality
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (post.title || post.content) {
        setAutoSaving(true);
        try {
          await onSave({ ...post, published: false });
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, 2000);
  }, [post, onSave]);

  // Trigger auto-save when content changes
  useEffect(() => {
    debouncedAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [debouncedAutoSave]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/-+$/, '');
  };

  // Update post data
  const updatePost = (updates: Partial<EnhancedBlogPost>) => {
    setPost(prev => ({ ...prev, ...updates }));
    
    // Auto-generate slug from title
    if (updates.title && !post.slug) {
      const newSlug = generateSlug(updates.title);
      setPost(prev => ({ ...prev, slug: newSlug }));
    }
  };

  // Add tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !post.tags.includes(trimmedTag)) {
      updatePost({ tags: [...post.tags, trimmedTag] });
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    updatePost({ tags: post.tags.filter(tag => tag !== tagToRemove) });
  };

  // Handle save
  const handleSave = async (publish = false) => {
    setSaving(true);
    setErrors({});
    
    try {
      // Basic validation
      const newErrors: Record<string, string> = {};
      if (!post.title.trim()) newErrors.title = 'Title is required';
      if (!post.content.trim()) newErrors.content = 'Content is required';
      if (!post.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await onSave({ 
        ...post, 
        published: publish,
        publishedAt: publish ? new Date() : post.publishedAt 
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      setErrors({ general: 'Failed to save post. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Auto-save status */}
      {autoSaving && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <Save className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">Auto-saving...</span>
        </div>
      )}
      
      {lastSaved && !autoSaving && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <span className="text-sm text-green-800">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Error alerts */}
      {errors.general && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-800">{errors.general}</span>
        </div>
      )}

      {/* Main content editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blog Post Editor
            {hasRichEditor && (
              <Badge variant="secondary">Enhanced Editor</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={post.title}
              onChange={(e) => updatePost({ title: e.target.value })}
              placeholder="Enter your blog post title..."
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={post.slug}
              onChange={(e) => updatePost({ slug: e.target.value })}
              placeholder="url-friendly-slug"
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label htmlFor="content">Content*</Label>
            {hasRichEditor && isRichEditorLoaded ? (
              <div className="border rounded-md p-4 min-h-[300px] bg-gray-50">
                <p className="text-gray-600 mb-4">Rich Editor Loaded ✨</p>
                <Textarea
                  ref={contentRef}
                  value={post.content}
                  onChange={(e) => updatePost({ content: e.target.value })}
                  placeholder="Write your blog post content..."
                  className="min-h-[250px] resize-none border-0 focus:ring-0"
                />
              </div>
            ) : (
              <Textarea
                ref={contentRef}
                value={post.content}
                onChange={(e) => updatePost({ content: e.target.value })}
                placeholder="Write your blog post content..."
                className={`min-h-[300px] ${errors.content ? 'border-red-500' : ''}`}
              />
            )}
            {hasRichEditor && !isRichEditorLoaded && (
              <p className="text-sm text-gray-600">Loading enhanced editor...</p>
            )}
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt*</Label>
            <Textarea
              id="excerpt"
              value={post.excerpt}
              onChange={(e) => updatePost({ excerpt: e.target.value })}
              placeholder="Brief description of your post..."
              className={`resize-none ${errors.excerpt ? 'border-red-500' : ''}`}
              rows={3}
            />
            {errors.excerpt && (
              <p className="text-sm text-red-500">{errors.excerpt}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                Add Tag
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced features (conditionally rendered) */}
      {(hasAssetIntegration || hasEnhancedValidation) && (
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasAssetIntegration && (
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Asset integration enabled</p>
                  <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                </div>
              </div>
            )}

            {hasEnhancedValidation && (
              <div className="space-y-2">
                <Label>Content Validation</Label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Readability:</span>
                    <span className="ml-2 text-green-600">Good</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">SEO Score:</span>
                    <span className="ml-2 text-yellow-600">Fair</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Content Length:</span>
                    <span className="ml-2">{post.content.length} characters</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Accessibility:</span>
                    <span className="ml-2 text-green-600">Good</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <input
              id="published"
              type="checkbox"
              checked={post.published}
              onChange={(e) => updatePost({ published: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="published">Published</Label>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onPreview && (
            <Button
              variant="outline"
              onClick={() => onPreview(post)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            variant="default"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
}