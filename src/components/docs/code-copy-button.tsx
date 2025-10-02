'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeCopyButtonProps {
  code: string;
  className?: string;
}

export default function CodeCopyButton({ code, className }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleCopy}
      className={cn(
        'absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
        className
      )}
    >
      {copied ? (
        <Check className='h-4 w-4 text-green-500' />
      ) : (
        <Copy className='h-4 w-4' />
      )}
      <span className='sr-only'>{copied ? 'Copied' : 'Copy code'}</span>
    </Button>
  );
}
