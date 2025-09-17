'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RichEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export default function RichEditor({
  content = '',
  onChange,
  placeholder = 'Start writing something beautiful...',
  className,
  editable = true,
}: RichEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setEditorContent(newContent);
      onChange?.(newContent);
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      handleContentChange(html);
    }
  }, [handleContentChange]);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const text = event.clipboardData.getData('text/plain');
      const html = event.clipboardData.getData('text/html');

      // Detect markdown patterns
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
      ];

      const isMarkdown = markdownPatterns.some(pattern => pattern.test(text));

      if (isMarkdown && !html) {
        event.preventDefault();
        // Simple markdown to HTML conversion for basic patterns
        const convertedHtml = text
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');

        if (editorRef.current) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const div = document.createElement('div');
            div.innerHTML = convertedHtml;
            range.insertNode(div);
            selection.removeAllRanges();
          }
          handleInput();
        }
      }
    },
    [handleInput]
  );

  useEffect(() => {
    if (editorRef.current && content !== editorContent) {
      editorRef.current.innerHTML = content;
      setEditorContent(content);
    }
  }, [content, editorContent]);

  return (
    <div
      className={cn(
        'min-h-[400px] w-full rounded-lg border border-slate-200 dark:border-slate-800',
        'bg-white dark:bg-slate-950',
        'shadow-sm transition-shadow duration-200',
        'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
        'hover:shadow-md',
        className
      )}
    >
      <div
        ref={editorRef}
        contentEditable={editable}
        onInput={handleInput}
        onPaste={handlePaste}
        className={cn(
          'prose prose-slate dark:prose-invert max-w-none',
          'min-h-[350px] w-full px-6 py-4',
          'focus:outline-none',
          'text-slate-900 dark:text-slate-100',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400',
          'empty:before:dark:text-slate-500 empty:before:pointer-events-none'
        )}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      />

      {/* Floating toolbar for formatting (optional) */}
      <div className='px-4 py-2 border-t border-slate-200 dark:border-slate-800'>
        <div className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
          <span>
            💡 Tip: Paste markdown text and it&apos;ll be converted
            automatically
          </span>
        </div>
      </div>
    </div>
  );
}
