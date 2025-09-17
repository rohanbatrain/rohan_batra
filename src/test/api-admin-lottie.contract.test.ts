import { describe, it, expect } from 'vitest';

describe('Admin Lottie Asset Management API', () => {
  describe('GET /api/admin/lottie', () => {
    it('should return Lottie assets with admin-specific data', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/lottie?page=1&limit=10'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        assets: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
            slug: expect.any(String),
            description: expect.any(String),
            category: expect.stringMatching(
              /^(animation|icon|illustration|logo|ui|effect)$/
            ),
            tags: expect.arrayContaining([expect.any(String)]),
            file: expect.objectContaining({
              url: expect.any(String),
              path: expect.any(String),
              size: expect.any(Number),
              format: expect.stringMatching(/^(json|lottie)$/),
              version: expect.any(String),
            }),
            metadata: expect.objectContaining({
              duration: expect.any(Number),
              frameRate: expect.any(Number),
              dimensions: expect.objectContaining({
                width: expect.any(Number),
                height: expect.any(Number),
              }),
              layers: expect.any(Number),
              complexity: expect.stringMatching(/^(low|medium|high)$/),
            }),
            status: expect.stringMatching(
              /^(active|inactive|processing|error)$/
            ),
            visibility: expect.stringMatching(/^(public|private|restricted)$/),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            // Admin-specific fields
            uploadedBy: expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
              email: expect.any(String),
            }),
            usage: expect.objectContaining({
              totalUses: expect.any(Number),
              blogPosts: expect.any(Number),
              portfolioProjects: expect.any(Number),
              pages: expect.any(Number),
              lastUsed: expect.any(String),
            }),
            performance: expect.objectContaining({
              loadTime: expect.any(Number),
              renderTime: expect.any(Number),
              fileOptimized: expect.any(Boolean),
            }),
            seo: expect.objectContaining({
              altText: expect.any(String),
              keywords: expect.arrayContaining([expect.any(String)]),
            }),
            versions: expect.arrayContaining([
              expect.objectContaining({
                version: expect.any(String),
                url: expect.any(String),
                uploadedAt: expect.any(String),
              }),
            ]),
          }),
        ]),
        pagination: expect.objectContaining({
          currentPage: 1,
          totalPages: expect.any(Number),
          totalAssets: expect.any(Number),
          limit: 10,
          hasNextPage: expect.any(Boolean),
          hasPrevPage: false,
        }),
        summary: expect.objectContaining({
          totalAssets: expect.any(Number),
          activeAssets: expect.any(Number),
          inactiveAssets: expect.any(Number),
          processingAssets: expect.any(Number),
          totalFileSize: expect.any(Number),
          averageFileSize: expect.any(Number),
          totalUsage: expect.any(Number),
        }),
      });
    });

    it('should support filtering assets by category and status', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/lottie?category=animation&status=active&visibility=public'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.assets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: 'animation',
            status: 'active',
            visibility: 'public',
          }),
        ])
      );

      expect(data.filters).toMatchObject({
        category: 'animation',
        status: 'active',
        visibility: 'public',
      });
    });

    it('should support advanced search and sorting', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/lottie?search=loading&sortBy=usage.totalUses&sortOrder=desc&complexity=low'
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      if (data.assets.length > 0) {
        expect(data.assets[0]).toMatchObject({
          name: expect.stringMatching(/loading/i),
          metadata: expect.objectContaining({
            complexity: 'low',
          }),
        });
      }

      // Verify sorting by usage
      if (data.assets.length > 1) {
        expect(data.assets[0].usage.totalUses).toBeGreaterThanOrEqual(
          data.assets[1].usage.totalUses
        );
      }
    });

    it('should include Lottie analytics and insights', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/lottie?includeAnalytics=true'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.analytics).toMatchObject({
        categoryDistribution: expect.objectContaining({
          animation: expect.any(Number),
          icon: expect.any(Number),
          illustration: expect.any(Number),
          logo: expect.any(Number),
          ui: expect.any(Number),
          effect: expect.any(Number),
        }),
        usageStats: expect.objectContaining({
          mostUsedAssets: expect.arrayContaining([
            expect.objectContaining({
              assetId: expect.any(String),
              name: expect.any(String),
              totalUses: expect.any(Number),
            }),
          ]),
          leastUsedAssets: expect.arrayContaining([
            expect.objectContaining({
              assetId: expect.any(String),
              name: expect.any(String),
              totalUses: expect.any(Number),
            }),
          ]),
          unusedAssets: expect.any(Number),
        }),
        performanceMetrics: expect.objectContaining({
          averageLoadTime: expect.any(Number),
          averageRenderTime: expect.any(Number),
          optimizationRate: expect.any(Number),
          sizeTrends: expect.arrayContaining([
            expect.objectContaining({
              month: expect.any(String),
              averageSize: expect.any(Number),
              count: expect.any(Number),
            }),
          ]),
        }),
        storageAnalysis: expect.objectContaining({
          totalStorageUsed: expect.any(Number),
          storageByCategory: expect.objectContaining({
            animation: expect.any(Number),
            icon: expect.any(Number),
          }),
          growthProjection: expect.objectContaining({
            nextMonth: expect.any(Number),
            nextQuarter: expect.any(Number),
          }),
        }),
      });
    });

    it('should require admin or editor authentication', async () => {
      // Request without authentication
      const response = await fetch('http://localhost:3000/api/admin/lottie');

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

  describe('GET /api/admin/lottie/[id]', () => {
    it('should return detailed Lottie asset information', async () => {
      // First get an asset ID from the list
      const assetsResponse = await fetch(
        'http://localhost:3000/api/admin/lottie?limit=1'
      );
      const assetsData = await assetsResponse.json();
      const assetId = assetsData.assets[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/lottie/${assetId}`
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        asset: expect.objectContaining({
          _id: assetId,
          name: expect.any(String),
          slug: expect.any(String),
          description: expect.any(String),
          category: expect.any(String),
          tags: expect.arrayContaining([expect.any(String)]),
          file: expect.objectContaining({
            url: expect.any(String),
            path: expect.any(String),
            size: expect.any(Number),
            format: expect.any(String),
            version: expect.any(String),
            checksum: expect.any(String),
          }),
          // Detailed technical metadata
          detailedMetadata: expect.objectContaining({
            lottieVersion: expect.any(String),
            bodymovinVersion: expect.any(String),
            duration: expect.any(Number),
            frameRate: expect.any(Number),
            dimensions: expect.objectContaining({
              width: expect.any(Number),
              height: expect.any(Number),
            }),
            layers: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                type: expect.any(String),
                duration: expect.any(Number),
              }),
            ]),
            assets: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                type: expect.any(String),
                path: expect.any(String),
              }),
            ]),
            markers: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                time: expect.any(Number),
              }),
            ]),
          }),
          // Usage tracking with detailed breakdown
          detailedUsage: expect.objectContaining({
            totalUses: expect.any(Number),
            usageBreakdown: expect.objectContaining({
              blogPosts: expect.arrayContaining([
                expect.objectContaining({
                  postId: expect.any(String),
                  postTitle: expect.any(String),
                  usedAt: expect.any(String),
                }),
              ]),
              portfolioProjects: expect.arrayContaining([
                expect.objectContaining({
                  projectId: expect.any(String),
                  projectTitle: expect.any(String),
                  usedAt: expect.any(String),
                }),
              ]),
              pages: expect.arrayContaining([
                expect.objectContaining({
                  pageId: expect.any(String),
                  pageName: expect.any(String),
                  usedAt: expect.any(String),
                }),
              ]),
            }),
            usageHistory: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(String),
                uses: expect.any(Number),
              }),
            ]),
          }),
          // Performance analysis
          performanceAnalysis: expect.objectContaining({
            loadTimes: expect.objectContaining({
              average: expect.any(Number),
              p50: expect.any(Number),
              p95: expect.any(Number),
              p99: expect.any(Number),
            }),
            renderPerformance: expect.objectContaining({
              browserCompatibility: expect.objectContaining({
                chrome: expect.any(Boolean),
                firefox: expect.any(Boolean),
                safari: expect.any(Boolean),
                edge: expect.any(Boolean),
              }),
              devicePerformance: expect.objectContaining({
                mobile: expect.any(String),
                tablet: expect.any(String),
                desktop: expect.any(String),
              }),
            }),
            optimizationSuggestions: expect.arrayContaining([
              expect.objectContaining({
                type: expect.any(String),
                description: expect.any(String),
                impact: expect.stringMatching(/^(low|medium|high)$/),
                estimatedSavings: expect.any(Number),
              }),
            ]),
          }),
          // Version history
          versionHistory: expect.arrayContaining([
            expect.objectContaining({
              version: expect.any(String),
              uploadedAt: expect.any(String),
              uploadedBy: expect.objectContaining({
                name: expect.any(String),
              }),
              changes: expect.arrayContaining([expect.any(String)]),
              fileSize: expect.any(Number),
              url: expect.any(String),
            }),
          ]),
        }),
      });
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/lottie/non-existent-id'
      );

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('not found'),
      });
    });
  });

  describe('POST /api/admin/lottie', () => {
    it('should upload and create a new Lottie asset', async () => {
      const formData = new FormData();

      // Mock Lottie JSON content
      const lottieContent = {
        v: '5.7.1',
        fr: 30,
        ip: 0,
        op: 60,
        w: 400,
        h: 400,
        nm: 'Test Animation',
        ddd: 0,
        assets: [],
        layers: [],
      };

      const lottieBlob = new Blob([JSON.stringify(lottieContent)], {
        type: 'application/json',
      });

      formData.append('file', lottieBlob, 'test-animation.json');
      formData.append('name', 'Test Animation Upload');
      formData.append('description', 'A test animation uploaded via admin');
      formData.append('category', 'animation');
      formData.append('tags', JSON.stringify(['test', 'upload', 'animation']));
      formData.append('visibility', 'public');
      formData.append('altText', 'Test animation for upload testing');

      const response = await fetch('http://localhost:3000/api/admin/lottie', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        asset: expect.objectContaining({
          _id: expect.any(String),
          name: 'Test Animation Upload',
          slug: expect.any(String),
          description: 'A test animation uploaded via admin',
          category: 'animation',
          tags: expect.arrayContaining(['test', 'upload', 'animation']),
          visibility: 'public',
          file: expect.objectContaining({
            url: expect.any(String),
            path: expect.any(String),
            size: expect.any(Number),
            format: 'json',
            version: '1.0.0',
          }),
          metadata: expect.objectContaining({
            duration: expect.any(Number),
            frameRate: 30,
            dimensions: expect.objectContaining({
              width: 400,
              height: 400,
            }),
            lottieVersion: '5.7.1',
          }),
          status: 'processing', // Should start as processing
          uploadedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
          usage: expect.objectContaining({
            totalUses: 0,
            blogPosts: 0,
            portfolioProjects: 0,
            pages: 0,
          }),
          seo: expect.objectContaining({
            altText: 'Test animation for upload testing',
          }),
        }),
        processing: expect.objectContaining({
          status: 'queued',
          estimatedTime: expect.any(Number),
          jobId: expect.any(String),
        }),
      });
    });

    it('should validate file format and content', async () => {
      const formData = new FormData();

      // Invalid file content (not valid Lottie JSON)
      const invalidBlob = new Blob(['invalid json content'], {
        type: 'text/plain',
      });

      formData.append('file', invalidBlob, 'invalid.txt');
      formData.append('name', 'Invalid File Test');
      formData.append('category', 'animation');

      const response = await fetch('http://localhost:3000/api/admin/lottie', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.any(String),
        validation: expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'file',
              message: expect.stringContaining('valid Lottie'),
            }),
          ]),
        }),
      });
    });

    it('should handle file size limitations', async () => {
      const formData = new FormData();

      // Create a large mock file
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      const largeBlob = new Blob([largeContent], {
        type: 'application/json',
      });

      formData.append('file', largeBlob, 'large-file.json');
      formData.append('name', 'Large File Test');
      formData.append('category', 'animation');

      const response = await fetch('http://localhost:3000/api/admin/lottie', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(413);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('file size'),
        maxSize: expect.any(Number),
        actualSize: expect.any(Number),
      });
    });

    it('should auto-generate slug and prevent duplicates', async () => {
      const formData = new FormData();

      const lottieContent = {
        v: '5.7.1',
        fr: 30,
        ip: 0,
        op: 60,
        w: 200,
        h: 200,
        nm: 'Duplicate Test',
        layers: [],
      };

      const lottieBlob = new Blob([JSON.stringify(lottieContent)], {
        type: 'application/json',
      });

      formData.append('file', lottieBlob, 'duplicate-test.json');
      formData.append('name', 'Duplicate Slug Test Animation');
      formData.append('category', 'animation');

      const response = await fetch('http://localhost:3000/api/admin/lottie', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 201) {
        const data = await response.json();
        expect(data.asset.slug).toBe('duplicate-slug-test-animation');
      } else if (response.status === 409) {
        const data = await response.json();
        expect(data).toMatchObject({
          success: false,
          error: expect.stringContaining('slug'),
          code: 'DUPLICATE_SLUG',
        });
      }
    });

    it('should require admin or editor authentication', async () => {
      const formData = new FormData();
      const lottieBlob = new Blob(['{}'], { type: 'application/json' });
      formData.append('file', lottieBlob, 'test.json');
      formData.append('name', 'Unauthorized Upload');

      // Request without authentication
      const response = await fetch('http://localhost:3000/api/admin/lottie', {
        method: 'POST',
        body: formData,
      });

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/admin/lottie/[id]', () => {
    it('should update Lottie asset metadata', async () => {
      // Get an asset to update
      const assetsResponse = await fetch(
        'http://localhost:3000/api/admin/lottie?limit=1'
      );
      const assetsData = await assetsResponse.json();
      const assetId = assetsData.assets[0]._id;

      const updateData = {
        name: 'Updated Animation Name',
        description: 'Updated description with new information',
        category: 'icon',
        tags: ['updated', 'test', 'icon'],
        visibility: 'private',
        seo: {
          altText: 'Updated alt text',
          keywords: ['updated', 'animation', 'icon'],
        },
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/lottie/${assetId}`,
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
        asset: expect.objectContaining({
          _id: assetId,
          name: updateData.name,
          description: updateData.description,
          category: updateData.category,
          tags: expect.arrayContaining(updateData.tags),
          visibility: updateData.visibility,
          seo: expect.objectContaining(updateData.seo),
          updatedAt: expect.any(String),
          lastModifiedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
          version: expect.any(String),
        }),
      });
    });

    it('should handle file replacement uploads', async () => {
      const assetsResponse = await fetch(
        'http://localhost:3000/api/admin/lottie?limit=1'
      );
      const assetsData = await assetsResponse.json();
      const assetId = assetsData.assets[0]._id;

      const formData = new FormData();

      const updatedLottieContent = {
        v: '5.7.1',
        fr: 60, // Different frame rate
        ip: 0,
        op: 120, // Different duration
        w: 500,
        h: 500,
        nm: 'Updated Animation',
        layers: [],
      };

      const lottieBlob = new Blob([JSON.stringify(updatedLottieContent)], {
        type: 'application/json',
      });

      formData.append('file', lottieBlob, 'updated-animation.json');
      formData.append('versionNote', 'Updated with new dimensions and timing');

      const response = await fetch(
        `http://localhost:3000/api/admin/lottie/${assetId}/replace`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        asset: expect.objectContaining({
          _id: assetId,
          file: expect.objectContaining({
            version: expect.any(String), // Should be incremented
            size: expect.any(Number),
          }),
          metadata: expect.objectContaining({
            frameRate: 60,
            dimensions: expect.objectContaining({
              width: 500,
              height: 500,
            }),
          }),
          versionHistory: expect.arrayContaining([
            expect.objectContaining({
              version: expect.any(String),
              changes: expect.arrayContaining([
                'Updated with new dimensions and timing',
              ]),
            }),
          ]),
        }),
        processing: expect.objectContaining({
          status: 'queued',
          jobId: expect.any(String),
        }),
      });
    });

    it('should return 404 for non-existent asset', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/lottie/non-existent-id',
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
        name: 'Unauthorized Update',
        description: 'This should not be updated',
      };

      // Request without authentication
      const response = await fetch(
        'http://localhost:3000/api/admin/lottie/some-asset-id',
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

  describe('DELETE /api/admin/lottie/[id]', () => {
    it('should delete a Lottie asset and handle dependencies', async () => {
      // Get an asset to delete
      const assetsResponse = await fetch(
        'http://localhost:3000/api/admin/lottie?limit=1'
      );
      const assetsData = await assetsResponse.json();
      const assetId = assetsData.assets[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/lottie/${assetId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('deleted'),
        deletedAsset: expect.objectContaining({
          _id: assetId,
          deletedAt: expect.any(String),
          deletedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
        }),
        dependencies: expect.objectContaining({
          blogPosts: expect.any(Number),
          portfolioProjects: expect.any(Number),
          pages: expect.any(Number),
          action: expect.stringMatching(/^(removed|placeholder|warning)$/),
        }),
        cleanup: expect.objectContaining({
          filesRemoved: expect.any(Boolean),
          cacheCleared: expect.any(Boolean),
          cdnPurged: expect.any(Boolean),
        }),
      });
    });

    it('should support hard delete with force parameter', async () => {
      const assetsResponse = await fetch(
        'http://localhost:3000/api/admin/lottie?limit=1'
      );
      const assetsData = await assetsResponse.json();
      const assetId = assetsData.assets[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/lottie/${assetId}?force=true`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('permanently deleted'),
        deletedAsset: expect.objectContaining({
          _id: assetId,
        }),
        filesRemoved: expect.arrayContaining([expect.any(String)]),
      });

      // Verify asset is completely removed
      const getResponse = await fetch(
        `http://localhost:3000/api/admin/lottie/${assetId}`
      );
      expect(getResponse.status).toBe(404);
    });

    it('should handle bulk deletion', async () => {
      // Get multiple unused assets
      const assetsResponse = await fetch(
        'http://localhost:3000/api/admin/lottie?unused=true&limit=2'
      );
      const assetsData = await assetsResponse.json();
      const assetIds = assetsData.assets.map(
        (asset: { _id: string }) => asset._id
      );

      const bulkDeleteData = {
        assetIds: assetIds,
        reason: 'Cleanup of unused assets',
        force: false,
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/lottie/bulk-delete',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bulkDeleteData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        deletedCount: assetIds.length,
        results: expect.arrayContaining([
          expect.objectContaining({
            assetId: expect.any(String),
            success: true,
            action: 'deleted',
          }),
        ]),
        totalSpaceSaved: expect.any(Number),
      });
    });

    it('should prevent deletion of assets in use', async () => {
      // Get an asset that's in use
      const assetsResponse = await fetch(
        'http://localhost:3000/api/admin/lottie?inUse=true&limit=1'
      );

      if (assetsResponse.status === 200) {
        const assetsData = await assetsResponse.json();

        if (assetsData.assets.length > 0) {
          const assetId = assetsData.assets[0]._id;

          const response = await fetch(
            `http://localhost:3000/api/admin/lottie/${assetId}`,
            {
              method: 'DELETE',
            }
          );

          expect(response.status).toBe(409);

          const data = await response.json();
          expect(data).toMatchObject({
            success: false,
            error: expect.stringContaining('in use'),
            dependencies: expect.objectContaining({
              total: expect.any(Number),
              details: expect.arrayContaining([
                expect.objectContaining({
                  type: expect.stringMatching(/^(blog|portfolio|page)$/),
                  id: expect.any(String),
                  title: expect.any(String),
                }),
              ]),
            }),
            suggestions: expect.arrayContaining([expect.any(String)]),
          });
        }
      }
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/lottie/non-existent-id',
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
        'http://localhost:3000/api/admin/lottie/some-asset-id',
        {
          method: 'DELETE',
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/admin/lottie/optimize', () => {
    it('should optimize Lottie assets for better performance', async () => {
      const optimizationRequest = {
        assetIds: ['asset-id-1', 'asset-id-2'],
        options: {
          reduceFileSize: true,
          optimizeForWeb: true,
          removeUnusedLayers: true,
          compressColors: true,
          targetFileSize: 50000, // 50KB target
        },
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/lottie/optimize',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(optimizationRequest),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        jobId: expect.any(String),
        status: 'queued',
        assetsToOptimize: optimizationRequest.assetIds.length,
        estimatedTime: expect.any(Number),
        options: expect.objectContaining(optimizationRequest.options),
      });
    });

    it('should provide optimization analysis without applying changes', async () => {
      const analysisRequest = {
        assetIds: ['asset-id-1'],
        dryRun: true,
        options: {
          reduceFileSize: true,
          optimizeForWeb: true,
        },
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/lottie/optimize',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analysisRequest),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        dryRun: true,
        analysis: expect.arrayContaining([
          expect.objectContaining({
            assetId: expect.any(String),
            currentSize: expect.any(Number),
            estimatedOptimizedSize: expect.any(Number),
            potentialSavings: expect.any(Number),
            optimizations: expect.arrayContaining([
              expect.objectContaining({
                type: expect.any(String),
                description: expect.any(String),
                impact: expect.stringMatching(/^(low|medium|high)$/),
                savings: expect.any(Number),
              }),
            ]),
          }),
        ]),
        totalPotentialSavings: expect.any(Number),
        recommendations: expect.arrayContaining([expect.any(String)]),
      });
    });
  });
});
