import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBraindump extends Document {
  _id: mongoose.Types.ObjectId;
  title?: string;
  content: string;
  tags: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  userId: mongoose.Types.ObjectId;
  
  // ===== NEW: Visibility & Public Fields =====
  visibility: 'private' | 'unlisted' | 'public';
  slug?: string;
  publicMetadata?: {
    viewCount: number;
    lastViewedAt?: Date;
    shareCount: number;
    sharesByPlatform?: {
      twitter: number;
      linkedin: number;
      facebook: number;
      email: number;
      copy: number;
    };
    ogImage?: string;
    ogDescription?: string;
  };
  sharedWith?: mongoose.Types.ObjectId[];
  editHistory?: Array<{
    editedBy: mongoose.Types.ObjectId;
    editedAt: Date;
    previousContent?: string;
  }>;
  // Internal linking fields
  linkedTo?: mongoose.Types.ObjectId[];      // Outgoing links to other braindumps
  linkedFrom?: mongoose.Types.ObjectId[];    // Backlinks (auto-populated)
  // Can be associated with multiple content types
  associations?: Array<{
    type:
      | 'blog'
      | 'project'
      | 'course'
      | 'book'
      | 'character'
      | 'portfolio'
      | 'social-post'
      | 'linkedin'
      | 'twitter'
      | 'experience'
      | 'flashcard'
      | 'documentation'
      | 'other';
    id?: string;
    title?: string;
    url?: string;
    note?: string;
  }>;
  metadata?: {
    source?: string; // e.g., 'quick-capture', 'mobile', 'api'
    relatedTo?: {
      type: 'blog' | 'project' | 'course' | 'book' | 'character' | 'other';
      id?: string;
    };
  };
  processedInto?: {
    type:
      | 'blog'
      | 'project'
      | 'course'
      | 'book'
      | 'character'
      | 'task'
      | 'other';
    id?: string;
    note?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // ===== Methods =====
  generateSlug(): string;
  canView(userId?: string): boolean;
  toPublicJSON(): any;
}

const braindumpSchema = new Schema<IBraindump>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['captured', 'processed', 'archived'],
      default: 'captured',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // ===== NEW: Visibility & Public Fields =====
    visibility: {
      type: String,
      enum: ['private', 'unlisted', 'public'],
      default: 'private',
      required: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: /^[a-z0-9-]+$/,
    },
    publicMetadata: {
      viewCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastViewedAt: Date,
      shareCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      sharesByPlatform: {
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 },
        facebook: { type: Number, default: 0 },
        email: { type: Number, default: 0 },
        copy: { type: Number, default: 0 },
      },
      ogImage: { type: String, maxlength: 500 },
      ogDescription: { type: String, maxlength: 160 },
    },
    sharedWith: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    editHistory: [{
      editedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      editedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      previousContent: {
        type: String,
        maxlength: 200, // Store only first 200 chars for history
      },
    }],
    linkedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      index: true,
    }],
    linkedFrom: [{
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      index: true,
    }],
    associations: [
      {
        type: {
          type: String,
          enum: [
            'blog',
            'project',
            'course',
            'book',
            'character',
            'portfolio',
            'social-post',
            'linkedin',
            'twitter',
            'experience',
            'flashcard',
            'documentation',
            'other',
          ],
          required: true,
        },
        id: { type: String },
        title: { type: String, maxlength: 200 },
        url: { type: String, maxlength: 500 },
        note: { type: String, maxlength: 500 },
      },
    ],
    metadata: {
      source: { type: String },
      relatedTo: {
        type: { type: String },
        id: { type: String },
      },
    },
    processedInto: {
      type: { type: String },
      id: { type: String },
      note: { type: String, maxlength: 500 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
braindumpSchema.index({ userId: 1, status: 1, createdAt: -1 });
braindumpSchema.index({ userId: 1, tags: 1 });
braindumpSchema.index({ userId: 1, priority: 1, status: 1 });
braindumpSchema.index({ userId: 1, linkedTo: 1 });
braindumpSchema.index({ userId: 1, linkedFrom: 1 });

// ===== NEW: Visibility Indexes =====
braindumpSchema.index({ visibility: 1, createdAt: -1 });
braindumpSchema.index({ userId: 1, visibility: 1 });
braindumpSchema.index({ visibility: 1, tags: 1 });
braindumpSchema.index({ visibility: 1, 'publicMetadata.viewCount': -1 });

// ===== Methods =====

/**
 * Generate unique slug from content
 */
braindumpSchema.methods.generateSlug = function(): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  // Take first 50 chars of content, make URL-safe
  const contentSlug = this.content
    .slice(0, 50)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  return `${contentSlug}-${timestamp}${randomSuffix}`;
};

/**
 * Check if a user can view this braindump
 * @param userId - Clerk user ID or MongoDB ObjectId string
 */
braindumpSchema.methods.canView = function(userId?: string): boolean {
  // Public braindumps are visible to everyone
  if (this.visibility === 'public') {
    return true;
  }
  
  // Unlisted braindumps are visible to anyone with the link
  if (this.visibility === 'unlisted') {
    return true;
  }
  
  // Private braindumps require authentication
  if (!userId) {
    return false;
  }
  
  // Owner can always view
  if (this.userId.toString() === userId) {
    return true;
  }
  
  // Check if user has explicit share permission
  if (this.sharedWith && this.sharedWith.length > 0) {
    return this.sharedWith.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId
    );
  }
  
  return false;
};

/**
 * Convert to public-safe JSON (excludes private fields)
 */
braindumpSchema.methods.toPublicJSON = function() {
  return {
    id: this._id.toString(),
    content: this.content,
    slug: this.slug,
    tags: this.tags,
    category: this.category,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    viewCount: this.publicMetadata?.viewCount || 0,
    shareCount: this.publicMetadata?.shareCount || 0,
    // Note: userId and other private fields are excluded
  };
};

// ===== Pre-save Hook =====
braindumpSchema.pre('save', async function(next) {
  // Generate slug for public/unlisted braindumps if not provided
  if ((this.visibility === 'public' || this.visibility === 'unlisted') && !this.slug) {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const potentialSlug = this.generateSlug();
      
      // Check if slug is unique
      const existing = await mongoose.model('Braindump').findOne({ 
        slug: potentialSlug,
        _id: { $ne: this._id }
      });
      
      if (!existing) {
        this.slug = potentialSlug;
        break;
      }
      
      attempts++;
    }
    
    if (!this.slug) {
      // Fallback: use ObjectId as slug
      this.slug = `braindump-${this._id.toString()}`;
    }
  }
  
  // Initialize publicMetadata if visibility is public/unlisted
  if ((this.visibility === 'public' || this.visibility === 'unlisted') && !this.publicMetadata) {
    this.publicMetadata = {
      viewCount: 0,
      shareCount: 0,
      sharesByPlatform: {
        twitter: 0,
        linkedin: 0,
        facebook: 0,
        email: 0,
        copy: 0,
      },
    };
  }
  
  next();
});

const BraindumpModel: Model<IBraindump> =
  mongoose.models.Braindump ||
  mongoose.model<IBraindump>('Braindump', braindumpSchema);

export default BraindumpModel;
