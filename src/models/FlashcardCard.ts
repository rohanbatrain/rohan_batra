import mongoose, { Schema, Document } from 'mongoose';
import { FlashcardCard as FlashcardCardType } from '@/types/courses';

export interface IFlashcardCard
  extends Omit<
      FlashcardCardType,
      '_id' | 'deckId' | 'prompt' | 'response' | 'createdAt' | 'updatedAt'
    >,
    Document {
  _id: mongoose.Types.ObjectId;
  deckId: mongoose.Types.ObjectId;
  prompt: {
    text?: string | null;
    richText?: string | null;
    media?: {
      lottieIds?: mongoose.Types.ObjectId[];
      imageUrls?: string[];
      audioUrl?: string | null;
    };
  };
  response: {
    text?: string | null;
    richText?: string | null;
    media?: {
      lottieIds?: mongoose.Types.ObjectId[];
      imageUrls?: string[];
      audioUrl?: string | null;
    };
  };
  scheduling?: {
    intervalDays: number;
    easeFactor: number;
    repetitions: number;
    lastReviewedAt?: Date | null;
    nextReviewAt?: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema(
  {
    lottieIds: [{ type: Schema.Types.ObjectId, ref: 'LottieAsset' }],
    imageUrls: [{ type: String, trim: true }],
    audioUrl: { type: String, trim: true },
  },
  { _id: false }
);

const faceSchema = new Schema(
  {
    text: { type: String, trim: true },
    richText: { type: String },
    media: { type: mediaSchema, default: undefined },
  },
  { _id: false }
);

const schedulingSchema = new Schema(
  {
    intervalDays: { type: Number, default: 0, min: 0 },
    easeFactor: { type: Number, default: 2.5, min: 1.3, max: 2.5 },
    repetitions: { type: Number, default: 0, min: 0 },
    lastReviewedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: null },
  },
  { _id: false }
);

const FlashcardCardSchema = new Schema<IFlashcardCard>(
  {
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'FlashcardDeck',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['basic', 'cloze', 'qa', 'image'],
      required: true,
    },
    prompt: {
      type: faceSchema,
      required: true,
    },
    response: {
      type: faceSchema,
      required: true,
    },
    hint: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    scheduling: {
      type: schedulingSchema,
      default: () => ({
        intervalDays: 0,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        nextReviewAt: null,
      }),
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
        if (json.deckId instanceof mongoose.Types.ObjectId) {
          json.deckId = json.deckId.toString();
        }
        delete json.__v;
        return json;
      },
    },
  }
);

FlashcardCardSchema.index({ deckId: 1, order: 1 }, { unique: true });
FlashcardCardSchema.index({ deckId: 1, createdAt: -1 });
FlashcardCardSchema.index({ deckId: 1, tags: 1 });
FlashcardCardSchema.index({ 'scheduling.nextReviewAt': 1 });

FlashcardCardSchema.pre<IFlashcardCard>('validate', function (next) {
  if (this.type === 'cloze' && !(this.prompt.richText || this.prompt.text)) {
    return next(new Error('Cloze cards require prompt text or rich text'));
  }

  if (this.type === 'image' && !this.prompt.media?.imageUrls?.length) {
    return next(new Error('Image cards require a prompt image URL'));
  }

  next();
});

export type FlashcardCardModelType = mongoose.Model<IFlashcardCard>;

const FlashcardCardModel: FlashcardCardModelType =
  mongoose.models.FlashcardCard ||
  mongoose.model<IFlashcardCard>('FlashcardCard', FlashcardCardSchema);

export default FlashcardCardModel;
