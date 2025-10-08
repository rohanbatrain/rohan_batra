'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, X, Upload, Image as ImageIcon } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { CardTemplate } from '@/lib/flashcards/card-templates';

interface CardFormData {
  type: 'basic' | 'cloze' | 'qa' | 'image';
  promptText: string;
  responseText: string;
  hint: string;
  explanation: string;
  tags: string;
  order: string;
}

interface CardFormProps {
  deckId: string;
  cardId?: string;
  mode: 'create' | 'edit';
  initialData?: CardFormData;
  deckTitle?: string;
  template?: CardTemplate;
}

const defaultFormData: CardFormData = {
  type: 'basic',
  promptText: '',
  responseText: '',
  hint: '',
  explanation: '',
  tags: '',
  order: '',
};

export default function CardForm({
  deckId,
  cardId,
  mode,
  initialData,
  deckTitle,
}: CardFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<CardFormData>(
    initialData || defaultFormData
  );
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    field: keyof CardFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother = false) => {
    e.preventDefault();

    if (!formData.promptText.trim()) {
      toast({
        title: 'Validation error',
        description: 'Prompt is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.responseText.trim()) {
      toast({
        title: 'Validation error',
        description: 'Response is required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const url =
        mode === 'edit'
          ? `/api/admin/flashcards/${deckId}/cards/${cardId}`
          : `/api/admin/flashcards/${deckId}/cards`;

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const payload = {
        type: formData.type,
        prompt: {
          text: formData.promptText.trim(),
        },
        response: {
          text: formData.responseText.trim(),
        },
        hint: formData.hint.trim() || null,
        explanation: formData.explanation.trim() || null,
        tags: formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        order: formData.order ? parseInt(formData.order) : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to save card');
      }

      toast({
        title: mode === 'edit' ? 'Card updated' : 'Card created',
        description: 'The card has been saved successfully.',
      });

      if (saveAndAddAnother && mode === 'create') {
        // Reset form for another card
        setFormData(defaultFormData);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Navigate back to card list
        router.push(`/admin/flashcards/${deckId}/cards`);
      }
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const tagArray = formData.tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link href={`/admin/flashcards/${deckId}/cards`}>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Cards
          </Button>
        </Link>
      </div>

      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          {mode === 'edit' ? 'Edit Card' : 'Create Card'}
        </h1>
        {deckTitle && (
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Deck: {deckTitle}
          </p>
        )}
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Card Type */}
              <div className='space-y-2'>
                <Label htmlFor='type'>Card Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    handleChange('type', value as CardFormData['type'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='basic'>Basic (Front/Back)</SelectItem>
                    <SelectItem value='cloze'>Cloze (Fill in blank)</SelectItem>
                    <SelectItem value='qa'>Q&A (Question/Answer)</SelectItem>
                    <SelectItem value='image'>Image (Visual memory)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt */}
              <div className='space-y-2'>
                <Label htmlFor='promptText'>Prompt (Front) *</Label>
                <RichTextEditor
                  content={formData.promptText}
                  onChange={(html) => handleChange('promptText', html)}
                  placeholder='Enter the prompt or question...'
                />
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  This is what the learner sees first
                </p>
              </div>

              {/* Image Upload for Image Cards */}
              {formData.type === 'image' && mode === 'edit' && cardId && (
                <div className='space-y-2'>
                  <Label>Card Image</Label>
                  <div className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center'>
                    <ImageIcon className='mx-auto h-12 w-12 text-gray-400 mb-3' />
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                      Image cards support is available
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-500'>
                      Use the rich text editor to embed images, or use the media API endpoint at:
                    </p>
                    <code className='text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 inline-block'>
                      POST /api/admin/flashcards/{deckId}/cards/{cardId}/media
                    </code>
                  </div>
                </div>
              )}

              {/* Response */}
              <div className='space-y-2'>
                <Label htmlFor='responseText'>Response (Back) *</Label>
                <RichTextEditor
                  content={formData.responseText}
                  onChange={(html) => handleChange('responseText', html)}
                  placeholder='Enter the answer or explanation...'
                />
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  This is revealed after the learner responds
                </p>
              </div>

              {/* Hint */}
              <div className='space-y-2'>
                <Label htmlFor='hint'>Hint (Optional)</Label>
                <Textarea
                  id='hint'
                  value={formData.hint}
                  onChange={e => handleChange('hint', e.target.value)}
                  placeholder='Optional hint to help learners...'
                  rows={2}
                />
              </div>

              {/* Explanation */}
              <div className='space-y-2'>
                <Label htmlFor='explanation'>Explanation (Optional)</Label>
                <Textarea
                  id='explanation'
                  value={formData.explanation}
                  onChange={e => handleChange('explanation', e.target.value)}
                  placeholder='Additional context or explanation...'
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className='space-y-2'>
                <Label htmlFor='tags'>Tags</Label>
                <Input
                  id='tags'
                  value={formData.tags}
                  onChange={e => handleChange('tags', e.target.value)}
                  placeholder='e.g. javascript, arrays, methods'
                />
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Comma-separated tags for organization
                </p>
                {tagArray.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {tagArray.map(tag => (
                      <Badge key={tag} variant='secondary'>
                        {tag}
                        <button
                          type='button'
                          onClick={() => {
                            const newTags = tagArray.filter(t => t !== tag).join(', ');
                            handleChange('tags', newTags);
                          }}
                          className='ml-1 hover:text-red-600'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Order */}
              <div className='space-y-2'>
                <Label htmlFor='order'>Order (Optional)</Label>
                <Input
                  id='order'
                  type='number'
                  value={formData.order}
                  onChange={e => handleChange('order', e.target.value)}
                  placeholder='Auto-assigned if left empty'
                />
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Lower numbers appear first
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-3'>
            <Button type='submit' disabled={saving}>
              <Save className='mr-2 h-4 w-4' />
              {saving ? 'Saving...' : mode === 'edit' ? 'Update Card' : 'Save Card'}
            </Button>

            {mode === 'create' && (
              <Button
                type='button'
                variant='outline'
                disabled={saving}
                onClick={e => handleSubmit(e, true)}
              >
                Save & Add Another
              </Button>
            )}

            <Button
              type='button'
              variant='outline'
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className='mr-2 h-4 w-4' />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>

            <Link href={`/admin/flashcards/${deckId}/cards`}>
              <Button type='button' variant='ghost'>
                Cancel
              </Button>
            </Link>
          </div>
        </form>

        {/* Preview */}
        {showPreview && (
          <div className='space-y-4 lg:sticky lg:top-6 h-fit'>
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Card Type Badge */}
                <div className='flex gap-2'>
                  <Badge>{formData.type}</Badge>
                  {formData.order && <Badge variant='outline'>Order: {formData.order}</Badge>}
                </div>

                {/* Prompt Side */}
                <div className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800'>
                  <p className='text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2'>
                    FRONT (Prompt)
                  </p>
                  <div className='text-lg font-medium prose prose-sm dark:prose-invert max-w-none'>
                    {formData.promptText ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.promptText }} />
                    ) : (
                      <span className='text-gray-400 italic'>Prompt will appear here...</span>
                    )}
                  </div>
                  {formData.hint && (
                    <p className='mt-4 text-sm text-gray-600 dark:text-gray-300 border-t pt-2'>
                      <span className='font-semibold'>💡 Hint:</span> {formData.hint}
                    </p>
                  )}
                </div>

                {/* Response Side */}
                <div className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-800'>
                  <p className='text-xs font-semibold text-green-600 dark:text-green-400 mb-2'>
                    BACK (Response)
                  </p>
                  <div className='text-lg font-medium prose prose-sm dark:prose-invert max-w-none'>
                    {formData.responseText ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.responseText }} />
                    ) : (
                      <span className='text-gray-400 italic'>Response will appear here...</span>
                    )}
                  </div>
                  {formData.explanation && (
                    <p className='mt-4 text-sm text-gray-600 dark:text-gray-300 border-t pt-2'>
                      <span className='font-semibold'>📖 Explanation:</span> {formData.explanation}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {tagArray.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {tagArray.map(tag => (
                      <Badge key={tag} variant='secondary'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
