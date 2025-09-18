'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Users,
  FileText,
  MessageCircle,
  Heart,
  BookOpen,
} from 'lucide-react';

interface BlogPost {
  _id: string;
  id: string;
  title: string;
  publishedAt: string;
  createdAt: string;
  status: string;
  views?: number;
  likes?: number;
}

interface Project {
  _id: string;
  id: string;
  title: string;
  createdAt: string;
  featured: boolean;
  views?: number;
}

interface Comment {
  _id: string;
  id: string;
  content: string;
  createdAt: string;
  author:
    | {
        name: string;
      }
    | string;
  status: string;
}

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  role: string;
}

interface PopularItem {
  _id: string;
  id: string;
  title: string;
  views: number;
  type: 'blog' | 'project';
  likesCount: number;
  commentsCount: number;
  engagement: string;
}

interface AnalyticsData {
  overview: {
    timeframe: string;
    dateRange: { start: string; end: string };
  };
  content: {
    blogPosts: {
      total: number;
      published: number;
      draft: number;
      scheduled: number;
      publishedPercentage: number;
    };
    projects: {
      total: number;
      featured: number;
      archived: number;
      featuredPercentage: number;
    };
    books: {
      total: number;
      published: number;
      draft: number;
      chapters: number;
      characters: number;
      characterJournals: number;
    };
    characters: {
      total: number;
      active: number;
    };
    assets: {
      lottieAnimations: number;
    };
  };
  engagement: {
    comments: {
      total: number;
      pending: number;
      approved: number;
      spam: number;
    };
    likes: {
      total: number;
      thisWeek: number;
      growth: number;
    };
    trends: Array<{ date: string; comments: number; likes: number }>;
  };
  users: {
    total: number;
    admins: number;
    editors: number;
    users: number;
    regularUsers: number;
    active: number;
    thisWeek: number;
    growth: number;
    activityRate: number;
  };
  metrics: {
    avgPostsPerDay: number;
    engagementRate: number;
    userRetention: number;
    contentApprovalRate: number;
  };
  performance: {
    avgPostsPerDay: number;
    engagementRate: number;
    contentApprovalRate: number;
  };
  recentActivity: {
    blogPosts: BlogPost[];
    projects: Project[];
    comments: Comment[];
    users: User[];
  };
  trends: {
    activity: Array<{ date: string; posts: number }>;
    popular: PopularItem[];
    topLiked: PopularItem[];
  };
  cache?: {
    connected: boolean;
    memoryUsage?: string;
    totalKeys?: number;
    error?: string;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30d');

  const fetchAnalytics = useCallback(
    async (selectedTimeframe = timeframe) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/analytics?timeframe=${selectedTimeframe}&include=all`,
          {
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [timeframe]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    fetchAnalytics(newTimeframe);
  };

  if (loading) {
    return (
      <div className='container mx-auto py-8'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-red-600 mb-2'>
                Error Loading Analytics
              </h3>
              <p className='text-gray-600 mb-4'>{error}</p>
              <Button onClick={() => fetchAnalytics()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const contentStats = [
    {
      name: 'Blog Posts',
      value: data.content.blogPosts.total,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      name: 'Projects',
      value: data.content.projects.total,
      icon: BookOpen,
      color: 'text-green-600',
    },
    {
      name: 'Books',
      value: data.content.books.total,
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      name: 'Characters',
      value: data.content.books.characters,
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  const engagementStats = [
    {
      name: 'Comments',
      value: data.engagement.comments.total,
      icon: MessageCircle,
      color: 'text-blue-600',
    },
    {
      name: 'Likes',
      value: data.engagement.likes.total,
      icon: Heart,
      color: 'text-red-600',
    },
    {
      name: 'Users',
      value: data.users.total,
      icon: Users,
      color: 'text-green-600',
    },
    {
      name: 'Active Users',
      value: data.users.active,
      icon: Activity,
      color: 'text-purple-600',
    },
  ];

  const userDistribution = [
    { name: 'Admins', value: data.users.admins, color: COLORS[0] },
    { name: 'Editors', value: data.users.editors, color: COLORS[1] },
    { name: 'Users', value: data.users.regularUsers, color: COLORS[2] },
  ];

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
          <p className='text-gray-600 mt-2'>
            Overview for {data.overview.timeframe}(
            {new Date(data.overview.dateRange.start).toLocaleDateString()} -{' '}
            {new Date(data.overview.dateRange.end).toLocaleDateString()})
          </p>
        </div>

        <div className='flex gap-2'>
          {['7d', '30d', '90d', '1y'].map(tf => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size='sm'
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {contentStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      {stat.name}
                    </p>
                    <p className='text-2xl font-bold'>
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {engagementStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      {stat.name}
                    </p>
                    <p className='text-2xl font-bold'>
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-600'>
                Content Approval Rate
              </p>
              <div className='mt-2'>
                <div className='text-2xl font-bold'>
                  {Math.round(data.performance.contentApprovalRate * 100)}%
                </div>
                <Progress
                  value={data.performance.contentApprovalRate * 100}
                  className='mt-2'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-600'>
                User Activity Rate
              </p>
              <div className='mt-2'>
                <div className='text-2xl font-bold'>
                  {data.users.activityRate}%
                </div>
                <Progress value={data.users.activityRate} className='mt-2' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-600'>Avg Posts/Day</p>
              <div className='mt-2'>
                <div className='text-2xl font-bold'>
                  {data.performance.avgPostsPerDay.toFixed(1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-600'>
                Engagement Rate
              </p>
              <div className='mt-2'>
                <div className='text-2xl font-bold'>
                  {data.performance.engagementRate.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='charts' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='charts'>Charts</TabsTrigger>
          <TabsTrigger value='content'>Content</TabsTrigger>
          <TabsTrigger value='activity'>Recent Activity</TabsTrigger>
          <TabsTrigger value='cache'>Cache Status</TabsTrigger>
        </TabsList>

        <TabsContent value='charts' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Activity Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>
                  Daily content creation over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={data.trends.activity}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='posts'
                      stroke='#8884d8'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Distribution of user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={(props: any) => {
                        const total = userDistribution.reduce(
                          (sum, item) => sum + item.value,
                          0
                        );
                        const percent = (props.value / total) * 100;
                        return `${props.name} ${percent.toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Trends */}
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Daily comment activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={data.engagement.trends}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='comments' fill='#82ca9d' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='content' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Content Status */}
            <Card>
              <CardHeader>
                <CardTitle>Content Status</CardTitle>
                <CardDescription>Published vs draft content</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm'>
                    <span>Blog Posts Published</span>
                    <span>{data.content.blogPosts.publishedPercentage}%</span>
                  </div>
                  <Progress
                    value={data.content.blogPosts.publishedPercentage}
                    className='mt-1'
                  />
                </div>

                <div>
                  <div className='flex justify-between text-sm'>
                    <span>Projects Featured</span>
                    <span>{data.content.projects.featuredPercentage}%</span>
                  </div>
                  <Progress
                    value={data.content.projects.featuredPercentage}
                    className='mt-1'
                  />
                </div>

                <Separator />

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Total Chapters</span>
                    <Badge variant='outline'>
                      {data.content.books.chapters}
                    </Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span>Characters</span>
                    <Badge variant='outline'>
                      {data.content.books.characters}
                    </Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span>Character Journals</span>
                    <Badge variant='outline'>
                      {data.content.books.characterJournals}
                    </Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span>Lottie Assets</span>
                    <Badge variant='outline'>
                      {data.content.assets.lottieAnimations}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Content */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Content</CardTitle>
                <CardDescription>Most engaging content pieces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.trends.popular.slice(0, 5).map(item => (
                    <div
                      key={item._id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate'>
                          {item.title}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {item.likesCount} likes, {item.commentsCount} comments
                        </p>
                      </div>
                      <Badge variant='secondary'>{item.engagement}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='activity' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Recent Blog Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.blogPosts.map(post => (
                    <div
                      key={post._id}
                      className='flex items-center justify-between'
                    >
                      <div>
                        <p className='text-sm font-medium'>{post.title}</p>
                        <p className='text-xs text-gray-500'>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          post.status === 'published' ? 'default' : 'secondary'
                        }
                      >
                        {post.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.comments.map(comment => (
                    <div key={comment._id} className='space-y-1'>
                      <div className='flex items-center justify-between'>
                        <p className='text-xs text-gray-500'>
                          {typeof comment.author === 'string'
                            ? comment.author
                            : comment.author?.name || 'Anonymous'}
                        </p>
                        <Badge
                          variant={
                            comment.status === 'approved'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {comment.status}
                        </Badge>
                      </div>
                      <p className='text-sm'>
                        {comment.content ? comment.content.substring(0, 100) + '...' : 'No content'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.users.map(user => (
                    <div
                      key={user._id}
                      className='flex items-center justify-between'
                    >
                      <div>
                        <p className='text-sm font-medium'>{user.name}</p>
                        <p className='text-xs text-gray-500'>{user.email}</p>
                      </div>
                      <Badge variant='outline'>{user.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.projects.map(project => (
                    <div
                      key={project._id}
                      className='flex items-center justify-between'
                    >
                      <div>
                        <p className='text-sm font-medium'>{project.title}</p>
                        <p className='text-xs text-gray-500'>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={project.featured ? 'default' : 'secondary'}
                      >
                        {project.featured ? 'Featured' : 'Standard'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='cache' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Cache Status</CardTitle>
              <CardDescription>
                Redis cache information and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.cache ? (
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${data.cache.connected ? 'bg-green-500' : 'bg-red-500'}`}
                    ></div>
                    <span className='text-sm font-medium'>
                      {data.cache.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  {data.cache.connected ? (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='text-center'>
                        <p className='text-2xl font-bold'>
                          {data.cache.totalKeys || 0}
                        </p>
                        <p className='text-sm text-gray-600'>Total Keys</p>
                      </div>
                      <div className='text-center'>
                        <p className='text-2xl font-bold'>
                          {data.cache.memoryUsage || 'N/A'}
                        </p>
                        <p className='text-sm text-gray-600'>Memory Usage</p>
                      </div>
                      <div className='text-center'>
                        <Button variant='outline' size='sm'>
                          Manage Cache
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-4'>
                      <p className='text-sm text-gray-600'>
                        {data.cache.error || 'Redis cache is not available'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-center py-4'>
                  <p className='text-sm text-gray-600'>
                    Cache information not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
