export type THMDifficulty = 'easy' | 'medium' | 'hard' | 'insane' | 'unknown';

export interface TryHackMeBadge {
  _id?: string;
  title: string;
  thmBadgeId?: string;
  imageUrl?: string;
  link?: string;
  description?: string;
  category?: string;
  tags?: string[];
  earnedAt?: string | Date;
  visibility?: 'public' | 'private';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TryHackMeRoom {
  _id?: string;
  title: string;
  thmRoomId?: string;
  slug?: string;
  link?: string;
  difficulty?: THMDifficulty;
  points?: number;
  completedAt?: string | Date;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TryHackMeProfile {
  _id?: string;
  username: string;
  displayName?: string;
  rank?: string;
  points?: number;
  badgesCount?: number;
  roomsCount?: number;
  profileUrl?: string;
  avatarUrl?: string;
  lastSyncedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TryHackMeSummary {
  profile: TryHackMeProfile | null;
  recentRooms: TryHackMeRoom[];
  recentBadges: TryHackMeBadge[];
}
