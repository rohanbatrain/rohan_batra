'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Loader2, Link2 } from 'lucide-react';

interface BraindumpSuggestion {
  _id: string;
  preview: string;
  tags?: string[];
  category?: string;
  createdAt: string;
}

interface BraindumpLinkAutocompleteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSelect: (braindumpId: string, displayText: string) => void;
}

export function BraindumpLinkAutocomplete({
  textareaRef,
  onSelect,
}: BraindumpLinkAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<BraindumpSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const linkStartPos = useRef<number>(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Detect [[ pattern
  const detectLinkPattern = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // Look backwards for [[
    const beforeCursor = value.slice(0, cursorPos);
    const linkMatch = beforeCursor.match(/\[\[([^\]]*?)$/);
    
    if (linkMatch) {
      const searchQuery = linkMatch[1];
      linkStartPos.current = cursorPos - searchQuery.length;
      setQuery(searchQuery);
      setIsOpen(true);
      
      // Calculate position
      const coords = getCaretCoordinates(textarea, cursorPos);
      const rect = textarea.getBoundingClientRect();
      setPosition({
        top: rect.top + coords.top + 20,
        left: rect.left + coords.left,
      });
    } else {
      setIsOpen(false);
    }
  }, [textareaRef]);

  // Fetch suggestions
  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/braindump/search?q=${encodeURIComponent(query)}&limit=10`
        );
        const data = await response.json();
        setSuggestions(data.results || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, isOpen]);

  // Handle selection
  const handleSelect = useCallback((suggestion: BraindumpSuggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // Replace [[query with [[braindumpId|preview]]
    const before = value.slice(0, linkStartPos.current - 2); // Remove [[
    const after = value.slice(cursorPos);
    const displayText = suggestion.preview.slice(0, 50).trim();
    const linkText = `[[${suggestion._id}|${displayText}]]`;
    
    const newValue = before + linkText + after;
    const newCursorPos = before.length + linkText.length;
    
    textarea.value = newValue;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // Trigger onChange
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    onSelect(suggestion._id, displayText);
    setIsOpen(false);
  }, [textareaRef, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always detect [[ pattern
      if (e.key === '[' && textarea.value[textarea.selectionStart - 1] === '[') {
        setTimeout(detectLinkPattern, 0);
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            handleSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    const handleInput = () => {
      detectLinkPattern();
    };

    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
      textarea.removeEventListener('input', handleInput);
    };
  }, [isOpen, suggestions, selectedIndex, detectLinkPattern, handleSelect, textareaRef]);

  if (!isOpen || !position) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="w-[400px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
        <Command className="rounded-lg border shadow-md">
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>
                {query ? 'No braindumps found' : 'Type to search braindumps...'}
              </CommandEmpty>
            ) : (
              <CommandGroup heading="Link to Braindump">
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={suggestion._id}
                    onSelect={() => handleSelect(suggestion)}
                    className={index === selectedIndex ? 'bg-accent' : ''}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium line-clamp-1">
                        {suggestion.preview.slice(0, 60)}...
                      </span>
                      {suggestion.tags && suggestion.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.tags.slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    </div>
  );
}

// Helper: Get caret coordinates relative to textarea
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const style = getComputedStyle(element);
  
  // Copy textarea styles
  const properties = [
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
  ];
  
  properties.forEach(prop => {
    div.style[prop as any] = style[prop as any];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.style.overflow = 'hidden';
  
  div.textContent = element.value.substring(0, position);
  document.body.appendChild(div);
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  const coordinates = {
    top: span.offsetTop,
    left: span.offsetLeft,
  };
  
  document.body.removeChild(div);
  return coordinates;
}
