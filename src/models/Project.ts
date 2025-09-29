import mongoose, { Schema, Document } from 'mongoose';
import { Project } from '@/types/project';

export interface IProject extends Omit<Project, '_id' | 'authorId'>, Document {
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    longDescription: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    categories: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'LottieAsset',
      },
    ],
    gallery: [
      {
        asset: {
          type: Schema.Types.ObjectId,
          ref: 'LottieAsset',
        },
        caption: String,
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    galleryAssets: [
      {
        asset: {
          type: Schema.Types.ObjectId,
          ref: 'LottieAsset',
        },
        type: {
          type: String,
          enum: ['image', 'video', 'lottie'],
          default: 'image',
        },
        caption: String,
        order: {
          type: Number,
          default: 0,
        },
        metadata: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    featuredImage: {
      type: Schema.Types.ObjectId,
      ref: 'LottieAsset',
    },
    demoUrl: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    sourceUrl: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    liveUrl: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    links: {
      github: String,
      demo: String,
      live: String,
      documentation: String,
      other: [
        {
          label: String,
          url: String,
        },
      ],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    timeline: {
      startDate: Date,
      endDate: Date,
      milestones: [
        {
          title: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
            required: true,
          },
          description: String,
        },
      ],
      estimatedDuration: Number,
      actualDuration: Number,
    },
    client: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    collaboration: {
      teamSize: Number,
      role: String,
      responsibilities: [String],
      collaborators: [
        {
          name: String,
          role: String,
          contact: String,
        },
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    complexity: {
      technical: {
        type: Number,
        min: 1,
        max: 10,
      },
      design: {
        type: Number,
        min: 1,
        max: 10,
      },
      overall: {
        type: Number,
        min: 1,
        max: 10,
      },
    },
    analytics: {
      viewHistory: [
        {
          date: {
            type: Date,
            default: Date.now,
          },
          count: {
            type: Number,
            default: 1,
          },
        },
      ],
      clickMetrics: {
        demoClicks: {
          type: Number,
          default: 0,
        },
        sourceClicks: {
          type: Number,
          default: 0,
        },
        liveClicks: {
          type: Number,
          default: 0,
        },
      },
      referrers: [
        {
          source: String,
          count: {
            type: Number,
            default: 1,
          },
        },
      ],
    },
    seoMetadata: {
      keywords: [String],
      canonicalUrl: String,
      openGraph: {
        title: String,
        description: String,
        image: String,
        type: {
          type: String,
          default: 'website',
        },
      },
      twitter: {
        card: {
          type: String,
          default: 'summary_large_image',
        },
        title: String,
        description: String,
        image: String,
      },
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const result = ret as any;
        result.id = result._id?.toString();
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Indexes for performance
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ featured: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ technologies: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ authorId: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ viewCount: -1 });
ProjectSchema.index({ status: 1, featured: 1, createdAt: -1 });

// Compound indexes for common queries
ProjectSchema.index({ status: 1, category: 1 });
ProjectSchema.index({ status: 1, technologies: 1 });
ProjectSchema.index({ status: 1, tags: 1 });

// Pre-save middleware to auto-generate slug from title if not provided
ProjectSchema.pre<IProject>('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Instance method to increment view count
ProjectSchema.methods.incrementViewCount = function (): Promise<IProject> {
  this.viewCount += 1;
  return this.save();
};

// Instance method to check if project is published
ProjectSchema.methods.isPublished = function (): boolean {
  return this.status === 'published';
};

// Instance method to check if project is featured
ProjectSchema.methods.isFeatured = function (): boolean {
  return this.featured && this.isPublished();
};

// Static method to find published projects
ProjectSchema.statics.findPublished = function () {
  return this.find({ status: 'published' });
};

// Static method to find featured projects
ProjectSchema.statics.findFeatured = function () {
  return this.find({ status: 'published', featured: true });
};

// Static method to find projects by category
ProjectSchema.statics.findByCategory = function (category: string) {
  return this.find({ status: 'published', category });
};

// Static method to find projects by technology
ProjectSchema.statics.findByTechnology = function (technology: string) {
  return this.find({ status: 'published', technologies: technology });
};

// Static method to find projects by tag
ProjectSchema.statics.findByTag = function (tag: string) {
  return this.find({ status: 'published', tags: tag });
};

const ProjectModel =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default ProjectModel;
