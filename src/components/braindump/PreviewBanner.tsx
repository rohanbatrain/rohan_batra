'use client';

import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PreviewBannerProps {
  visibility: 'private' | 'unlisted' | 'public';
  braindump: {
    slug?: string;
    updatedAt: string;
    content?: string;
    tags?: string[];
  };
}

export default function PreviewBanner({ visibility, braindump }: PreviewBannerProps) {
  const visibilityInfo = {
    private: {
      icon: Lock,
      color: 'bg-red-500/10 text-red-700 dark:text-red-400',
      message: 'This is a PRIVATE braindump. Only you can see it.',
    },
    unlisted: {
      icon: EyeOff,
      color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      message: 'This is an UNLISTED braindump. Anyone with the link can view it.',
    },
    public: {
      icon: Eye,
      color: 'bg-green-500/10 text-green-700 dark:text-green-400',
      message: 'This is a PUBLIC braindump. It appears in listings and search.',
    },
  };

  const info = visibilityInfo[visibility];
  const Icon = info.icon;

  return (
    <>
      {/* Enhanced Preview Mode Banner */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline" 
                className="text-sm font-medium border-primary/20 bg-primary/5 text-primary animate-pulse"
              >
                🔍 PREVIEW MODE
              </Badge>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${info.color} transition-all duration-200 hover:scale-105`}>
                <Icon className="h-4 w-4" />
                <span>{visibility.toUpperCase()}</span>
              </div>
              
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => window.open(`/admin/braindump`, '_blank')}
                  className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Edit
                </button>
                {braindump.slug && (
                  <button
                    onClick={() => window.open(`/braindump/${braindump.slug}`, '_blank')}  
                    className="px-3 py-1 text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-md transition-colors"
                  >
                    Live View
                  </button>
                )}
              </div>
            </div>
            
            <a
              href="/admin/braindump"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 hover:translate-x-1"
            >
              ← Back to Admin
            </a>
          </div>
          
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-muted">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{info.message}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 rounded-xl p-8 border border-muted/50 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Preview Info */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                🔍 Preview Information
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>This shows exactly how your braindump appears to viewers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">ℹ</span>
                  <span>Analytics tracking is disabled in preview mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-0.5">🔗</span>
                  <div>
                    <span>Public URL: </span>
                    {braindump.slug ? (
                      <code className="text-xs bg-background px-2 py-1 rounded border ml-1 font-mono">
                        /braindump/{braindump.slug}
                      </code>
                    ) : (
                      <span className="text-amber-600 font-medium">Not generated (set visibility to public/unlisted)</span>
                    )}
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Quick Stats */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                📊 Content Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-background/50 p-3 rounded-lg border">
                  <div className="font-semibold text-lg">{braindump.content?.length || 0}</div>
                  <div className="text-muted-foreground">Characters</div>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border">
                  <div className="font-semibold text-lg">{braindump.content?.split(/\s+/).length || 0}</div>
                  <div className="text-muted-foreground">Words</div>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border">
                  <div className="font-semibold text-lg">{braindump.tags?.length || 0}</div>
                  <div className="text-muted-foreground">Tags</div>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border">
                  <div className="font-semibold text-lg">{Math.max(1, Math.ceil((braindump.content?.length || 0) / 1000))}</div>
                  <div className="text-muted-foreground">Min read</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="mt-8 pt-6 border-t border-muted flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <a
                href="/admin/braindump"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Edit Braindump
              </a>
              {braindump.slug && (
                <a
                  href={`/braindump/${braindump.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  View Live Page
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              Last updated {formatDistanceToNow(new Date(braindump.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}