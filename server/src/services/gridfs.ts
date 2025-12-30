import mongoose from 'mongoose';
import { Readable } from 'stream';

type Bucket = mongoose.mongo.GridFSBucket;
type MongoObjectId = mongoose.mongo.ObjectId;

let bucket: Bucket;

// Initialize GridFS bucket after MongoDB connection
export const initGridFS = (): void => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection not established');
  }
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'documents'
  });
  console.log('✅ GridFS bucket initialized');
};

// Get the bucket instance
export const getGridFSBucket = (): Bucket => {
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
): Promise<MongoObjectId> => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      
      console.log('Starting GridFS upload for:', filename);
      console.log('File size:', fileBuffer.length);
      
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          ...metadata,
          uploadedAt: new Date()
        }
      });

      const readableStream = Readable.from(fileBuffer);
      
      readableStream.pipe(uploadStream)
        .on('error', (err) => {
          console.error('Upload stream error:', err);
          reject(err);
        })
        .on('finish', () => {
          console.log('GridFS upload complete. File ID:', uploadStream.id);
          resolve(uploadStream.id as MongoObjectId);
        });
    } catch (err) {
      console.error('GridFS upload error:', err);
      reject(err);
    }
  });
};

// Download file from GridFS
export const downloadFromGridFS = async (fileId: string | MongoObjectId): Promise<{
  stream: NodeJS.ReadableStream;
  file: any;
}> => {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.mongo.ObjectId(fileId) : fileId;
  
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
export const deleteFromGridFS = async (fileId: string | MongoObjectId): Promise<void> => {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.mongo.ObjectId(fileId) : fileId;
  await bucket.delete(objectId);
};

// Get file info from GridFS
export const getFileInfo = async (fileId: string | MongoObjectId): Promise<any | null> => {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.mongo.ObjectId(fileId) : fileId;
  
  const files = await bucket.find({ _id: objectId }).toArray();
  return files.length > 0 ? files[0] : null;
};

// List files by owner
export const listFilesByOwner = async (ownerId: string): Promise<any[]> => {
  const bucket = getGridFSBucket();
  return bucket.find({ 'metadata.uploadedBy': ownerId }).toArray();
};
