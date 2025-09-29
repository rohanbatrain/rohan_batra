import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: string;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId | string;
  userId?: mongoose.Types.ObjectId | string;
  userEmail?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },
    entityType: { type: String, index: true },
    entityId: { type: Schema.Types.Mixed, index: true },
    userId: { type: Schema.Types.Mixed, index: true },
    userEmail: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

const AuditLogModel =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLogModel;
