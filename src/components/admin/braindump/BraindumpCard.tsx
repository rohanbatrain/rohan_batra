'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  CheckCircle,
  Archive,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Tag,
  Calendar,
  Link2,
  EyeOff,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { parseBraindumpLinks } from '@/lib/braindump/link-parser';
import { useCSRFToken } from '@/hooks/useCSRFToken';

interface Association {
  type: string;
  id?: string;
  title?: string;
  url?: string;
  note?: string;
}

interface Braindump {
  _id: string;
  title?: string;
  content: string;
  tags: string[];
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  visibility?: 'private' | 'unlisted' | 'public';
  slug?: string;
  associations?: Association[];
  linkedTo?: string[];
  linkedFrom?: string[];
  createdAt: string;
  updatedAt: string;
}

interface BraindumpCardProps {
  braindump: Braindump;
  onUpdate: () => void;
  onEdit: (braindump: Braindump) => void;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  captured: 'bg-purple-100 text-purple-800',
  processed: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

const visibilityConfig = {
  private: { 
    icon: Lock, 
    color: 'bg-gray-100 text-gray-800',
    label: 'Private'
  },
  unlisted: { 
    icon: EyeOff, 
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Unlisted'
  },
  public: { 
    icon: Eye, 
    color: 'bg-green-100 text-green-800',
    label: 'Public'
  },
};

const associationTypeColors = {
  blog: 'bg-blue-100 text-blue-800',
  project: 'bg-purple-100 text-purple-800',
  course: 'bg-green-100 text-green-800',
  book: 'bg-yellow-100 text-yellow-800',
  character: 'bg-pink-100 text-pink-800',
  portfolio: 'bg-indigo-100 text-indigo-800',
  'social-post': 'bg-cyan-100 text-cyan-800',
  linkedin: 'bg-blue-100 text-blue-800',
  twitter: 'bg-sky-100 text-sky-800',
  experience: 'bg-teal-100 text-teal-800',
  flashcard: 'bg-amber-100 text-amber-800',
  documentation: 'bg-slate-100 text-slate-800',
  other: 'bg-gray-100 text-gray-800',
};

export function BraindumpCard({ braindump, onUpdate, onEdit }: BraindumpCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [linkedBraindumps, setLinkedBraindumps] = useState<Map<string, { title?: string }>>(new Map());
  const { toast } = useToast();
  const { withCSRF } = useCSRFToken();

  // Derive a display title: prefer explicit title, otherwise fall back to first content line
  const displayTitle = useMemo(() => {
    if (braindump.title && braindump.title.trim().length > 0) return braindump.title.trim();
    const firstLine = braindump.content
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.length > 0) || '';
    return firstLine.slice(0, 120);
  }, [braindump.title, braindump.content]);

  // Determine if there is more content beyond the first non-empty line
  const hasMoreThanTitleLine = useMemo(() => {
    const lines = braindump.content.split('\n');
    const firstLineIndex = lines.findIndex((l) => l.trim().length > 0);
    if (firstLineIndex === -1) return false;
    const rest = lines.slice(firstLineIndex + 1).join('\n').trim();
    return rest.length > 0;
  }, [braindump.content]);

  // Debug: Log braindump data
  useEffect(() => {
    console.log('[BraindumpCard] Braindump data:', {
      id: braindump._id,
      title: braindump.title,
      hasTitle: !!braindump.title,
      content: braindump.content.substring(0, 50)
    });
  }, [braindump]);

  // Fetch linked braindumps metadata
  useEffect(() => {
    const links = parseBraindumpLinks(braindump.content);
    const idBasedLinks = links.filter(l => l.linkType === 'id' && l.braindumpId);
    
    if (idBasedLinks.length === 0) return;

    // Fetch metadata for linked braindumps
    const fetchLinkedData = async () => {
      const dataMap = new Map<string, { title?: string }>();
      
      await Promise.all(
        idBasedLinks.map(async (link) => {
          if (!link.braindumpId) return;
          
          try {
            const res = await fetch(`/api/admin/braindump/${link.braindumpId}`);
            if (res.ok) {
              const data = await res.json();
              dataMap.set(link.braindumpId, { title: data.title });
            }
          } catch (err) {
            console.error(`Failed to fetch braindump ${link.braindumpId}:`, err);
          }
        })
      );
      
      setLinkedBraindumps(dataMap);
    };

    fetchLinkedData();
  }, [braindump.content]);

  // Parse and render internal links
  const renderedContent = useMemo(() => {
    const links = parseBraindumpLinks(braindump.content);
    
    if (links.length === 0) {
      return <span className="whitespace-pre-wrap">{braindump.content}</span>;
    }

    // Split content into parts
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    links.forEach((link, i) => {
      // Text before link
      if (link.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {braindump.content.slice(lastIndex, link.startIndex)}
          </span>
        );
      }

      // Determine display text based on link type
      let displayText: string;
      let href: string;
      
      if (link.linkType === 'id' && link.braindumpId) {
        // ID-based link: [[671d4f8e9a8b2c3d4e5f6789]] or [[671d4f8e9a8b2c3d4e5f6789|Custom]]
        const linkedData = linkedBraindumps.get(link.braindumpId);
  displayText = link.displayText || linkedData?.title || `Note ${link.braindumpId.slice(-6)}`;
        href = `/admin/braindump?id=${link.braindumpId}`;
      } else if (link.linkType === 'title' && link.linkText) {
        // Title-based link: [[My Note Title]] or [[My Note Title|Custom]]
        displayText = link.displayText || link.linkText;
        // For title-based links, we'll search by title
        href = `/admin/braindump?search=${encodeURIComponent(link.linkText)}`;
      } else {
        // Fallback
        displayText = 'Unknown Link';
        href = '#';
      }

      // Link
      parts.push(
        <a
          key={`link-${i}`}
          href={href}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-dotted hover:decoration-solid transition-colors"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = href;
          }}
          title={link.linkType === 'title' ? `Search for: ${link.linkText}` : `Link to braindump ${link.braindumpId}`}
        >
          <Link2 className="h-3 w-3" />
          {displayText}
        </a>
      );

      lastIndex = link.endIndex;
    });

    // Text after last link
    if (lastIndex < braindump.content.length) {
      parts.push(
        <span key="text-end">
          {braindump.content.slice(lastIndex)}
        </span>
      );
    }

    return <span className="whitespace-pre-wrap">{parts}</span>;
  }, [braindump.content]);

  const handleStatusChange = async (newStatus: 'captured' | 'processed' | 'archived') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/braindump/${braindump._id}`, {
        method: 'PUT',
        credentials: 'include', // Ensure cookies are sent
        headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: 'Success',
        description: `Braindump marked as ${newStatus}`,
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this braindump?')) return;

    setIsLoading(true);
    try {
      const headers = withCSRF();
      console.log('[CLIENT] DELETE request headers:', headers);
      console.log('[CLIENT] Has X-CSRF-Token?', 'X-CSRF-Token' in headers);
      
      const response = await fetch(`/api/admin/braindump/${braindump._id}`, {
        method: 'DELETE',
        credentials: 'include', // Ensure cookies are sent
        headers,
      });

      console.log('[CLIENT] Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[CLIENT] Error response:', errorData);
        throw new Error('Failed to delete');
      }

      toast({
        title: 'Success',
        description: 'Braindump deleted successfully',
      });
      onUpdate();
    } catch (error) {
      console.error('Error deleting braindump:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete braindump',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <h3 className='text-lg font-semibold mb-2 truncate'>{displayTitle}</h3>
        <div className='flex items-start justify-between'>
          <div className='flex gap-2 flex-wrap'>
            <Badge className={priorityColors[braindump.priority]}>
              {braindump.priority}
            </Badge>
            <Badge className={statusColors[braindump.status]}>
              {braindump.status}
            </Badge>
            {braindump.visibility && braindump.visibility !== 'private' && (
              <Badge className={visibilityConfig[braindump.visibility].color}>
                {(() => {
                  const Icon = visibilityConfig[braindump.visibility].icon;
                  return (
                    <span className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {visibilityConfig[braindump.visibility].label}
                    </span>
                  );
                })()}
              </Badge>
            )}
            {braindump.category && (
              <Badge variant='outline'>{braindump.category}</Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' disabled={isLoading}>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onEdit(braindump)}>
                <Edit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open(`/braindump/preview/${braindump._id}`, '_blank')}
              >
                <Eye className='mr-2 h-4 w-4' />
                Preview
              </DropdownMenuItem>
              {braindump.visibility !== 'private' && braindump.slug && (
                <DropdownMenuItem 
                  onClick={() => window.open(`/braindump/${braindump.slug}`, '_blank')}
                >
                  <ExternalLink className='mr-2 h-4 w-4' />
                  View Public Page
                </DropdownMenuItem>
              )}
              {braindump.status === 'captured' && (
                <DropdownMenuItem onClick={() => handleStatusChange('processed')}>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Mark as Processed
                </DropdownMenuItem>
              )}
              {braindump.status !== 'archived' && (
                <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                  <Archive className='mr-2 h-4 w-4' />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-red-600'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        {(braindump.title || hasMoreThanTitleLine) && (
          <div className='text-sm text-muted-foreground'>
            {renderedContent}
          </div>
        )}

        {/* Show linked notes count */}
        {braindump.linkedTo && braindump.linkedTo.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Link2 className="h-3 w-3" />
            <span>Links to {braindump.linkedTo.length} {braindump.linkedTo.length === 1 ? 'note' : 'notes'}</span>
          </div>
        )}

        {braindump.tags.length > 0 && (
          <div className='flex items-center gap-2 flex-wrap'>
            <Tag className='h-3 w-3 text-muted-foreground' />
            {braindump.tags.map((tag, index) => (
              <Badge key={index} variant='secondary' className='text-xs'>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {braindump.associations && braindump.associations.length > 0 && (
          <div className='space-y-2'>
            <p className='text-xs font-semibold text-muted-foreground'>
              Associations:
            </p>
            <div className='flex flex-wrap gap-2'>
              {braindump.associations.map((assoc, index) => (
                <Badge
                  key={index}
                  className={associationTypeColors[assoc.type as keyof typeof associationTypeColors] || associationTypeColors.other}
                >
                  {assoc.type}
                  {assoc.title && `: ${assoc.title}`}
                  {assoc.url && (
                    <a
                      href={assoc.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='ml-1 inline-flex'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Calendar className='h-3 w-3' />
          <span>
            Created {formatDistanceToNow(new Date(braindump.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
