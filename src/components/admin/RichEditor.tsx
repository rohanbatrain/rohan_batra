'use client';

import { EditorRoot, EditorContent, type JSONContent } from 'novel';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RichEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onMarkdownPaste?: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export default function RichEditor({
  content = '',
  onChange,
  className,
  editable = true,
}: RichEditorProps) {
  const [editorContent] = useState<JSONContent | undefined>(
    content ? JSON.parse(content) : undefined
  );

  return (
    <div
      className={cn(
        'w-full border border-slate-200 dark:border-slate-700',
        'rounded-lg bg-white dark:bg-slate-800',
        'shadow-sm transition-shadow duration-200',
        'hover:shadow-md',
        className
      )}
    >
      <EditorRoot>
        <EditorContent
          className='prose prose-slate dark:prose-invert max-w-none min-h-[350px] w-full px-6 py-4'
          initialContent={editorContent}
          editable={editable}
          immediatelyRender={false}
          onUpdate={({ editor }: { editor: { getHTML: () => string } }) => {
            const html = editor.getHTML();
            onChange?.(html);
          }}
        />
      </EditorRoot>
    </div>
  );
}

// Additional component for markdown paste detection
export function MarkdownPasteHandler({
  onMarkdownDetected,
}: {
  onMarkdownDetected: (markdown: string) => void;
}) {
  const detectMarkdown = (text: string): boolean => {
    const markdownPatterns = [
      /^#{1,6}\s+/m, // Headers
      /^\s*[-*+]\s+/m, // Unordered lists
      /^\s*\d+\.\s+/m, // Ordered lists
      /^\s*>\s+/m, // Blockquotes
      /```[\s\S]*?```/m, // Code blocks
      /`[^`]+`/m, // Inline code
      /\*\*[^*]+\*\*/m, // Bold
      /\*[^*]+\*/m, // Italic
      /\[[^\]]+\]\([^)]+\)/m, // Links
      /!\[[^\]]*\]\([^)]+\)/m, // Images
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const text = event.clipboardData.getData('text/plain');
    if (text && detectMarkdown(text)) {
      onMarkdownDetected(text);
    }
  };

  return <div onPaste={handlePaste} className='hidden' aria-hidden='true' />;
}
