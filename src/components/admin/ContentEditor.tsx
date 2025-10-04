'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Code, Eye, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const MDXPreview = dynamic(() => import('@/components/admin/mdx-preview'), {
  ssr: false,
  loading: () => <div className='text-sm text-muted-foreground p-4'>Loading preview...</div>,
});

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFormatChange?: (format: 'rich-html' | 'mdx') => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  editorType?: 'rich-html' | 'mdx';
  showPreview?: boolean;
  className?: string;
}

export default function ContentEditor({
  value,
  onChange,
  onFormatChange,
  label,
  placeholder,
  rows = 8,
  editorType = 'rich-html',
  showPreview = true,
  className,
}: ContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [userPreference, setUserPreference] = useState<'rich-html' | 'mdx'>(editorType);

  // Fetch user's editor preference on mount
  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.preferences?.editor) {
            setUserPreference(data.preferences.editor);
            // Notify parent component of format change
            if (onFormatChange) {
              onFormatChange(data.preferences.editor);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching editor preference:', error);
      }
    };

    fetchPreference();
  }, [onFormatChange]);

  const isMDX = userPreference === 'mdx';

  // Detect if content looks like HTML when in MDX mode
  const hasHtmlTags = value && /<\/?[a-z][\s\S]*>/i.test(value);
  const showConversionWarning = isMDX && hasHtmlTags;

  if (!showPreview) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <div className='flex items-center justify-between'>
            <Label className='flex items-center gap-2'>
              {label}
              <Badge variant={isMDX ? 'default' : 'secondary'} className='text-xs'>
                {isMDX ? (
                  <>
                    <Code className='h-3 w-3 mr-1' />
                    MDX
                  </>
                ) : (
                  <>
                    <FileText className='h-3 w-3 mr-1' />
                    Rich HTML
                  </>
                )}
              </Badge>
            </Label>
          </div>
        )}
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || (isMDX ? 'Write MDX content...' : 'Write HTML content...')}
          rows={rows}
          className='font-mono text-sm'
        />
        {isMDX && (
          <p className='text-xs text-muted-foreground'>
            💡 Tip: Use Markdown syntax. Custom components: &lt;Alert&gt;, &lt;Card&gt;, &lt;Badge&gt;
          </p>
        )}
        {showConversionWarning && (
          <p className='text-xs text-amber-600 dark:text-amber-400'>
            ⚠️ This content contains HTML tags. Consider converting to Markdown syntax.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className='flex items-center justify-between'>
          <Label className='flex items-center gap-2'>
            {label}
            <Badge variant={isMDX ? 'default' : 'secondary'} className='text-xs'>
              {isMDX ? (
                <>
                  <Code className='h-3 w-3 mr-1' />
                  MDX
                </>
              ) : (
                <>
                  <FileText className='h-3 w-3 mr-1' />
                  Rich HTML
                </>
              )}
            </Badge>
          </Label>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              window.open('/admin/settings', '_blank');
            }}
            className='text-xs'
          >
            <Settings className='h-3 w-3 mr-1' />
            Change Editor
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='edit' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            Edit
          </TabsTrigger>
          <TabsTrigger value='preview' className='flex items-center gap-2'>
            <Eye className='h-4 w-4' />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value='edit' className='mt-2'>
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || (isMDX ? 'Write MDX content...' : 'Write HTML content...')}
            rows={rows}
            className='font-mono text-sm'
          />
          {isMDX && (
            <p className='text-xs text-muted-foreground mt-2'>
              💡 Tip: Use Markdown syntax. Custom components: &lt;Alert&gt;, &lt;Card&gt;, &lt;Badge&gt;
            </p>
          )}
          {showConversionWarning && (
            <p className='text-xs text-amber-600 dark:text-amber-400 mt-2'>
              ⚠️ This content contains HTML tags. Consider converting to Markdown syntax for better MDX compatibility.
            </p>
          )}
        </TabsContent>

        <TabsContent value='preview' className='mt-2'>
          <div className='min-h-[200px] rounded-md border border-input bg-muted/20 p-4'>
            {value.trim() ? (
              isMDX ? (
                <MDXPreview content={value} />
              ) : (
                <div
                  className='prose prose-sm dark:prose-invert max-w-none'
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              )
            ) : (
              <p className='text-sm text-muted-foreground italic'>
                No content to preview. Start typing in the Edit tab.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
