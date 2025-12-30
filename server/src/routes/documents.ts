import { Router, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { DocumentModel, Version, IDocument, AccessLevel } from '../models';
import { AuthRequest, requireAuth } from '../middleware';
import { config } from '../config';
import { uploadToGridFS, downloadFromGridFS, deleteFromGridFS } from '../services';

const router = Router();

// Configure multer for memory storage (files go to GridFS, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize, // 10MB
    files: 5 // Max 5 files at once
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Helper: Check if user can view document (owner OR has ACL entry)
const canView = (doc: IDocument, userId: string): boolean => {
  if (doc.ownerId.toString() === userId) return true;
  return doc.acl.some(p => p.userId.toString() === userId);
};

// Helper: Check if user can edit document (owner OR editor in ACL)
const canEdit = (doc: IDocument, userId: string): boolean => {
  if (doc.ownerId.toString() === userId) return true;
  return doc.acl.some(p => p.userId.toString() === userId && p.access === 'editor');
};

// Helper: Check if user is owner
const isOwner = (doc: IDocument, userId: string): boolean => {
  return doc.ownerId.toString() === userId;
};

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload up to 5 documents at once (stored in GridFS)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
// POST /api/documents/upload - Upload multiple files (max 5)
router.post('/upload', requireAuth, upload.array('files', 5), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Upload request received');
    console.log('User ID:', req.user?._id);
    console.log('Files count:', req.files?.length);
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      console.log('No files provided');
      res.status(400).json({ message: 'At least one file is required', code: 'NO_FILE' });
      return;
    }

    if (files.length > 5) {
      res.status(400).json({ message: 'Maximum 5 files allowed at once', code: 'TOO_MANY_FILES' });
      return;
    }

    const { tags } = req.body;
    const userId = req.user!._id;
    
    console.log('Tags received:', tags);
    
    // Parse tags
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' 
          ? (tags.startsWith('[') ? JSON.parse(tags) : tags.split(',').map((t: string) => t.trim()))
          : (Array.isArray(tags) ? tags : [tags]);
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [tags];
      }
    }
    
    parsedTags = parsedTags.filter(t => t && t.length > 0);

    const uploadedDocs = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileTitle = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension for title

      try {
        console.log(`Processing file ${i + 1}/${files.length}: ${file.originalname}`);
        
        // Upload file to GridFS
        const gridfsFileId = await uploadToGridFS(
          file.buffer,
          `${Date.now()}-${i}-${file.originalname}`,
          {
            originalFilename: file.originalname,
            mimeType: file.mimetype,
            uploadedBy: userId.toString(),
            size: file.size
          }
        );

        console.log(`GridFS upload complete. File ID:`, gridfsFileId);

        // Create document record
        const document = new DocumentModel({
          title: fileTitle,
          description: '',
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          ownerId: userId,
          tags: parsedTags,
          currentVersionNumber: 1,
          acl: [],
          isDeleted: false
        });

        await document.save();
        console.log(`Document saved with ID:`, document._id);

        // Create initial version
        const version = new Version({
          documentId: document._id,
          versionNumber: 1,
          gridfsFileId: gridfsFileId,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          uploadedBy: userId,
          changeLog: 'Initial upload'
        });

        await version.save();
        console.log(`Version saved`);

        uploadedDocs.push({
          id: document._id,
          title: document.title,
          originalFilename: document.originalFilename,
          mimeType: document.mimeType,
          size: document.size,
          tags: document.tags,
          createdAt: document.createdAt
        });
      } catch (fileError: any) {
        console.error(`Error uploading file ${file.originalname}:`, fileError.message);
        // Continue with next file
      }
    }

    if (uploadedDocs.length === 0) {
      console.log('No files were successfully uploaded');
      res.status(500).json({ message: 'Failed to upload any files', code: 'UPLOAD_ERROR' });
      return;
    }

    console.log(`Successfully uploaded ${uploadedDocs.length} documents`);
    res.status(201).json({
      message: `${uploadedDocs.length} document(s) uploaded successfully`,
      documents: uploadedDocs
    });
  } catch (error: any) {
    console.error('Upload error:', error.message, error.stack);
    res.status(500).json({ message: error.message || 'Upload failed', code: 'UPLOAD_ERROR' });
  }
});

// POST /api/documents - Single file upload (backward compatible)
router.post('/', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ message: 'File is required', code: 'NO_FILE' });
      return;
    }

    const { title, description, tags } = req.body;
    
    // Parse tags
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' 
          ? (tags.startsWith('[') ? JSON.parse(tags) : tags.split(',').map((t: string) => t.trim()))
          : tags;
      } catch {
        parsedTags = tags.split(',').map((t: string) => t.trim());
      }
    }

    // Upload file to GridFS
    const gridfsFileId = await uploadToGridFS(
      file.buffer,
      `${Date.now()}-${file.originalname}`,
      {
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        uploadedBy: req.user!._id.toString(),
        size: file.size
      }
    );

    // Create document record
    const document = new DocumentModel({
      title: title || file.originalname,
      description: description || '',
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      ownerId: req.user!._id,
      tags: parsedTags.filter(t => t.length > 0),
      currentVersionNumber: 1,
      acl: [],
      isDeleted: false
    });

    await document.save();

    // Create initial version
    const version = new Version({
      documentId: document._id,
      versionNumber: 1,
      gridfsFileId: gridfsFileId,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user!._id,
      changeLog: 'Initial upload'
    });

    await version.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        title: document.title,
        description: document.description,
        originalFilename: document.originalFilename,
        mimeType: document.mimeType,
        size: document.size,
        tags: document.tags,
        currentVersionNumber: document.currentVersionNumber,
        createdAt: document.createdAt
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Upload failed', code: 'UPLOAD_ERROR' });
  }
});

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: List documents owned by current user only
 *     tags: [Documents]
 */
// GET /api/documents - List user's own documents ONLY (ownership segregation)
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, tags, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
    const userId = req.user!._id;

    // Build query - ONLY show user's own documents
    const query: any = {
      ownerId: userId,
      isDeleted: { $ne: true }
    };

    // Search by name/title
    if (q && typeof q === 'string') {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { originalFilename: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Filter by tags
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      if (tagList.length > 0) {
        query.tags = { $in: tagList };
      }
    }

    // Sorting
    const sortField = ['size', 'createdAt', 'title', 'updatedAt'].includes(sortBy as string) 
      ? sortBy as string 
      : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .populate('ownerId', 'firstName lastName email')
        .lean(),
      DocumentModel.countDocuments(query)
    ]);

    res.json({
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        description: doc.description,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        size: doc.size,
        tags: doc.tags,
        currentVersionNumber: doc.currentVersionNumber,
        owner: doc.ownerId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ message: 'Failed to list documents', code: 'LIST_ERROR' });
  }
});

/**
 * @swagger
 * /api/documents/dashboard:
 *   get:
 *     summary: Get dashboard data (top 5 recent files, size stats)
 *     tags: [Documents]
 */
// GET /api/documents/dashboard - Dashboard with top 5 recent, size grouping
router.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Top 5 recently uploaded
    const recentFiles = await DocumentModel.find({
      ownerId: userId,
      isDeleted: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Size statistics
    const sizeStats = await DocumentModel.aggregate([
      { $match: { ownerId: userId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' },
          maxSize: { $max: '$size' },
          minSize: { $min: '$size' },
          totalFiles: { $sum: 1 }
        }
      }
    ]);

    // Group by size ranges
    const sizeGroups = await DocumentModel.aggregate([
      { $match: { ownerId: userId, isDeleted: { $ne: true } } },
      {
        $bucket: {
          groupBy: '$size',
          boundaries: [0, 102400, 1048576, 5242880, 10485760, Infinity], // 0, 100KB, 1MB, 5MB, 10MB
          default: 'Large',
          output: {
            count: { $sum: 1 },
            files: { $push: { title: '$title', size: '$size' } }
          }
        }
      }
    ]);

    // Group by file type
    const typeGroups = await DocumentModel.aggregate([
      { $match: { ownerId: userId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$mimeType',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Group by tags
    const tagGroups = await DocumentModel.aggregate([
      { $match: { ownerId: userId, isDeleted: { $ne: true } } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const stats = sizeStats[0] || {
      totalSize: 0,
      avgSize: 0,
      maxSize: 0,
      minSize: 0,
      totalFiles: 0
    };

    res.json({
      recentDocuments: recentFiles.map(doc => ({
        id: doc._id,
        title: doc.title,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        size: doc.size,
        tags: doc.tags,
        createdAt: doc.createdAt,
        currentVersionNumber: doc.currentVersionNumber
      })),
      stats: {
        totalDocuments: stats.totalFiles || 0,
        totalSize: stats.totalSize || 0,
        avgSize: stats.avgSize || 0
      },
      sizeGroups: sizeGroups.map(g => ({
        _id: g._id,
        label: g._id === 0 ? '0-100KB' :
               g._id === 102400 ? '100KB-1MB' :
               g._id === 1048576 ? '1MB-5MB' :
               g._id === 5242880 ? '5MB-10MB' : '10MB+',
        count: g.count,
        totalSize: g.files?.reduce((sum: number, f: any) => sum + (f.size || 0), 0) || 0
      })),
      typeGroups: typeGroups.map(g => ({
        _id: g._id,
        count: g.count,
        totalSize: g.totalSize
      })),
      topTags: tagGroups.map(g => ({
        _id: g._id,
        count: g.count
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to get dashboard data', code: 'DASHBOARD_ERROR' });
  }
});

// GET /api/documents/shared - Documents shared with me
router.get('/shared', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { page = 1, limit = 20 } = req.query;

    const query = {
      'acl.userId': userId,
      isDeleted: { $ne: true }
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('ownerId', 'firstName lastName email')
        .lean(),
      DocumentModel.countDocuments(query)
    ]);

    res.json({
      documents: documents.map(doc => {
        const userAccess = doc.acl.find(p => p.userId.toString() === userId.toString());
        return {
          id: doc._id,
          title: doc.title,
          originalFilename: doc.originalFilename,
          mimeType: doc.mimeType,
          size: doc.size,
          tags: doc.tags,
          owner: doc.ownerId,
          myAccess: userAccess?.access || 'viewer',
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        };
      }),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Shared documents error:', error);
    res.status(500).json({ message: 'Failed to list shared documents', code: 'SHARED_ERROR' });
  }
});

// GET /api/documents/:id - Get document details
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid document ID', code: 'INVALID_ID' });
      return;
    }

    const document = await DocumentModel.findById(id)
      .populate('ownerId', 'firstName lastName email')
      .populate('acl.userId', 'firstName lastName email');

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canView(document, userId)) {
      res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      return;
    }

    // Get versions
    const versions = await Version.find({ documentId: id })
      .sort({ versionNumber: -1 })
      .populate('uploadedBy', 'firstName lastName email')
      .lean();

    res.json({
      document: {
        id: document._id,
        title: document.title,
        description: document.description,
        originalFilename: document.originalFilename,
        mimeType: document.mimeType,
        size: document.size,
        tags: document.tags,
        currentVersionNumber: document.currentVersionNumber,
        owner: document.ownerId,
        acl: document.acl,
        isOwner: isOwner(document, userId),
        canEdit: canEdit(document, userId),
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      },
      versions: versions.map(v => ({
        id: v._id,
        versionNumber: v.versionNumber,
        originalFilename: v.originalFilename,
        mimeType: v.mimeType,
        size: v.size,
        uploadedBy: v.uploadedBy,
        changeLog: v.changeLog,
        createdAt: v.createdAt
      }))
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Failed to get document', code: 'GET_ERROR' });
  }
});

// GET /api/documents/:id/download - Download document from GridFS
router.get('/:id/download', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { version, preview } = req.query;
    const userId = req.user!._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid document ID', code: 'INVALID_ID' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canView(document, userId)) {
      res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      return;
    }

    // Get specific version or latest
    const versionQuery: any = { documentId: id };
    if (version) {
      versionQuery.versionNumber = Number(version);
    }

    const versionDoc = await Version.findOne(versionQuery)
      .sort({ versionNumber: -1 });

    if (!versionDoc) {
      res.status(404).json({ message: 'Version not found', code: 'VERSION_NOT_FOUND' });
      return;
    }

    // Download from GridFS
    const { stream, file } = await downloadFromGridFS(versionDoc.gridfsFileId);

    res.set({
      'Content-Type': versionDoc.mimeType,
      'Content-Disposition': `${preview ? 'inline' : 'attachment'}; filename="${encodeURIComponent(versionDoc.originalFilename)}"`
    });
    if (file.length) {
      res.setHeader('Content-Length', file.length);
    }

    stream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Download failed', code: 'DOWNLOAD_ERROR' });
  }
});

// POST /api/documents/:id/version - Upload new version
router.post('/:id/version', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'File is required', code: 'NO_FILE' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid document ID', code: 'INVALID_ID' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canEdit(document, userId)) {
      res.status(403).json({ message: 'Edit access required', code: 'FORBIDDEN' });
      return;
    }

    const { changeLog } = req.body;
    const newVersionNumber = document.currentVersionNumber + 1;

    // Upload to GridFS
    const gridfsFileId = await uploadToGridFS(
      file.buffer,
      `${Date.now()}-v${newVersionNumber}-${file.originalname}`,
      {
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        uploadedBy: userId,
        documentId: id,
        size: file.size
      }
    );

    // Create version record
    const version = new Version({
      documentId: id,
      versionNumber: newVersionNumber,
      gridfsFileId: gridfsFileId,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user!._id,
      changeLog: changeLog || `Version ${newVersionNumber}`
    });

    await version.save();

    // Update document
    document.currentVersionNumber = newVersionNumber;
    document.mimeType = file.mimetype;
    document.size = file.size;
    document.originalFilename = file.originalname;
    await document.save();

    res.status(201).json({
      message: 'New version uploaded',
      version: {
        id: version._id,
        versionNumber: version.versionNumber,
        originalFilename: version.originalFilename,
        size: version.size,
        changeLog: version.changeLog,
        createdAt: version.createdAt
      }
    });
  } catch (error) {
    console.error('Version upload error:', error);
    res.status(500).json({ message: 'Version upload failed', code: 'VERSION_UPLOAD_ERROR' });
  }
});

// PUT /api/documents/:id - Update document metadata
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const { title, description, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid document ID', code: 'INVALID_ID' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canEdit(document, userId)) {
      res.status(403).json({ message: 'Edit access required', code: 'FORBIDDEN' });
      return;
    }

    // Update fields
    if (title !== undefined) document.title = title;
    if (description !== undefined) document.description = description;
    if (tags !== undefined) {
      const parsedTags = typeof tags === 'string'
        ? (tags.startsWith('[') ? JSON.parse(tags) : tags.split(',').map((t: string) => t.trim()))
        : tags;
      document.tags = parsedTags.filter((t: string) => t.length > 0);
    }

    await document.save();

    res.json({
      message: 'Document updated',
      document: {
        id: document._id,
        title: document.title,
        description: document.description,
        tags: document.tags,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Update failed', code: 'UPDATE_ERROR' });
  }
});

// DELETE /api/documents/:id - Soft delete document
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid document ID', code: 'INVALID_ID' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    // Only owner can delete
    if (!isOwner(document, userId)) {
      res.status(403).json({ message: 'Only owner can delete', code: 'FORBIDDEN' });
      return;
    }

    // Soft delete
    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save();

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Delete failed', code: 'DELETE_ERROR' });
  }
});

// POST /api/documents/:id/permissions - Add permission
router.post('/:id/permissions', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const { userId: targetUserId, access } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      res.status(400).json({ message: 'Invalid ID', code: 'INVALID_ID' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    // Only owner can manage permissions
    if (!isOwner(document, userId)) {
      res.status(403).json({ message: 'Only owner can manage permissions', code: 'FORBIDDEN' });
      return;
    }

    // Check if already has permission
    const existingIndex = document.acl.findIndex(p => p.userId.toString() === targetUserId);
    if (existingIndex >= 0) {
      document.acl[existingIndex].access = access as AccessLevel;
    } else {
      document.acl.push({
        userId: new mongoose.Types.ObjectId(targetUserId),
        access: access as AccessLevel
      });
    }

    await document.save();

    res.json({
      message: 'Permission updated',
      acl: document.acl
    });
  } catch (error) {
    console.error('Add permission error:', error);
    res.status(500).json({ message: 'Failed to update permission', code: 'PERMISSION_ERROR' });
  }
});

// DELETE /api/documents/:id/permissions/:userId - Remove permission
router.delete('/:id/permissions/:targetUserId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, targetUserId } = req.params;
    const userId = req.user!._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      res.status(400).json({ message: 'Invalid ID', code: 'INVALID_ID' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!isOwner(document, userId)) {
      res.status(403).json({ message: 'Only owner can manage permissions', code: 'FORBIDDEN' });
      return;
    }

    document.acl = document.acl.filter(p => p.userId.toString() !== targetUserId);
    await document.save();

    res.json({
      message: 'Permission removed',
      acl: document.acl
    });
  } catch (error) {
    console.error('Remove permission error:', error);
    res.status(500).json({ message: 'Failed to remove permission', code: 'PERMISSION_ERROR' });
  }
});

export default router;
