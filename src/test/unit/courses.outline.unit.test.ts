import { describe, it, expect } from 'vitest';
import { buildOrderedOutline } from '@/app/courses/[slug]/page';

describe('Unit: buildOrderedOutline', () => {
  it('orders lessons by lessonIds when provided, otherwise A–Z', () => {
    const m1 = { _id: 'm1', title: 'Module 1', order: 0, lessonIds: ['l2', 'l1'] } as any;
    const m2 = { _id: 'm2', title: 'Module 2', order: 1, lessonIds: [] } as any;
    const lessons = [
      { _id: 'l1', moduleId: 'm1', title: 'Alpha' },
      { _id: 'l2', moduleId: 'm1', title: 'Beta' },
      { _id: 'l3', moduleId: 'm2', title: 'Zulu' },
      { _id: 'l4', moduleId: 'm2', title: 'Charlie' },
    ] as any[];
    const outline = buildOrderedOutline([m1, m2], lessons);
    expect(outline[0].lessons.map((l: any) => l._id)).toEqual(['l2', 'l1']);
    expect(outline[1].lessons.map((l: any) => l._id)).toEqual(['l4', 'l3']);
  });
});
