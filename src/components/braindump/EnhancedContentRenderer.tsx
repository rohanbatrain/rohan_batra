'use client';

import { useMemo } from 'react';
import { parseBraindumpLinks } from '@/lib/braindump/link-parser';

interface EnhancedContentRendererProps {
  content: string;
  className?: string;
}

export default function EnhancedContentRenderer({ content, className = '' }: EnhancedContentRendererProps) {
  const enhancedContent = useMemo(() => {
    let processed = content;
    
    // Parse braindump links
    const links = parseBraindumpLinks(content);
    const sortedLinks = [...links].sort((a, b) => b.startIndex - a.startIndex);
    
    // Replace braindump links with inline markdown-style links
    for (const link of sortedLinks) {
      const idSuffix = link.braindumpId ? link.braindumpId.slice(-6) : 'link';
      const displayText = link.displayText || link.linkText || `Note ${idSuffix}`;
      const targetHref = link.braindumpId
        ? `/braindump/preview/${link.braindumpId}`
        : `/braindump?search=${encodeURIComponent(link.linkText || '')}`;
      const linkHtml = `<a href="${targetHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-baseline gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 decoration-blue-600/50 hover:decoration-blue-800/70 transition-all duration-200 font-medium cursor-pointer group" title="Internal link to: ${displayText}">
        <svg class="h-3 w-3 opacity-60 group-hover:opacity-80 transition-opacity flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71"/>
        </svg>
        <span class="group-hover:underline-offset-4 transition-all">${displayText}</span>
      </a>`;
      
      processed = processed.slice(0, link.startIndex) + linkHtml + processed.slice(link.endIndex);
    }
    
    // Enhanced formatting with code blocks, markdown features, and knowledge base styling
    processed = processed
      // Code blocks (```code```)
      .replace(/```([a-zA-Z]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang ? ` data-language="${lang}"` : '';
        return `<pre class="bg-muted/50 border border-border rounded-lg p-4 my-6 overflow-x-auto"><code class="text-sm font-mono text-foreground whitespace-pre"${language}>${code.trim()}</code></pre>`;
      })
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted/70 px-2 py-0.5 rounded text-sm font-mono text-foreground border border-border/50">$1</code>')
      
      // Markdown-style links [text](url)
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-600/50 hover:decoration-emerald-800/70 transition-all duration-200 font-medium group" title="External link: $2"><span class="group-hover:underline-offset-4 transition-all">$1</span><svg class="h-3 w-3 opacity-60 group-hover:opacity-80 transition-opacity flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>'
      )
      
      // Raw URLs - enhanced inline style
      .replace(
        /(^|[^"'>])(https?:\/\/[^\s<>"]+)/g, 
        '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-600/50 hover:decoration-emerald-800/70 transition-all duration-200 font-medium group" title="External link: $2"><span class="group-hover:underline-offset-4 transition-all">$2</span><svg class="h-3 w-3 opacity-60 group-hover:opacity-80 transition-opacity flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>'
      )
      
      // Enhanced headings with better spacing and borders
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-8 mb-4 text-foreground border-l-3 border-primary/30 pl-4 bg-primary/5 py-2 rounded-r-lg">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-10 mb-5 text-foreground border-b border-border pb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-8 text-foreground border-b-2 border-primary/30 pb-3">$1</h1>')
      
      // Enhanced lists with better styling
      .replace(/^[\-\*] (.+$)/gm, '<li class="ml-6 text-foreground relative before:content-[\"•\"] before:absolute before:-left-4 before:text-primary before:font-bold">$1</li>')
      
      // Wrap consecutive list items with better spacing
      .replace(/(<li[^>]*>[\s\S]*?<\/li>[\s]*?)+/g, '<ul class="space-y-2 my-6 pl-2">$&</ul>')
      
      // Blockquotes (lines starting with >)
      .replace(/^> (.+$)/gm, '<blockquote class="border-l-4 border-muted-foreground/30 pl-4 py-2 my-4 bg-muted/30 rounded-r-lg italic text-muted-foreground">$1</blockquote>')
      
      // Horizontal rules (--- or ***)
      .replace(/^(---|___|\*\*\*)$/gm, '<hr class="my-8 border-t border-border">')
      
      // Paragraphs with enhanced typography
      .split('\n\n')
      .map(paragraph => {
        if (paragraph.trim() === '') return '';
        if (paragraph.includes('<h1>') || paragraph.includes('<h2>') || paragraph.includes('<h3>') || paragraph.includes('<ul>') || paragraph.includes('<blockquote>') || paragraph.includes('<hr>')) {
          return paragraph;
        }
        return `<p class="mb-6 leading-7 text-foreground text-[15px] tracking-[0.01em]">${paragraph.trim()}</p>`;
      })
      .join('');

    return processed;
  }, [content]);

  return (
    <div 
      className={`prose prose-gray dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: enhancedContent }}
    />
  );
}