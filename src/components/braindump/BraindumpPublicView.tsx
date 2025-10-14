'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Target, Lightbulb, Flame, ThumbsUp, Share2, Eye, Clock, Tag, ExternalLink, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CommentThread from './CommentThread';
import ReactionBar from './ReactionBar';
import ShareDialog from './ShareDialog';
import EnhancedContentRenderer from './EnhancedContentRenderer';
import { parseBraindumpLinks } from '@/lib/braindump/link-parser';

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

  // Parse content for metadata
  const { hasLinks, linkCount } = useMemo(() => {
    const links = parseBraindumpLinks(braindump.content);
    return {
      hasLinks: links.length > 0,
      linkCount: links.length
    };
  }, [braindump.content]);

  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil(braindump.content.length / 1000));

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-background to-muted/30 pb-6">
          {/* Metadata Bar */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{braindump.publicMetadata.viewCount}</span>
              <span>views</span>
            </div>
            
            <span className="text-muted-foreground/50">•</span>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(braindump.createdAt), { addSuffix: true })}</span>
            </div>
            
            <span className="text-muted-foreground/50">•</span>
            
            <div className="flex items-center gap-1">
              <span>{readingTime} min read</span>
            </div>

            {hasLinks && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  <span>{linkCount} {linkCount === 1 ? 'link' : 'links'}</span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          {braindump.tags && braindump.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {braindump.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Category */}
          {braindump.category && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs bg-background">
                {braindump.category}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {/* Enhanced Content */}
          <div className="mb-8 bg-gradient-to-br from-background/50 to-muted/20 rounded-lg border border-border/50 p-8 md:p-10 shadow-inner">
            <EnhancedContentRenderer 
              content={braindump.content}
              className="prose-base max-w-none text-[15px] leading-7 tracking-[0.01em]"
            />
          </div>

          {/* Enhanced Actions */}
          <div className="space-y-6">
            <Separator />
            
            {/* Reaction Bar */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Reactions</h3>
              <ReactionBar
                braindumpId={braindump.id}
                initialCounts={braindump.reactionCounts}
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="gap-2 transition-all duration-200 hover:scale-105"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{braindump.commentCount}</span>
                  <span>Comments</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  className="gap-2 transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              {/* Share Count */}
              {braindump.publicMetadata.shareCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  Shared {braindump.publicMetadata.shareCount} {braindump.publicMetadata.shareCount === 1 ? 'time' : 'times'}
                </div>
              )}
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="pt-6">
                <Separator className="mb-6" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Comments ({braindump.commentCount})
                  </h3>
                  <CommentThread braindumpId={braindump.id} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
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
