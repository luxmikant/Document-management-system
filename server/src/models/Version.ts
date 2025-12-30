import mongoose, { Document, Schema } from 'mongoose';

export interface IVersion extends Document {
  _id: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  versionNumber: number;
  gridfsFileId: mongoose.Types.ObjectId; // GridFS file ID
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  changeLog: string;
  createdAt: Date;
}

const versionSchema = new Schema<IVersion>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    gridfsFileId: {
      type: Schema.Types.ObjectId,
      required: true
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
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changeLog: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for efficient version lookups
versionSchema.index({ documentId: 1, versionNumber: -1 });

export const Version = mongoose.model<IVersion>('Version', versionSchema);
