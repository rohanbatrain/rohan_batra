import { describe, it, expect } from 'vitest';

// Contract test for GET /api/portfolio/projects - will fail until route is implemented

describe('GET /api/portfolio/projects', () => {
  it('should return portfolio projects with correct structure', async () => {
    // This will fail with 404 until the route is created
    const response = await fetch(
      'http://localhost:3000/api/portfolio/projects'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(
      expect.objectContaining({
        projects: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
      })
    );

    // Verify project structure if projects exist
    if (data.projects.length > 0) {
      const firstProject = data.projects[0];
      expect(firstProject).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          slug: expect.any(String),
          description: expect.any(String),
          longDescription: expect.any(String),
          images: expect.any(Array),
          technologies: expect.any(Array),
          category: expect.any(String),
          featured: expect.any(Boolean),
          liveUrl: expect.any(String),
          githubUrl: expect.any(String),
          startDate: expect.any(String),
          endDate: expect.any(String),
          status: expect.stringMatching(/^(completed|in-progress|planned)$/),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    }
  });

  it('should support filtering by category', async () => {
    const response = await fetch(
      'http://localhost:3000/api/portfolio/projects?category=web-development'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toBeDefined();

    // All returned projects should have the specified category
    data.projects.forEach((project: { category: string }) => {
      expect(project.category).toBe('web-development');
    });
  });

  it('should support filtering by technology', async () => {
    const response = await fetch(
      'http://localhost:3000/api/portfolio/projects?tech=react,nextjs'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toBeDefined();

    // All returned projects should include the specified technologies
    data.projects.forEach((project: { technologies: string[] }) => {
      const hasTech = project.technologies.some((tech: string) =>
        ['react', 'nextjs'].includes(tech.toLowerCase())
      );
      expect(hasTech).toBe(true);
    });
  });

  it('should support filtering by status', async () => {
    const response = await fetch(
      'http://localhost:3000/api/portfolio/projects?status=completed'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toBeDefined();

    // All returned projects should have the specified status
    data.projects.forEach((project: { status: string }) => {
      expect(project.status).toBe('completed');
    });
  });

  it('should support sorting by date', async () => {
    const response = await fetch(
      'http://localhost:3000/api/portfolio/projects?sort=recent'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toBeDefined();

    if (data.projects.length > 1) {
      // Projects should be sorted by creation date (most recent first)
      for (let i = 0; i < data.projects.length - 1; i++) {
        const currentDate = new Date(data.projects[i].createdAt);
        const nextDate = new Date(data.projects[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(
          nextDate.getTime()
        );
      }
    }
  });

  it('should return featured projects only', async () => {
    const response = await fetch(
      'http://localhost:3000/api/portfolio/projects?featured=true'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toBeDefined();

    // All returned projects should be featured
    data.projects.forEach((project: { featured: boolean }) => {
      expect(project.featured).toBe(true);
    });
  });

  it('should support pagination parameters', async () => {
    const response = await fetch(
      'http://localhost:3000/api/portfolio/projects?page=2&limit=3'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(data.limit).toBe(3);
    expect(data.projects.length).toBeLessThanOrEqual(3);
  });
});
