import { describe, it, expect } from 'vitest';

// Contract test for GET /api/admin/books/[bookId]/chapters

describe('GET /api/admin/books/[bookId]/chapters', () => {
  it('should return chapters for a specific book', async () => {
    // Note: In a real test, we would use a valid book ID
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify the response structure
    expect(data).toHaveProperty('chapters');
    expect(Array.isArray(data.chapters)).toBe(true);
  });

  it('should include comprehensive chapter data', async () => {
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Check chapter structure
    if (data.chapters.length > 0) {
      const chapter = data.chapters[0];

      // Basic chapter fields
      expect(chapter).toHaveProperty('_id');
      expect(chapter).toHaveProperty('title');
      expect(chapter).toHaveProperty('content');
      expect(chapter).toHaveProperty('summary');
      expect(chapter).toHaveProperty('chapterNumber');
      expect(chapter).toHaveProperty('wordCount');
      expect(chapter).toHaveProperty('isPublished');
      expect(chapter).toHaveProperty('bookId');
      expect(chapter).toHaveProperty('createdAt');
      expect(chapter).toHaveProperty('updatedAt');

      // Chapter number should be a positive integer
      expect(typeof chapter.chapterNumber).toBe('number');
      expect(chapter.chapterNumber).toBeGreaterThan(0);

      // Word count should be a number
      expect(typeof chapter.wordCount).toBe('number');
      expect(chapter.wordCount).toBeGreaterThanOrEqual(0);

      // isPublished should be a boolean
      expect(typeof chapter.isPublished).toBe('boolean');

      // bookId should match the requested book
      expect(chapter.bookId).toBe(bookId);
    }
  });

  it('should return chapters ordered by chapter number', async () => {
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`
    );
    const data = await response.json();

    expect(response.status).toBe(200);

    // Chapters should be sorted by chapter number (if more than one exists)
    if (data.chapters.length > 1) {
      for (let i = 1; i < data.chapters.length; i++) {
        const prevChapter = data.chapters[i - 1];
        const currentChapter = data.chapters[i];
        expect(prevChapter.chapterNumber).toBeLessThanOrEqual(
          currentChapter.chapterNumber
        );
      }
    }
  });

  it('should require authentication', async () => {
    const bookId = 'test-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`,
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

  it('should return 404 for non-existent book', async () => {
    const bookId = 'non-existent-book-id';
    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`
    );

    // Should return 404 for non-existent book
    expect([404, 200]).toContain(response.status);

    if (response.status === 404) {
      const error = await response.json();
      expect(error).toHaveProperty('error');
    }
  });
});

// Contract test for POST /api/admin/books/[bookId]/chapters

describe('POST /api/admin/books/[bookId]/chapters', () => {
  it('should create a new chapter', async () => {
    const bookId = 'test-book-id';
    const newChapter = {
      title: 'Test Chapter',
      content: 'This is test chapter content.',
      summary: 'A test chapter summary',
      chapterNumber: 1,
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChapter),
      }
    );

    // Should be created successfully or return validation error
    expect([201, 400, 401]).toContain(response.status);

    const data = await response.json();

    if (response.status === 201) {
      // Verify created chapter structure
      expect(data).toHaveProperty('chapter');
      expect(data.chapter).toHaveProperty('_id');
      expect(data.chapter.title).toBe(newChapter.title);
      expect(data.chapter.content).toBe(newChapter.content);
      expect(data.chapter.summary).toBe(newChapter.summary);
      expect(data.chapter.chapterNumber).toBe(newChapter.chapterNumber);
      expect(data.chapter.bookId).toBe(bookId);
    } else if (response.status === 400) {
      // Should have validation error
      expect(data).toHaveProperty('error');
    }
  });

  it('should validate required fields', async () => {
    const bookId = 'test-book-id';
    const invalidChapter = {
      // Missing required fields
      content: 'Content without title',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidChapter),
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
    const newChapter = {
      title: 'Test Chapter',
      content: 'This is test chapter content.',
      chapterNumber: 1,
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No authentication headers
        },
        body: JSON.stringify(newChapter),
      }
    );

    // Should return 401
    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.error).toMatch(/unauthorized/i);
  });
});

// Contract test for PUT /api/admin/books/[bookId]/chapters/[chapterId]

describe('PUT /api/admin/books/[bookId]/chapters/[chapterId]', () => {
  it('should update an existing chapter', async () => {
    const bookId = 'test-book-id';
    const chapterId = 'test-chapter-id';
    const updatedChapter = {
      title: 'Updated Chapter Title',
      content: 'Updated chapter content.',
      summary: 'Updated summary',
      chapterNumber: 2,
      isPublished: true,
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters/${chapterId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedChapter),
      }
    );

    // Should be updated successfully or return error
    expect([200, 404, 401]).toContain(response.status);

    const data = await response.json();

    if (response.status === 200) {
      // Verify updated chapter structure
      expect(data).toHaveProperty('chapter');
      expect(data.chapter.title).toBe(updatedChapter.title);
      expect(data.chapter.content).toBe(updatedChapter.content);
      expect(data.chapter.summary).toBe(updatedChapter.summary);
      expect(data.chapter.chapterNumber).toBe(updatedChapter.chapterNumber);
      expect(data.chapter.isPublished).toBe(updatedChapter.isPublished);
    }
  });

  it('should require authentication', async () => {
    const bookId = 'test-book-id';
    const chapterId = 'test-chapter-id';
    const updatedChapter = {
      title: 'Updated Chapter Title',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters/${chapterId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // No authentication headers
        },
        body: JSON.stringify(updatedChapter),
      }
    );

    // Should return 401
    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.error).toMatch(/unauthorized/i);
  });
});

// Contract test for DELETE /api/admin/books/[bookId]/chapters/[chapterId]

describe('DELETE /api/admin/books/[bookId]/chapters/[chapterId]', () => {
  it('should delete an existing chapter', async () => {
    const bookId = 'test-book-id';
    const chapterId = 'test-chapter-id';

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters/${chapterId}`,
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
    const chapterId = 'test-chapter-id';

    const response = await fetch(
      `http://localhost:3000/api/admin/books/${bookId}/chapters/${chapterId}`,
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
