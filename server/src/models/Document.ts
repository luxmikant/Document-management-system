import mongoose, { Document, Schema } from 'mongoose';

export type AccessLevel = 'viewer' | 'editor';

export interface IPermission {
  userId: mongoose.Types.ObjectId;
  access: AccessLevel;
}

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  ownerId: mongoose.Types.ObjectId;
  tags: string[];
  currentVersionNumber: number;
  acl: IPermission[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    access: {
      type: String,
      enum: ['viewer', 'editor'],
      required: true
    }
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 255
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    originalFilename: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    currentVersionNumber: {
      type: Number,
      default: 1
    },
    acl: {
      type: [permissionSchema],
      default: []
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Text index for search
documentSchema.index({ title: 'text', description: 'text', tags: 'text', originalFilename: 'text' });

// Compound index for permission-aware queries
documentSchema.index({ ownerId: 1, 'acl.userId': 1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
