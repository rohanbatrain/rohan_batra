import { describe, it, expect } from 'vitest';

describe('Contract: Courses index shape', () => {
  it('should contain items array and pagination fields', async () => {
    // TODO: Implement with server-side call abstraction or direct function returning shape.
    // For now, assert schema keys shape as a placeholder to be replaced with real call.
    const shape = {
      items: [],
      page: 1,
      limit: 24,
      total: 0,
      totalPages: 1,
    };
    expect(shape).toHaveProperty('items');
    expect(shape).toHaveProperty('page');
    expect(shape).toHaveProperty('total');
  });
});
