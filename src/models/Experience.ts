import mongoose, { Schema, Model } from 'mongoose';
import { IExperience, EmploymentType, ContentFormat } from '@/types/experience';

const experienceSchema = new Schema<IExperience>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    companyLogoAsset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: [
          'Full-time',
          'Part-time',
          'Self-employed',
          'Freelance',
          'Contract',
          'Internship',
          'Apprenticeship',
          'Seasonal',
        ] as EmploymentType[],
        message: '{VALUE} is not a valid employment type',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    descriptionFormat: {
      type: String,
      enum: {
        values: ['rich-text', 'markdown'] as ContentFormat[],
        message: '{VALUE} is not a valid content format',
      },
      default: 'rich-text',
    },
    skills: {
      type: [String],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
experienceSchema.index({ displayOrder: 1, startDate: -1 });
experienceSchema.index({ published: 1, startDate: -1 });

// Validation: endDate must be after startDate if provided
experienceSchema.pre('save', function (next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  // If isCurrent is true, endDate should be null
  if (this.isCurrent && this.endDate) {
    this.endDate = null;
  }
  
  next();
});

// Prevent duplicate models in development
const ExperienceModel: Model<IExperience> =
  mongoose.models.Experience ||
  mongoose.model<IExperience>('Experience', experienceSchema);

export default ExperienceModel;
