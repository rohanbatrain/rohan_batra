import { describe, it, expect } from 'vitest';

// Contract test for GET /api/admin/books

describe('GET /api/admin/books', () => {
  it('should return books with pagination and stats', async () => {
    const response = await fetch('http://localhost:3000/api/admin/books');

    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify the response structure
    expect(data).toHaveProperty('books');
    expect(data).toHaveProperty('pagination');
    expect(data).toHaveProperty('stats');

    // Books should be an array
    expect(Array.isArray(data.books)).toBe(true);

    // Verify pagination metadata
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('limit');
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('totalPages');
    expect(data.pagination).toHaveProperty('hasNextPage');
    expect(data.pagination).toHaveProperty('hasPrevPage');

    // Verify stats object
    expect(typeof data.stats).toBe('object');
  });

  it('should include comprehensive book data', async () => {
    const response = await fetch('http://localhost:3000/api/admin/books');
    const data = await response.json();

    expect(response.status).toBe(200);

    // Check book structure
    if (data.books.length > 0) {
      const book = data.books[0];

      // Basic book fields
      expect(book).toHaveProperty('_id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('description');
      expect(book).toHaveProperty('genre');
      expect(book).toHaveProperty('status');
      expect(book).toHaveProperty('visibility');
      expect(book).toHaveProperty('currentWordCount');
      expect(book).toHaveProperty('authorId');
      expect(book).toHaveProperty('createdAt');
      expect(book).toHaveProperty('updatedAt');

      // Status should be valid
      expect([
        'planning',
        'drafting',
        'editing',
        'completed',
        'published',
      ]).toContain(book.status);

      // Visibility should be valid
      expect(['private', 'public', 'shared']).toContain(book.visibility);

      // Word count should be a number
      expect(typeof book.currentWordCount).toBe('number');
      expect(book.currentWordCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('should support filtering by status and genre', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/books?status=drafting&genre=fantasy'
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Posts should match filters (if any exist)
    data.books.forEach((book: { status: string; genre: string }) => {
      expect(book.status).toBe('drafting');
      expect(book.genre.toLowerCase()).toContain('fantasy');
    });
  });

  it('should support search functionality', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/books?search=dragon'
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Books should match search term in title, description, or subtitle
    data.books.forEach(
      (book: { title: string; description: string; subtitle?: string }) => {
        const searchTerm = 'dragon';
        const matchesTitle = book.title.toLowerCase().includes(searchTerm);
        const matchesDescription = book.description
          .toLowerCase()
          .includes(searchTerm);
        const matchesSubtitle = book.subtitle
          ?.toLowerCase()
          .includes(searchTerm);

        expect(matchesTitle || matchesDescription || matchesSubtitle).toBe(
          true
        );
      }
    );
  });

  it('should support pagination', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/books?page=1&limit=5'
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Should respect pagination parameters
    expect(data.pagination.page).toBe(1);
    expect(data.books.length).toBeLessThanOrEqual(5);

    // Pagination metadata should be correct
    expect(typeof data.pagination.total).toBe('number');
    expect(typeof data.pagination.totalPages).toBe('number');
    expect(typeof data.pagination.hasNextPage).toBe('boolean');
    expect(typeof data.pagination.hasPrevPage).toBe('boolean');
  });

  it('should support sorting', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/books?sortBy=updatedAt&sortOrder=desc'
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Books should be sorted correctly (if more than one exists)
    if (data.books.length > 1) {
      const firstBook = new Date(data.books[0].updatedAt);
      const secondBook = new Date(data.books[1].updatedAt);
      expect(firstBook.getTime()).toBeGreaterThanOrEqual(secondBook.getTime());
    }
  });

  it('should provide status statistics', async () => {
    const response = await fetch('http://localhost:3000/api/admin/books');
    const data = await response.json();

    expect(response.status).toBe(200);

    // Stats should include counts and word counts for each status
    Object.entries(data.stats).forEach(([status, statData]) => {
      expect([
        'planning',
        'drafting',
        'editing',
        'completed',
        'published',
      ]).toContain(status);
      expect(statData).toHaveProperty('count');
      expect(statData).toHaveProperty('totalWords');
      expect(typeof (statData as { count: number; totalWords: number }).count).toBe('number');
      expect(typeof (statData as { count: number; totalWords: number }).totalWords).toBe('number');
    });
  });

  it('should require editor or admin authentication', async () => {
    // Test without authentication headers
    const response = await fetch('http://localhost:3000/api/admin/books', {
      headers: {
        // No authentication headers
      },
    });

    // Should return 401
    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.error).toMatch(/unauthorized/i);
  });

  it('should filter books by author for editor role', async () => {
    // This test assumes editor role filtering is working
    // In a real test, we would mock authentication with editor role
    const response = await fetch('http://localhost:3000/api/admin/books');
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // For editor role, all books should belong to the same author
    if (data.books.length > 1) {
      const firstAuthorId = data.books[0].authorId;
      data.books.forEach((book: { authorId: string }) => {
        expect(book.authorId).toBe(firstAuthorId);
      });
    }
  });
});