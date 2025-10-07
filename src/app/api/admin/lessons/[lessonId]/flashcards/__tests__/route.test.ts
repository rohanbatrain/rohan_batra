import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import connectToDatabase from '@/lib/mongodb';
import CourseLessonModel from '@/models/CourseLesson';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import UserModel from '@/models/User';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/CourseLesson');
vi.mock('@/models/FlashcardDeck');
vi.mock('@/models/User');

const { auth } = await import('@clerk/nextjs/server');

describe('POST /api/admin/lessons/[lessonId]/flashcards', () => {
  const mockUser = {
    _id: 'user123',
    clerkUserId: 'clerk123',
  };

  const mockLesson = {
    _id: 'lesson123',
    title: 'JavaScript Variables',
    slug: 'javascript-variables',
    courseId: 'course123',
    moduleId: 'module123',
    flashcardDeckIds: [],
    save: vi.fn(),
  };

  const mockDeck = {
    _id: 'deck123',
    title: 'JavaScript Variables - Flashcards',
    slug: 'javascript-variables-flashcards',
    toJSON: vi.fn(() => ({
      id: 'deck123',
      title: 'JavaScript Variables - Flashcards',
      slug: 'javascript-variables-flashcards',
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).mockResolvedValue({ userId: 'clerk123' });
    (connectToDatabase as any).mockResolvedValue(true);
    (UserModel.findOne as any).mockResolvedValue(mockUser);
    (CourseLessonModel.findById as any).mockResolvedValue(mockLesson);
    (FlashcardDeckModel.create as any).mockResolvedValue(mockDeck);
  });

  it('should create a flashcard deck for a lesson', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Custom Deck Title',
        description: 'Learn JavaScript variables',
      }),
    });

    const response = await POST(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.deck).toBeDefined();
    expect(data.message).toBe('Flashcard deck created and linked to lesson');
    
    // Verify deck was created with correct linkTargets
    expect(FlashcardDeckModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Custom Deck Title',
        linkTargets: [
          {
            scope: 'lesson',
            courseId: 'course123',
            moduleId: 'module123',
            lessonId: 'lesson123',
          },
        ],
      })
    );

    // Verify lesson was updated
    expect(mockLesson.save).toHaveBeenCalled();
    expect(mockLesson.flashcardDeckIds).toContain('deck123');
  });

  it('should auto-generate title and slug if not provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });

    expect(FlashcardDeckModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'JavaScript Variables - Flashcards',
        slug: 'javascript-variables-flashcards',
      })
    );
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as any).mockResolvedValue({ userId: null });

    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards', {
      method: 'POST',
    });

    const response = await POST(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if lesson is not found', async () => {
    (CourseLessonModel.findById as any).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Lesson not found');
  });

  it('should return 400 for invalid lesson ID', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/lessons/invalid-id/flashcards', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: Promise.resolve({ lessonId: 'invalid-id' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid lesson ID');
  });

  it('should return 409 if deck slug already exists', async () => {
    const duplicateError = new Error('Duplicate key') as any;
    duplicateError.code = 11000;
    (FlashcardDeckModel.create as any).mockRejectedValue(duplicateError);

    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('A deck with this slug already exists');
  });
});

describe('GET /api/admin/lessons/[lessonId]/flashcards', () => {
  const mockLessonWithDecks = {
    _id: 'lesson123',
    title: 'JavaScript Variables',
    flashcardDeckIds: [
      { id: 'deck1', title: 'Deck 1' },
      { id: 'deck2', title: 'Deck 2' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).mockResolvedValue({ userId: 'clerk123' });
    (connectToDatabase as any).mockResolvedValue(true);
    (CourseLessonModel.findById as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockLessonWithDecks),
    });
  });

  it('should return all flashcard decks for a lesson', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards');

    const response = await GET(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.decks).toHaveLength(2);
    expect(data.lessonTitle).toBe('JavaScript Variables');
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as any).mockResolvedValue({ userId: null });

    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards');

    const response = await GET(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if lesson is not found', async () => {
    (CourseLessonModel.findById as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    });

    const req = new NextRequest('http://localhost:3000/api/admin/lessons/lesson123/flashcards');

    const response = await GET(req, { params: Promise.resolve({ lessonId: 'lesson123' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Lesson not found');
  });
});
