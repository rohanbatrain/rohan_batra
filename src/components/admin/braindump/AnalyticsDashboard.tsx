/**
 * Analytics Dashboard for Braindumps
 * Shows views, shares, trending braindumps, and engagement metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Share2, 
  MessageSquare, 
  ThumbsUp, 
  TrendingUp,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface TrendingBraindump {
  _id: string;
  content: string;
  slug?: string;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  reactionCount: number;
  trendingScore: number;
  createdAt: string;
}

interface AnalyticsData {
  totalViews: number;
  totalShares: number;
  totalComments: number;
  totalReactions: number;
  publicBraindumps: number;
  unlistedBraindumps: number;
  trending24h: TrendingBraindump[];
  trending7d: TrendingBraindump[];
  trending30d: TrendingBraindump[];
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch trending for all periods
      const [trending24h, trending7d, trending30d, stats] = await Promise.all([
        fetch('/api/analytics/trending?period=24h&limit=5').then(r => r.json()),
        fetch('/api/analytics/trending?period=7d&limit=10').then(r => r.json()),
        fetch('/api/analytics/trending?period=30d&limit=10').then(r => r.json()),
        fetch('/api/admin/braindump?limit=1000').then(r => r.json()), // Get all to calculate stats
      ]);

      // Calculate aggregate stats
      const publicBraindumps = stats.braindumps?.filter((b: any) => b.visibility === 'public').length || 0;
      const unlistedBraindumps = stats.braindumps?.filter((b: any) => b.visibility === 'unlisted').length || 0;
      
      const totalViews = stats.braindumps?.reduce((sum: number, b: any) => sum + (b.viewCount || 0), 0) || 0;
      const totalShares = stats.braindumps?.reduce((sum: number, b: any) => sum + (b.shareCount || 0), 0) || 0;
      const totalComments = stats.braindumps?.reduce((sum: number, b: any) => sum + (b.commentCount || 0), 0) || 0;
      const totalReactions = stats.braindumps?.reduce((sum: number, b: any) => sum + (b.reactionCount || 0), 0) || 0;

      setAnalytics({
        totalViews,
        totalShares,
        totalComments,
        totalReactions,
        publicBraindumps,
        unlistedBraindumps,
        trending24h: trending24h.data?.braindumps || [],
        trending7d: trending7d.data?.braindumps || [],
        trending30d: trending30d.data?.braindumps || [],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  const trendingData = {
    '24h': analytics.trending24h,
    '7d': analytics.trending7d,
    '30d': analytics.trending30d,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all public braindumps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Times braindumps were shared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Community engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reactions</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Emoji reactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Visibility Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Public Braindumps</span>
                <span className="text-2xl font-bold text-green-600">{analytics.publicBraindumps}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Visible in listing and search
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unlisted Braindumps</span>
                <span className="text-2xl font-bold text-yellow-600">{analytics.unlistedBraindumps}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Accessible via direct link only
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Braindumps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Braindumps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
              <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
            </TabsList>

            {(['24h', '7d', '30d'] as const).map((period) => (
              <TabsContent key={period} value={period} className="space-y-4 mt-4">
                {trendingData[period].length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No trending braindumps in this period
                  </div>
                ) : (
                  trendingData[period].map((braindump, index) => (
                    <div key={braindump._id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2">
                              {braindump.content.substring(0, 150)}
                              {braindump.content.length > 150 && '...'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                          <BarChart3 className="h-4 w-4" />
                          {braindump.trendingScore}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {braindump.viewCount} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {braindump.shareCount} shares
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {braindump.commentCount} comments
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {braindump.reactionCount} reactions
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(braindump.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {braindump.slug && (
                        <div className="pt-2 border-t">
                          <a
                            href={`/braindump/${braindump.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View public page →
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
