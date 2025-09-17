export interface Book {
  _id?: string;
  title: string;
  subtitle?: string;
  description: string;
  genre: string;
  targetWordCount?: number;
  currentWordCount: number;
  status: 'planning' | 'drafting' | 'editing' | 'completed' | 'published';
  visibility: 'private' | 'public' | 'shared';
  coverImage?: string;
  tags: string[];
  authorId: string;
  collaborators: string[];
  startedAt?: Date;
  completedAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  _id?: string;
  bookId: string;
  title: string;
  content: string;
  markdown?: string;
  orderIndex: number;
  wordCount: number;
  status: 'outline' | 'draft' | 'review' | 'complete';
  notes?: string;
  targetWordCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  _id?: string;
  bookId: string;
  name: string;
  fullName?: string;
  age?: number;
  description: string;
  physicalDescription?: string;
  personality: string;
  background: string;
  goals?: string;
  conflicts?: string;
  relationships: Array<{
    characterId: string;
    relationshipType: string;
    description?: string;
  }>;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  significance: 'major' | 'minor' | 'background';
  avatar?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterJournal {
  _id?: string;
  characterId: string;
  bookId: string;
  title: string;
  content: string;
  entryDate?: Date;
  mood?: string;
  location?: string;
  tags: string[];
  isPrivate: boolean;
  referencedChapters: string[];
  relatedCharacters: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookWithStats extends Book {
  chapterCount: number;
  characterCount: number;
  progress: number;
}

export interface ChapterWithProgress extends Chapter {
  progress: number;
}

export interface CharacterWithRelationships extends Character {
  relationshipDetails: Array<{
    character: Character;
    relationshipType: string;
    description?: string;
  }>;
}
