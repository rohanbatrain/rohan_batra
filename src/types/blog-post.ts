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
    position?: number;
    metadata?: Record<string, any>;
  }>;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoMetadata?: {
    keywords?: string[];
    canonicalUrl?: string;
    openGraph?: {
      title?: string;
      description?: string;
      image?: string;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      image?: string;
    };
    structuredData?: Record<string, any>;
  };
  validation?: {
    contentQuality?: {
      score?: number;
      issues?: string[];
      suggestions?: string[];
    };
    seoScore?: number;
    readabilityScore?: number;
    lastChecked?: Date;
  };
  analytics?: {
    viewHistory?: Array<{
      date: Date;
      count: number;
    }>;
    engagementMetrics?: {
      averageTimeOnPage?: number;
      bounceRate?: number;
      shareCount?: number;
      clickThroughRate?: number;
    };
    referrers?: Array<{
      source: string;
      count: number;
    }>;
  };
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
