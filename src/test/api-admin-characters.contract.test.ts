import { describe, it, expect } from 'vitest';

// Contract test for GET /api/admin/books/[bookId]/characters

describe('GET /api/admin/books/[bookId]/characters', () => {
  it('should return characters for a specific book', async () => {
    // Note: In a real test, we would use a valid book ID
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify the response structure
    expect(data).toHaveProperty('characters');
    expect(Array.isArray(data.characters)).toBe(true);
  });

  it('should include comprehensive character data', async () => {
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters`
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Check character structure
    if (data.characters.length > 0) {
      const character = data.characters[0];

      // Basic character fields
      expect(character).toHaveProperty('_id');
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('description');
      expect(character).toHaveProperty('role');
      expect(character).toHaveProperty('age');
      expect(character).toHaveProperty('appearance');
      expect(character).toHaveProperty('personality');
      expect(character).toHaveProperty('backstory');
      expect(character).toHaveProperty('goals');
      expect(character).toHaveProperty('relationships');
      expect(character).toHaveProperty('bookId');
      expect(character).toHaveProperty('createdAt');
      expect(character).toHaveProperty('updatedAt');

      // Role should be valid
      expect([
        'protagonist',
        'antagonist',
        'supporting',
        'minor',
        'background',
      ]).toContain(character.role);

      // Age should be a positive number if provided
      if (character.age !== null && character.age !== undefined) {
        expect(typeof character.age).toBe('number');
        expect(character.age).toBeGreaterThan(0);
      }

      // Relationships should be an array
      expect(Array.isArray(character.relationships)).toBe(true);

      // bookId should match the requested book
      expect(character.bookId).toBe(bookId);
    }
  });

  it('should support filtering by role', async () => {
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters?role=protagonist`
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Characters should match filter (if any exist)
    data.characters.forEach((character: { role: string }) => {
      expect(character.role).toBe('protagonist');
    });
  });

  it('should require authentication', async () => {
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters`,
      {
        headers: {
          // No authentication headers
        },
      }
    );

    // Should return 401
    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.error).toMatch(/unauthorized/i);
  });
});

// Contract test for POST /api/admin/books/[bookId]/characters

describe('POST /api/admin/books/[bookId]/characters', () => {
  it('should create a new character', async () => {
    const bookId = 'test-book-id';
    const newCharacter = {
      name: 'John Doe',
      description: 'A brave hero',
      role: 'protagonist',
      age: 25,
      appearance: 'Tall with dark hair',
      personality: 'Brave and kind',
      backstory: 'Grew up in a small village',
      goals: 'Save the kingdom',
      relationships: [
        {
          characterId: 'other-character-id',
          relationshipType: 'friend',
          description: 'Best friend since childhood',
        },
      ],
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCharacter),
      }
    );

    // Should be created successfully or return validation error
    expect([201, 400, 401]).toContain(response.status);

    const data = await response.json();

    if (response.status === 201) {
      // Verify created character structure
      expect(data).toHaveProperty('character');
      expect(data.character).toHaveProperty('_id');
      expect(data.character.name).toBe(newCharacter.name);
      expect(data.character.description).toBe(newCharacter.description);
      expect(data.character.role).toBe(newCharacter.role);
      expect(data.character.age).toBe(newCharacter.age);
      expect(data.character.bookId).toBe(bookId);
    } else if (response.status === 400) {
      // Should have validation error
      expect(data).toHaveProperty('error');
    }
  });

  it('should validate required fields', async () => {
    const bookId = 'test-book-id';
    const invalidCharacter = {
      // Missing required fields
      description: 'Character without name',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidCharacter),
      }
    );

    // Should return validation error
    expect([400, 401]).toContain(response.status);

    if (response.status === 400) {
      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.error).toMatch(/validation|required/i);
    }
  });

  it('should require authentication', async () => {
    const bookId = 'test-book-id';
    const newCharacter = {
      name: 'Test Character',
      description: 'A test character',
      role: 'supporting',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No authentication headers
        },
        body: JSON.stringify(newCharacter),
      }
    );

    // Should return 401
    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.error).toMatch(/unauthorized/i);
  });
});

// Contract test for PUT /api/admin/books/[bookId]/characters/[characterId]

describe('PUT /api/admin/books/[bookId]/characters/[characterId]', () => {
  it('should update an existing character', async () => {
    const bookId = 'test-book-id';
    const characterId = 'test-character-id';
    const updatedCharacter = {
      name: 'Updated Character Name',
      description: 'Updated character description',
      role: 'antagonist',
      age: 30,
      appearance: 'Updated appearance',
      personality: 'Updated personality',
      backstory: 'Updated backstory',
      goals: 'Updated goals',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters/${characterId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCharacter),
      }
    );

    // Should be updated successfully or return error
    expect([200, 404, 401]).toContain(response.status);

    const data = await response.json();

    if (response.status === 200) {
      // Verify updated character structure
      expect(data).toHaveProperty('character');
      expect(data.character.name).toBe(updatedCharacter.name);
      expect(data.character.description).toBe(updatedCharacter.description);
      expect(data.character.role).toBe(updatedCharacter.role);
      expect(data.character.age).toBe(updatedCharacter.age);
    }
  });

  it('should require authentication', async () => {
    const bookId = 'test-book-id';
    const characterId = 'test-character-id';
    const updatedCharacter = {
      name: 'Updated Character Name',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters/${characterId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // No authentication headers
        },
        body: JSON.stringify(updatedCharacter),
      }
    );

    // Should return 401
    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.error).toMatch(/unauthorized/i);
  });
});

// Contract test for DELETE /api/admin/books/[bookId]/characters/[characterId]

describe('DELETE /api/admin/books/[bookId]/characters/[characterId]', () => {
  it('should delete an existing character', async () => {
    const bookId = 'test-book-id';
    const characterId = 'test-character-id';

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters/${characterId}`,
      {
        method: 'DELETE',
      }
    );

    // Should be deleted successfully or return error
    expect([200, 404, 401]).toContain(response.status);

    const data = await response.json();

    if (response.status === 200) {
      // Should confirm deletion
      expect(data).toHaveProperty('message');
      expect(data.message).toMatch(/deleted|removed/i);
    }
  });

  it('should require authentication', async () => {
    const bookId = 'test-book-id';
    const characterId = 'test-character-id';

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/characters/${characterId}`,
      {
        method: 'DELETE',
        headers: {
          // No authentication headers
        },
      }
    );

    // Should return 401
    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.error).toMatch(/unauthorized/i);
  });
});
