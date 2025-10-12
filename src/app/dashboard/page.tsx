'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  ArrowRight,
  Star,
  Calendar,
  Download,
  Sparkles,
  BarChart3,
  Zap,
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

interface DashboardData {
  enrolledCourses: Array<{
    course: {
      id: string;
      slug: string;
      title: string;
      subtitle?: string | null;
      heroImage?: string | null;
      difficulty: string;
      lessonCount: number;
    };
    enrollment: {
      _id: string;
      status: string;
      enrolledAt: Date;
      lastAccessedAt?: Date | null;
      completedAt?: Date | null;
    };
    progress: {
      percentageComplete: number;
      timeSpentSeconds: number;
      completedLessonIds: string[];
      streak?: {
        currentCount: number;
        longestCount: number;
      } | null;
    } | null;
  }>;
  recommendedContent: Array<{
    type: string;
    id: string;
    title: string;
    reason: string;
  }>;
  certificates: Array<{
    _id: string;
    courseId: string;
    status: string;
    issuedAt?: Date | null;
    certificateNumber: string;
    verificationUrl: string;
    pdfUrl?: string | null;
  }>;
  metrics: {
    totalCourses: number;
    coursesInProgress: number;
    completionRate: number;
    streak: number;
  };
  insights?: {
    totalLearningTime: number;
    averageCompletionRate: number;
    coursesNearCompletion: number;
    recentActivity: Array<any>;
  };
  achievements?: {
    certificatesEarned: number;
    coursesCompleted: number;
    currentStreak: number;
    totalCourses: number;
  };
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchDashboardData();
    } else if (isLoaded && !userId) {
      setLoading(false);
    }
  }, [isLoaded, userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/summary', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Format seconds to readable time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date to relative time
  const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Require authentication
  if (isLoaded && !userId) {
    return (
      <div className='container mx-auto py-16 px-4'>
        <Card className='max-w-md mx-auto'>
          <CardContent className='p-8 text-center'>
            <BookOpen className='h-12 w-12 mx-auto mb-4 text-gray-400' />
            <h2 className='text-2xl font-bold mb-2'>Sign In Required</h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to view your learning dashboard.
            </p>
            <Button asChild>
              <Link href='/sign-in'>Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className='container mx-auto py-16 px-4'>
        <Alert variant='destructive'>
          <AlertDescription>
            {error}
            <Button
              variant='outline'
              size='sm'
              className='ml-4'
              onClick={fetchDashboardData}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  const achievements = data.achievements || {
    certificatesEarned: data.certificates.filter(c => c.status === 'issued')
      .length,
    coursesCompleted: data.enrolledCourses.filter(
      e => e.enrollment.status === 'completed'
    ).length,
    currentStreak: data.metrics.streak,
    totalCourses: data.metrics.totalCourses,
  };

  const insights = data.insights || {
    totalLearningTime: data.enrolledCourses.reduce(
      (total, course) => total + (course.progress?.timeSpentSeconds || 0),
      0
    ),
    averageCompletionRate:
      data.enrolledCourses.length > 0
        ? data.enrolledCourses.reduce(
            (total, course) =>
              total + (course.progress?.percentageComplete || 0),
            0
          ) / data.enrolledCourses.length
        : 0,
    coursesNearCompletion: data.enrolledCourses.filter(
      course =>
        course.progress &&
        course.progress.percentageComplete >= 80 &&
        course.progress.percentageComplete < 100
    ).length,
    recentActivity: data.enrolledCourses
      .filter(course => course.enrollment.lastAccessedAt)
      .sort(
        (a, b) =>
          new Date(b.enrollment.lastAccessedAt!).getTime() -
          new Date(a.enrollment.lastAccessedAt!).getTime()
      )
      .slice(0, 5),
  };

  return (
    <div className='container mx-auto py-8 px-4 space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Welcome back, {user?.firstName || 'Learner'}!
          </h1>
          <p className='text-gray-600 mt-2'>
            Track your learning progress and achievements
          </p>
        </div>
        <Button variant='outline' onClick={fetchDashboardData}>
          Refresh
        </Button>
      </div>

      {/* Achievement Badges */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6 text-center'>
            <Award className='h-8 w-8 mx-auto mb-2 text-yellow-600' />
            <div className='text-3xl font-bold'>{achievements.certificatesEarned}</div>
            <div className='text-sm text-gray-600 mt-1'>Certificates</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 text-center'>
            <CheckCircle2 className='h-8 w-8 mx-auto mb-2 text-green-600' />
            <div className='text-3xl font-bold'>{achievements.coursesCompleted}</div>
            <div className='text-sm text-gray-600 mt-1'>Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 text-center'>
            <Flame className='h-8 w-8 mx-auto mb-2 text-orange-600' />
            <div className='text-3xl font-bold'>{achievements.currentStreak}</div>
            <div className='text-sm text-gray-600 mt-1'>Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 text-center'>
            <BookOpen className='h-8 w-8 mx-auto mb-2 text-blue-600' />
            <div className='text-3xl font-bold'>{achievements.totalCourses}</div>
            <div className='text-sm text-gray-600 mt-1'>Total Courses</div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {insights.coursesNearCompletion > 0 && (
          <Alert>
            <Target className='h-4 w-4' />
            <AlertDescription className='flex items-center justify-between'>
              <span>
                🎯 You have {insights.coursesNearCompletion} course
                {insights.coursesNearCompletion > 1 ? 's' : ''} above 80%
                completion! Keep going!
              </span>
              <Button variant='link' size='sm' asChild>
                <Link href='#in-progress'>View Courses</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {achievements.currentStreak >= 7 && (
          <Alert className='border-orange-200 bg-orange-50'>
            <Flame className='h-4 w-4 text-orange-600' />
            <AlertDescription>
              <span className='text-orange-900'>
                🔥 Amazing! You're on a {achievements.currentStreak}-day learning
                streak! Keep it up!
              </span>
            </AlertDescription>
          </Alert>
        )}

        {data.enrolledCourses.length > 0 &&
          data.enrolledCourses.filter(c => c.enrollment.status === 'in_progress')
            .length === 0 && (
            <Alert className='border-blue-200 bg-blue-50'>
              <Sparkles className='h-4 w-4 text-blue-600' />
              <AlertDescription>
                <span className='text-blue-900'>
                  💡 Ready to learn something new? Check out our recommendations!
                </span>
              </AlertDescription>
            </Alert>
          )}
      </div>

      {/* Learning Stats */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2'>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='flex items-center space-x-4'>
                <Clock className='h-10 w-10 text-blue-600' />
                <div>
                  <div className='text-2xl font-bold'>
                    {formatTime(insights.totalLearningTime)}
                  </div>
                  <div className='text-sm text-gray-600'>Total Learning Time</div>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <TrendingUp className='h-10 w-10 text-green-600' />
                <div>
                  <div className='text-2xl font-bold'>
                    {Math.round(insights.averageCompletionRate)}%
                  </div>
                  <div className='text-sm text-gray-600'>Average Completion</div>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <Star className='h-10 w-10 text-yellow-600' />
                <div>
                  <div className='text-2xl font-bold'>
                    {data.metrics.completionRate}%
                  </div>
                  <div className='text-sm text-gray-600'>Completion Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DashboardStats
          enrolledCourses={data.enrolledCourses}
          metrics={data.metrics}
          certificates={data.certificates}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue='courses' className='space-y-6'>
        <TabsList className='grid grid-cols-3 w-full max-w-md'>
          <TabsTrigger value='courses'>My Courses</TabsTrigger>
          <TabsTrigger value='certificates'>Certificates</TabsTrigger>
          <TabsTrigger value='recommendations'>For You</TabsTrigger>
        </TabsList>

        {/* My Courses Tab */}
        <TabsContent value='courses' className='space-y-6'>
          {data.enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <BookOpen className='h-16 w-16 mx-auto mb-4 text-gray-400' />
                <h3 className='text-xl font-semibold mb-2'>
                  No Courses Yet
                </h3>
                <p className='text-gray-600 mb-6'>
                  Start your learning journey by enrolling in a course
                </p>
                <Button asChild>
                  <Link href='/courses'>Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* In Progress Courses */}
              <div id='in-progress'>
                <h2 className='text-2xl font-bold mb-4'>In Progress</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {data.enrolledCourses
                    .filter(
                      item =>
                        item.enrollment.status === 'in_progress' ||
                        item.enrollment.status === 'active'
                    )
                    .map(item => (
                      <Card key={item.enrollment._id} className='hover:shadow-lg transition-shadow'>
                        <CardHeader>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <CardTitle className='line-clamp-2'>
                                {item.course.title}
                              </CardTitle>
                              {item.course.subtitle && (
                                <CardDescription className='line-clamp-1 mt-1'>
                                  {item.course.subtitle}
                                </CardDescription>
                              )}
                            </div>
                            <Badge variant='secondary' className='ml-2'>
                              {item.course.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          {/* Progress Bar */}
                          <div>
                            <div className='flex justify-between text-sm mb-2'>
                              <span className='text-gray-600'>Progress</span>
                              <span className='font-semibold'>
                                {Math.round(
                                  item.progress?.percentageComplete || 0
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={item.progress?.percentageComplete || 0}
                              className='h-2'
                            />
                          </div>

                          {/* Stats */}
                          <div className='flex items-center justify-between text-sm text-gray-600'>
                            <div className='flex items-center space-x-4'>
                              <span>
                                {item.progress?.completedLessonIds.length || 0}/
                                {item.course.lessonCount} lessons
                              </span>
                              {item.progress?.timeSpentSeconds && (
                                <span className='flex items-center'>
                                  <Clock className='h-3 w-3 mr-1' />
                                  {formatTime(item.progress.timeSpentSeconds)}
                                </span>
                              )}
                            </div>
                            {item.enrollment.lastAccessedAt && (
                              <span>
                                {formatRelativeTime(
                                  item.enrollment.lastAccessedAt
                                )}
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button asChild className='w-full'>
                            <Link href={`/courses/${item.course.slug}`}>
                              Continue Learning
                              <ArrowRight className='ml-2 h-4 w-4' />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Completed Courses */}
              {data.enrolledCourses.some(
                item => item.enrollment.status === 'completed'
              ) && (
                <div>
                  <h2 className='text-2xl font-bold mb-4'>Completed</h2>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {data.enrolledCourses
                      .filter(item => item.enrollment.status === 'completed')
                      .map(item => (
                        <Card key={item.enrollment._id}>
                          <CardHeader>
                            <div className='flex items-start justify-between'>
                              <CardTitle className='text-lg line-clamp-2'>
                                {item.course.title}
                              </CardTitle>
                              <CheckCircle2 className='h-5 w-5 text-green-600 flex-shrink-0 ml-2' />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className='text-sm text-gray-600 mb-4'>
                              Completed{' '}
                              {item.enrollment.completedAt &&
                                formatRelativeTime(item.enrollment.completedAt)}
                            </div>
                            <Button variant='outline' size='sm' asChild className='w-full'>
                              <Link href={`/courses/${item.course.slug}`}>
                                Review Course
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value='certificates' className='space-y-6'>
          {data.certificates.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Award className='h-16 w-16 mx-auto mb-4 text-gray-400' />
                <h3 className='text-xl font-semibold mb-2'>
                  No Certificates Yet
                </h3>
                <p className='text-gray-600'>
                  Complete courses to earn certificates
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {data.certificates
                .filter(cert => cert.status === 'issued')
                .map(cert => (
                  <Card key={cert._id}>
                    <CardHeader>
                      <Award className='h-12 w-12 text-yellow-600 mb-2' />
                      <CardTitle>Certificate</CardTitle>
                      <CardDescription>
                        #{cert.certificateNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='text-sm text-gray-600'>
                        <Calendar className='h-4 w-4 inline mr-2' />
                        Issued{' '}
                        {cert.issuedAt && formatRelativeTime(cert.issuedAt)}
                      </div>
                      <div className='flex space-x-2'>
                        <Button variant='outline' size='sm' asChild className='flex-1'>
                          <a
                            href={cert.verificationUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            Verify
                          </a>
                        </Button>
                        {cert.pdfUrl && (
                          <Button size='sm' asChild className='flex-1'>
                            <a
                              href={cert.pdfUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Download className='h-4 w-4 mr-2' />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value='recommendations' className='space-y-6'>
          {data.recommendedContent.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Star className='h-16 w-16 mx-auto mb-4 text-gray-400' />
                <h3 className='text-xl font-semibold mb-2'>
                  No Recommendations Yet
                </h3>
                <p className='text-gray-600'>
                  Start learning to get personalized recommendations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {data.recommendedContent.map((rec, idx) => (
                <Card key={`${rec.type}-${rec.id}-${idx}`}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div>
                        <Badge className='mb-2'>{rec.type}</Badge>
                        <CardTitle>{rec.title}</CardTitle>
                        <CardDescription className='mt-2'>
                          {rec.reason}
                        </CardDescription>
                      </div>
                      <Button variant='outline' size='sm' asChild>
                        <Link
                          href={
                            rec.type === 'course'
                              ? `/courses/${rec.id}`
                              : rec.type === 'blog'
                                ? `/blog/${rec.id}`
                                : `/books/${rec.id}`
                          }
                        >
                          View
                          <ArrowRight className='ml-2 h-4 w-4' />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
