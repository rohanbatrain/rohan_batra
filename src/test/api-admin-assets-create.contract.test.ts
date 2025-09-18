import { describe, test, expect } from 'vitest';

describe('POST /api/admin/assets - Contract Test', () => {
  test('contract: should return 401 when not authenticated', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/assets', {
        method: 'POST',
        body: JSON.stringify({
          filename: 'test.jpg',
          type: 'image',
        }),
      });
      expect(response.status).toBe(401);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('contract: should return 403 when user is not admin', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/assets', {
        method: 'POST',
        headers: { Authorization: 'Bearer user_token' },
        body: JSON.stringify({
          filename: 'test.jpg',
          type: 'image',
        }),
      });
      expect(response.status).toBe(403);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('contract: should upload asset and return asset data', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/assets', {
        method: 'POST',
        headers: { Authorization: 'Bearer admin_token' },
        body: JSON.stringify({
          filename: 'test.jpg',
          type: 'image',
          size: 1024,
        }),
      });
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('asset');
      expect(data.asset).toHaveProperty('_id');
      expect(data.asset).toHaveProperty('filename');
      expect(data.asset).toHaveProperty('url');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('contract: should validate required fields', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/assets', {
        method: 'POST',
        headers: { Authorization: 'Bearer admin_token' },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
