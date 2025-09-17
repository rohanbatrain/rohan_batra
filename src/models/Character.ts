import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacter extends Document {
  _id: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  name: string;
  fullName?: string;
  age?: number;
  description: string; // Rich HTML content from Novel editor
  physicalDescription?: string;
  personality: string;
  background: string;
  goals?: string;
  conflicts?: string;
  relationships: Array<{
    characterId: mongoose.Types.ObjectId;
    relationshipType: string;
    description?: string;
  }>;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  significance: 'major' | 'minor' | 'background';
  avatar?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    age: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    physicalDescription: {
      type: String,
      trim: true,
    },
    personality: {
      type: String,
      required: true,
    },
    background: {
      type: String,
      required: true,
    },
    goals: {
      type: String,
      trim: true,
    },
    conflicts: {
      type: String,
      trim: true,
    },
    relationships: [
      {
        characterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Character',
          required: true,
        },
        relationshipType: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    role: {
      type: String,
      enum: ['protagonist', 'antagonist', 'supporting', 'minor'],
      required: true,
    },
    significance: {
      type: String,
      enum: ['major', 'minor', 'background'],
      default: 'minor',
    },
    avatar: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
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
CharacterSchema.index({ bookId: 1 });
CharacterSchema.index({ bookId: 1, role: 1 });
CharacterSchema.index({ bookId: 1, significance: 1 });
CharacterSchema.index({ name: 1 });

// Instance methods
CharacterSchema.methods.isMainCharacter = function (): boolean {
  return this.role === 'protagonist' || this.role === 'antagonist';
};

CharacterSchema.methods.isMajorCharacter = function (): boolean {
  return this.significance === 'major';
};

// Static methods
CharacterSchema.statics.findByBook = function (bookId: string) {
  return this.find({ bookId }).sort({ significance: 1, role: 1, name: 1 });
};

CharacterSchema.statics.findMainCharacters = function (bookId: string) {
  return this.find({
    bookId,
    role: { $in: ['protagonist', 'antagonist'] },
  }).sort({ role: 1, name: 1 });
};

const CharacterModel =
  mongoose.models.Character ||
  mongoose.model<ICharacter>('Character', CharacterSchema);

export default CharacterModel;
