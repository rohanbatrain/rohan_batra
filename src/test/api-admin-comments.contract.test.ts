import { describe, it, expect } from 'vitest';

describe('Admin Comment Moderation API', () => {
  describe('GET /api/admin/comments', () => {
    it('should return comments with moderation information', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments?page=1&limit=10'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        comments: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            content: expect.any(String),
            author: expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
              email: expect.any(String),
              avatar: expect.any(String),
            }),
            post: expect.objectContaining({
              _id: expect.any(String),
              title: expect.any(String),
              slug: expect.any(String),
              type: expect.stringMatching(/^(blog|portfolio)$/),
            }),
            status: expect.stringMatching(/^(pending|approved|rejected|spam)$/),
            parentId: expect.any(String),
            replies: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(String),
                content: expect.any(String),
                author: expect.objectContaining({
                  name: expect.any(String),
                }),
                status: expect.stringMatching(
                  /^(pending|approved|rejected|spam)$/
                ),
              }),
            ]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            // Moderation-specific fields
            moderationInfo: expect.objectContaining({
              moderatedBy: expect.objectContaining({
                _id: expect.any(String),
                name: expect.any(String),
              }),
              moderatedAt: expect.any(String),
              moderationReason: expect.any(String),
              flagCount: expect.any(Number),
              spamScore: expect.any(Number),
            }),
            metadata: expect.objectContaining({
              ipAddress: expect.any(String),
              userAgent: expect.any(String),
              isEdited: expect.any(Boolean),
              editedAt: expect.any(String),
            }),
          }),
        ]),
        pagination: expect.objectContaining({
          currentPage: 1,
          totalPages: expect.any(Number),
          totalComments: expect.any(Number),
          limit: 10,
          hasNextPage: expect.any(Boolean),
          hasPrevPage: false,
        }),
        summary: expect.objectContaining({
          totalComments: expect.any(Number),
          pendingComments: expect.any(Number),
          approvedComments: expect.any(Number),
          rejectedComments: expect.any(Number),
          spamComments: expect.any(Number),
          flaggedComments: expect.any(Number),
          commentsToday: expect.any(Number),
        }),
      });
    });

    it('should support filtering comments by status and content type', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments?status=pending&postType=blog&flagged=true'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.comments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'pending',
            post: expect.objectContaining({
              type: 'blog',
            }),
            moderationInfo: expect.objectContaining({
              flagCount: expect.any(Number),
            }),
          }),
        ])
      );

      expect(data.filters).toMatchObject({
        status: 'pending',
        postType: 'blog',
        flagged: true,
      });
    });

    it('should support advanced search and sorting', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments?search=spam&sortBy=spamScore&sortOrder=desc&author=johndoe'
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      if (data.comments.length > 0) {
        expect(data.comments[0]).toMatchObject({
          content: expect.stringMatching(/spam/i),
          author: expect.objectContaining({
            name: expect.stringMatching(/johndoe/i),
          }),
        });
      }

      // Verify sorting by spam score
      if (data.comments.length > 1) {
        expect(
          data.comments[0].moderationInfo.spamScore
        ).toBeGreaterThanOrEqual(data.comments[1].moderationInfo.spamScore);
      }
    });

    it('should include moderation analytics', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments?includeAnalytics=true'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.analytics).toMatchObject({
        moderationStats: expect.objectContaining({
          averageResponseTime: expect.any(Number),
          moderationAccuracy: expect.any(Number),
          autoModerationRate: expect.any(Number),
        }),
        spamAnalysis: expect.objectContaining({
          totalSpamDetected: expect.any(Number),
          spamDetectionRate: expect.any(Number),
          falsePositiveRate: expect.any(Number),
        }),
        userBehavior: expect.objectContaining({
          repeatOffenders: expect.arrayContaining([
            expect.objectContaining({
              userId: expect.any(String),
              spamCount: expect.any(Number),
              name: expect.any(String),
            }),
          ]),
          mostActivePosters: expect.arrayContaining([
            expect.objectContaining({
              userId: expect.any(String),
              commentCount: expect.any(Number),
              name: expect.any(String),
            }),
          ]),
        }),
        timeAnalysis: expect.objectContaining({
          peakHours: expect.arrayContaining([expect.any(Number)]),
          dailyPattern: expect.objectContaining({
            monday: expect.any(Number),
            tuesday: expect.any(Number),
          }),
        }),
      });
    });

    it('should require admin or editor authentication', async () => {
      // Request without authentication
      const response = await fetch('http://localhost:3000/api/admin/comments');

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

  describe('GET /api/admin/comments/[commentId]', () => {
    it('should return detailed comment information with full context', async () => {
      // First get a comment ID from the list
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?limit=1'
      );
      const commentsData = await commentsResponse.json();
      const commentId = commentsData.comments[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/comments/${commentId}`
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        comment: expect.objectContaining({
          _id: commentId,
          content: expect.any(String),
          originalContent: expect.any(String), // For tracking edits
          author: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
            email: expect.any(String),
            avatar: expect.any(String),
            role: expect.stringMatching(/^(user|editor|admin)$/),
            // Additional author context
            totalComments: expect.any(Number),
            approvedComments: expect.any(Number),
            rejectedComments: expect.any(Number),
            trustScore: expect.any(Number),
          }),
          post: expect.objectContaining({
            _id: expect.any(String),
            title: expect.any(String),
            slug: expect.any(String),
            type: expect.stringMatching(/^(blog|portfolio)$/),
            author: expect.objectContaining({
              name: expect.any(String),
            }),
          }),
          // Complete conversation thread
          thread: expect.objectContaining({
            parentComment: expect.any(Object),
            replies: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(String),
                content: expect.any(String),
                author: expect.objectContaining({
                  name: expect.any(String),
                }),
                status: expect.any(String),
                createdAt: expect.any(String),
              }),
            ]),
            totalReplies: expect.any(Number),
          }),
          // Detailed moderation information
          moderationInfo: expect.objectContaining({
            status: expect.stringMatching(/^(pending|approved|rejected|spam)$/),
            moderatedBy: expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
            }),
            moderatedAt: expect.any(String),
            moderationReason: expect.any(String),
            flagCount: expect.any(Number),
            flags: expect.arrayContaining([
              expect.objectContaining({
                reason: expect.any(String),
                reportedBy: expect.objectContaining({
                  name: expect.any(String),
                }),
                reportedAt: expect.any(String),
              }),
            ]),
            spamScore: expect.any(Number),
            spamIndicators: expect.arrayContaining([expect.any(String)]),
            autoModerationResult: expect.objectContaining({
              action: expect.stringMatching(/^(approve|flag|reject)$/),
              confidence: expect.any(Number),
              reasons: expect.arrayContaining([expect.any(String)]),
            }),
          }),
          // Technical metadata
          metadata: expect.objectContaining({
            ipAddress: expect.any(String),
            userAgent: expect.any(String),
            isEdited: expect.any(Boolean),
            editHistory: expect.arrayContaining([
              expect.objectContaining({
                editedAt: expect.any(String),
                previousContent: expect.any(String),
                editReason: expect.any(String),
              }),
            ]),
            location: expect.objectContaining({
              country: expect.any(String),
              city: expect.any(String),
            }),
          }),
        }),
      });
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments/non-existent-id'
      );

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('not found'),
      });
    });
  });

  describe('PUT /api/admin/comments/[commentId]', () => {
    it('should update comment moderation status', async () => {
      // Get a comment to moderate
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?status=pending&limit=1'
      );
      const commentsData = await commentsResponse.json();
      const commentId = commentsData.comments[0]._id;

      const moderationData = {
        status: 'approved',
        moderationReason: 'Comment is appropriate and adds value',
        notifyAuthor: true,
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moderationData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        comment: expect.objectContaining({
          _id: commentId,
          status: 'approved',
          moderationInfo: expect.objectContaining({
            status: 'approved',
            moderatedBy: expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
            }),
            moderatedAt: expect.any(String),
            moderationReason: moderationData.moderationReason,
          }),
          updatedAt: expect.any(String),
        }),
        notification: expect.objectContaining({
          sent: true,
          type: 'comment_approved',
          recipient: expect.objectContaining({
            email: expect.any(String),
          }),
        }),
      });
    });

    it('should support bulk moderation actions', async () => {
      // Get multiple pending comments
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?status=pending&limit=3'
      );
      const commentsData = await commentsResponse.json();
      const commentIds = commentsData.comments.map(
        (comment: { _id: string }) => comment._id
      );

      const bulkModerationData = {
        action: 'approve',
        commentIds: commentIds,
        moderationReason: 'Bulk approval of legitimate comments',
        notifyAuthors: false,
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/comments/bulk-moderate',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bulkModerationData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        moderatedCount: commentIds.length,
        results: expect.arrayContaining([
          expect.objectContaining({
            commentId: expect.any(String),
            success: true,
            newStatus: 'approved',
          }),
        ]),
        summary: expect.objectContaining({
          approved: commentIds.length,
          failed: 0,
        }),
      });
    });

    it('should handle comment editing by moderators', async () => {
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?limit=1'
      );
      const commentsData = await commentsResponse.json();
      const commentId = commentsData.comments[0]._id;

      const editData = {
        content: 'Edited content with removed inappropriate language',
        editReason: 'Removed inappropriate language',
        preserveOriginal: true,
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/comments/${commentId}/edit`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        comment: expect.objectContaining({
          _id: commentId,
          content: editData.content,
          originalContent: expect.any(String),
          metadata: expect.objectContaining({
            isEdited: true,
            editedBy: expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
              role: expect.stringMatching(/^(admin|editor)$/),
            }),
            editHistory: expect.arrayContaining([
              expect.objectContaining({
                editedAt: expect.any(String),
                previousContent: expect.any(String),
                editReason: editData.editReason,
              }),
            ]),
          }),
        }),
      });
    });

    it('should validate moderation status transitions', async () => {
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?limit=1'
      );
      const commentsData = await commentsResponse.json();
      const commentId = commentsData.comments[0]._id;

      const invalidModerationData = {
        status: 'invalid-status',
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidModerationData),
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
              field: 'status',
              message: expect.stringContaining('valid status'),
            }),
          ]),
        }),
      });
    });

    it('should require admin or editor authentication', async () => {
      const moderationData = {
        status: 'approved',
        moderationReason: 'Approved by unauthorized user',
      };

      // Request without authentication
      const response = await fetch(
        'http://localhost:3000/api/admin/comments/some-comment-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moderationData),
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/admin/comments/[commentId]', () => {
    it('should delete a comment and handle replies', async () => {
      // Get a comment with replies
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?hasReplies=true&limit=1'
      );
      const commentsData = await commentsResponse.json();
      const commentId = commentsData.comments[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('deleted'),
        deletedComment: expect.objectContaining({
          _id: commentId,
          deletedAt: expect.any(String),
          deletedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
        }),
        repliesHandling: expect.objectContaining({
          action: expect.stringMatching(/^(deleted|orphaned|promoted)$/),
          count: expect.any(Number),
        }),
      });
    });

    it('should support hard delete with force parameter', async () => {
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?limit=1'
      );
      const commentsData = await commentsResponse.json();
      const commentId = commentsData.comments[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/comments/${commentId}?force=true`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('permanently deleted'),
        deletedComment: expect.objectContaining({
          _id: commentId,
        }),
      });

      // Verify comment is completely removed
      const getResponse = await fetch(
        `http://localhost:3000/api/admin/comments/${commentId}`
      );
      expect(getResponse.status).toBe(404);
    });

    it('should handle bulk deletion', async () => {
      // Get multiple spam comments
      const commentsResponse = await fetch(
        'http://localhost:3000/api/admin/comments?status=spam&limit=2'
      );
      const commentsData = await commentsResponse.json();
      const commentIds = commentsData.comments.map(
        (comment: { _id: string }) => comment._id
      );

      const bulkDeleteData = {
        commentIds: commentIds,
        reason: 'Bulk deletion of spam comments',
        force: false,
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/comments/bulk-delete',
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
        deletedCount: commentIds.length,
        results: expect.arrayContaining([
          expect.objectContaining({
            commentId: expect.any(String),
            success: true,
            action: 'deleted',
          }),
        ]),
      });
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments/non-existent-id',
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
        'http://localhost:3000/api/admin/comments/some-comment-id',
        {
          method: 'DELETE',
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/admin/comments/auto-moderate', () => {
    it('should run automatic moderation on pending comments', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments/auto-moderate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            batchSize: 50,
            confidenceThreshold: 0.8,
            dryRun: false,
          }),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        processed: expect.any(Number),
        results: expect.objectContaining({
          approved: expect.any(Number),
          flagged: expect.any(Number),
          rejected: expect.any(Number),
          needsReview: expect.any(Number),
        }),
        summary: expect.objectContaining({
          averageConfidence: expect.any(Number),
          processingTime: expect.any(Number),
          accuracy: expect.any(Number),
        }),
      });
    });

    it('should support dry run mode for testing', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/comments/auto-moderate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            batchSize: 10,
            confidenceThreshold: 0.9,
            dryRun: true,
          }),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        dryRun: true,
        processed: expect.any(Number),
        wouldApprove: expect.any(Number),
        wouldFlag: expect.any(Number),
        wouldReject: expect.any(Number),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            commentId: expect.any(String),
            recommendation: expect.stringMatching(/^(approve|flag|reject)$/),
            confidence: expect.any(Number),
            reasons: expect.arrayContaining([expect.any(String)]),
          }),
        ]),
      });
    });
  });
});
