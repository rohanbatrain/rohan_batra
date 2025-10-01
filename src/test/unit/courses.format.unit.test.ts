import { describe, it, expect } from 'vitest';
import { formatMinutes, truncate } from '@/lib/courses/format';

describe('Unit: format helpers', () => {
  it('formats minutes to h m', () => {
    expect(formatMinutes(5)).toBe('5m');
    expect(formatMinutes(65)).toBe('1h 5m');
    expect(formatMinutes(0)).toBe('—');
  });
  it('truncates long strings', () => {
    expect(truncate('abc', 5)).toBe('abc');
    expect(truncate('abcdef', 5)).toBe('abcd…');
  });
});
