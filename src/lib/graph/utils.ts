/**
 * T014: Graph Utilities
 * 
 * Helper functions for graph manipulation.
 * 
 * @pattern Follows /src/lib/courses/format.ts structure
 */

import type { KnowledgeGraph, GraphNode, GraphEdge } from './types';

/**
 * Filter graph by depth from a start node
 * Uses BFS traversal to include only nodes within maxDepth edges
 * 
 * @param graph - Knowledge graph
 * @param startNodeId - Starting node ID
 * @param maxDepth - Maximum edge distance to include
 * @returns Filtered graph
 */
export function filterByDepth(
  graph: KnowledgeGraph,
  startNodeId: string,
  maxDepth: number
): KnowledgeGraph {
  if (maxDepth === 0) {
    const startNode = graph.nodes.find((n) => n.id === startNodeId);
    return {
      ...graph,
      nodes: startNode ? [startNode] : [],
      edges: [],
      metadata: {
        ...graph.metadata,
        nodeCount: startNode ? 1 : 0,
        edgeCount: 0,
      },
    };
  }

  // Build adjacency map
  const adjacency = new Map<string, Set<string>>();
  graph.edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, new Set());
    }
    if (!adjacency.has(edge.target)) {
      adjacency.set(edge.target, new Set());
    }
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  });

  // BFS traversal
  const visited = new Set<string>([startNodeId]);
  const queue: Array<{ id: string; depth: number }> = [{ id: startNodeId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    
    if (depth < maxDepth) {
      const neighbors = adjacency.get(id) || new Set();
      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, depth: depth + 1 });
        }
      });
    }
  }

  // Filter nodes and edges
  const filteredNodes = graph.nodes.filter((node) => visited.has(node.id));
  const filteredEdges = graph.edges.filter(
    (edge) => visited.has(edge.source) && visited.has(edge.target)
  );

  return {
    ...graph,
    nodes: filteredNodes,
    edges: filteredEdges,
    metadata: {
      ...graph.metadata,
      nodeCount: filteredNodes.length,
      edgeCount: filteredEdges.length,
      depth: maxDepth,
    },
  };
}

/**
 * Find shortest path between two nodes
 * Uses BFS to find the shortest path
 * 
 * @param graph - Knowledge graph
 * @param startId - Start node ID
 * @param endId - End node ID
 * @returns Array of node IDs in path, or empty array if no path
 */
export function findPath(
  graph: KnowledgeGraph,
  startId: string,
  endId: string
): string[] {
  if (startId === endId) {
    return [startId];
  }

  // Build adjacency map
  const adjacency = new Map<string, Set<string>>();
  graph.edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, new Set());
    }
    if (!adjacency.has(edge.target)) {
      adjacency.set(edge.target, new Set());
    }
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  });

  // BFS with path tracking
  const visited = new Set<string>([startId]);
  const queue: Array<{ id: string; path: string[] }> = [
    { id: startId, path: [startId] },
  ];

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    const neighbors = adjacency.get(id) || new Set();
    for (const neighborId of neighbors) {
      if (neighborId === endId) {
        return [...path, neighborId];
      }

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({ id: neighborId, path: [...path, neighborId] });
      }
    }
  }

  return []; // No path found
}

/**
 * Get all nodes connected to a given node
 * 
 * @param graph - Knowledge graph
 * @param nodeId - Node ID
 * @returns Array of connected node IDs
 */
export function getConnectedNodes(
  graph: KnowledgeGraph,
  nodeId: string
): string[] {
  const connected = new Set<string>();

  graph.edges.forEach((edge) => {
    if (edge.source === nodeId) {
      connected.add(edge.target);
    } else if (edge.target === nodeId) {
      connected.add(edge.source);
    }
  });

  return Array.from(connected);
}

/**
 * Calculate graph statistics
 * 
 * @param graph - Knowledge graph
 * @returns Statistics object
 */
export function calculateStats(graph: KnowledgeGraph): {
  totalNodes: number;
  totalEdges: number;
  avgDegree: number;
  maxDepth: number;
} {
  const totalNodes = graph.nodes.length;
  const totalEdges = graph.edges.length;

  // Calculate average degree (connections per node)
  const degrees = new Map<string, number>();
  graph.edges.forEach((edge) => {
    degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
    degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
  });

  const avgDegree =
    totalNodes > 0
      ? Array.from(degrees.values()).reduce((sum, d) => sum + d, 0) / totalNodes
      : 0;

  // Calculate max depth (longest shortest path)
  let maxDepth = 0;
  if (totalNodes > 0 && totalNodes < 100) {
    // Only calculate for smaller graphs to avoid performance issues
    const nodes = graph.nodes.map((n) => n.id);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const path = findPath(graph, nodes[i], nodes[j]);
        if (path.length > 0) {
          maxDepth = Math.max(maxDepth, path.length - 1);
        }
      }
    }
  }

  return {
    totalNodes,
    totalEdges,
    avgDegree,
    maxDepth,
  };
}

/**
 * Group nodes by module
 * 
 * @param graph - Knowledge graph
 * @returns Map of module ID to nodes
 */
export function groupByModule(
  graph: KnowledgeGraph
): Map<string, GraphNode[]> {
  const groups = new Map<string, GraphNode[]>();

  graph.nodes.forEach((node) => {
    if (node.type === 'lesson' || node.type === 'sublesson') {
      const moduleId = node.moduleId || 'unknown';
      if (!groups.has(moduleId)) {
        groups.set(moduleId, []);
      }
      groups.get(moduleId)!.push(node);
    } else if (node.type === 'module') {
      if (!groups.has(node.id)) {
        groups.set(node.id, []);
      }
    }
  });

  return groups;
}
