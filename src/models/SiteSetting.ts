import mongoose, { Schema, Document } from 'mongoose';
import { SiteSetting } from '@/types/site-setting';

export interface ISiteSetting
  extends Omit<SiteSetting, '_id' | 'updatedBy'>,
    Document {
  _id: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      lowercase: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean', 'json'],
      default: 'string',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'general',
        'seo',
        'social',
        'analytics',
        'email',
        'security',
        'performance',
        'features',
      ],
      default: 'general',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: Document, ret: { [key: string]: unknown }) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
SiteSettingSchema.index({ category: 1 });
SiteSettingSchema.index({ isPublic: 1 });
SiteSettingSchema.index({ isSystem: 1 });
SiteSettingSchema.index({ updatedAt: -1 });

// Compound indexes for common queries
SiteSettingSchema.index({ category: 1, isPublic: 1 });
SiteSettingSchema.index({ isSystem: 1, updatedAt: -1 });

// Pre-save middleware for value validation based on type
SiteSettingSchema.pre<ISiteSetting>('save', function (next) {
  // Validate value based on type
  switch (this.type) {
    case 'string':
      if (typeof this.value !== 'string') {
        return next(new Error('Value must be a string for string type'));
      }
      break;
    case 'number':
      if (typeof this.value !== 'number' || isNaN(this.value)) {
        return next(new Error('Value must be a valid number for number type'));
      }
      break;
    case 'boolean':
      if (typeof this.value !== 'boolean') {
        return next(new Error('Value must be a boolean for boolean type'));
      }
      break;
    case 'json':
      if (typeof this.value !== 'object' || this.value === null) {
        return next(new Error('Value must be a valid object for json type'));
      }
      break;
  }
  next();
});

// Instance method to get typed value
SiteSettingSchema.methods.getTypedValue = function () {
  switch (this.type) {
    case 'string':
      return String(this.value);
    case 'number':
      return Number(this.value);
    case 'boolean':
      return Boolean(this.value);
    case 'json':
      return this.value;
    default:
      return this.value;
  }
};

// Instance method to check if setting can be modified
SiteSettingSchema.methods.canModify = function (userRole?: string): boolean {
  // System settings can only be modified by admins
  if (this.isSystem) {
    return userRole === 'admin';
  }
  // Non-system settings can be modified by editors and admins
  return ['editor', 'admin'].includes(userRole || '');
};

// Static method to get setting by key
SiteSettingSchema.statics.getByKey = function (key: string) {
  return this.findOne({ key: key.toLowerCase() });
};

// Static method to get public settings
SiteSettingSchema.statics.getPublicSettings = function () {
  return this.find({ isPublic: true }).sort({ category: 1, key: 1 });
};

// Static method to get settings by category
SiteSettingSchema.statics.getByCategory = function (category: string) {
  return this.find({ category }).sort({ key: 1 });
};

// Static method to set setting value
SiteSettingSchema.statics.setValue = function (
  key: string,
  value: string | number | boolean | object,
  type: 'string' | 'number' | 'boolean' | 'json',
  updatedBy?: string
) {
  const updateData: Partial<ISiteSetting> = {
    value,
    type,
    updatedBy: updatedBy ? new mongoose.Types.ObjectId(updatedBy) : undefined,
  };

  return this.findOneAndUpdate({ key: key.toLowerCase() }, updateData, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
};

// Static method to get multiple settings by keys
SiteSettingSchema.statics.getMultipleByKeys = function (keys: string[]) {
  return this.find({
    key: { $in: keys.map(key => key.toLowerCase()) },
  });
};

// Static method to get settings as key-value object
SiteSettingSchema.statics.getAsObject = function (keys?: string[]) {
  const query = keys
    ? { key: { $in: keys.map(key => key.toLowerCase()) } }
    : {};

  return this.find(query).then((settings: ISiteSetting[]) => {
    const result: { [key: string]: string | number | boolean | object } = {};
    settings.forEach((setting: ISiteSetting) => {
      result[setting.key] = (
        setting as InstanceType<typeof SiteSettingModel>
      ).getTypedValue();
    });
    return result;
  });
};

// Static method to delete setting
SiteSettingSchema.statics.deleteByKey = function (key: string) {
  return this.findOneAndDelete({ key: key.toLowerCase() });
};

// Static method to get setting statistics
SiteSettingSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalSettings: { $sum: 1 },
        publicSettings: {
          $sum: { $cond: ['$isPublic', 1, 0] },
        },
        systemSettings: {
          $sum: { $cond: ['$isSystem', 1, 0] },
        },
        categories: {
          $addToSet: '$category',
        },
        types: {
          $addToSet: '$type',
        },
      },
    },
  ]);
};

const SiteSettingModel =
  mongoose.models.SiteSetting ||
  mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema);

export default SiteSettingModel;
