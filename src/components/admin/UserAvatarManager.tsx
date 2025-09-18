'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Avatar from '@/components/ui/Avatar';
import AvatarSelector from '@/components/admin/AvatarSelector';
import { User, Settings, X } from 'lucide-react';
import type { AvatarStyle } from '@/components/ui/Avatar';

interface AvatarConfig {
  style: AvatarStyle;
  seed: string;
  backgroundColor: string;
  radius: number;
}

interface UserAvatarManagerProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentAvatar?: AvatarConfig;
  onAvatarUpdate?: (newConfig: AvatarConfig) => void;
}

export default function UserAvatarManager({
  userId,
  userName,
  userEmail,
  currentAvatar,
  onAvatarUpdate,
}: UserAvatarManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultConfig: AvatarConfig = {
    style: 'adventurer',
    seed: `user-${userId}`,
    backgroundColor: 'b6e3f4',
    radius: 50,
  };

  const avatarConfig = currentAvatar || defaultConfig;

  const handleSaveAvatar = async (newConfig: AvatarConfig) => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update avatar');
      }

      toast.success('Avatar updated successfully');
      onAvatarUpdate?.(newConfig);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update avatar'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAvatar = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/avatar`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset avatar');
      }

      toast.success('Avatar reset to default');
      onAvatarUpdate?.(result.user.avatarConfig);
      setIsOpen(false);
    } catch (error) {
      console.error('Error resetting avatar:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to reset avatar'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <div className='flex items-center gap-2'>
            <Avatar
              style={avatarConfig.style}
              seed={avatarConfig.seed}
              size={24}
              radius={avatarConfig.radius}
              backgroundColor={avatarConfig.backgroundColor}
            />
            <Settings className='w-4 h-4' />
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            Manage Avatar for {userName}
          </DialogTitle>
          <DialogDescription>
            Customize the avatar for {userEmail}. Changes will be applied to their profile.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Current Avatar Display */}
          <div className='text-center space-y-2'>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Current Avatar
            </p>
            <div className='flex justify-center'>
              <Avatar
                style={avatarConfig.style}
                seed={avatarConfig.seed}
                size={80}
                radius={avatarConfig.radius}
                backgroundColor={avatarConfig.backgroundColor}
                className='border-2 border-gray-200 dark:border-gray-700'
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <AvatarSelector
            initialConfig={avatarConfig}
            onSave={handleSaveAvatar}
            className='border-t pt-6'
          />

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4 border-t'>
            <Button
              variant='outline'
              onClick={handleResetAvatar}
              disabled={isSaving}
              className='flex-1'
            >
              Reset to Default
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
              className='flex-1'
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}