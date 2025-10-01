import { describe, it } from 'vitest';

describe('Integration: Course detail', () => {
  it('returns 404 for non-public/non-published', async () => {
    // TODO: call page logic with a slug of a draft/private course and expect notFound
  });

  it('renders outline with correct ordering rules', async () => {
    // TODO: assemble modules/lessons and test buildOrderedOutline in isolation if exported
  });
});
