import mongoose, { Schema, Document } from 'mongoose';

export interface IBulkOperationRecord extends Document {
  _id: mongoose.Types.ObjectId;
  initiatedBy: mongoose.Types.ObjectId;
  deckId?: mongoose.Types.ObjectId | null;
  operationType: 'import' | 'export' | 'move' | 'delete' | 'edit';
  totalItems: number;
  succeeded: number;
  failed: number;
  startedAt: Date;
  finishedAt?: Date | null;
  errorSummary?: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const BulkOperationRecordSchema = new Schema<IBulkOperationRecord>(
  {
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'FlashcardDeck',
      default: null,
      index: true,
    },
    operationType: {
      type: String,
      enum: ['import', 'export', 'move', 'delete', 'edit'],
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
      min: 0,
    },
    succeeded: {
      type: Number,
      default: 0,
      min: 0,
    },
    failed: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
    errorSummary: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        const json = ret as Record<string, unknown>;
        if (json._id) {
          json.id = json._id.toString();
          delete json._id;
        }
        if (json.initiatedBy instanceof mongoose.Types.ObjectId) {
          json.initiatedBy = json.initiatedBy.toString();
        }
        if (json.deckId instanceof mongoose.Types.ObjectId) {
          json.deckId = json.deckId.toString();
        }
        delete json.__v;
        return json;
      },
    },
  }
);

BulkOperationRecordSchema.index({ initiatedBy: 1, createdAt: -1 });
BulkOperationRecordSchema.index({ deckId: 1, createdAt: -1 });
BulkOperationRecordSchema.index({ status: 1 });

export type BulkOperationRecordModelType = mongoose.Model<IBulkOperationRecord>;

const BulkOperationRecordModel: BulkOperationRecordModelType =
  mongoose.models.BulkOperationRecord ||
  mongoose.model<IBulkOperationRecord>(
    'BulkOperationRecord',
    BulkOperationRecordSchema
  );

export default BulkOperationRecordModel;
