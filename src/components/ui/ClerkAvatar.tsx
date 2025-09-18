'use client';

import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '@/lib/utils';

interface ClerkAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackName?: string;
  showOnlineStatus?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function ClerkAvatar({
  size = 'md',
  className,
  fallbackName,
  showOnlineStatus = false,
}: ClerkAvatarProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    // Loading state
    return (
      <div
        className={cn(
          sizeClasses[size],
          'animate-pulse rounded-full bg-muted',
          className
        )}
      />
    );
  }

  const displayName =
    fallbackName ||
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    'User';
  const initials = displayName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage
          src={user?.imageUrl}
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary font-medium text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showOnlineStatus && (
        <div className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
      )}
    </div>
  );
}

// Component for displaying other users' avatars (when you have user data but not Clerk context)
interface UserAvatarProps {
  user: {
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
}

export function UserAvatar({
  user,
  size = 'md',
  className,
  showOnlineStatus = false,
}: UserAvatarProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username || 'User';

  const initials = displayName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={user.avatar} alt={displayName} className="object-cover" />
        <AvatarFallback className="bg-primary font-medium text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showOnlineStatus && (
        <div className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
      )}
    </div>
  );
}