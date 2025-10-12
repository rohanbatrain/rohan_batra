'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { Send, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from 'sonner';

interface Comment {
  _id: string;
  authorId: string;
  content: string;
  status: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  braindumpId: string;
}

export default function CommentThread({ braindumpId }: CommentThreadProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [braindumpId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/braindump/${braindumpId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/braindump/${braindumpId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      toast.success('Comment posted successfully');
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/braindump/${braindumpId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }

      toast.success('Reply posted successfully');
      setReplyContent('');
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

      {/* New Comment Form */}
      {isSignedIn && (
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="space-y-4">
            {/* Main Comment */}
            <div className="flex gap-3">
              <Avatar 
                fallback={comment.authorId.substring(0, 2).toUpperCase()}
                alt={comment.authorId}
                size="sm"
              />

              <div className="flex-1 space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </div>

                <div className="text-sm whitespace-pre-wrap break-words">
                  {comment.content}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(comment._id)}
                  className="h-7 text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>
            </div>

            {/* Reply Form */}
            {replyTo === comment._id && (
              <div className="ml-11 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSubmitReply(comment._id)}
                    disabled={submitting || !replyContent.trim()}
                    size="sm"
                  >
                    Post Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-11 space-y-4 border-l-2 border-muted pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-3">
                    <Avatar 
                      fallback={reply.authorId.substring(0, 2).toUpperCase()}
                      alt={reply.authorId}
                      size="sm"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </div>

                      <div className="text-sm whitespace-pre-wrap break-words">
                        {reply.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
