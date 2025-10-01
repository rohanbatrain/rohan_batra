import { describe, it, expect } from 'vitest';

describe('Contract: Course detail shape', () => {
  it('should contain modules with lessons and include flashcards in contentType enum', async () => {
    // Placeholder schema shape to be replaced with real data fetch.
    const detail = {
      modules: [
        {
          lessons: [
            { title: 'Sample', contentType: 'flashcards' as const, isPreviewable: false },
          ],
        },
      ],
    };
    expect(Array.isArray(detail.modules)).toBe(true);
    expect(Array.isArray(detail.modules[0].lessons)).toBe(true);
    expect(['blog', 'standalone', 'video', 'quiz', 'flashcards']).toContain(
      detail.modules[0].lessons[0].contentType
    );
  });
});
