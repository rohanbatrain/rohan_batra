import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; // e.g., "rohanbatrain"
  displayName: string; // e.g., "Rohan Batra - Professional"
  slug: string; // URL-friendly version
  description?: string;
  type: 'professional' | 'creative' | 'personal' | 'other';
  visibility: 'public' | 'private' | 'unlisted';
  isPrimary: boolean; // Main brand (shows in footer)
  isActive: boolean;
  order: number; // Display order
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    icon?: string; // emoji or icon name
  };
  metadata?: {
    followers?: number;
    totalPosts?: number;
    websiteUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-_]+$/,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['professional', 'creative', 'personal', 'other'],
      default: 'professional',
      required: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
      required: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    theme: {
      primaryColor: {
        type: String,
        match: /^#[0-9A-Fa-f]{6}$/,
      },
      secondaryColor: {
        type: String,
        match: /^#[0-9A-Fa-f]{6}$/,
      },
      icon: {
        type: String,
        maxlength: 50,
      },
    },
    metadata: {
      followers: {
        type: Number,
        min: 0,
      },
      totalPosts: {
        type: Number,
        min: 0,
      },
      websiteUrl: {
        type: String,
        trim: true,
        match: /^https?:\/\/.+/,
      },
    },
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

// Indexes
BrandSchema.index({ slug: 1 });
BrandSchema.index({ type: 1, isActive: 1 });
BrandSchema.index({ order: 1 });

// Pre-save middleware to generate slug if not provided
BrandSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Static method to find primary brand
BrandSchema.statics.findPrimary = function () {
  return this.findOne({ isPrimary: true, isActive: true });
};

// Static method to find active brands
BrandSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ order: 1 });
};

const BrandModel =
  mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default BrandModel;
