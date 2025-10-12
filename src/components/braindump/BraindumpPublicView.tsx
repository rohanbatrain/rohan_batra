'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Target, Lightbulb, Flame, ThumbsUp, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import CommentThread from './CommentThread';
import ReactionBar from './ReactionBar';
import ShareDialog from './ShareDialog';

interface BraindumpPublicViewProps {
  braindump: {
    id: string;
    content: string;
    slug?: string;
    tags?: string[];
    category?: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    publicMetadata: {
      viewCount: number;
      shareCount: number;
      sharesByPlatform?: Record<string, number>;
    };
    commentCount: number;
    reactionCounts: Record<string, number>;
  };
}

export default function BraindumpPublicView({ braindump }: BraindumpPublicViewProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/braindump/${braindump.slug || braindump.id}`
    : '';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Eye className="h-4 w-4" />
            <span>{braindump.publicMetadata.viewCount} views</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(braindump.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Tags */}
          {braindump.tags && braindump.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {braindump.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none mb-8">
          <div className="whitespace-pre-wrap break-words">
            {braindump.content}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-6 space-y-6">
          {/* Reaction Bar */}
          <ReactionBar
            braindumpId={braindump.id}
            initialCounts={braindump.reactionCounts}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {braindump.commentCount} Comments
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareDialog(true)}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="border-t pt-6">
              <CommentThread braindumpId={braindump.id} />
            </div>
          )}
        </div>
      </Card>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        url={shareUrl}
        title={braindump.content.substring(0, 100)}
      />
    </div>
  );
}
