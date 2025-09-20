import { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Rohan Batra',
  description: 'Content management dashboard for blog, portfolio, and more',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  let user: Awaited<ReturnType<typeof currentUser>> | null = null;
  try {
    user = await currentUser();
  } catch {
    // Treat as unauthenticated on Clerk errors
    user = null;
  }

  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  // Get user role from metadata
  const userRole = (user?.publicMetadata?.role as string) || 'user';

  // Check if user has admin/editor access
  if (!['editor', 'admin'].includes(userRole)) {
    redirect('/access-denied');
  }

  // Extract only serializable user data for client components
  const userData = {
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='flex'>
        {/* Sidebar */}
        <AdminSidebar userRole={userRole} />

        {/* Main Content */}
        <div className='flex-1 flex flex-col min-h-screen'>
          {/* Header */}
          <AdminHeader user={userData} userRole={userRole} />

          {/* Page Content */}
          <main className='flex-1 p-6'>
            <div className='max-w-7xl mx-auto'>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
