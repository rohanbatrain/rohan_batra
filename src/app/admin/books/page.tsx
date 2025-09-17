import { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import BooksManagement from '@/components/admin/books/BooksManagement';

export const metadata: Metadata = {
  title: 'Books Management | Admin',
  description: 'Manage books, chapters, and characters',
};

export default async function BooksManagementPage() {
  // Check authentication
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/books');
  }

  // Get user role from metadata
  const userRole = (user.publicMetadata?.role as string) || 'user';

  // Check if user has admin/editor access
  if (!['editor', 'admin'].includes(userRole)) {
    redirect('/');
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Books Management
        </h1>
      </div>

      <BooksManagement userRole={userRole} />
    </div>
  );
}