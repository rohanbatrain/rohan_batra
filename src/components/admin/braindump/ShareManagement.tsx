/**
 * Share Management Component
 * Manage sharing permissions for private braindumps
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Share2, Trash2, UserPlus, Shield, Eye, MessageSquare, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface SharePermission {
  _id: string;
  userId: string;
  permission: 'view' | 'comment' | 'edit';
  grantedBy: string;
  grantedAt: string;
  revoked: boolean;
}

interface ShareManagementProps {
  braindumpId: string;
  isOwner: boolean;
}

const permissionConfig = {
  view: {
    icon: Eye,
    color: 'bg-blue-100 text-blue-800',
    label: 'View',
    description: 'Can view the braindump',
  },
  comment: {
    icon: MessageSquare,
    color: 'bg-green-100 text-green-800',
    label: 'Comment',
    description: 'Can view and comment',
  },
  edit: {
    icon: Edit,
    color: 'bg-purple-100 text-purple-800',
    label: 'Edit',
    description: 'Can view, comment, and edit',
  },
};

export function ShareManagement({ braindumpId, isOwner }: ShareManagementProps) {
  const [permissions, setPermissions] = useState<SharePermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newPermission, setNewPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const { toast } = useToast();

  useEffect(() => {
    loadPermissions();
  }, [braindumpId]);

  const loadPermissions = async () => {
    try {
      const response = await fetch(`/api/braindump/${braindumpId}/permissions`);
      if (!response.ok) return;
      
      const data = await response.json();
      setPermissions(data.data?.permissions || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const grantPermission = async () => {
    if (!newUserId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/braindump/${braindumpId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUserId.trim(),
          permission: newPermission,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to grant permission');
      }

      toast({
        title: 'Success',
        description: 'Permission granted successfully',
      });

      setNewUserId('');
      setNewPermission('view');
      loadPermissions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant permission',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokePermission = async (permissionId: string, userId: string) => {
    if (!confirm(`Are you sure you want to revoke access for user ${userId}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/braindump/${braindumpId}/permissions/${permissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke permission');
      }

      toast({
        title: 'Success',
        description: 'Permission revoked successfully',
      });

      loadPermissions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke permission',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          You don't have permission to manage sharing for this braindump
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grant Permission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Grant Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID (Clerk ID)</Label>
              <Input
                id="userId"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="user_xxxxxxxxxxxxx"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the Clerk user ID of the person you want to share with
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permission">Permission Level</Label>
              <Select
                value={newPermission}
                onValueChange={(v: any) => setNewPermission(v)}
                disabled={isLoading}
              >
                <SelectTrigger id="permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(permissionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={grantPermission}
            disabled={isLoading || !newUserId.trim()}
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Grant Permission
          </Button>
        </CardContent>
      </Card>

      {/* Active Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Permissions ({permissions.filter(p => !p.revoked).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.filter(p => !p.revoked).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active permissions. Grant access to share this braindump.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions
                  .filter(p => !p.revoked)
                  .map((permission) => {
                    const config = permissionConfig[permission.permission];
                    const Icon = config.icon;
                    
                    return (
                      <TableRow key={permission._id}>
                        <TableCell className="font-mono text-sm">
                          {permission.userId}
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            <Icon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(permission.grantedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokePermission(permission._id, permission.userId)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Permission Levels:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>View:</strong> Can view the braindump content</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>Comment:</strong> Can view and post comments</span>
              </li>
              <li className="flex items-start gap-2">
                <Edit className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>Edit:</strong> Can view, comment, and edit the braindump</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
