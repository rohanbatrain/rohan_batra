'use client';

import { useUser } from '@clerk/nextjs';
import { ClerkAvatar } from '@/components/ui/ClerkAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserProfileCard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4'>
            <div className='h-16 w-16 animate-pulse rounded-full bg-muted' />
            <div className='space-y-2'>
              <div className='h-4 w-32 animate-pulse rounded bg-muted' />
              <div className='h-3 w-24 animate-pulse rounded bg-muted' />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center space-x-4'>
          <ClerkAvatar size='xl' showOnlineStatus />
          <div className='space-y-1'>
            <h3 className='font-semibold text-lg'>
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </h3>
            <p className='text-muted-foreground text-sm'>
              {user.primaryEmailAddress?.emailAddress}
            </p>
            {user.username && (
              <p className='text-muted-foreground text-xs'>@{user.username}</p>
            )}
          </div>
        </div>
        
        <div className='mt-4 space-y-2'>
          <div className='text-sm'>
            <span className='font-medium'>Email verified:</span>{' '}
            <span className={user.primaryEmailAddress?.verification?.status === 'verified' ? 'text-green-600' : 'text-yellow-600'}>
              {user.primaryEmailAddress?.verification?.status === 'verified' ? 'Yes' : 'No'}
            </span>
          </div>
          <div className='text-sm'>
            <span className='font-medium'>Account created:</span>{' '}
            <span className='text-muted-foreground'>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Avatar size examples */}
        <div className='mt-6 space-y-3'>
          <h4 className='font-medium text-sm'>Avatar Sizes:</h4>
          <div className='flex items-center space-x-4'>
            <div className='text-center'>
              <ClerkAvatar size='sm' />
              <p className='text-xs text-muted-foreground mt-1'>Small</p>
            </div>
            <div className='text-center'>
              <ClerkAvatar size='md' />
              <p className='text-xs text-muted-foreground mt-1'>Medium</p>
            </div>
            <div className='text-center'>
              <ClerkAvatar size='lg' />
              <p className='text-xs text-muted-foreground mt-1'>Large</p>
            </div>
            <div className='text-center'>
              <ClerkAvatar size='xl' />
              <p className='text-xs text-muted-foreground mt-1'>Extra Large</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}