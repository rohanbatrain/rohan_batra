import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@/types/user';

export interface IUser extends Omit<User, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    avatar: {
      type: String,
      trim: true,
    },
    avatarConfig: {
      style: {
        type: String,
        enum: ['adventurer', 'avataaars', 'big-ears', 'bottts', 'fun-emoji', 'identicon', 'lorelei', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art'],
        default: 'adventurer',
      },
      seed: {
        type: String,
        default: 'default-seed',
      },
      backgroundColor: {
        type: String,
        default: 'b6e3f4',
      },
      radius: {
        type: Number,
        default: 50,
        min: 0,
        max: 50,
      },
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ['user', 'editor', 'admin'],
      default: 'user',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        browser: { type: Boolean, default: true },
        mobile: { type: Boolean, default: false },
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
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
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to update lastLoginAt when user logs in
UserSchema.pre('save', function (next) {
  if (this.isModified('lastLoginAt')) {
    // Could add additional logic here if needed
  }
  next();
});

// Static method to find user by Clerk ID
UserSchema.statics.findByClerkId = function (clerkId: string) {
  return this.findOne({ clerkId });
};

// Instance method to get full name
UserSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to check if user has admin role
UserSchema.methods.isAdmin = function (): boolean {
  return this.role === 'admin';
};

// Instance method to check if user has editor role or higher
UserSchema.methods.isEditor = function (): boolean {
  return ['editor', 'admin'].includes(this.role);
};

const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
