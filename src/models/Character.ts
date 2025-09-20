import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacter extends Document {
  _id: mongoose.Types.ObjectId;
  bookId?: mongoose.Types.ObjectId;
  slug: string;
  visibility: 'private' | 'public';
  name: string;
  fullName?: string;
  birthdate?: Date | null;
  age?: number;
  description: string; // Rich HTML content
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
  avatarAssetId?: mongoose.Types.ObjectId;
  featured?: boolean;
  tags: string[];
  notes?: string;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
      index: true,
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
    birthdate: {
      type: Date,
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
          strength: {
            type: Number, // 1-10 scale
            min: 0,
            max: 10,
            default: 5,
          },
          direction: {
            type: String, // one-way or mutual
            enum: ['one-way', 'mutual'],
            default: 'mutual',
          },
          inverseType: {
            type: String,
            trim: true,
          },
          startedAt: {
            type: Date,
          },
          endedAt: {
            type: Date,
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
    avatarAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
    },
    featured: {
      type: Boolean,
      default: false,
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
CharacterSchema.index({ bookId: 1 });
CharacterSchema.index({ slug: 1 });
CharacterSchema.index({ bookId: 1, role: 1 });
CharacterSchema.index({ bookId: 1, significance: 1 });
CharacterSchema.index({ name: 1 });
CharacterSchema.index({ visibility: 1 });
CharacterSchema.index({ 'relationships.characterId': 1, 'relationships.relationshipType': 1 });

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

// Helpers
function computeAgeFromDate(date: Date | undefined | null): number | undefined {
  if (!date) return undefined;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

// Ensure slug exists before validation so required constraint passes
CharacterSchema.pre<ICharacter>('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (this.birthdate) {
    const computed = computeAgeFromDate(this.birthdate);
    if (typeof computed === 'number') this.age = computed;
  }
  next();
});

// Keep age in sync when using findOneAndUpdate
CharacterSchema.pre('findOneAndUpdate', function (next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: any = this.getUpdate() || {};
  const $set = update.$set ?? update;
  if ($set && $set.birthdate) {
    const bd = new Date($set.birthdate);
    if (!isNaN(bd.getTime())) {
      const computed = computeAgeFromDate(bd);
      if (typeof computed === 'number') {
        if (update.$set) update.$set.age = computed; else update.age = computed;
      }
    }
  }
  next();
});

export default CharacterModel;
