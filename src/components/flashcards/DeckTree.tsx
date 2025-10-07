/**
 * Deck Tree Component
 * Displays flashcard decks in hierarchical tree structure
 *
 * Features:
 * - Collapsible/expandable nodes
 * - Nested deck visualization
 * - Due card counts
 * - Drag-and-drop support (future)
 */

'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Clock,
} from 'lucide-react';

export interface DeckNode {
  _id: string;
  title: string;
  slug: string;
  path: string;
  level: number;
  cardCount: number;
  dueCount: number;
  children?: DeckNode[];
  parentDeckId?: string | null;
}

interface DeckTreeProps {
  decks: DeckNode[];
  onDeckClick?: (deck: DeckNode) => void;
  onDeckMove?: (deckId: string, newParentId: string | null) => void;
  selectedDeckId?: string;
  showDueCounts?: boolean;
}

export function DeckTree({
  decks,
  onDeckClick,
  onDeckMove,
  selectedDeckId,
  showDueCounts = true,
}: DeckTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (deckId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(deckId)) {
        next.delete(deckId);
      } else {
        next.add(deckId);
      }
      return next;
    });
  };

  const renderDeckNode = (deck: DeckNode, depth: number = 0) => {
    const hasChildren = deck.children && deck.children.length > 0;
    const isExpanded = expandedNodes.has(deck._id);
    const isSelected = selectedDeckId === deck._id;

    return (
      <div key={deck._id} className='deck-tree-node'>
        <div
          className={`deck-tree-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => onDeckClick?.(deck)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              type='button'
              className='expand-button'
              onClick={e => {
                e.stopPropagation();
                toggleNode(deck._id);
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
            </button>
          )}

          {/* Folder Icon */}
          <span className='folder-icon'>
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className='w-4 h-4' />
              ) : (
                <Folder className='w-4 h-4' />
              )
            ) : (
              <Folder className='w-4 h-4 text-gray-400' />
            )}
          </span>

          {/* Deck Title */}
          <span className='deck-title'>{deck.title}</span>

          {/* Card Count */}
          <span className='card-count text-sm text-gray-500'>
            {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
          </span>

          {/* Due Count (if showing) */}
          {showDueCounts && deck.dueCount > 0 && (
            <span className='due-count text-sm text-orange-600 flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              {deck.dueCount} due
            </span>
          )}
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className='deck-tree-children'>
            {deck.children!.map(child => renderDeckNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='deck-tree'>
      {decks.length === 0 ? (
        <div className='empty-state p-4 text-center text-gray-500'>
          No decks found. Create your first deck to get started.
        </div>
      ) : (
        <div className='deck-tree-root'>
          {decks.map(deck => renderDeckNode(deck))}
        </div>
      )}

      <style jsx>{`
        .deck-tree {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .deck-tree-node {
          border-bottom: 1px solid #f3f4f6;
        }

        .deck-tree-node:last-child {
          border-bottom: none;
        }

        .deck-tree-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.15s;
          user-select: none;
        }

        .deck-tree-item:hover {
          background-color: #f9fafb;
        }

        .deck-tree-item.selected {
          background-color: #eff6ff;
          border-left: 3px solid #3b82f6;
        }

        .expand-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #6b7280;
          min-width: 16px;
        }

        .expand-button:hover {
          color: #374151;
        }

        .folder-icon {
          display: flex;
          align-items: center;
          color: #fbbf24;
        }

        .deck-title {
          flex: 1;
          font-weight: 500;
          color: #111827;
        }

        .card-count {
          margin-left: auto;
        }

        .due-count {
          margin-left: 8px;
          padding: 2px 8px;
          border-radius: 12px;
          background-color: #fef3c7;
          font-weight: 500;
        }

        .deck-tree-children {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
}

/**
 * Deck Breadcrumbs Component
 * Shows navigation trail for current deck
 */
interface DeckBreadcrumbsProps {
  breadcrumbs: Array<{ _id: string; title: string; slug: string }>;
  onNavigate?: (deckId: string) => void;
}

export function DeckBreadcrumbs({
  breadcrumbs,
  onNavigate,
}: DeckBreadcrumbsProps) {
  if (breadcrumbs.length === 0) return null;

  return (
    <nav className='deck-breadcrumbs' aria-label='Breadcrumb'>
      <ol className='flex items-center gap-2 text-sm'>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb._id} className='flex items-center gap-2'>
            {index > 0 && <span className='text-gray-400'>/</span>}
            <button
              type='button'
              className={`breadcrumb-link ${
                index === breadcrumbs.length - 1
                  ? 'text-gray-900 font-semibold'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
              onClick={() => onNavigate?.(crumb._id)}
              aria-current={
                index === breadcrumbs.length - 1 ? 'page' : undefined
              }
            >
              {crumb.title}
            </button>
          </li>
        ))}
      </ol>

      <style jsx>{`
        .deck-breadcrumbs {
          padding: 12px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .breadcrumb-link {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 14px;
        }

        .breadcrumb-link:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 2px;
        }
      `}</style>
    </nav>
  );
}
