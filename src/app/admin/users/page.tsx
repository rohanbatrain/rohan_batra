'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Settings, Shield, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/nextjs';

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  role: 'user' | 'editor' | 'admin';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  loginCount: number;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to fetch users';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      const usersArray = (result?.data?.users ?? result?.users ?? []) as User[];
      setUsers(Array.isArray(usersArray) ? usersArray : []);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, roleFilter, searchTerm, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (
    userId: string,
    newRole: 'user' | 'editor' | 'admin'
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to update user role';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      fetchUsers();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.data.message,
      });

      fetchUsers();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        'Permanently delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/users/${userId}?permanent=true`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        let message = 'Failed to delete user';
        try {
          const err = await response.json();
          message = err?.error || err?.message || message;
        } catch {}
        if (response.status === 401) message = 'Please sign in to continue';
        if (response.status === 403) message = 'You do not have access';
        throw new Error(message);
      }

      const result = await response.json();
      toast({
        title: 'Deleted',
        description:
          result?.message || result?.data?.message || 'User deleted successfully',
      });
      fetchUsers();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[role as keyof typeof colors] || colors.user}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = users.filter(
    user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isLoaded || !isSignedIn) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Users className='h-8 w-8' />
            Users Management
          </h1>
          <p className='text-gray-600 mt-2'>
            Manage user accounts and permissions
          </p>
        </div>

        <Button onClick={fetchUsers} variant='outline'>
          <Search className='h-4 w-4 mr-2' />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {(['all', 'admin', 'editor', 'user'] as const).map(role => {
          const count =
            role === 'all'
              ? users.length
              : users.filter(u => u.role === role).length;

          return (
            <Card key={role}>
              <CardContent className='p-4 text-center'>
                <p className='text-2xl font-bold'>{count}</p>
                <p className='text-sm text-gray-600 capitalize'>
                  {role === 'all' ? 'Total Users' : `${role}s`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className='flex gap-4'>
        <Input
          placeholder='Search users...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='w-64'
        />

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            <SelectItem value='admin'>Admin</SelectItem>
            <SelectItem value='editor'>Editor</SelectItem>
            <SelectItem value='user'>User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto'></div>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredUsers.map(user => (
            <Card key={user.id}>
              <CardContent className='p-6'>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='font-semibold text-lg'>
                        {user.firstName} {user.lastName}
                      </h3>
                      {getRoleBadge(user.role)}
                      <Badge
                        variant={user.isActive ? 'default' : 'destructive'}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className='space-y-1 text-sm text-gray-600'>
                      <p>📧 {user.email}</p>
                      {user.username && <p>👤 @{user.username}</p>}
                      <p>🆔 {user.clerkId}</p>
                      <div className='flex gap-4 mt-2'>
                        <span>
                          📅 Joined:{' '}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        {user.lastLoginAt && (
                          <span>
                            🕐 Last login:{' '}
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </span>
                        )}
                        <span>🔢 Login count: {user.loginCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Select
                      value={user.role}
                      onValueChange={(newRole: 'user' | 'editor' | 'admin') =>
                        updateUserRole(user.id, newRole)
                      }
                    >
                      <SelectTrigger className='w-32'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='user'>
                          <div className='flex items-center gap-2'>
                            <UserCheck className='h-4 w-4' />
                            User
                          </div>
                        </SelectItem>
                        <SelectItem value='editor'>
                          <div className='flex items-center gap-2'>
                            <Settings className='h-4 w-4' />
                            Editor
                          </div>
                        </SelectItem>
                        <SelectItem value='admin'>
                          <div className='flex items-center gap-2'>
                            <Shield className='h-4 w-4' />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={user.isActive ? 'destructive' : 'default'}
                      size='sm'
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>

                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              {users.length === 0
                ? 'No users found'
                : 'No users match your search criteria'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
