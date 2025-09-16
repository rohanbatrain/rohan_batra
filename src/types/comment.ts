export interface Comment {
  _id?: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string; // For replies
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  isReply: boolean;
  depth: number; // 0 for top-level, 1 for replies, etc.
  likeCount: number;
  replyCount: number;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  authorWebsite?: string;
  ipAddress?: string;
  userAgent?: string;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CommentWithReplies extends CommentWithAuthor {
  replies: CommentWithAuthor[];
}
