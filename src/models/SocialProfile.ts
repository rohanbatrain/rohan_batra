import mongoose, { Schema, Document } from 'mongoose';

export type SocialPlatform =
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'threads'
  | 'mastodon'
  | 'bluesky'
  | 'medium'
  | 'dev.to'
  | 'hashnode'
  | 'dribbble'
  | 'behance'
  | 'pinterest'
  | 'snapchat'
  | 'reddit'
  | 'discord'
  | 'telegram'
  | 'whatsapp'
  | 'spotify'
  | 'twitch'
  | 'tinder'
  | 'bumble'
  | 'hinge'
  | 'website'
  | 'email'
  | 'other';

export interface ISocialProfile extends Document {
  _id: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  platform: SocialPlatform;
  username: string;
  profileUrl: string;
  displayName?: string; // Optional custom display name
  description?: string;
  isActive: boolean;
  isVerified?: boolean; // If platform shows verification badge
  order: number; // Display order within brand
  visibility: 'public' | 'private' | 'unlisted';
  stats?: {
    followers?: number;
    following?: number;
    posts?: number;
    lastUpdated?: Date;
  };
  customIcon?: string; // For 'other' platform type
  createdAt: Date;
  updatedAt: Date;
}

const SocialProfileSchema = new Schema<ISocialProfile>(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: [
        'instagram',
        'twitter',
        'linkedin',
        'github',
        'youtube',
        'tiktok',
        'facebook',
        'threads',
        'mastodon',
        'bluesky',
        'medium',
        'dev.to',
        'hashnode',
        'dribbble',
        'behance',
        'pinterest',
        'snapchat',
        'reddit',
        'discord',
        'telegram',
        'whatsapp',
        'spotify',
        'twitch',
        'tinder',
        'bumble',
        'hinge',
        'website',
        'email',
        'other',
      ],
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    profileUrl: {
      type: String,
      required: true,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
      required: true,
    },
    stats: {
      followers: {
        type: Number,
        min: 0,
      },
      following: {
        type: Number,
        min: 0,
      },
      posts: {
        type: Number,
        min: 0,
      },
      lastUpdated: {
        type: Date,
      },
    },
    customIcon: {
      type: String,
      maxlength: 50,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const result = ret as any;
        result.id = result._id?.toString();
        result.brandId = result.brandId?.toString();
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Indexes
SocialProfileSchema.index({ brandId: 1, platform: 1 });
SocialProfileSchema.index({ brandId: 1, order: 1 });
SocialProfileSchema.index({ platform: 1 });

// Compound index for unique platform per brand
SocialProfileSchema.index({ brandId: 1, platform: 1, username: 1 }, { unique: true });

// Static method to find profiles by brand
SocialProfileSchema.statics.findByBrand = function (brandId: mongoose.Types.ObjectId) {
  return this.find({ brandId, isActive: true }).sort({ order: 1 });
};

// Static method to find public profiles
SocialProfileSchema.statics.findPublic = function () {
  return this.find({ isActive: true, visibility: 'public' }).sort({ order: 1 });
};

const SocialProfileModel =
  mongoose.models.SocialProfile ||
  mongoose.model<ISocialProfile>('SocialProfile', SocialProfileSchema);

export default SocialProfileModel;
