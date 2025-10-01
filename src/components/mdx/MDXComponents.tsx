import React from 'react';

export const MDXComponents: Record<string, React.ComponentType<any>> = {
  h1: (props: any) => <h1 {...props} className='mt-10 scroll-m-20 text-4xl font-bold tracking-tight first:mt-0' />,
  h2: (props: any) => <h2 {...props} className='mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0' />,
  h3: (props: any) => <h3 {...props} className='mt-8 scroll-m-20 text-2xl font-semibold tracking-tight' />,
  h4: (props: any) => <h4 {...props} className='mt-8 scroll-m-20 text-xl font-semibold tracking-tight' />,
  p: (props: any) => <p {...props} className='leading-7 [&:not(:first-child)]:mt-6' />,
  ul: (props: any) => <ul {...props} className='my-6 ml-6 list-disc' />,
  ol: (props: any) => <ol {...props} className='my-6 ml-6 list-decimal' />,
  li: (props: any) => <li {...props} className='mt-2' />,
  a: (props: any) => <a {...props} className='font-medium text-blue-600 hover:underline dark:text-blue-400' />,
  blockquote: (props: any) => (
    <blockquote {...props} className='mt-6 border-l-2 pl-6 italic text-gray-700 dark:text-gray-300' />
  ),
  code: (props: any) => (
    <code {...props} className='relative rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-800' />
  ),
  pre: (props: any) => (
    <pre
      {...props}
      className='mb-4 mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'
    />
  ),
  hr: (props: any) => <hr {...props} className='my-8 border-gray-200 dark:border-gray-700' />,
};

export const mdxProseBase = 'prose prose-slate dark:prose-invert max-w-none';
