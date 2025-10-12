'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className='container mx-auto py-8 px-4 space-y-8'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-10 w-24' />
      </div>

      {/* Achievement Badges Skeleton */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6 text-center space-y-2'>
              <Skeleton className='h-8 w-8 mx-auto' />
              <Skeleton className='h-8 w-12 mx-auto' />
              <Skeleton className='h-4 w-20 mx-auto' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-4'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-20' />
                  <Skeleton className='h-4 w-32' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Cards Skeleton */}
      <div className='space-y-4'>
        <Skeleton className='h-8 w-48' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-full' />
                <Skeleton className='h-4 w-3/4 mt-2' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-12' />
                  </div>
                  <Skeleton className='h-2 w-full' />
                </div>
                <Skeleton className='h-10 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-full' />
        <Skeleton className='h-4 w-3/4 mt-2' />
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-12' />
          </div>
          <Skeleton className='h-2 w-full' />
        </div>
        <div className='flex justify-between text-sm'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-20' />
        </div>
        <Skeleton className='h-10 w-full' />
      </CardContent>
    </Card>
  );
}
