export interface Project {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  categories?: string[]; // Enhanced: multi-category support
  technologies: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  images: string[];
  gallery: Array<{
    asset: string;
    caption?: string;
    order: number;
  }>;
  galleryAssets?: Array<{
    asset: string;
    type: 'image' | 'video' | 'lottie';
    caption?: string;
    order?: number;
    metadata?: Record<string, any>;
  }>;
  featuredImage?: string;
  demoUrl?: string;
  sourceUrl?: string;
  liveUrl?: string;
  links?: {
    github?: string;
    demo?: string;
    live?: string;
    documentation?: string;
    other?: Array<{
      label: string;
      url: string;
    }>;
  };
  startDate?: Date;
  endDate?: Date;
  timeline?: {
    startDate?: Date;
    endDate?: Date;
    milestones?: Array<{
      title: string;
      date: Date;
      description?: string;
    }>;
    estimatedDuration?: number; // in days
    actualDuration?: number; // in days
  };
  client?: string;
  collaboration?: {
    teamSize?: number;
    role?: string;
    responsibilities?: string[];
    collaborators?: Array<{
      name: string;
      role: string;
      contact?: string;
    }>;
  };
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  complexity?: {
    technical: number; // 1-10 scale
    design: number; // 1-10 scale
    overall: number; // 1-10 scale
  };
  analytics?: {
    viewHistory?: Array<{
      date: Date;
      count: number;
    }>;
    clickMetrics?: {
      demoClicks?: number;
      sourceClicks?: number;
      liveClicks?: number;
    };
    referrers?: Array<{
      source: string;
      count: number;
    }>;
  };
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
  };
  viewCount: number;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithAuthor extends Project {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}
