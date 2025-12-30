import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

let bucket: GridFSBucket;

// Initialize GridFS bucket after MongoDB connection
export const initGridFS = (): void => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection not established');
  }
  bucket = new GridFSBucket(db, {
    bucketName: 'documents'
  });
  console.log('✅ GridFS bucket initialized');
};

// Get the bucket instance
export const getGridFSBucket = (): GridFSBucket => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Call initGridFS first.');
  }
  return bucket;
};

// Upload file to GridFS
export const uploadToGridFS = async (
  fileBuffer: Buffer,
  filename: string,
  metadata: {
    originalFilename: string;
    mimeType: string;
    uploadedBy: string;
    documentId?: string;
    size: number;
  }
): Promise<ObjectId> => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: new Date()
      }
    });

    const readableStream = Readable.from(fileBuffer);
    
    readableStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id as ObjectId);
      });
  });
};

// Download file from GridFS
export const downloadFromGridFS = async (fileId: string | ObjectId): Promise<{
  stream: NodeJS.ReadableStream;
  file: any;
}> => {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  
  // Get file info
  const files = await bucket.find({ _id: objectId }).toArray();
  if (files.length === 0) {
    throw new Error('File not found in GridFS');
  }
  
  const file = files[0];
  const downloadStream = bucket.openDownloadStream(objectId);
  
  return { stream: downloadStream, file };
};

// Delete file from GridFS
export const deleteFromGridFS = async (fileId: string | ObjectId): Promise<void> => {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  await bucket.delete(objectId);
};

// Get file info from GridFS
export const getFileInfo = async (fileId: string | ObjectId): Promise<any | null> => {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  
  const files = await bucket.find({ _id: objectId }).toArray();
  return files.length > 0 ? files[0] : null;
};

// List files by owner
export const listFilesByOwner = async (ownerId: string): Promise<any[]> => {
  const bucket = getGridFSBucket();
  return bucket.find({ 'metadata.uploadedBy': ownerId }).toArray();
};
