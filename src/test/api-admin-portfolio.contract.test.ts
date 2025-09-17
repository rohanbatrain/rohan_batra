import { describe, it, expect } from 'vitest';

describe('Admin Portfolio Management API', () => {
  describe('GET /api/admin/portfolio', () => {
    it('should return portfolio projects with admin-specific data', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio?page=1&limit=10'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        projects: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            title: expect.any(String),
            slug: expect.any(String),
            description: expect.any(String),
            longDescription: expect.any(String),
            status: expect.stringMatching(/^(draft|published|archived)$/),
            featured: expect.any(Boolean),
            technologies: expect.arrayContaining([expect.any(String)]),
            category: expect.any(String),
            images: expect.arrayContaining([
              expect.objectContaining({
                url: expect.any(String),
                alt: expect.any(String),
                isPrimary: expect.any(Boolean),
              }),
            ]),
            links: expect.objectContaining({
              live: expect.any(String),
              github: expect.any(String),
              demo: expect.any(String),
            }),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            publishedAt: expect.any(String),
            // Admin-specific fields
            author: expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
              email: expect.any(String),
            }),
            metrics: expect.objectContaining({
              views: expect.any(Number),
              likes: expect.any(Number),
              clicks: expect.any(Number),
              shares: expect.any(Number),
            }),
            seo: expect.objectContaining({
              metaTitle: expect.any(String),
              metaDescription: expect.any(String),
              keywords: expect.arrayContaining([expect.any(String)]),
            }),
            lastModifiedBy: expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
            }),
          }),
        ]),
        pagination: expect.objectContaining({
          currentPage: 1,
          totalPages: expect.any(Number),
          totalProjects: expect.any(Number),
          limit: 10,
          hasNextPage: expect.any(Boolean),
          hasPrevPage: false,
        }),
        summary: expect.objectContaining({
          totalProjects: expect.any(Number),
          publishedProjects: expect.any(Number),
          draftProjects: expect.any(Number),
          archivedProjects: expect.any(Number),
          featuredProjects: expect.any(Number),
          totalViews: expect.any(Number),
          totalLikes: expect.any(Number),
        }),
      });
    });

    it('should support filtering projects by status and technology', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio?status=published&technology=React&category=Web Development'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.projects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'published',
            technologies: expect.arrayContaining(['React']),
            category: 'Web Development',
          }),
        ])
      );

      expect(data.filters).toMatchObject({
        status: 'published',
        technology: 'React',
        category: 'Web Development',
      });
    });

    it('should support advanced search functionality', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio?search=portfolio&featured=true&sortBy=views&sortOrder=desc'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.projects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            featured: true,
            title: expect.stringMatching(/portfolio/i),
          }),
        ])
      );

      // Verify sorting
      if (data.projects.length > 1) {
        expect(data.projects[0].metrics.views).toBeGreaterThanOrEqual(
          data.projects[1].metrics.views
        );
      }
    });

    it('should include technology and category analytics', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio?includeAnalytics=true'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.analytics).toMatchObject({
        technologyDistribution: expect.objectContaining({
          React: expect.any(Number),
          TypeScript: expect.any(Number),
          'Next.js': expect.any(Number),
        }),
        categoryDistribution: expect.objectContaining({
          'Web Development': expect.any(Number),
          'Mobile App': expect.any(Number),
          API: expect.any(Number),
        }),
        performanceMetrics: expect.objectContaining({
          averageViews: expect.any(Number),
          averageLikes: expect.any(Number),
          topPerformingProject: expect.objectContaining({
            title: expect.any(String),
            views: expect.any(Number),
          }),
        }),
        monthlyStats: expect.objectContaining({
          projectsCreated: expect.any(Number),
          projectsPublished: expect.any(Number),
          totalViews: expect.any(Number),
        }),
      });
    });

    it('should require admin or editor authentication', async () => {
      // Request without authentication
      const response = await fetch('http://localhost:3000/api/admin/portfolio');

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);

      if (response.status === 401) {
        const data = await response.json();
        expect(data).toMatchObject({
          success: false,
          error: expect.stringContaining('authentication'),
        });
      } else if (response.status === 403) {
        const data = await response.json();
        expect(data).toMatchObject({
          success: false,
          error: expect.stringContaining('permission'),
        });
      }
    });
  });

  describe('GET /api/admin/portfolio/[slug]', () => {
    it('should return detailed project information', async () => {
      // First get a project slug from the list
      const projectsResponse = await fetch(
        'http://localhost:3000/api/admin/portfolio?limit=1'
      );
      const projectsData = await projectsResponse.json();
      const projectSlug = projectsData.projects[0].slug;

      const response = await fetch(
        `http://localhost:3000/api/admin/portfolio/${projectSlug}`
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        project: expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          slug: projectSlug,
          description: expect.any(String),
          longDescription: expect.any(String),
          status: expect.stringMatching(/^(draft|published|archived)$/),
          featured: expect.any(Boolean),
          technologies: expect.arrayContaining([expect.any(String)]),
          category: expect.any(String),
          images: expect.arrayContaining([
            expect.objectContaining({
              url: expect.any(String),
              alt: expect.any(String),
              isPrimary: expect.any(Boolean),
              order: expect.any(Number),
            }),
          ]),
          links: expect.objectContaining({
            live: expect.any(String),
            github: expect.any(String),
            demo: expect.any(String),
          }),
          // Detailed analytics
          detailedMetrics: expect.objectContaining({
            dailyViews: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(String),
                views: expect.any(Number),
              }),
            ]),
            referralSources: expect.arrayContaining([
              expect.objectContaining({
                source: expect.any(String),
                visits: expect.any(Number),
              }),
            ]),
            deviceBreakdown: expect.objectContaining({
              desktop: expect.any(Number),
              mobile: expect.any(Number),
              tablet: expect.any(Number),
            }),
          }),
          // SEO information
          seo: expect.objectContaining({
            metaTitle: expect.any(String),
            metaDescription: expect.any(String),
            keywords: expect.arrayContaining([expect.any(String)]),
            socialImage: expect.any(String),
            canonicalUrl: expect.any(String),
          }),
          // Version history
          versionHistory: expect.arrayContaining([
            expect.objectContaining({
              version: expect.any(Number),
              updatedAt: expect.any(String),
              updatedBy: expect.objectContaining({
                name: expect.any(String),
              }),
              changes: expect.arrayContaining([expect.any(String)]),
            }),
          ]),
        }),
      });
    });

    it('should return 404 for non-existent project', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio/non-existent-slug'
      );

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('not found'),
      });
    });
  });

  describe('POST /api/admin/portfolio', () => {
    it('should create a new portfolio project', async () => {
      const newProject = {
        title: 'New Admin Portfolio Project',
        slug: 'new-admin-portfolio-project',
        description: 'A test project created through admin interface',
        longDescription:
          'Detailed description of the admin test project with comprehensive information.',
        status: 'draft',
        featured: false,
        technologies: ['React', 'TypeScript', 'Next.js'],
        category: 'Web Development',
        images: [
          {
            url: '/images/test-project-1.jpg',
            alt: 'Test project screenshot',
            isPrimary: true,
            order: 1,
          },
        ],
        links: {
          live: 'https://test-project.com',
          github: 'https://github.com/user/test-project',
          demo: 'https://demo.test-project.com',
        },
        seo: {
          metaTitle: 'New Admin Portfolio Project - Test',
          metaDescription: 'Test project created through admin dashboard',
          keywords: ['admin', 'portfolio', 'test'],
        },
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProject),
        }
      );

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        project: expect.objectContaining({
          _id: expect.any(String),
          title: newProject.title,
          slug: newProject.slug,
          description: newProject.description,
          longDescription: newProject.longDescription,
          status: newProject.status,
          featured: newProject.featured,
          technologies: expect.arrayContaining(newProject.technologies),
          category: newProject.category,
          images: expect.arrayContaining([
            expect.objectContaining({
              url: newProject.images[0].url,
              alt: newProject.images[0].alt,
              isPrimary: newProject.images[0].isPrimary,
              order: newProject.images[0].order,
            }),
          ]),
          links: expect.objectContaining(newProject.links),
          seo: expect.objectContaining(newProject.seo),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          author: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
          metrics: expect.objectContaining({
            views: 0,
            likes: 0,
            clicks: 0,
            shares: 0,
          }),
        }),
      });
    });

    it('should validate required fields', async () => {
      const invalidProject = {
        // Missing required fields: title, description
        slug: 'invalid-project',
        status: 'draft',
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidProject),
        }
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.any(String),
        validation: expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'title',
              message: expect.any(String),
            }),
            expect.objectContaining({
              field: 'description',
              message: expect.any(String),
            }),
          ]),
        }),
      });
    });

    it('should auto-generate slug if not provided', async () => {
      const projectWithoutSlug = {
        title: 'Auto Generated Slug Project',
        description: 'Project for testing slug generation',
        status: 'draft',
        technologies: ['Test'],
        category: 'Testing',
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectWithoutSlug),
        }
      );

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.project.slug).toBe('auto-generated-slug-project');
    });

    it('should prevent duplicate slugs', async () => {
      const firstProject = {
        title: 'First Project',
        slug: 'duplicate-slug-test-portfolio',
        description: 'First project description',
        status: 'draft',
        technologies: ['Test'],
        category: 'Testing',
      };

      // Create first project
      await fetch('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(firstProject),
      });

      // Try to create second project with same slug
      const secondProject = {
        title: 'Second Project',
        slug: 'duplicate-slug-test-portfolio',
        description: 'Second project description',
        status: 'draft',
        technologies: ['Test'],
        category: 'Testing',
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(secondProject),
        }
      );

      expect(response.status).toBe(409);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('slug'),
        code: 'DUPLICATE_SLUG',
      });
    });

    it('should require admin or editor authentication', async () => {
      const newProject = {
        title: 'Unauthorized Project',
        description: 'This should not be created',
        status: 'draft',
        technologies: ['Test'],
        category: 'Testing',
      };

      // Request without authentication
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProject),
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/admin/portfolio/[slug]', () => {
    it('should update an existing portfolio project', async () => {
      // First create a project to update
      const originalProject = {
        title: 'Original Portfolio Project',
        slug: 'original-portfolio-project',
        description: 'Original description',
        status: 'draft',
        technologies: ['Original'],
        category: 'Original Category',
      };

      await fetch('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(originalProject),
      });

      // Now update the project
      const updateData = {
        title: 'Updated Portfolio Project',
        description: 'Updated description with new information',
        status: 'published',
        featured: true,
        technologies: ['React', 'TypeScript', 'Updated'],
        category: 'Updated Category',
        seo: {
          metaTitle: 'Updated Meta Title',
          metaDescription: 'Updated meta description',
          keywords: ['updated', 'portfolio'],
        },
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/portfolio/${originalProject.slug}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        project: expect.objectContaining({
          title: updateData.title,
          slug: originalProject.slug, // Slug should remain the same
          description: updateData.description,
          status: updateData.status,
          featured: updateData.featured,
          technologies: expect.arrayContaining(updateData.technologies),
          category: updateData.category,
          seo: expect.objectContaining(updateData.seo),
          updatedAt: expect.any(String),
          publishedAt: expect.any(String), // Should be set when status becomes published
          lastModifiedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
          version: expect.any(Number),
        }),
      });
    });

    it('should handle status transitions correctly', async () => {
      // Create a draft project
      const draftProject = {
        title: 'Status Transition Portfolio Test',
        slug: 'status-transition-portfolio-test',
        description: 'Project for status transition testing',
        status: 'draft',
        technologies: ['Test'],
        category: 'Testing',
      };

      await fetch('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftProject),
      });

      // Transition from draft to published
      const publishUpdate = {
        status: 'published',
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/portfolio/${draftProject.slug}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(publishUpdate),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.project.status).toBe('published');
      expect(data.project.publishedAt).toBeTruthy();
      expect(new Date(data.project.publishedAt).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it('should return 404 for non-existent project', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio/non-existent-slug',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('not found'),
      });
    });

    it('should require admin or editor authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update',
        description: 'This should not be updated',
      };

      // Request without authentication
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio/some-slug',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/admin/portfolio/[slug]', () => {
    it('should delete an existing portfolio project', async () => {
      // First create a project to delete
      const projectToDelete = {
        title: 'Portfolio Project to Delete',
        slug: 'portfolio-project-to-delete',
        description: 'This project will be deleted',
        status: 'draft',
        technologies: ['Test'],
        category: 'Testing',
      };

      await fetch('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectToDelete),
      });

      // Delete the project
      const response = await fetch(
        `http://localhost:3000/api/admin/portfolio/${projectToDelete.slug}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('deleted'),
        deletedProject: expect.objectContaining({
          _id: expect.any(String),
          title: projectToDelete.title,
          slug: projectToDelete.slug,
          deletedAt: expect.any(String),
          deletedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      });
    });

    it('should support hard delete with force parameter', async () => {
      // Create a project
      const projectToHardDelete = {
        title: 'Hard Delete Portfolio Test',
        slug: 'hard-delete-portfolio-test',
        description: 'This project will be permanently deleted',
        status: 'draft',
        technologies: ['Test'],
        category: 'Testing',
      };

      await fetch('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectToHardDelete),
      });

      // Hard delete the project
      const response = await fetch(
        `http://localhost:3000/api/admin/portfolio/${projectToHardDelete.slug}?force=true`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('permanently deleted'),
        deletedProject: expect.objectContaining({
          title: projectToHardDelete.title,
          slug: projectToHardDelete.slug,
        }),
      });

      // Verify project is completely removed
      const getResponse = await fetch(
        `http://localhost:3000/api/admin/portfolio/${projectToHardDelete.slug}`
      );
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio/non-existent-slug',
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('not found'),
      });
    });

    it('should require admin or editor authentication', async () => {
      // Request without authentication
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio/some-slug',
        {
          method: 'DELETE',
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/admin/portfolio/bulk-actions', () => {
    it('should support bulk status updates', async () => {
      // Create multiple projects for bulk action
      const projectsToUpdate = [
        {
          title: 'Bulk Update Portfolio 1',
          slug: 'bulk-update-portfolio-1',
          description: 'First project for bulk update',
          status: 'draft',
          technologies: ['Test'],
          category: 'Testing',
        },
        {
          title: 'Bulk Update Portfolio 2',
          slug: 'bulk-update-portfolio-2',
          description: 'Second project for bulk update',
          status: 'draft',
          technologies: ['Test'],
          category: 'Testing',
        },
      ];

      for (const project of projectsToUpdate) {
        await fetch('http://localhost:3000/api/admin/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        });
      }

      // Bulk update
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio/bulk-actions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'updateStatus',
            slugs: ['bulk-update-portfolio-1', 'bulk-update-portfolio-2'],
            data: {
              status: 'published',
            },
          }),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        updatedCount: 2,
        results: expect.arrayContaining([
          expect.objectContaining({
            slug: 'bulk-update-portfolio-1',
            success: true,
            newStatus: 'published',
          }),
          expect.objectContaining({
            slug: 'bulk-update-portfolio-2',
            success: true,
            newStatus: 'published',
          }),
        ]),
      });
    });

    it('should support bulk delete operations', async () => {
      // Create projects to delete
      const projectsToDelete = [
        {
          title: 'Bulk Delete Portfolio 1',
          slug: 'bulk-delete-portfolio-1',
          description: 'First project to bulk delete',
          status: 'draft',
          technologies: ['Test'],
          category: 'Testing',
        },
        {
          title: 'Bulk Delete Portfolio 2',
          slug: 'bulk-delete-portfolio-2',
          description: 'Second project to bulk delete',
          status: 'draft',
          technologies: ['Test'],
          category: 'Testing',
        },
      ];

      for (const project of projectsToDelete) {
        await fetch('http://localhost:3000/api/admin/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        });
      }

      // Bulk delete
      const response = await fetch(
        'http://localhost:3000/api/admin/portfolio/bulk-actions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete',
            slugs: ['bulk-delete-portfolio-1', 'bulk-delete-portfolio-2'],
            force: false,
          }),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        deletedCount: 2,
        results: expect.arrayContaining([
          expect.objectContaining({
            slug: 'bulk-delete-portfolio-1',
            success: true,
          }),
          expect.objectContaining({
            slug: 'bulk-delete-portfolio-2',
            success: true,
          }),
        ]),
      });
    });
  });
});
