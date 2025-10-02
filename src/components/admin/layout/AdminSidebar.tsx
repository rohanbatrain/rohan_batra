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
  Book,
  Users2,
  BarChart3,
  Database,
  Trash2,
  History,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface AdminSidebarProps {
  userRole: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles: string[];
  items?: NavItem[];
}

interface NavGroup {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles: string[];
  items: NavItem[];
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [unstable, setUnstable] = React.useState(false);
  React.useEffect(() => {
    fetch('/api/admin/settings?category=features')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const enabled = !!d?.settings?.find(
          (s: any) => s.key === 'features.unstable'
        )?.value;
        setUnstable(enabled);
      })
      .catch(() => {});
  }, []);

  // Build grouped navigation
  const groups: NavGroup[] = [
    {
      name: 'Overview',
      icon: LayoutDashboard,
      roles: ['editor', 'admin'],
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['editor', 'admin'] },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
      ],
    },
    {
      name: 'Content',
      icon: FileText,
      roles: ['editor', 'admin'],
      items: [
        { name: 'Blog Posts', href: '/admin/blog', icon: FileText, roles: ['editor', 'admin'] },
        { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase, roles: ['editor', 'admin'] },
        { name: 'Documentation', href: '/admin/docs', icon: BookOpen, roles: ['editor', 'admin'] },
        { name: 'Courses', href: '/admin/courses', icon: GraduationCap, roles: ['editor', 'admin'] },
        { name: 'Books', href: '/admin/books', icon: Book, roles: ['editor', 'admin'] },
        { name: 'Flashcards', href: '/admin/flashcards', icon: Layers, roles: ['editor', 'admin'] },
        { name: 'Characters', href: '/admin/characters', icon: Users, roles: ['editor', 'admin'] },
        { name: 'Brands', href: '/admin/brands', icon: Share2, roles: ['editor', 'admin'] },
      ],
    },
    {
      name: 'Skills',
      icon: GraduationCap,
      roles: ['editor', 'admin'],
      items: [
        {
          name: 'Cybersecurity',
          icon: Shield,
          roles: ['editor', 'admin'],
          items: [
            { name: 'TryHackMe', href: '/admin/tryhackme', icon: Layers, roles: ['editor', 'admin'] },
          ],
        },
      ],
    },
    {
      name: 'Community',
      icon: MessageSquare,
      roles: ['editor', 'admin'],
      items: [
        { name: 'Comments', href: '/admin/comments', icon: MessageSquare, roles: ['editor', 'admin'] },
      ],
    },
    {
      name: 'System',
      icon: Settings,
      roles: ['admin'],
      items: [
        { name: 'Assets', href: '/admin/assets', icon: Image, roles: ['editor', 'admin'] },
        { name: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
        { name: 'Cache', href: '/admin/cache', icon: Database, roles: ['admin'] },
        { name: 'Audit Logs', href: '/admin/audit', icon: History, roles: ['admin'] },
        { name: 'Trash', href: '/admin/trash', icon: Trash2, roles: ['admin'] },
        { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
      ],
    },
  ];

  // Helpers to support nested nav and role-based filtering
  const filterItemsByRole = (items: NavItem[], role: string): NavItem[] =>
    items
      .map(item =>
        item.items
          ? { ...item, items: filterItemsByRole(item.items, role) }
          : item
      )
      .filter(item =>
        item.roles.includes(role) && (item.href || (item.items && item.items.length > 0))
      );

  const anyItemActive = (items: NavItem[], currentPath: string): boolean => {
    return items.some(item => {
      if (item.href) {
        return (
          currentPath === item.href ||
          (item.href !== '/admin' && Boolean(currentPath && currentPath.startsWith(item.href)))
        );
      }
      if (item.items && item.items.length > 0) {
        return anyItemActive(item.items, currentPath);
      }
      return false;
    });
  };

  // Inject Unstable if enabled and filter groups/items by role
  const filteredGroups = groups
    .map(group => ({
      ...group,
      items: filterItemsByRole(group.items, userRole),
    }))
    .filter(group => group.roles.includes(userRole) && group.items.length > 0);

  if (unstable) {
    const overview = filteredGroups.find(g => g.name === 'Overview');
    if (overview) {
      overview.items.splice(1, 0, { name: 'Unstable', href: '/admin/unstable', icon: BarChart3, roles: ['editor', 'admin'] });
    }
  }

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [openSubGroups, setOpenSubGroups] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    // Auto-open a group if current path is inside it (supports nested items)
    const defaults: Record<string, boolean> = {};
    const defaultsSub: Record<string, boolean> = {};
    filteredGroups.forEach(group => {
      const anyActive = anyItemActive(group.items, pathname || '');
      defaults[group.name] = anyActive;
      // open nested subgroups that contain the active route
      group.items.forEach(item => {
        if (item.items && item.items.length > 0) {
          const key = `${group.name}:${item.name}`;
          defaultsSub[key] = anyItemActive(item.items, pathname || '');
        }
      });
    });
    setOpenGroups(defaults);
    setOpenSubGroups(defaultsSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (name: string) =>
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  const toggleSubGroup = (groupName: string, itemName: string) => {
    const key = `${groupName}:${itemName}`;
    setOpenSubGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className='w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen flex flex-col'>
      <div className='p-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Admin Panel
        </h1>
      </div>

      <nav className='mt-4 flex-1'>
        <ul className='space-y-2 px-4'>
          {filteredGroups.map(group => (
            <li key={group.name} className='rounded-lg'>
              <button
                onClick={() => toggleGroup(group.name)}
                className='w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              >
                <span className='inline-flex items-center gap-2'>
                  {group.icon ? <group.icon className='h-4 w-4' /> : null}
                  {group.name}
                </span>
                {openGroups[group.name] ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </button>
              {openGroups[group.name] && (
                <ul className='mt-1 space-y-1'>
                  {group.items.map(item => {
                    const renderItem = (it: NavItem, depth = 1) => {
                      const padding = depth === 1 ? 'ml-6' : depth === 2 ? 'ml-10' : 'ml-12';
                      const Icon = it.icon;
                      const active = it.href
                        ? pathname === it.href || (it.href !== '/admin' && Boolean(pathname && pathname.startsWith(it.href)))
                        : it.items
                          ? anyItemActive(it.items, pathname || '')
                          : false;

                      if (it.items && it.items.length > 0) {
                        const subKey = `${group.name}:${it.name}`;
                        const isOpen = openSubGroups[subKey] ?? false;
                        return (
                          <li key={it.name}>
                            <button
                              onClick={() => toggleSubGroup(group.name, it.name)}
                              className={cn(
                                `${padding} w-full flex items-center justify-between px-3 py-2 text-sm rounded-md`,
                                active
                                  ? 'text-blue-700 dark:text-blue-200'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                              )}
                            >
                              <span className='inline-flex items-center gap-2'>
                                {Icon ? <Icon className='h-4 w-4' /> : null}
                                <span className='uppercase tracking-wide text-xs'>{it.name}</span>
                              </span>
                              {isOpen ? (
                                <ChevronDown className='h-4 w-4' />
                              ) : (
                                <ChevronRight className='h-4 w-4' />
                              )}
                            </button>
                            {isOpen && (
                              <ul className='mt-1 space-y-1'>
                                {it.items.map(child => renderItem(child, depth + 1))}
                              </ul>
                            )}
                          </li>
                        );
                      }

                      // Leaf link
                      return (
                        <li key={it.name}>
                          <Link
                            href={it.href as string}
                            className={cn(
                              `${padding} flex items-center px-3 py-2 text-sm rounded-md transition-colors`,
                              active
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            )}
                          >
                            {Icon ? <Icon className='mr-2 h-4 w-4' /> : null}
                            {it.name}
                          </Link>
                        </li>
                      );
                    };

                    return renderItem(item);
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Role indicator */}
      <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-3 border border-blue-100 dark:border-blue-800'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Users2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='ml-3'>
              <p className='text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide'>
                Current Role
              </p>
              <p className='text-sm font-semibold text-blue-900 dark:text-blue-200 capitalize'>
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
