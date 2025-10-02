import mongoose, { Schema, Document } from 'mongoose';

export interface IDocSection extends Document {
  _id: mongoose.Types.ObjectId;
  docProjectId: mongoose.Types.ObjectId;
  
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  
  // Hierarchy
  parentSectionId?: mongoose.Types.ObjectId;
  order: number;
  depth: number;
  
  // Display
  expanded: boolean;
  hidden: boolean;
  
  // Status
  status: 'draft' | 'published';
  
  createdAt: Date;
  updatedAt: Date;
}

const DocSectionSchema = new Schema<IDocSection>(
  {
    docProjectId: {
      type: Schema.Types.ObjectId,
      ref: 'DocProject',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    icon: {
      type: String,
      trim: true,
    },
    parentSectionId: {
      type: Schema.Types.ObjectId,
      ref: 'DocSection',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    expanded: {
      type: Boolean,
      default: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        const result = ret as any;
        result.id = result._id?.toString();
        delete result._id;
        delete result.__v;
        if (result.docProjectId) result.docProjectId = result.docProjectId.toString();
        if (result.parentSectionId) result.parentSectionId = result.parentSectionId.toString();
        return result;
      },
    },
  }
);

// Compound index for efficient querying
DocSectionSchema.index({ docProjectId: 1, order: 1 });
DocSectionSchema.index({ docProjectId: 1, parentSectionId: 1, order: 1 });
DocSectionSchema.index({ docProjectId: 1, slug: 1 }, { unique: true });

const DocSectionModel =
  mongoose.models.DocSection ||
  mongoose.model<IDocSection>('DocSection', DocSectionSchema);

export default DocSectionModel;
