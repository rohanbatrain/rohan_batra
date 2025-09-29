import { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import BookDetailManager from '../../../../components/admin/books/BookDetailManager';

export const metadata: Metadata = {
  title: 'Manage Book | Admin',
  description: 'Manage a specific book, its chapters, and characters',
};

export default async function AdminBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect('/sign-in?redirect_url=/admin/books');
  const userRole = (user.publicMetadata?.role as string) || 'user';
  if (!['editor', 'admin'].includes(userRole)) redirect('/');

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Manage Book
        </h1>
      </div>
      <BookDetailManager bookId={id} userRole={userRole} />
    </div>
  );
}
