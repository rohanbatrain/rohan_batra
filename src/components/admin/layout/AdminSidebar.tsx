'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  Users,
  Image,
  Settings,
  BookOpen,
  Users2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  userRole: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['editor', 'admin'],
  },
  {
    name: 'Blog Posts',
    href: '/admin/blog',
    icon: FileText,
    roles: ['editor', 'admin'],
  },
  {
    name: 'Portfolio',
    href: '/admin/portfolio',
    icon: Briefcase,
    roles: ['editor', 'admin'],
  },
  {
    name: 'Books',
    href: '/admin/books',
    icon: BookOpen,
    roles: ['editor', 'admin'],
  },
  {
    name: 'Comments',
    href: '/admin/comments',
    icon: MessageSquare,
    roles: ['editor', 'admin'],
  },
  {
    name: 'Assets',
    href: '/admin/assets',
    icon: Image,
    roles: ['editor', 'admin'],
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  // Filter nav items based on user role
  const availableNavItems = navItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <div className='w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen'>
      <div className='p-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Admin Panel
        </h1>
      </div>

      <nav className='mt-6'>
        <ul className='space-y-1 px-4'>
          {availableNavItems.map(item => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Icon className='mr-3 h-5 w-5' />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role indicator */}
      <div className='absolute bottom-4 left-4 right-4'>
        <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-3'>
          <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
            <Users2 className='h-4 w-4 mr-2' />
            Role:{' '}
            <span className='ml-1 font-medium capitalize'>{userRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
