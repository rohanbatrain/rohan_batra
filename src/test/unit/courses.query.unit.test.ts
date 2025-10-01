import { describe, it, expect } from 'vitest';
import { parseCourseIndexQuery } from '@/lib/courses/query';

describe('Unit: parseCourseIndexQuery', () => {
  it('parses basic params and caps limit', () => {
    const q = parseCourseIndexQuery({ page: '2', limit: '999', sort: 'az', tags: 'a,b', difficulty: 'beginner' });
    expect(q.page).toBe(2);
    expect(q.limit).toBe(48);
    expect(q.sort).toBe('az');
    expect(q.tags).toEqual(['a', 'b']);
    expect(q.difficulty).toEqual(['beginner']);
  });
});
