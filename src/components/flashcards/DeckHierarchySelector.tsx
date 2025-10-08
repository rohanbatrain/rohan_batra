'use client';

import { useState } from 'react';
import { ChevronRight, BookOpen, FolderOpen, FileText, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeckNode {
  id: string;
  title: string;
  path: string;
  level: number;
  cardCount: number;
  scope: 'course' | 'module' | 'lesson';
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
}

interface DeckHierarchySelectorProps {
  decks: DeckNode[];
  onSelectDeck: (deck: DeckNode) => void;
  selectedDeckId?: string;
}

export function DeckHierarchySelector({
  decks,
  onSelectDeck,
  selectedDeckId,
}: DeckHierarchySelectorProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Build tree structure
  const rootDecks = decks.filter(d => d.level === 0);
  
  const getChildren = (parentPath: string) => {
    return decks.filter(
      d => d.path.startsWith(parentPath + '/') && 
      d.path.split('/').length === parentPath.split('/').length + 1
    );
  };

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderDeckNode = (deck: DeckNode, depth: number = 0) => {
    const children = getChildren(deck.path);
    const hasChildren = children.length > 0;
    const isExpanded = expandedPaths.has(deck.path);
    const isSelected = deck.id === selectedDeckId;

    const icon = {
      course: BookOpen,
      module: FolderOpen,
      lesson: FileText,
    }[deck.scope];

    const Icon = icon;

    return (
      <div key={deck.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
            'hover:bg-accent',
            isSelected && 'bg-primary/10 text-primary font-medium'
          )}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(deck.path);
              }}
              className="p-0.5 hover:bg-accent rounded"
            >
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <Icon className="w-4 h-4" />
          
          <button
            onClick={() => onSelectDeck(deck)}
            className="flex-1 flex items-center justify-between text-left"
          >
            <span className="truncate">{deck.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {deck.cardCount} cards
              </span>
              <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderDeckNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Select Study Scope
      </div>
      {rootDecks.map(deck => renderDeckNode(deck))}
      {decks.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8">
          No flashcard decks available yet.
        </div>
      )}
    </div>
  );
}
