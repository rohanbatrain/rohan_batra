/**
 * T008: Unit Test - D3 Force Simulator
 * 
 * Tests D3 force simulation wrapper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  simulateGraphLayout,
  applyModuleGrouping,
  calculateBounds,
} from '@/lib/graph/simulator';
import type { KnowledgeGraph, GraphNode } from '@/lib/graph/types';

describe('D3 Force Simulator', () => {
  describe('simulateGraphLayout', () => {
    it('should return nodes with x, y coordinates', () => {
      const mockGraph: KnowledgeGraph = {
        nodes: [
          { id: '1', type: 'module', label: 'Module 1' },
          { id: '2', type: 'lesson', label: 'Lesson 1' },
        ],
        edges: [
          { source: '1', target: '2', type: 'contains' },
        ],
        metadata: {
          courseId: 'test-course',
          nodeCount: 2,
          edgeCount: 1,
          generatedAt: new Date(),
        },
      };

      const result = simulateGraphLayout(mockGraph);

      expect(result.nodes).toHaveLength(2);
      result.nodes.forEach((node: any) => {
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
      });
    });

    it('should handle empty graph', () => {
      const emptyGraph: KnowledgeGraph = {
        nodes: [],
        edges: [],
        metadata: {
          courseId: 'test',
          nodeCount: 0,
          edgeCount: 0,
          generatedAt: new Date(),
        },
      };

      const result = simulateGraphLayout(emptyGraph);
      expect(result.nodes).toHaveLength(0);
    });

    it('should handle single node', () => {
      const singleNodeGraph: KnowledgeGraph = {
        nodes: [{ id: '1', type: 'module', label: 'Module 1' }],
        edges: [],
        metadata: {
          courseId: 'test',
          nodeCount: 1,
          edgeCount: 0,
          generatedAt: new Date(),
        },
      };

      const result = simulateGraphLayout(singleNodeGraph);
      expect(result.nodes).toHaveLength(1);
      expect(typeof result.nodes[0].x).toBe('number');
      expect(typeof result.nodes[0].y).toBe('number');
    });

    it('should converge within max iterations', () => {
      const mockGraph: KnowledgeGraph = {
        nodes: Array.from({ length: 10 }, (_, i) => ({
          id: `${i}`,
          type: 'lesson',
          label: `Lesson ${i}`,
        })),
        edges: [],
        metadata: {
          courseId: 'test',
          nodeCount: 10,
          edgeCount: 0,
          generatedAt: new Date(),
        },
      };

      const result = simulateGraphLayout(mockGraph, { maxIterations: 100 });
      expect(result.nodes).toHaveLength(10);
    });
  });

  describe('applyModuleGrouping', () => {
    it('should group lesson nodes by module', () => {
      const mockGraph: KnowledgeGraph = {
        nodes: [
          { id: '1', type: 'module', label: 'Module 1' },
          { id: '2', type: 'lesson', label: 'Lesson 1', moduleId: '1' },
          { id: '3', type: 'lesson', label: 'Lesson 2', moduleId: '1' },
        ],
        edges: [],
        metadata: {
          courseId: 'test',
          nodeCount: 3,
          edgeCount: 0,
          generatedAt: new Date(),
        },
      };

      const result = applyModuleGrouping(mockGraph);
      expect(result.nodes).toHaveLength(3);
    });
  });

  describe('calculateBounds', () => {
    it('should return correct min/max x,y', () => {
      const nodes: GraphNode[] = [
        { id: '1', type: 'module', label: 'M1', x: 0, y: 0 },
        { id: '2', type: 'lesson', label: 'L1', x: 100, y: 50 },
        { id: '3', type: 'lesson', label: 'L2', x: -50, y: 75 },
      ];

      const bounds = calculateBounds(nodes);

      expect(bounds.minX).toBe(-50);
      expect(bounds.maxX).toBe(100);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxY).toBe(75);
      expect(bounds.width).toBe(150);
      expect(bounds.height).toBe(75);
    });
  });
});
