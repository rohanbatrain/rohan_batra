# Braindump Internal Linking - Implementation Guide

## Overview
Implement wiki-style internal linking (`[[note-title]]`) for braindumps, creating a personal knowledge graph with bidirectional links and autocomplete.

## Current State Analysis

### ✅ What You Have
1. **MDX Rendering System** - `ContentRenderer.tsx` with `next-mdx-remote`
2. **Braindump Model** - Already has `associations` array field
3. **Search API** - `/api/admin/braindump` with text search
4. **Quick Capture UI** - `BraindumpQuickCapture.tsx` with textarea
5. **Card Display** - `BraindumpCard.tsx` showing content

### 🎯 What to Build
1. **Link syntax parsing** - `[[braindump:id|title]]` or `[[id]]`
2. **Autocomplete dropdown** - Search while typing `[[`
3. **Clickable links in display** - Render as links in BraindumpCard
4. **Backlinks panel** - Show "Referenced by" section
5. **Bidirectional references** - Auto-update linkedTo/linkedFrom

---

## Phase 1: Database Schema Extension

### Update Braindump Model

**File:** `src/models/Braindump.ts`

```typescript
export interface IBraindump extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  userId: mongoose.Types.ObjectId;
  
  // NEW: Internal linking fields
  linkedTo?: mongoose.Types.ObjectId[];      // Outgoing links
  linkedFrom?: mongoose.Types.ObjectId[];    // Backlinks (auto-populated)
  
  associations?: Array<{/* existing */}>;
  metadata?: {/* existing */};
  processedInto?: {/* existing */};
  createdAt: Date;
  updatedAt: Date;
}

const braindumpSchema = new Schema<IBraindump>(
  {
    // ... existing fields ...
    
    // NEW: Internal linking fields
    linkedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      index: true,
    }],
    linkedFrom: [{
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      index: true,
    }],
  },
  { timestamps: true }
);

// NEW: Index for link queries
braindumpSchema.index({ userId: 1, linkedTo: 1 });
braindumpSchema.index({ userId: 1, linkedFrom: 1 });
```

---

## Phase 2: Link Parsing Utility

### Create Link Parser

**File:** `src/lib/braindump/link-parser.ts`

```typescript
import mongoose from 'mongoose';

export interface BraindumpLink {
  raw: string;              // [[braindump:123|My Note]]
  braindumpId: string;      // 123 or ObjectId string
  displayText?: string;     // "My Note" (optional)
  startIndex: number;
  endIndex: number;
}

/**
 * Parse braindump links from content
 * Supports formats:
 * - [[braindumpId]]
 * - [[braindumpId|Display Text]]
 * - [[braindump:braindumpId]]
 * - [[braindump:braindumpId|Display Text]]
 */
export function parseBraindumpLinks(content: string): BraindumpLink[] {
  const links: BraindumpLink[] = [];
  
  // Regex: [[optional-braindump:id|optional-display]]
  const linkRegex = /\[\[(?:braindump:)?([a-f0-9]{24})(?:\|([^\]]+))?\]\]/gi;
  
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      raw: match[0],
      braindumpId: match[1],
      displayText: match[2] || undefined,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }
  
  return links;
}

/**
 * Extract unique braindump IDs from content
 */
export function extractLinkedBraindumpIds(content: string): string[] {
  const links = parseBraindumpLinks(content);
  const uniqueIds = new Set(links.map(link => link.braindumpId));
  return Array.from(uniqueIds);
}

/**
 * Validate if string is valid MongoDB ObjectId
 */
export function isValidBraindumpId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Replace braindump links with HTML/React markup
 * For rendering in BraindumpCard
 */
export function renderBraindumpLinks(
  content: string,
  braindumps: Map<string, { _id: string; content: string }>
): string {
  const links = parseBraindumpLinks(content);
  
  // Sort by position (reverse) to replace from end to start
  links.sort((a, b) => b.startIndex - a.startIndex);
  
  let result = content;
  
  for (const link of links) {
    const braindump = braindumps.get(link.braindumpId);
    const displayText = link.displayText || 
                        braindump?.content.slice(0, 50) || 
                        'Unknown Note';
    
    const replacement = `<a href="/admin/braindump?id=${link.braindumpId}" class="braindump-link" data-braindump-id="${link.braindumpId}" title="${braindump?.content.slice(0, 100) || ''}">${displayText}</a>`;
    
    result = result.slice(0, link.startIndex) + 
             replacement + 
             result.slice(link.endIndex);
  }
  
  return result;
}
```

---

## Phase 3: API Enhancements

### 3.1 Update POST API to Extract Links

**File:** `src/app/api/admin/braindump/route.ts`

```typescript
import { parseBraindumpLinks, extractLinkedBraindumpIds } from '@/lib/braindump/link-parser';

export async function POST(request: NextRequest) {
  try {
    // ... existing auth & validation ...
    
    const validatedData = createBraindumpSchema.parse(body);
    
    // NEW: Extract linked braindump IDs
    const linkedBraindumpIds = extractLinkedBraindumpIds(validatedData.content);
    const validLinkedIds = linkedBraindumpIds
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    // Create braindump with links
    const braindump = new BraindumpModel({
      userId,
      content: validatedData.content,
      tags: validatedData.tags,
      category: validatedData.category || '',
      priority: validatedData.priority,
      associations: validatedData.associations,
      metadata: validatedData.metadata || {},
      linkedTo: validLinkedIds,  // NEW: Store outgoing links
    });

    await braindump.save();
    
    // NEW: Update backlinks on referenced braindumps
    if (validLinkedIds.length > 0) {
      await BraindumpModel.updateMany(
        { _id: { $in: validLinkedIds }, userId },
        { $addToSet: { linkedFrom: braindump._id } }
      );
    }

    return NextResponse.json(braindump, { status: 201 });
  } catch (error) {
    // ... error handling ...
  }
}
```

### 3.2 Update PUT API for Link Updates

**File:** `src/app/api/admin/braindump/[id]/route.ts`

```typescript
export async function PUT(request, { params }) {
  try {
    // ... existing auth & validation ...
    
    const oldBraindump = await BraindumpModel.findOne({ _id: id, userId });
    if (!oldBraindump) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Extract new links
    const newLinkedIds = validatedData.content 
      ? extractLinkedBraindumpIds(validatedData.content)
          .filter(id => mongoose.Types.ObjectId.isValid(id))
          .map(id => new mongoose.Types.ObjectId(id))
      : oldBraindump.linkedTo || [];
    
    // Find added and removed links
    const oldLinkedIds = (oldBraindump.linkedTo || []).map(id => id.toString());
    const newLinkedIdsStr = newLinkedIds.map(id => id.toString());
    
    const addedLinks = newLinkedIds.filter(
      id => !oldLinkedIds.includes(id.toString())
    );
    const removedLinks = oldBraindump.linkedTo?.filter(
      id => !newLinkedIdsStr.includes(id.toString())
    ) || [];
    
    // Update braindump
    const updated = await BraindumpModel.findOneAndUpdate(
      { _id: id, userId },
      { 
        $set: { 
          ...validatedData,
          linkedTo: newLinkedIds 
        } 
      },
      { new: true, runValidators: true }
    );
    
    // Update backlinks
    if (addedLinks.length > 0) {
      await BraindumpModel.updateMany(
        { _id: { $in: addedLinks }, userId },
        { $addToSet: { linkedFrom: id } }
      );
    }
    
    if (removedLinks.length > 0) {
      await BraindumpModel.updateMany(
        { _id: { $in: removedLinks }, userId },
        { $pull: { linkedFrom: id } }
      );
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    // ... error handling ...
  }
}
```

### 3.3 Add Search Endpoint for Autocomplete

**File:** `src/app/api/admin/braindump/search/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BraindumpModel from '@/models/Braindump';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/admin/braindump/search
 * Quick search for autocomplete (returns compact results)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = (await User.findOne({ clerkId }).lean()) as { _id: mongoose.Types.ObjectId } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    
    if (!query.trim()) {
      // Return recent braindumps if no query
      const recent = await BraindumpModel.find({ userId })
        .select('_id content createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      return NextResponse.json({
        results: recent.map(b => ({
          _id: b._id,
          preview: b.content.slice(0, 100),
          createdAt: b.createdAt,
        })),
      });
    }
    
    // Search by content
    const results = await BraindumpModel.find({
      userId,
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    })
      .select('_id content tags category createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      results: results.map(b => ({
        _id: b._id,
        preview: b.content.slice(0, 100),
        tags: b.tags,
        category: b.category,
        createdAt: b.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Braindump search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}
```

---

## Phase 4: Autocomplete Component

### Create Link Autocomplete

**File:** `src/components/admin/braindump/BraindumpLinkAutocomplete.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Loader2 } from 'lucide-react';

interface BraindumpSuggestion {
  _id: string;
  preview: string;
  tags?: string[];
  category?: string;
  createdAt: string;
}

interface BraindumpLinkAutocompleteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
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
      setPosition({
        top: coords.top + 20,
        left: coords.left,
      });
    } else {
      setIsOpen(false);
    }
  }, [textareaRef]);

  // Fetch suggestions
  useEffect(() => {
    if (!isOpen || !query) {
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
      if (!isOpen) {
        if (e.key === '[' && textarea.value[textarea.selectionStart - 1] === '[') {
          detectLinkPattern();
        }
        return;
      }

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
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            handleSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverContent
        className="w-[400px] p-0"
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 50,
        }}
      >
        <Command>
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>No braindumps found</CommandEmpty>
            ) : (
              <CommandGroup heading="Link to Braindump">
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={suggestion._id}
                    onSelect={() => handleSelect(suggestion)}
                    className={index === selectedIndex ? 'bg-accent' : ''}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {suggestion.preview.slice(0, 60)}...
                      </span>
                      {suggestion.tags && suggestion.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Tags: {suggestion.tags.join(', ')}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Helper: Get caret coordinates
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const style = getComputedStyle(element);
  
  // Copy styles
  ['font', 'letterSpacing', 'lineHeight', 'padding', 'border'].forEach(prop => {
    div.style[prop as any] = style[prop as any];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  
  div.textContent = element.value.substring(0, position);
  document.body.appendChild(div);
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  const coordinates = {
    top: span.offsetTop + element.offsetTop,
    left: span.offsetLeft + element.offsetLeft,
  };
  
  document.body.removeChild(div);
  return coordinates;
}
```

---

## Phase 5: Update Quick Capture Component

**File:** `src/components/admin/braindump/BraindumpQuickCapture.tsx`

```tsx
'use client';

import { useState, useRef } from 'react';
import { BraindumpLinkAutocomplete } from './BraindumpLinkAutocomplete';
// ... other imports ...

export function BraindumpQuickCapture({ onSuccess }: BraindumpQuickCaptureProps) {
  // ... existing state ...
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLinkSelect = (braindumpId: string, displayText: string) => {
    console.log('Link selected:', braindumpId, displayText);
    // Link is already inserted by autocomplete component
  };

  // ... existing handlers ...

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Capture</CardTitle>
        <p className="text-sm text-muted-foreground">
          Type [[ to link to another braindump
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className="relative">
            <Label htmlFor='content'>Content *</Label>
            <Textarea
              ref={textareaRef}
              id='content'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Type [[ to link to another note."
              rows={6}
              className='mt-1 font-mono'
              required
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {content.length} / 10,000 characters • [[ to link notes
            </p>
            
            {/* Autocomplete */}
            <BraindumpLinkAutocomplete
              textareaRef={textareaRef}
              onSelect={handleLinkSelect}
            />
          </div>

          {/* ... rest of form ... */}
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## Phase 6: Display Links in Card

### Update BraindumpCard to Render Links

**File:** `src/components/admin/braindump/BraindumpCard.tsx`

```tsx
'use client';

import { useMemo } from 'react';
import { parseBraindumpLinks } from '@/lib/braindump/link-parser';
import { Link2 } from 'lucide-react';

export function BraindumpCard({ braindump, onUpdate, onEdit }: BraindumpCardProps) {
  // ... existing code ...

  // Parse and render internal links
  const renderedContent = useMemo(() => {
    const links = parseBraindumpLinks(braindump.content);
    
    if (links.length === 0) {
      return braindump.content;
    }

    // Split content into parts
    let parts: JSX.Element[] = [];
    let lastIndex = 0;

    links.forEach((link, i) => {
      // Text before link
      if (link.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {braindump.content.slice(lastIndex, link.startIndex)}
          </span>
        );
      }

      // Link
      parts.push(
        <a
          key={`link-${i}`}
          href={`/admin/braindump?id=${link.braindumpId}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-dotted"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Open braindump in modal or navigate
            window.location.href = `/admin/braindump?id=${link.braindumpId}`;
          }}
        >
          <Link2 className="h-3 w-3" />
          {link.displayText || `Note ${link.braindumpId.slice(-6)}`}
        </a>
      );

      lastIndex = link.endIndex;
    });

    // Text after last link
    if (lastIndex < braindump.content.length) {
      parts.push(
        <span key="text-end">
          {braindump.content.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  }, [braindump.content]);

  return (
    <Card>
      {/* ... existing header ... */}

      <CardContent className='space-y-3'>
        <div className='text-sm whitespace-pre-wrap'>
          {renderedContent}
        </div>

        {/* Show linked notes count */}
        {braindump.linkedTo && braindump.linkedTo.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3" />
            <span>Links to {braindump.linkedTo.length} notes</span>
          </div>
        )}

        {/* ... rest of content ... */}
      </CardContent>
    </Card>
  );
}
```

---

## Phase 7: Backlinks Panel

### Add Backlinks Section

**File:** `src/components/admin/braindump/BraindumpBacklinks.tsx` (NEW)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Loader2 } from 'lucide-react';

interface BacklinkBraindump {
  _id: string;
  content: string;
  tags: string[];
  priority: string;
  createdAt: string;
}

interface BraindumpBacklinksProps {
  braindumpId: string;
}

export function BraindumpBacklinks({ braindumpId }: BraindumpBacklinksProps) {
  const [backlinks, setBacklinks] = useState<BacklinkBraindump[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBacklinks = async () => {
      try {
        const response = await fetch(
          `/api/admin/braindump/${braindumpId}/backlinks`
        );
        const data = await response.json();
        setBacklinks(data.backlinks || []);
      } catch (error) {
        console.error('Failed to fetch backlinks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBacklinks();
  }, [braindumpId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (backlinks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          Referenced By ({backlinks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {backlinks.map((backlink) => (
          <div
            key={backlink._id}
            className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => window.location.href = `/admin/braindump?id=${backlink._id}`}
          >
            <p className="text-sm line-clamp-2">{backlink.content}</p>
            <div className="flex items-center gap-2 mt-2">
              {backlink.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Add Backlinks API

**File:** `src/app/api/admin/braindump/[id]/backlinks/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BraindumpModel from '@/models/Braindump';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await connectToDatabase();

    const user = (await User.findOne({ clerkId }).lean()) as { _id: mongoose.Types.ObjectId } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;

    // Find braindumps that link to this one
    const backlinks = await BraindumpModel.find({
      userId,
      linkedTo: id,
    })
      .select('_id content tags priority createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ backlinks });
  } catch (error: any) {
    console.error('Backlinks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backlinks', details: error.message },
      { status: 500 }
    );
  }
}
```

---

## Implementation Checklist

### Phase 1: Foundation ✅
- [ ] Update `Braindump.ts` model with `linkedTo` and `linkedFrom` fields
- [ ] Add indexes for link queries
- [ ] Create `link-parser.ts` utility

### Phase 2: API ✅
- [ ] Update POST `/api/admin/braindump` to extract and store links
- [ ] Update PUT `/api/admin/braindump/[id]` to handle link changes
- [ ] Create GET `/api/admin/braindump/search` for autocomplete
- [ ] Create GET `/api/admin/braindump/[id]/backlinks` for backlinks

### Phase 3: UI Components ✅
- [ ] Create `BraindumpLinkAutocomplete.tsx`
- [ ] Update `BraindumpQuickCapture.tsx` with autocomplete
- [ ] Update `BraindumpCard.tsx` to render links
- [ ] Create `BraindumpBacklinks.tsx` component
- [ ] Add Command component from shadcn/ui if not exists

### Phase 4: Styling ✅
- [ ] Add link styles to global CSS
- [ ] Style autocomplete dropdown
- [ ] Add hover tooltips for link previews
- [ ] Mobile responsive design

### Phase 5: Testing ✅
- [ ] Test link parsing with various formats
- [ ] Test autocomplete UX
- [ ] Test bidirectional link updates
- [ ] Test backlinks display
- [ ] Test link deletion handling

---

## Usage Examples

### Creating Links

```
# In Quick Capture textarea

I'm thinking about [[673abc123...456|My First Note]] and how it relates to 
the concepts in [[673def789...012]].

This builds on my earlier ideas about [[673ghi345...678|Knowledge Management]].
```

### Link Formats Supported

1. **Full format:** `[[braindumpId|Display Text]]`
2. **Short format:** `[[braindumpId]]` (shows auto-generated preview)
3. **With prefix:** `[[braindump:braindumpId|Text]]`

### Autocomplete Trigger

- Type `[[` in textarea
- Autocomplete dropdown appears
- Type to search braindumps
- Use arrow keys to navigate
- Press Enter or click to insert

---

## Future Enhancements

### Phase 2+
1. **Graph Visualization** - Use D3.js or Cytoscape
2. **Orphan Detection** - Find unlinked notes
3. **Hub Detection** - Most connected notes
4. **Link Suggestions** - AI-based recommendations
5. **Transclusion** - Embed note content `![[id]]`
6. **Block References** - Link to specific paragraphs
7. **Alias Support** - Multiple display names per note
8. **Link Context** - Show surrounding text in backlinks

---

## Dependencies Needed

```bash
# Install Command component if not already installed
npx shadcn-ui@latest add command

# Install Popover if not already installed  
npx shadcn-ui@latest add popover
```

---

## Testing Commands

```bash
# Test link parsing
curl http://localhost:3000/api/admin/braindump/search?q=test

# Create braindump with links
curl -X POST http://localhost:3000/api/admin/braindump \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test [[673abc...123|First Note]] link",
    "priority": "medium"
  }'

# Get backlinks
curl http://localhost:3000/api/admin/braindump/673abc...123/backlinks
```

---

**Status:** 📋 READY TO IMPLEMENT  
**Estimated Time:** 6-8 hours  
**Complexity:** Medium  
**Impact:** High - transforms braindumps into knowledge graph
