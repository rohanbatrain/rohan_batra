import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacterJournal extends Document {
  _id: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  content: string; // Rich HTML content from Novel editor
  entryDate?: Date; // In-story date (optional)
  mood?: string;
  location?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  isPrivate: boolean; // Character's private thoughts vs shared (kept for backward compat)
  referencedChapters: mongoose.Types.ObjectId[];
  relatedCharacters: mongoose.Types.ObjectId[];
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterJournalSchema = new Schema<ICharacterJournal>(
  {
    characterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
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
    content: {
      type: String,
      required: true,
    },
    entryDate: {
      type: Date,
    },
    mood: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    isPrivate: { type: Boolean, default: false },
    referencedChapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
      },
    ],
    relatedCharacters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character',
      },
    ],
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
CharacterJournalSchema.index({ characterId: 1 });
CharacterJournalSchema.index({ bookId: 1 });
CharacterJournalSchema.index({ characterId: 1, createdAt: -1 });
CharacterJournalSchema.index({ entryDate: -1 });
CharacterJournalSchema.index({ isPrivate: 1 });
CharacterJournalSchema.index({ status: 1, publishedAt: -1 });
CharacterJournalSchema.index({ slug: 1 });

// Instance methods
CharacterJournalSchema.methods.isPublic = function (): boolean {
  return !this.isPrivate;
};

// Static methods
CharacterJournalSchema.statics.findByCharacter = function (
  characterId: string
) {
  return this.find({ characterId }).sort({ entryDate: -1, createdAt: -1 });
};

CharacterJournalSchema.statics.findByBook = function (bookId: string) {
  return this.find({ bookId }).sort({ entryDate: -1, createdAt: -1 });
};

CharacterJournalSchema.statics.findPublicEntries = function (
  characterId: string
) {
  return this.find({ characterId, isPrivate: false }).sort({
    entryDate: -1,
    createdAt: -1,
  });
};

const CharacterJournalModel =
  mongoose.models.CharacterJournal ||
  mongoose.model<ICharacterJournal>('CharacterJournal', CharacterJournalSchema);

export default CharacterJournalModel;
