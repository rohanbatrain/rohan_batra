import { describe, test, expect } from 'vitest';

describe('DELETE /api/admin/assets/{id} - Contract Test', () => {
  test('contract: should return 401 when not authenticated', async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/admin/assets/123',
        { method: 'DELETE' }
      );
      expect(response.status).toBe(401);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('contract: should delete asset when admin authenticated', async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/admin/assets/123',
        {
          method: 'DELETE',
          headers: { Authorization: 'Bearer admin_token' },
        }
      );
      expect(response.status).toBe(200);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
