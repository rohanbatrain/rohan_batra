'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BraindumpLinkAutocomplete } from './BraindumpLinkAutocomplete';

type Visibility = 'private' | 'unlisted' | 'public';

interface BraindumpQuickCaptureProps {
  onSuccess?: () => void;
}

export function BraindumpQuickCapture({ onSuccess }: BraindumpQuickCaptureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLinkSelect = (braindumpId: string, displayText: string) => {
    console.log('Link selected:', braindumpId, displayText);
    // Link is already inserted by autocomplete component
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Content is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/braindump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          category: category.trim() || undefined,
          priority,
          visibility,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create braindump');
      }

      toast({
        title: 'Success',
        description: 'Braindump captured successfully!',
      });

      // Reset form
      setContent('');
      setTags('');
      setCategory('');
      setPriority('medium');
      setVisibility('private');
      setIsExpanded(false);

      onSuccess?.();
    } catch (error) {
      console.error('Error creating braindump:', error);
      toast({
        title: 'Error',
        description: 'Failed to capture braindump. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card>
        <CardContent className='p-6'>
          <Button
            onClick={() => setIsExpanded(true)}
            className='w-full'
            size='lg'
          >
            <Plus className='mr-2 h-5 w-5' />
            Quick Capture
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Capture</CardTitle>
        <p className="text-sm text-muted-foreground">
          Type <code className="px-1 py-0.5 bg-muted rounded text-xs">[[</code> to link to another braindump
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className="relative">
            <Label htmlFor='content'>Content *</Label>
            <Textarea
              ref={textareaRef}
              id='content'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Type [[ to link to another note."
              rows={6}
              className='mt-1 font-mono text-sm'
              required
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {content.length} / 10,000 characters • Type <code className="px-1 bg-muted rounded">[[</code> to link notes
            </p>
            
            {/* Autocomplete */}
            <BraindumpLinkAutocomplete
              textareaRef={textareaRef}
              onSelect={handleLinkSelect}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='tags'>Tags</Label>
              <Input
                id='tags'
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder='comma, separated, tags'
                className='mt-1'
              />
            </div>

            <div>
              <Label htmlFor='category'>Category</Label>
              <Input
                id='category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder='Optional category'
                className='mt-1'
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor='priority'>Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>Low</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='urgent'>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='visibility'>Visibility</Label>
              <Select value={visibility} onValueChange={(value: Visibility) => setVisibility(value)}>
                <SelectTrigger className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='private'>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='unlisted'>
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      <span>Unlisted</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='public'>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              type='submit'
              disabled={isSubmitting || !content.trim()}
              className='flex-1'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Capturing...
                </>
              ) : (
                'Capture'
              )}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsExpanded(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
