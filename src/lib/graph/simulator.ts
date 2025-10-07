/**
 * T013: D3 Force Simulator Wrapper
 * 
 * Wrapper functions for D3 force simulation.
 * Applies force-directed layout to graph nodes.
 */

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';
import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  SimulationOptions,
  GraphBounds,
} from './types';

/**
 * Simulate graph layout using D3 force-directed algorithm
 * 
 * @param graph - Knowledge graph to simulate
 * @param options - Simulation options
 * @returns Graph with updated node positions
 */
export function simulateGraphLayout(
  graph: KnowledgeGraph,
  options: SimulationOptions = {}
): KnowledgeGraph {
  const {
    width = 1200,
    height = 800,
    maxIterations = Math.min(300, graph.nodes.length * 3),
    linkDistance = 100,
    chargeStrength = -300,
  } = options;

  // Handle empty graph
  if (graph.nodes.length === 0) {
    return graph;
  }

  // Handle single node
  if (graph.nodes.length === 1) {
    graph.nodes[0].x = width / 2;
    graph.nodes[0].y = height / 2;
    return graph;
  }

  const startTime = Date.now();

  // Create copies of nodes and edges for simulation
  const nodes = graph.nodes.map((node) => ({ ...node }));
  const edges = graph.edges.map((edge) => ({ ...edge }));

  // Create D3 force simulation
  const simulation = forceSimulation(nodes as any)
    .force(
      'link',
      forceLink(edges as any)
        .id((d: any) => d.id)
        .distance(linkDistance)
    )
    .force('charge', forceManyBody().strength(chargeStrength))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide().radius((d: any) => (d.size || 30) + 5))
    .stop();

  // Run simulation for specified iterations
  for (let i = 0; i < maxIterations; i++) {
    simulation.tick();
  }

  const elapsed = Date.now() - startTime;
  console.log(`[Simulator] Layout computed in ${elapsed}ms for ${nodes.length} nodes`);

  return {
    ...graph,
    nodes,
    edges,
  };
}

/**
 * Apply module grouping to graph layout
 * Groups lessons by their module using force positioning
 * 
 * @param graph - Knowledge graph
 * @returns Graph with module-grouped layout
 */
export function applyModuleGrouping(graph: KnowledgeGraph): KnowledgeGraph {
  const { nodes, edges } = graph;

  if (nodes.length === 0) {
    return graph;
  }

  // Group nodes by module
  const moduleGroups = new Map<string, GraphNode[]>();
  nodes.forEach((node) => {
    if (node.type === 'lesson' || node.type === 'sublesson') {
      const moduleId = node.moduleId || 'unknown';
      if (!moduleGroups.has(moduleId)) {
        moduleGroups.set(moduleId, []);
      }
      moduleGroups.get(moduleId)!.push(node);
    }
  });

  // Calculate module centers
  const moduleCount = moduleGroups.size;
  const angleStep = (2 * Math.PI) / moduleCount;
  const radius = 400;

  const moduleCenters = new Map<string, { x: number; y: number }>();
  let index = 0;
  moduleGroups.forEach((_, moduleId) => {
    const angle = index * angleStep;
    moduleCenters.set(moduleId, {
      x: 600 + radius * Math.cos(angle),
      y: 400 + radius * Math.sin(angle),
    });
    index++;
  });

  // Create simulation with module grouping forces
  const simulation = forceSimulation(nodes as any)
    .force(
      'link',
      forceLink(edges as any)
        .id((d: any) => d.id)
        .distance(80)
    )
    .force('charge', forceManyBody().strength(-200))
    .force('collide', forceCollide().radius(40))
    .stop();

  // Apply forceX and forceY to group by module
  moduleGroups.forEach((moduleNodes, moduleId) => {
    const center = moduleCenters.get(moduleId);
    if (center) {
      simulation
        .force(`x-${moduleId}`, forceX(center.x).strength(0.1))
        .force(`y-${moduleId}`, forceY(center.y).strength(0.1));
    }
  });

  // Run simulation
  for (let i = 0; i < 200; i++) {
    simulation.tick();
  }

  return {
    ...graph,
    nodes,
  };
}

/**
 * Calculate bounding box of graph nodes
 * 
 * @param nodes - Graph nodes with x, y coordinates
 * @returns Bounds with min/max x,y and width/height
 */
export function calculateBounds(nodes: GraphNode[]): GraphBounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
