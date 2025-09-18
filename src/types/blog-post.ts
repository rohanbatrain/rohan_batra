export interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  markdown?: string;
  contentType: 'html' | 'rich-text' | 'markdown';
  featuredImage?: string;
  featuredImageUrl?: string;
  images: string[];
  attachedAssets: Array<{
    asset: string;
    usage: 'featured' | 'content' | 'gallery' | 'attachment';
    caption?: string;
    altText?: string;
  }>;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  authorId: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostWithAuthor extends BlogPost {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface BlogPostWithRelated extends BlogPostWithAuthor {
  relatedPosts: BlogPost[];
}
