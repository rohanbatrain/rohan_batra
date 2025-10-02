import mongoose, { Schema, Document } from 'mongoose';

export interface IDocPage extends Document {
  _id: mongoose.Types.ObjectId;
  docProjectId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  
  title: string;
  slug: string;
  description?: string;
  
  // Content
  content: string;
  contentFormat: 'mdx' | 'markdown';
  
  // Navigation
  order: number;
  parentPageId?: mongoose.Types.ObjectId;
  
  // Table of Contents
  headings: Array<{
    level: number;
    text: string;
    id: string;
  }>;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  
  // Features
  features: {
    showToc: boolean;
    showBreadcrumbs: boolean;
    showLastUpdated: boolean;
    allowComments: boolean;
    showEditLink: boolean;
  };
  
  // SEO
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  
  // Analytics
  analytics: {
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    searchAppearances: number;
    externalReferrals: number;
  };
  
  // Relationships
  relatedPages?: mongoose.Types.ObjectId[];
  prerequisites?: mongoose.Types.ObjectId[];
  
  // Assets
  assets?: {
    images?: string[];
    videos?: string[];
    downloads?: Array<{ label: string; url: string }>;
  };
  
  // Edit History
  lastEditedBy?: mongoose.Types.ObjectId;
  editHistory?: Array<{
    editedBy: mongoose.Types.ObjectId;
    editedAt: Date;
    summary: string;
  }>;
  
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocPageSchema = new Schema<IDocPage>(
  {
    docProjectId: {
      type: Schema.Types.ObjectId,
      ref: 'DocProject',
      required: true,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'DocSection',
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
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    contentFormat: {
      type: String,
      enum: ['mdx', 'markdown'],
      default: 'mdx',
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    parentPageId: {
      type: Schema.Types.ObjectId,
      ref: 'DocPage',
      index: true,
    },
    headings: [
      {
        level: {
          type: Number,
          required: true,
          min: 1,
          max: 6,
        },
        text: {
          type: String,
          required: true,
        },
        id: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: Date,
    features: {
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
      allowComments: {
        type: Boolean,
        default: false,
      },
      showEditLink: {
        type: Boolean,
        default: false,
      },
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
      keywords: [String],
      ogImage: String,
    },
    analytics: {
      views: {
        type: Number,
        default: 0,
        min: 0,
      },
      uniqueVisitors: {
        type: Number,
        default: 0,
        min: 0,
      },
      avgTimeOnPage: {
        type: Number,
        default: 0,
        min: 0,
      },
      searchAppearances: {
        type: Number,
        default: 0,
        min: 0,
      },
      externalReferrals: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    relatedPages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DocPage',
      },
    ],
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DocPage',
      },
    ],
    assets: {
      images: [String],
      videos: [String],
      downloads: [
        {
          label: String,
          url: String,
        },
      ],
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    editHistory: [
      {
        editedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        editedAt: {
          type: Date,
          required: true,
        },
        summary: {
          type: String,
          maxlength: 200,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        const result = ret as any;
        result.id = result._id?.toString();
        delete result._id;
        delete result.__v;
        if (result.docProjectId) result.docProjectId = result.docProjectId.toString();
        if (result.sectionId) result.sectionId = result.sectionId.toString();
        if (result.parentPageId) result.parentPageId = result.parentPageId.toString();
        if (result.createdBy) result.createdBy = result.createdBy.toString();
        if (result.lastEditedBy) result.lastEditedBy = result.lastEditedBy.toString();
        if (result.relatedPages) {
          result.relatedPages = result.relatedPages.map((id: any) => id.toString());
        }
        if (result.prerequisites) {
          result.prerequisites = result.prerequisites.map((id: any) => id.toString());
        }
        if (result.editHistory) {
          result.editHistory = result.editHistory.map((entry: any) => ({
            ...entry,
            editedBy: entry.editedBy.toString(),
          }));
        }
        return result;
      },
    },
  }
);

// Indexes for efficient querying
DocPageSchema.index({ docProjectId: 1, status: 1 });
DocPageSchema.index({ docProjectId: 1, sectionId: 1, order: 1 });
DocPageSchema.index({ docProjectId: 1, slug: 1 }, { unique: true });
DocPageSchema.index({ status: 1, publishedAt: -1 });

// Text index for search
DocPageSchema.index({ title: 'text', content: 'text', description: 'text' });

// Pre-save hook to set publishedAt
DocPageSchema.pre<IDocPage>('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const DocPageModel =
  mongoose.models.DocPage || mongoose.model<IDocPage>('DocPage', DocPageSchema);

export default DocPageModel;
