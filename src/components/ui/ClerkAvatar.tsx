/**
 * ClerkAvatar Component
 * 
 * Avatar component specifically designed for Clerk user data.
 * Automatically fetches and displays user profile image from Clerk.
 * 
 * @pattern Integrates Clerk useUser hook with Avatar component
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { Avatar } from './Avatar';
import { Skeleton } from './skeleton';

interface ClerkAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
}

/**
 * ClerkAvatar Component
 * 
 * Displays the current user's avatar from Clerk authentication.
 * Automatically handles loading states and fallbacks.
 */
export function ClerkAvatar({ 
  className, 
  size = 'md',
  showFallback = true 
}: ClerkAvatarProps) {
  const { user, isLoaded } = useUser();

  // Show skeleton while loading
  if (!isLoaded) {
    const sizeMap = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };
    return <Skeleton className={`${sizeMap[size]} rounded-full ${className}`} />;
  }

  // Show placeholder if not signed in and showFallback is true
  if (!user) {
    if (!showFallback) return null;
    return (
      <Avatar
        fallback="?"
        alt="Guest"
        className={className}
        size={size}
      />
    );
  }

  // Get user's name for fallback initials
  const userName = user.fullName || user.username || user.emailAddresses[0]?.emailAddress || 'User';

  return (
    <Avatar
      src={user.imageUrl}
      alt={userName}
      fallback={userName.substring(0, 2).toUpperCase()}
      className={className}
      size={size}
    />
  );
}

/**
 * ClerkAvatarWithName Component
 * 
 * Displays user avatar alongside their name
 */
export function ClerkAvatarWithName({ 
  className,
  size = 'md',
  nameClassName = ''
}: ClerkAvatarProps & { nameClassName?: string }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className={`h-10 w-10 rounded-full`} />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Avatar fallback="?" alt="Guest" size={size} />
        <span className={`text-sm text-muted-foreground ${nameClassName}`}>Guest</span>
      </div>
    );
  }

  const userName = user.fullName || user.username || user.emailAddresses[0]?.emailAddress || 'User';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ClerkAvatar size={size} />
      <span className={`text-sm font-medium ${nameClassName}`}>{userName}</span>
    </div>
  );
}
