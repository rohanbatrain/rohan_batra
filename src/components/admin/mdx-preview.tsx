'use client';

import { useEffect, useState } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, AlertTriangle, CheckCircle2, Code } from 'lucide-react';
import CodeCopyButton from '@/components/docs/code-copy-button';

// Custom MDX components
const components = {
  h1: (props: any) => (
    <h1 className='text-4xl font-bold mb-6 mt-8 first:mt-0 pb-2 border-b' {...props} />
  ),
  h2: (props: any) => (
    <h2 className='text-3xl font-semibold mb-4 mt-8 pb-2 border-b' {...props} />
  ),
  h3: (props: any) => <h3 className='text-2xl font-semibold mb-3 mt-6' {...props} />,
  h4: (props: any) => <h4 className='text-xl font-semibold mb-2 mt-4' {...props} />,
  h5: (props: any) => <h5 className='text-lg font-semibold mb-2 mt-3' {...props} />,
  h6: (props: any) => <h6 className='text-base font-semibold mb-2 mt-3' {...props} />,
  p: (props: any) => <p className='mb-4 leading-7' {...props} />,
  a: (props: any) => (
    <a className='text-blue-600 hover:text-blue-800 underline underline-offset-2' {...props} />
  ),
  ul: (props: any) => <ul className='list-disc list-inside mb-4 space-y-2' {...props} />,
  ol: (props: any) => <ol className='list-decimal list-inside mb-4 space-y-2' {...props} />,
  li: (props: any) => <li className='leading-7' {...props} />,
  blockquote: (props: any) => (
    <blockquote className='border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700' {...props} />
  ),
  code: (props: any) => {
    const { className, children } = props;
    const isInline = !className;

    if (isInline) {
      return (
        <code
          className='bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono'
          {...props}
        />
      );
    }

    // Extract code content for copy button
    const codeContent = typeof children === 'string' ? children : String(children);

    return (
      <div className='relative my-4 group'>
        <CodeCopyButton code={codeContent.trim()} />
        <pre className='bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto'>
          <code className='font-mono text-sm' {...props} />
        </pre>
      </div>
    );
  },
  pre: (props: any) => <div {...props} />, // Wrapper is handled by code component
  table: (props: any) => (
    <div className='overflow-x-auto my-4'>
      <table className='min-w-full border-collapse border border-gray-300' {...props} />
    </div>
  ),
  thead: (props: any) => <thead className='bg-gray-100 dark:bg-gray-800' {...props} />,
  tbody: (props: any) => <tbody {...props} />,
  tr: (props: any) => <tr className='border-b border-gray-300' {...props} />,
  th: (props: any) => <th className='border border-gray-300 px-4 py-2 text-left font-semibold' {...props} />,
  td: (props: any) => <td className='border border-gray-300 px-4 py-2' {...props} />,
  hr: (props: any) => <hr className='my-8 border-t-2 border-gray-200' {...props} />,
  img: (props: any) => (
    <img className='max-w-full h-auto rounded-lg my-4' alt='' {...props} />
  ),
  // Custom components for enhanced documentation
  Alert: ({ type = 'info', title, children }: any) => {
    const icons = {
      info: <InfoIcon className='h-4 w-4' />,
      warning: <AlertTriangle className='h-4 w-4' />,
      success: <CheckCircle2 className='h-4 w-4' />,
      error: <AlertTriangle className='h-4 w-4' />,
    };

    const variants = {
      info: 'border-blue-500 bg-blue-50 text-blue-900',
      warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
      success: 'border-green-500 bg-green-50 text-green-900',
      error: 'border-red-500 bg-red-50 text-red-900',
    };

    return (
      <Alert className={`my-4 ${variants[type as keyof typeof variants]}`}>
        {icons[type as keyof typeof icons]}
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    );
  },
  Card: ({ title, children }: any) => (
    <Card className='my-4'>
      <CardContent className='pt-6'>
        {title && <h4 className='font-semibold mb-2'>{title}</h4>}
        {children}
      </CardContent>
    </Card>
  ),
  Badge: (props: any) => <Badge className='mx-1' {...props} />,
  CodeBlock: ({ title, language, children }: any) => (
    <div className='my-4'>
      {title && (
        <div className='bg-gray-800 text-gray-100 px-4 py-2 rounded-t-lg flex items-center gap-2'>
          <Code className='h-4 w-4' />
          <span className='text-sm font-medium'>{title}</span>
          {language && <Badge variant='outline'>{language}</Badge>}
        </div>
      )}
      <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${title ? 'rounded-b-lg' : 'rounded-lg'}`}>
        <code className='font-mono text-sm'>{children}</code>
      </pre>
    </div>
  ),
};

interface MDXPreviewProps {
  content: string;
}

export default function MDXPreview({ content }: MDXPreviewProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const serializeContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await serialize(content, {
          mdxOptions: {
            development: false,
          },
        });
        setMdxSource(result);
      } catch (err) {
        console.error('MDX serialization error:', err);
        setError((err as Error).message || 'Failed to parse MDX content');
      } finally {
        setIsLoading(false);
      }
    };

    if (content) {
      serializeContent();
    } else {
      setMdxSource(null);
      setIsLoading(false);
    }
  }, [content]);

  if (isLoading) {
    return (
      <div className='p-8 text-center text-muted-foreground'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-3/4'></div>
          <div className='h-4 bg-gray-200 rounded w-full'></div>
          <div className='h-4 bg-gray-200 rounded w-5/6'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>MDX Parse Error</AlertTitle>
        <AlertDescription className='font-mono text-sm'>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!mdxSource) {
    return (
      <div className='p-8 text-center text-muted-foreground'>
        <p>Start writing to see the preview...</p>
      </div>
    );
  }

  return (
    <div className='prose prose-gray dark:prose-invert max-w-none'>
      <MDXRemote {...mdxSource} components={components} />
    </div>
  );
}
