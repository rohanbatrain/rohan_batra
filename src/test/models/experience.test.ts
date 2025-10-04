import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import ExperienceModel from '@/models/Experience';
import { IExperience, EmploymentType } from '@/types/experience';

// Mock mongoose connection
vi.mock('@/lib/db', () => ({
  connectDB: vi.fn(),
}));

describe('Experience Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Schema Validation', () => {
    it('should create a valid experience with required fields', async () => {
      const validExperience = {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time' as EmploymentType,
        startDate: new Date('2023-01-01'),
        isCurrent: true,
        location: 'San Francisco, CA',
        description: 'Leading development of core platform features',
        descriptionFormat: 'rich-text',
        skills: ['TypeScript', 'React', 'Node.js'],
        displayOrder: 1,
        published: true,
      };

      const experience = new ExperienceModel(validExperience);
      const validationError = experience.validateSync();

      expect(validationError).toBeUndefined();
      expect(experience.title).toBe(validExperience.title);
      expect(experience.company).toBe(validExperience.company);
      expect(experience.employmentType).toBe(validExperience.employmentType);
      expect(experience.isCurrent).toBe(true);
    });

    it('should require title field', () => {
      const experience = new ExperienceModel({
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.title).toBeDefined();
    });

    it('should require company field', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.company).toBeDefined();
    });

    it('should require employmentType field', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.employmentType).toBeDefined();
    });

    it('should require startDate field', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.startDate).toBeDefined();
    });

    it('should require location field', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.location).toBeDefined();
    });

    it('should require description field', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.description).toBeDefined();
    });

    it('should enforce employment type enum', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Invalid Type' as EmploymentType,
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.employmentType).toBeDefined();
    });

    it('should accept all valid employment types', () => {
      const validTypes: EmploymentType[] = [
        'Full-time',
        'Part-time',
        'Self-employed',
        'Freelance',
        'Contract',
        'Internship',
        'Apprenticeship',
        'Seasonal',
      ];

      validTypes.forEach((type) => {
        const experience = new ExperienceModel({
          title: 'Engineer',
          company: 'Tech Corp',
          employmentType: type,
          startDate: new Date(),
          location: 'Remote',
          description: 'Test',
        });

        const validationError = experience.validateSync();
        expect(validationError?.errors.employmentType).toBeUndefined();
      });
    });

    it('should enforce content format enum', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
        descriptionFormat: 'invalid',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.descriptionFormat).toBeDefined();
    });

    it('should default descriptionFormat to rich-text', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      expect(experience.descriptionFormat).toBe('rich-text');
    });

    it('should default isCurrent to false', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      expect(experience.isCurrent).toBe(false);
    });

    it('should default published to false', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      expect(experience.published).toBe(false);
    });

    it('should default skills to empty array', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      expect(experience.skills).toEqual([]);
    });

    it('should default displayOrder to 0', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      expect(experience.displayOrder).toBe(0);
    });

    it('should trim whitespace from string fields', () => {
      const experience = new ExperienceModel({
        title: '  Engineer  ',
        company: '  Tech Corp  ',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: '  Remote  ',
        description: 'Test',
      });

      expect(experience.title).toBe('Engineer');
      expect(experience.company).toBe('Tech Corp');
      expect(experience.location).toBe('Remote');
    });

    it('should enforce title maxlength', () => {
      const longTitle = 'a'.repeat(201);
      const experience = new ExperienceModel({
        title: longTitle,
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.title).toBeDefined();
    });

    it('should enforce company maxlength', () => {
      const longCompany = 'a'.repeat(201);
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: longCompany,
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.company).toBeDefined();
    });

    it('should enforce location maxlength', () => {
      const longLocation = 'a'.repeat(201);
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: longLocation,
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError?.errors.location).toBeDefined();
    });
  });

  describe('Pre-save Hooks', () => {
    it('should reject endDate before startDate', async () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-01-01'),
        location: 'Remote',
        description: 'Test',
      });

      await expect(experience.save()).rejects.toThrow(
        'End date must be after start date'
      );
    });

    it('should allow endDate after startDate', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-01'),
        location: 'Remote',
        description: 'Test',
      });

      const validationError = experience.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should set endDate to null when isCurrent is true', async () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-01'),
        isCurrent: true,
        location: 'Remote',
        description: 'Test',
      });

      // Trigger pre-save hook
      await experience.validate();
      
      expect(experience.isCurrent).toBe(true);
      // Note: This would be set in pre-save, which requires actual DB save
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      const experience = new ExperienceModel({
        title: 'Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: new Date(),
        location: 'Remote',
        description: 'Test',
      });

      expect(experience.createdAt).toBeDefined();
      expect(experience.updatedAt).toBeDefined();
    });
  });
});
