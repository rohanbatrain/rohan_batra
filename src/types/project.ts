export interface Project {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  technologies: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  images: string[];
  demoUrl?: string;
  sourceUrl?: string;
  liveUrl?: string;
  startDate?: Date;
  endDate?: Date;
  client?: string;
  tags: string[];
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
