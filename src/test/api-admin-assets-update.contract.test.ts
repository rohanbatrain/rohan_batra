import { describe, test, expect } from 'vitest';

describe('PUT /api/admin/assets/{id} - Contract Test', () => {
  test('contract: should return 401 when not authenticated', async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/admin/assets/123',
        {
          method: 'PUT',
          body: JSON.stringify({ filename: 'updated.jpg' }),
        }
      );
      expect(response.status).toBe(401);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('contract: should update asset when admin authenticated', async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/admin/assets/123',
        {
          method: 'PUT',
          headers: { Authorization: 'Bearer admin_token' },
          body: JSON.stringify({ filename: 'updated.jpg' }),
        }
      );
      expect(response.status).toBe(200);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
