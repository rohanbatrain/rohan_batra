export interface User {
  _id?: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  role: 'user' | 'editor' | 'admin';
  emailVerified: boolean;
  lastLoginAt?: Date;
  isActive: boolean;
  preferences: {
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  adminNotes?: string;
  lastActiveAt: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  role: 'user' | 'editor' | 'admin';
  emailVerified: boolean;
  lastLoginAt?: Date;
  isActive: boolean;
  preferences: {
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  adminNotes?: string;
  lastActiveAt: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}
