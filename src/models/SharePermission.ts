import mongoose, { Schema, Document, Model } from 'mongoose';

export type SharePermissionLevel = 'view' | 'comment' | 'edit';

export interface ISharePermission extends Document {
  _id: mongoose.Types.ObjectId;
  braindumpId: mongoose.Types.ObjectId;
  userId: string; // Clerk user ID
  permission: SharePermissionLevel;
  grantedBy: string; // Clerk user ID
  grantedAt: Date;
  updatedAt: Date;
  revoked: boolean;
}

// Static method types
export interface ISharePermissionModel extends Model<ISharePermission> {
  grantPermission(
    braindumpId: mongoose.Types.ObjectId,
    userId: string,
    permission: SharePermissionLevel,
    grantedBy: string
  ): Promise<ISharePermission>;
  revokePermission(braindumpId: mongoose.Types.ObjectId, userId: string): Promise<boolean>;
  hasPermission(
    braindumpId: mongoose.Types.ObjectId,
    userId: string,
    requiredPermission?: SharePermissionLevel
  ): Promise<boolean>;
  getPermissions(braindumpId: mongoose.Types.ObjectId): Promise<ISharePermission[]>;
}

const sharePermissionSchema = new Schema<ISharePermission>(
  {
    braindumpId: {
      type: Schema.Types.ObjectId,
      ref: 'Braindump',
      required: true,
      index: true,
    },
    userId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },
    permission: {
      type: String,
      enum: ['view', 'comment', 'edit'],
      required: true,
    },
    grantedBy: {
      type: String, // Clerk user ID
      required: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one permission per user per braindump (if not revoked)
sharePermissionSchema.index(
  { braindumpId: 1, userId: 1, revoked: 1 },
  { unique: true }
);

// Index for querying active permissions
sharePermissionSchema.index({ braindumpId: 1, revoked: 1 });

// ===== Static Methods =====

/**
 * Grant or update share permission
 */
sharePermissionSchema.statics.grantPermission = async function(
  braindumpId: mongoose.Types.ObjectId,
  userId: string,
  permission: SharePermissionLevel,
  grantedBy: string
): Promise<ISharePermission> {
  // Check for existing permission
  const existing = await this.findOne({
    braindumpId,
    userId,
    revoked: false,
  });
  
  if (existing) {
    // Update existing permission
    existing.permission = permission;
    existing.updatedAt = new Date();
    return await existing.save();
  } else {
    // Create new permission
    return await this.create({
      braindumpId,
      userId,
      permission,
      grantedBy,
    });
  }
};

/**
 * Revoke share permission
 */
sharePermissionSchema.statics.revokePermission = async function(
  braindumpId: mongoose.Types.ObjectId,
  userId: string
): Promise<boolean> {
  const result = await this.updateOne(
    { braindumpId, userId, revoked: false },
    { $set: { revoked: true, updatedAt: new Date() } }
  );
  
  return result.modifiedCount > 0;
};

/**
 * Check if user has permission
 */
sharePermissionSchema.statics.hasPermission = async function(
  braindumpId: mongoose.Types.ObjectId,
  userId: string,
  requiredPermission?: SharePermissionLevel
): Promise<boolean> {
  const permission = await this.findOne({
    braindumpId,
    userId,
    revoked: false,
  });
  
  if (!permission) {
    return false;
  }
  
  // If no specific permission required, just check existence
  if (!requiredPermission) {
    return true;
  }
  
  // Permission hierarchy: edit > comment > view
  const hierarchy: SharePermissionLevel[] = ['view', 'comment', 'edit'];
  const userLevel = hierarchy.indexOf(permission.permission);
  const requiredLevel = hierarchy.indexOf(requiredPermission);
  
  return userLevel >= requiredLevel;
};

/**
 * Get all active permissions for a braindump
 */
sharePermissionSchema.statics.getPermissions = async function(
  braindumpId: mongoose.Types.ObjectId
): Promise<ISharePermission[]> {
  return await this.find({
    braindumpId,
    revoked: false,
  }).sort({ grantedAt: -1 });
};

const SharePermissionModel = (mongoose.models.SharePermission ||
  mongoose.model<ISharePermission>('SharePermission', sharePermissionSchema)) as ISharePermissionModel;

export default SharePermissionModel;
