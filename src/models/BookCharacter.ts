/**
 * BookCharacter Model
 * Placeholder for book character schema
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IBookCharacter extends Document {
  name: string;
  bookTitle: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookCharacterSchema = new Schema<IBookCharacter>(
  {
    name: { type: String, required: true },
    bookTitle: { type: String, required: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BookCharacter ||
  mongoose.model<IBookCharacter>('BookCharacter', BookCharacterSchema);
