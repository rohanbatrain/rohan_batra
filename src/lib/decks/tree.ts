import mongoose from 'mongoose';
import FlashcardDeckModel from '@/models/FlashcardDeck';

export interface DeckTreeNode {
  id: string;
  slug: string;
  title: string;
  parentDeckId?: string | null;
  path: string;
  level: number;
  cardCount: number;
  dueCount: number;
  children?: DeckTreeNode[];
}

/**
 * Build a hierarchical tree structure from flat deck list
 */
export function buildDeckTree(decks: any[]): DeckTreeNode[] {
  const deckMap = new Map<string, DeckTreeNode>();
  const rootDecks: DeckTreeNode[] = [];

  // First pass: Create nodes
  for (const deck of decks) {
    const node: DeckTreeNode = {
      id: deck._id?.toString() || deck.id,
      slug: deck.slug,
      title: deck.title,
      parentDeckId: deck.parentDeckId?.toString() || null,
      path: deck.path,
      level: deck.level,
      cardCount: deck.cardCount || 0,
      dueCount: deck.dueCount || 0,
      children: [],
    };
    deckMap.set(node.id, node);
  }

  // Second pass: Build tree
  for (const node of deckMap.values()) {
    if (node.parentDeckId) {
      const parent = deckMap.get(node.parentDeckId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        rootDecks.push(node);
      }
    } else {
      rootDecks.push(node);
    }
  }

  // Sort children by title
  const sortChildren = (nodes: DeckTreeNode[]) => {
    nodes.sort((a, b) => a.title.localeCompare(b.title));
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    }
  };

  sortChildren(rootDecks);
  return rootDecks;
}

/**
 * Get all descendant deck IDs for a given deck
 */
export async function getDescendantDeckIds(deckId: string): Promise<string[]> {
  const deck = await FlashcardDeckModel.findById(deckId);
  if (!deck) return [];

  const descendants = await FlashcardDeckModel.find({
    path: { $regex: `^${deck.path}/` },
  }).select('_id');

  return descendants.map(d => d._id.toString());
}

/**
 * Validate that moving a deck won't create a cycle
 */
export async function validateDeckMove(
  deckId: string,
  newParentId: string | null
): Promise<{ valid: boolean; error?: string }> {
  if (!newParentId) {
    return { valid: true }; // Moving to root is always valid
  }

  if (deckId === newParentId) {
    return { valid: false, error: 'Cannot make a deck its own parent' };
  }

  // Check if new parent is a descendant of the deck being moved
  const descendantIds = await getDescendantDeckIds(deckId);
  if (descendantIds.includes(newParentId)) {
    return {
      valid: false,
      error: 'Cannot move a deck into its own descendant',
    };
  }

  // Check depth limit
  const newParent = await FlashcardDeckModel.findById(newParentId);
  if (newParent && newParent.level >= 5) {
    return { valid: false, error: 'Maximum nesting depth (6 levels) exceeded' };
  }

  return { valid: true };
}

/**
 * Update path and level for deck and all descendants after reparenting
 */
export async function updateDeckHierarchy(
  deckId: string,
  session?: mongoose.ClientSession
): Promise<void> {
  const deck = await FlashcardDeckModel.findById(deckId).session(
    session || null
  );
  if (!deck) return;

  // Update the deck itself (path/level set by pre-save hook)
  await deck.save({ session });

  // Find and update all descendants
  const descendants = await FlashcardDeckModel.find({
    path: { $regex: `^${deck.path}/` },
  }).session(session || null);

  for (const descendant of descendants) {
    // Recalculate path based on parent
    const parent = await FlashcardDeckModel.findById(
      descendant.parentDeckId
    ).session(session || null);
    if (parent) {
      descendant.level = parent.level + 1;
      descendant.path = `${parent.path}/${descendant.slug}`;
      await descendant.save({ session });
    }
  }
}

/**
 * Get breadcrumb trail for a deck
 */
export async function getDeckBreadcrumbs(
  deckId: string
): Promise<Array<{ id: string; title: string; slug: string }>> {
  const deck = await FlashcardDeckModel.findById(deckId);
  if (!deck) return [];

  const breadcrumbs: Array<{ id: string; title: string; slug: string }> = [];
  let current: any = deck;

  while (current) {
    breadcrumbs.unshift({
      id: current._id.toString(),
      title: current.title,
      slug: current.slug,
    });

    if (current.parentDeckId) {
      current = await FlashcardDeckModel.findById(current.parentDeckId);
    } else {
      break;
    }
  }

  return breadcrumbs;
}
