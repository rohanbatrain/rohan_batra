export interface Like {
  _id?: string;
  userId: string;
  targetId: string; // ID of the post or comment being liked
  targetType: 'post' | 'comment';
  createdAt: Date;
  updatedAt: Date;
}

export interface LikeWithUser extends Like {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface LikeWithTarget extends Like {
  target: {
    id: string;
    title?: string; // For posts
    content?: string; // For comments
    type: 'post' | 'comment';
  };
}
