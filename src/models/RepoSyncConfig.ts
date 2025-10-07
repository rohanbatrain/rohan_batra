import mongoose, { Schema, Document } from 'mongoose';

export interface IRepoSyncConfig extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  repoUrl: string;
  repoName: string;
  defaultBranch: string;
  pathMapping: Map<string, string>; // deckId -> file path
  syncDirection: 'pull-only' | 'push-pull';
  lastSyncedAt?: Date | null;
  status: 'active' | 'paused' | 'error';
  authType: 'none' | 'pat' | 'oauth';
  webhookEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RepoSyncConfigSchema = new Schema<IRepoSyncConfig>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    repoName: {
      type: String,
      required: true,
      default: 'flashcards',
      trim: true,
    },
    defaultBranch: {
      type: String,
      required: true,
      default: 'main',
      trim: true,
    },
    pathMapping: {
      type: Map,
      of: String,
      default: new Map(),
    },
    syncDirection: {
      type: String,
      enum: ['pull-only', 'push-pull'],
      default: 'pull-only',
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'error'],
      default: 'active',
    },
    authType: {
      type: String,
      enum: ['none', 'pat', 'oauth'],
      default: 'none',
    },
    webhookEnabled: {
      type: Boolean,
      default: false,
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
        if (json.ownerId instanceof mongoose.Types.ObjectId) {
          json.ownerId = json.ownerId.toString();
        }
        delete json.__v;
        return json;
      },
    },
  }
);

RepoSyncConfigSchema.index({ ownerId: 1, repoName: 1 }, { unique: true });

export type RepoSyncConfigModelType = mongoose.Model<IRepoSyncConfig>;

const RepoSyncConfigModel: RepoSyncConfigModelType =
  mongoose.models.RepoSyncConfig ||
  mongoose.model<IRepoSyncConfig>('RepoSyncConfig', RepoSyncConfigSchema);

export default RepoSyncConfigModel;
