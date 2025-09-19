'use client';

import {
  EditorRoot,
  EditorContent,
  StarterKit,
  Placeholder,
  EditorBubble,
  EditorBubbleItem,
  type JSONContent,
} from 'novel';
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
  const [editorContent] = useState<JSONContent | undefined>(() => {
    try {
      return content ? (JSON.parse(content) as JSONContent) : undefined;
    } catch {
      return undefined;
    }
  });

  const defaultDoc: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  } as any;
  const extensions = [
    StarterKit.configure({}),
    Placeholder.configure({ placeholder: 'Write your post…' }),
  ];

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
          initialContent={
            editorContent ?? defaultDoc
          }
          extensions={extensions}
          editable={editable}
          immediatelyRender={false}
          onUpdate={(ctx: any) => {
            try {
              const html = ctx?.editor?.getHTML?.() ?? '';
              onChange?.(html);
            } catch {
              // no-op
            }
          }}
        />
        <EditorBubble tippyOptions={{ duration: 150 }}>
          <div className='flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 shadow-sm'>
            <EditorBubbleItem onSelect={editor => editor.chain().focus().toggleBold().run()}>
              <button className='px-2 py-1 text-sm font-semibold'>B</button>
            </EditorBubbleItem>
            <EditorBubbleItem onSelect={editor => editor.chain().focus().toggleItalic().run()}>
              <button className='px-2 py-1 text-sm italic'>I</button>
            </EditorBubbleItem>
            <span className='mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700' />
            <EditorBubbleItem onSelect={editor => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <button className='px-2 py-1 text-sm'>H1</button>
            </EditorBubbleItem>
            <EditorBubbleItem onSelect={editor => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <button className='px-2 py-1 text-sm'>H2</button>
            </EditorBubbleItem>
            <span className='mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700' />
            <EditorBubbleItem onSelect={editor => editor.chain().focus().toggleBulletList().run()}>
              <button className='px-2 py-1 text-sm'>• List</button>
            </EditorBubbleItem>
            <EditorBubbleItem onSelect={editor => editor.chain().focus().toggleOrderedList().run()}>
              <button className='px-2 py-1 text-sm'>1. List</button>
            </EditorBubbleItem>
            <span className='mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700' />
            <EditorBubbleItem onSelect={editor => {
              const url = window.prompt('Enter URL');
              if (!url) return;
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }}>
              <button className='px-2 py-1 text-sm underline'>Link</button>
            </EditorBubbleItem>
          </div>
        </EditorBubble>
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
