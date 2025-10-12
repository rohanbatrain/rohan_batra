'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BacklinkBraindump {
  _id: string;
  content: string;
  tags: string[];
  priority: string;
  status: string;
  createdAt: string;
}

interface BraindumpBacklinksProps {
  braindumpId: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export function BraindumpBacklinks({ braindumpId }: BraindumpBacklinksProps) {
  const [backlinks, setBacklinks] = useState<BacklinkBraindump[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBacklinks = async () => {
      try {
        const response = await fetch(
          `/api/admin/braindump/${braindumpId}/backlinks`
        );
        const data = await response.json();
        setBacklinks(data.backlinks || []);
      } catch (error) {
        console.error('Failed to fetch backlinks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBacklinks();
  }, [braindumpId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading backlinks...</span>
        </CardContent>
      </Card>
    );
  }

  if (backlinks.length === 0) {
    return null; // Don't show if no backlinks
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          Referenced By ({backlinks.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Other braindumps that link to this one
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {backlinks.map((backlink) => (
          <div
            key={backlink._id}
            className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => window.location.href = `/admin/braindump?id=${backlink._id}`}
          >
            <p className="text-sm line-clamp-2 mb-2">{backlink.content}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  priorityColors[backlink.priority as keyof typeof priorityColors] ||
                  priorityColors.medium
                }
              >
                {backlink.priority}
              </Badge>
              {backlink.tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDistanceToNow(new Date(backlink.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
