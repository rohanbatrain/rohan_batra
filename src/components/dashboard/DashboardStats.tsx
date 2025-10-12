'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, Award } from 'lucide-react';

interface DashboardStatsProps {
  enrolledCourses: Array<{
    progress: {
      percentageComplete: number;
      timeSpentSeconds: number;
    } | null;
    enrollment: {
      status: string;
    };
  }>;
  metrics: {
    totalCourses: number;
    coursesInProgress: number;
    completionRate: number;
  };
  certificates: Array<any>;
}

export function DashboardStats({
  enrolledCourses,
  metrics,
  certificates,
}: DashboardStatsProps) {
  // Calculate additional insights
  const totalLessonsCompleted = enrolledCourses.reduce(
    (total, course) =>
      total + (course.progress?.percentageComplete || 0) / 100,
    0
  );

  const activeCourses = enrolledCourses.filter(
    c => c.enrollment.status === 'in_progress' || c.enrollment.status === 'active'
  );

  const avgProgress =
    activeCourses.length > 0
      ? activeCourses.reduce(
          (sum, c) => sum + (c.progress?.percentageComplete || 0),
          0
        ) / activeCourses.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <BarChart3 className='h-5 w-5' />
          <span>Learning Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Active Courses Progress */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Active Courses Progress</span>
            <Badge variant='secondary'>{Math.round(avgProgress)}%</Badge>
          </div>
          <Progress value={avgProgress} className='h-2' />
          <p className='text-xs text-gray-500 mt-1'>
            {metrics.coursesInProgress} courses in progress
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <div className='flex items-center space-x-2'>
              <TrendingUp className='h-4 w-4 text-green-600' />
              <span className='text-xs text-gray-600'>Completion Rate</span>
            </div>
            <div className='text-2xl font-bold'>{metrics.completionRate}%</div>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center space-x-2'>
              <Award className='h-4 w-4 text-yellow-600' />
              <span className='text-xs text-gray-600'>Certificates</span>
            </div>
            <div className='text-2xl font-bold'>
              {certificates.filter(c => c.status === 'issued').length}
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center space-x-2'>
              <Clock className='h-4 w-4 text-blue-600' />
              <span className='text-xs text-gray-600'>Total Courses</span>
            </div>
            <div className='text-2xl font-bold'>{metrics.totalCourses}</div>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center space-x-2'>
              <BarChart3 className='h-4 w-4 text-purple-600' />
              <span className='text-xs text-gray-600'>Avg. Progress</span>
            </div>
            <div className='text-2xl font-bold'>{Math.round(avgProgress)}%</div>
          </div>
        </div>

        {/* Recent Activity */}
        {activeCourses.length > 0 && (
          <div className='pt-4 border-t'>
            <h4 className='text-sm font-medium mb-3'>Most Active Courses</h4>
            <div className='space-y-2'>
              {activeCourses.slice(0, 3).map((course, idx) => (
                <div key={idx} className='flex items-center justify-between'>
                  <div className='flex-1 min-w-0'>
                    <div className='text-xs text-gray-500'>
                      Course {idx + 1}
                    </div>
                  </div>
                  <Progress
                    value={course.progress?.percentageComplete || 0}
                    className='h-1 w-24 ml-2'
                  />
                  <span className='text-xs font-medium ml-2 w-10 text-right'>
                    {Math.round(course.progress?.percentageComplete || 0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
