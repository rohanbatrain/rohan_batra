import mongoose, { Schema, Document } from 'mongoose';
import { BlogPost } from '@/types/blog-post';

export interface IBlogPost
  extends Omit<BlogPost, '_id' | 'authorId'>,
    Document {
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
}

const BlogPostSchema = new Schema<IBlogPost>(
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
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    markdown: {
      type: String,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ['html', 'rich-text', 'markdown'],
      default: 'rich-text',
    },
    featuredImage: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    featuredImageUrl: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
      },
    ],
    attachedAssets: [
      {
        asset: {
          type: Schema.Types.ObjectId,
          ref: 'LottieAsset',
        },
        usage: {
          type: String,
          enum: ['featured', 'content', 'gallery', 'attachment'],
          default: 'content',
        },
        caption: String,
        altText: String,
        position: {
          type: Number,
          default: 0,
        },
        metadata: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    seoMetadata: {
      keywords: [String],
      canonicalUrl: String,
      openGraph: {
        title: String,
        description: String,
        image: String,
        type: {
          type: String,
          default: 'article',
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
      structuredData: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    validation: {
      contentQuality: {
        score: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        issues: [String],
        suggestions: [String],
      },
      seoScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      readabilityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      lastChecked: Date,
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
      engagementMetrics: {
        averageTimeOnPage: Number,
        bounceRate: Number,
        shareCount: {
          type: Number,
          default: 0,
        },
        clickThroughRate: Number,
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
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
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
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    readingTime: {
      type: Number,
      min: 1,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
BlogPostSchema.index({ status: 1 });
BlogPostSchema.index({ featured: 1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ authorId: 1 });
BlogPostSchema.index({ publishedAt: -1 });
BlogPostSchema.index({ createdAt: -1 });
BlogPostSchema.index({ viewCount: -1 });
BlogPostSchema.index({ likeCount: -1 });

// Compound indexes for common queries
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ status: 1, category: 1 });
BlogPostSchema.index({ status: 1, tags: 1 });
BlogPostSchema.index({ status: 1, featured: 1, publishedAt: -1 });

// Pre-save middleware to auto-generate slug from title if not provided
BlogPostSchema.pre<IBlogPost>('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Set publishedAt when status changes to published
  if (
    this.isModified('status') &&
    this.status === 'published' &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  // Auto-calculate reading time if not provided (roughly 200 words per minute)
  if (this.isModified('content') && !this.readingTime) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  next();
});

// Instance method to increment view count
BlogPostSchema.methods.incrementViewCount = function (): Promise<IBlogPost> {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment like count
BlogPostSchema.methods.incrementLikeCount = function (): Promise<IBlogPost> {
  this.likeCount += 1;
  return this.save();
};

// Instance method to decrement like count
BlogPostSchema.methods.decrementLikeCount = function (): Promise<IBlogPost> {
  if (this.likeCount > 0) {
    this.likeCount -= 1;
  }
  return this.save();
};

// Instance method to increment comment count
BlogPostSchema.methods.incrementCommentCount = function (): Promise<IBlogPost> {
  this.commentCount += 1;
  return this.save();
};

// Instance method to decrement comment count
BlogPostSchema.methods.decrementCommentCount = function (): Promise<IBlogPost> {
  if (this.commentCount > 0) {
    this.commentCount -= 1;
  }
  return this.save();
};

// Instance method to check if post is published
BlogPostSchema.methods.isPublished = function (): boolean {
  return this.status === 'published';
};

// Instance method to check if post is featured
BlogPostSchema.methods.isFeatured = function (): boolean {
  return this.featured && this.isPublished();
};

// Instance method to get SEO title (fallback to title)
BlogPostSchema.methods.getSeoTitle = function (): string {
  return this.seoTitle || this.title;
};

// Instance method to get SEO description (fallback to excerpt)
BlogPostSchema.methods.getSeoDescription = function (): string {
  return this.seoDescription || this.excerpt;
};

// Static method to find published posts
BlogPostSchema.statics.findPublished = function () {
  return this.find({ status: 'published' }).sort({ publishedAt: -1 });
};

// Static method to find featured posts
BlogPostSchema.statics.findFeatured = function () {
  return this.find({ status: 'published', featured: true }).sort({
    publishedAt: -1,
  });
};

// Static method to find posts by category
BlogPostSchema.statics.findByCategory = function (category: string) {
  return this.find({ status: 'published', category }).sort({ publishedAt: -1 });
};

// Static method to find posts by tag
BlogPostSchema.statics.findByTag = function (tag: string) {
  return this.find({ status: 'published', tags: tag }).sort({
    publishedAt: -1,
  });
};

// Static method to find posts by author
BlogPostSchema.statics.findByAuthor = function (authorId: string) {
  return this.find({ status: 'published', authorId }).sort({ publishedAt: -1 });
};

// Static method to search posts
BlogPostSchema.statics.search = function (query: string) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    status: 'published',
    $or: [
      { title: searchRegex },
      { excerpt: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ],
  }).sort({ publishedAt: -1 });
};

const BlogPostModel =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPostModel;
