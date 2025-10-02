import mongoose, { Schema, Document } from 'mongoose';

export interface IDocProject extends Document {
  _id: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId; // Link to portfolio project
  title: string;
  slug: string;
  description: string;
  logoUrl?: string;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  
  // Configuration
  config: {
    theme?: 'light' | 'dark' | 'system';
    primaryColor?: string;
    sidebarPosition?: 'left' | 'right';
    showToc?: boolean;
    showBreadcrumbs?: boolean;
    showLastUpdated?: boolean;
    showContributors?: boolean;
  };
  
  // External links
  externalLinks?: {
    github?: string;
    npm?: string;
    demo?: string;
    support?: string;
  };
  
  // SEO
  seo?: {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string[];
  };
  
  // Analytics
  analytics: {
    totalViews: number;
    totalSearches: number;
    popularPages: Array<{ pageId: mongoose.Types.ObjectId; views: number }>;
  };
  
  // Access control
  accessControl?: {
    requireAuth: boolean;
    allowedRoles?: string[];
    allowedUserIds?: mongoose.Types.ObjectId[];
  };
  
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const DocProjectSchema = new Schema<IDocProject>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
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
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
      index: true,
    },
    config: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      primaryColor: String,
      sidebarPosition: {
        type: String,
        enum: ['left', 'right'],
        default: 'left',
      },
      showToc: {
        type: Boolean,
        default: true,
      },
      showBreadcrumbs: {
        type: Boolean,
        default: true,
      },
      showLastUpdated: {
        type: Boolean,
        default: true,
      },
      showContributors: {
        type: Boolean,
        default: false,
      },
    },
    externalLinks: {
      github: String,
      npm: String,
      demo: String,
      support: String,
    },
    seo: {
      title: {
        type: String,
        maxlength: 70,
      },
      description: {
        type: String,
        maxlength: 160,
      },
      image: String,
      keywords: [String],
    },
    analytics: {
      totalViews: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalSearches: {
        type: Number,
        default: 0,
        min: 0,
      },
      popularPages: [
        {
          pageId: {
            type: Schema.Types.ObjectId,
            ref: 'DocPage',
          },
          views: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    accessControl: {
      requireAuth: {
        type: Boolean,
        default: false,
      },
      allowedRoles: [String],
      allowedUserIds: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        const result = ret as any;
        result.id = result._id?.toString();
        delete result._id;
        delete result.__v;
        if (result.projectId) result.projectId = result.projectId.toString();
        if (result.createdBy) result.createdBy = result.createdBy.toString();
        if (result.analytics?.popularPages) {
          result.analytics.popularPages = result.analytics.popularPages.map((p: any) => ({
            pageId: p.pageId.toString(),
            views: p.views,
          }));
        }
        if (result.accessControl?.allowedUserIds) {
          result.accessControl.allowedUserIds = result.accessControl.allowedUserIds.map((id: any) =>
            id.toString()
          );
        }
        return result;
      },
    },
  }
);

// Indexes
DocProjectSchema.index({ status: 1, visibility: 1 });
DocProjectSchema.index({ createdBy: 1, status: 1 });
DocProjectSchema.index({ slug: 1, status: 1 });

// Pre-save hook to auto-generate slug if needed
DocProjectSchema.pre<IDocProject>('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Set publishedAt when first published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

const DocProjectModel =
  mongoose.models.DocProject ||
  mongoose.model<IDocProject>('DocProject', DocProjectSchema);

export default DocProjectModel;
