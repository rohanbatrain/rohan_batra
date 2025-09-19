'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import { Bell, Search } from 'lucide-react';

interface AdminHeaderProps {
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  userRole: string;
}

export default function AdminHeader({ user, userRole }: AdminHeaderProps) {
  const { isLoaded } = useAuth();
  return (
    <header className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
      <div className='px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Left side - Search */}
          <div className='flex items-center flex-1 max-w-md'>
            <div className='relative w-full'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              />
            </div>
          </div>

          {/* Right side - Notifications and User */}
          <div className='flex items-center space-x-4'>
            {/* Notifications */}
            <button
              type='button'
              className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
            >
              <Bell className='h-5 w-5' />
            </button>

            {/* User info and button */}
            <div className='flex items-center space-x-3'>
              <div className='text-right'>
                <div className='text-sm font-medium text-gray-900 dark:text-white'>
                  {user.firstName} {user.lastName}
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                  {userRole}
                </div>
              </div>
              {isLoaded ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              ) : (
                <div
                  aria-hidden
                  className='h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700'
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
