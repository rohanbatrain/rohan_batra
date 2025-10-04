import { Document } from 'mongoose';

/**
 * Employment type classification
 */
export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Self-employed'
  | 'Freelance'
  | 'Contract'
  | 'Internship'
  | 'Apprenticeship'
  | 'Seasonal';

/**
 * Content format for experience descriptions
 */
export type ContentFormat = 'rich-text' | 'markdown';

/**
 * Experience entity for public API responses
 */
export interface Experience {
  _id: string;
  title: string;
  company: string;
  companyWebsite?: string;
  companyLogo?: string;
  employmentType: EmploymentType;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  location: string;
  description: string;
  descriptionFormat: ContentFormat;
  skills: string[];
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields
  duration?: string;
  dateRange?: string;
}

/**
 * Experience document interface for Mongoose
 */
export interface IExperience extends Document {
  _id: import('mongoose').Types.ObjectId;
  title: string;
  company: string;
  companyWebsite?: string;
  companyLogo?: string;
  companyLogoAsset?: import('mongoose').Types.ObjectId;
  employmentType: EmploymentType;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  location: string;
  description: string;
  descriptionFormat: ContentFormat;
  skills: string[];
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for creating a new experience
 */
export interface ExperienceCreateInput {
  title: string;
  company: string;
  companyWebsite?: string;
  companyLogo?: string;
  employmentType: EmploymentType;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent: boolean;
  location: string;
  description: string;
  descriptionFormat?: ContentFormat;
  skills?: string[];
  displayOrder?: number;
  published?: boolean;
}

/**
 * Input type for updating an existing experience
 */
export interface ExperienceUpdateInput {
  title?: string;
  company?: string;
  companyWebsite?: string;
  companyLogo?: string;
  employmentType?: EmploymentType;
  startDate?: Date | string;
  endDate?: Date | string | null;
  isCurrent?: boolean;
  location?: string;
  description?: string;
  descriptionFormat?: ContentFormat;
  skills?: string[];
  displayOrder?: number;
  published?: boolean;
}

/**
 * Reorder request for batch updating display order
 */
export interface ExperienceReorderUpdate {
  id: string;
  displayOrder: number;
}
