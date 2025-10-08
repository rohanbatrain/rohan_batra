'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link2,
  Code,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-700',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[120px] focus:outline-none p-3 rounded-md border border-gray-200 dark:border-gray-700',
      },
    },
  });

  // Update editor content when prop changes (for form resets)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toolbar */}
      <div className='flex flex-wrap gap-1 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title='Bold'
        >
          <Bold className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title='Italic'
        >
          <Italic className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title='Inline Code'
        >
          <Code className='h-4 w-4' />
        </Button>

        <div className='w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1' />

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title='Heading 2'
        >
          <Heading2 className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title='Bullet List'
        >
          <List className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title='Numbered List'
        >
          <ListOrdered className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={setLink}
          className={editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title='Add Link'
        >
          <Link2 className='h-4 w-4' />
        </Button>

        <div className='w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1' />

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title='Undo'
        >
          <Undo className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title='Redo'
        >
          <Redo className='h-4 w-4' />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
