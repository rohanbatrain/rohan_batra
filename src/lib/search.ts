/**
 * Full-Text Search Implementation
 * Supports MongoDB Atlas Search (when available) with regex fallback
 */

import { Types } from 'mongoose';
import Braindump from '@/models/Braindump';

export interface SearchOptions {
  query: string;
  tags?: string[];
  visibility?: ('public' | 'unlisted')[];
  limit?: number;
  skip?: number;
  sortBy?: 'relevance' | 'recent' | 'popular';
}

export interface SearchResult {
  _id: string;
  content: string;
  slug?: string;
  tags: string[];
  category?: string;
  visibility: 'private' | 'unlisted' | 'public';
  viewCount: number;
  shareCount: number;
  commentCount: number;
  reactionCount: number;
  createdAt: Date;
  relevanceScore?: number;
}

/**
 * Check if MongoDB Atlas Search is available
 */
async function isAtlasSearchAvailable(): Promise<boolean> {
  try {
    // Try to use $search operator - will fail if not on Atlas
    await Braindump.aggregate([
      {
        $search: {
          index: 'braindump_search',
          text: {
            query: 'test',
            path: ['content', 'tags'],
          },
        },
      },
      { $limit: 1 },
    ]).exec();
    return true;
  } catch (error: any) {
    // If error contains 'search' or '$search', Atlas Search not available
    if (error.message?.includes('search') || error.message?.includes('$search')) {
      return false;
    }
    // Other errors might indicate connection issues
    console.warn('Atlas Search availability check failed:', error.message);
    return false;
  }
}

/**
 * Perform full-text search using MongoDB Atlas Search
 */
async function searchWithAtlas(options: SearchOptions): Promise<SearchResult[]> {
  const {
    query,
    tags = [],
    visibility = ['public', 'unlisted'],
    limit = 20,
    skip = 0,
    sortBy = 'relevance',
  } = options;

  const pipeline: any[] = [
    {
      $search: {
        index: 'braindump_search',
        compound: {
          must: [
            {
              text: {
                query,
                path: ['content', 'tags', 'category'],
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 3,
                },
              },
            },
          ],
          filter: [
            {
              in: {
                path: 'visibility',
                value: visibility,
              },
            },
          ],
        },
      },
    },
    {
      $addFields: {
        relevanceScore: { $meta: 'searchScore' },
      },
    },
  ];

  // Add tag filter if specified
  if (tags.length > 0) {
    pipeline.push({
      $match: {
        tags: { $in: tags },
      },
    });
  }

  // Sort based on preference
  if (sortBy === 'relevance') {
    pipeline.push({ $sort: { relevanceScore: -1, createdAt: -1 } });
  } else if (sortBy === 'recent') {
    pipeline.push({ $sort: { createdAt: -1 } });
  } else if (sortBy === 'popular') {
    pipeline.push({
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: ['$viewCount', 1] },
            { $multiply: ['$shareCount', 5] },
            { $multiply: ['$commentCount', 3] },
            { $multiply: ['$reactionCount', 2] },
          ],
        },
      },
    });
    pipeline.push({ $sort: { popularityScore: -1, createdAt: -1 } });
  }

  // Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Project fields
  pipeline.push({
    $project: {
      _id: 1,
      content: 1,
      slug: 1,
      tags: 1,
      category: 1,
      visibility: 1,
      viewCount: 1,
      shareCount: 1,
      commentCount: 1,
      reactionCount: 1,
      createdAt: 1,
      relevanceScore: 1,
    },
  });

  const results = await Braindump.aggregate(pipeline).exec();

  return results.map((doc) => ({
    _id: doc._id.toString(),
    content: doc.content,
    slug: doc.slug,
    tags: doc.tags || [],
    category: doc.category,
    visibility: doc.visibility,
    viewCount: doc.viewCount || 0,
    shareCount: doc.shareCount || 0,
    commentCount: doc.commentCount || 0,
    reactionCount: doc.reactionCount || 0,
    createdAt: doc.createdAt,
    relevanceScore: doc.relevanceScore,
  }));
}

/**
 * Perform search using regex fallback (for non-Atlas deployments)
 */
async function searchWithRegex(options: SearchOptions): Promise<SearchResult[]> {
  const {
    query,
    tags = [],
    visibility = ['public', 'unlisted'],
    limit = 20,
    skip = 0,
    sortBy = 'relevance',
  } = options;

  // Build regex query
  const searchTerms = query
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape regex

  if (searchTerms.length === 0) {
    searchTerms.push(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  }

  // Build query
  const matchQuery: any = {
    visibility: { $in: visibility },
  };

  // Add text search conditions
  if (searchTerms.length > 0) {
    matchQuery.$or = [
      { content: { $regex: searchTerms.join('|'), $options: 'i' } },
      { tags: { $in: searchTerms.map((term) => new RegExp(term, 'i')) } },
      { category: { $regex: searchTerms.join('|'), $options: 'i' } },
    ];
  }

  // Add tag filter
  if (tags.length > 0) {
    matchQuery.tags = { $in: tags };
  }

  // Build aggregation pipeline
  const pipeline: any[] = [{ $match: matchQuery }];

  // Calculate relevance score manually
  pipeline.push({
    $addFields: {
      relevanceScore: {
        $add: [
          // Content match score
          {
            $cond: [
              { $regexMatch: { input: '$content', regex: query, options: 'i' } },
              10,
              0,
            ],
          },
          // Tag match score
          {
            $size: {
              $filter: {
                input: '$tags',
                as: 'tag',
                cond: { $regexMatch: { input: '$$tag', regex: query, options: 'i' } },
              },
            },
          },
          // Category match score
          {
            $cond: [
              { $regexMatch: { input: { $ifNull: ['$category', ''] }, regex: query, options: 'i' } },
              5,
              0,
            ],
          },
        ],
      },
    },
  });

  // Sort
  if (sortBy === 'relevance') {
    pipeline.push({ $sort: { relevanceScore: -1, createdAt: -1 } });
  } else if (sortBy === 'recent') {
    pipeline.push({ $sort: { createdAt: -1 } });
  } else if (sortBy === 'popular') {
    pipeline.push({
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: ['$viewCount', 1] },
            { $multiply: ['$shareCount', 5] },
            { $multiply: ['$commentCount', 3] },
            { $multiply: ['$reactionCount', 2] },
          ],
        },
      },
    });
    pipeline.push({ $sort: { popularityScore: -1, createdAt: -1 } });
  }

  // Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Project
  pipeline.push({
    $project: {
      _id: 1,
      content: 1,
      slug: 1,
      tags: 1,
      category: 1,
      visibility: 1,
      viewCount: 1,
      shareCount: 1,
      commentCount: 1,
      reactionCount: 1,
      createdAt: 1,
      relevanceScore: 1,
    },
  });

  const results = await Braindump.aggregate(pipeline).exec();

  return results.map((doc) => ({
    _id: doc._id.toString(),
    content: doc.content,
    slug: doc.slug,
    tags: doc.tags || [],
    category: doc.category,
    visibility: doc.visibility,
    viewCount: doc.viewCount || 0,
    shareCount: doc.shareCount || 0,
    commentCount: doc.commentCount || 0,
    reactionCount: doc.reactionCount || 0,
    createdAt: doc.createdAt,
    relevanceScore: doc.relevanceScore || 0,
  }));
}

/**
 * Main search function - automatically detects and uses best available method
 */
export async function searchBraindumps(options: SearchOptions): Promise<SearchResult[]> {
  // Check if query is too short
  if (options.query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  try {
    // Try Atlas Search first
    const hasAtlas = await isAtlasSearchAvailable();
    
    if (hasAtlas) {
      console.log('Using MongoDB Atlas Search');
      return await searchWithAtlas(options);
    } else {
      console.log('Using regex fallback search');
      return await searchWithRegex(options);
    }
  } catch (error) {
    console.error('Search error:', error);
    // Fallback to regex if Atlas fails
    return await searchWithRegex(options);
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<string[]> {
  if (query.length < 2) {
    return [];
  }

  try {
    // Get most common tags and categories matching query
    const results = await Braindump.aggregate([
      {
        $match: {
          visibility: { $in: ['public', 'unlisted'] },
          $or: [
            { tags: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } },
          ],
        },
      },
      { $unwind: '$tags' },
      {
        $match: {
          tags: { $regex: query, $options: 'i' },
        },
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]).exec();

    return results.map((r) => r._id);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
}
