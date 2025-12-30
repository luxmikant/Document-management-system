import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { DocumentModel, Version, IDocument, AccessLevel } from '../models';
import { AuthRequest, requireAuth, upload, handleMulterError } from '../middleware';
import { config } from '../config';

const router = Router();

// Helper: Check if user can view document
const canView = (doc: IDocument, userId: string): boolean => {
  if (doc.ownerId.toString() === userId) return true;
  return doc.acl.some(p => p.userId.toString() === userId);
};

// Helper: Check if user can edit document
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
 * /api/documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The document file to upload (PDF, DOCX, PNG, JPEG, WEBP, GIF)
 *               title:
 *                 type: string
 *                 example: Q4 Report
 *               description:
 *                 type: string
 *                 example: Financial report for Q4 2024
 *               tags:
 *                 type: string
 *                 example: finance,important
 *                 description: Comma-separated tags or JSON array
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: No file provided or invalid file type
 *       413:
 *         description: File too large (max 10MB)
 *   get:
 *     summary: List all accessible documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (searches title, description, tags, filename)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
// POST /api/documents - Upload new document
router.post('/', requireAuth, upload.single('file'), handleMulterError, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'File is required', code: 'NO_FILE' });
      return;
    }

    const { title, description, tags } = req.body;
    
    // Parse tags (can be JSON array or comma-separated string)
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? 
          (tags.startsWith('[') ? JSON.parse(tags) : tags.split(',').map((t: string) => t.trim())) 
          : tags;
      } catch {
        parsedTags = tags.split(',').map((t: string) => t.trim());
      }
    }

    // Create document record
    const document = new DocumentModel({
      title: title || req.file.originalname,
      description: description || '',
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      ownerId: req.user!._id,
      tags: parsedTags.filter(t => t.length > 0),
      currentVersionNumber: 1,
      acl: []
    });

    await document.save();

    // Create initial version
    const version = new Version({
      documentId: document._id,
      versionNumber: 1,
      storageKey: req.file.filename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
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
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(path.join(config.uploadDir, req.file.filename), () => {});
    }
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', code: 'UPLOAD_ERROR' });
  }
});

// GET /api/documents - List/search documents
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, tags, page = '1', limit = '20' } = req.query;
    const userId = req.user!._id;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build query - user must own or have access
    const baseQuery: any = {
      isDeleted: false,
      $or: [
        { ownerId: userId },
        { 'acl.userId': userId }
      ]
    };

    // Text search
    if (q && typeof q === 'string' && q.trim()) {
      baseQuery.$text = { $search: q.trim() };
    }

    // Tag filter
    if (tags) {
      const tagList = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      baseQuery.tags = { $all: tagList };
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(baseQuery)
        .populate('ownerId', 'email firstName lastName')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DocumentModel.countDocuments(baseQuery)
    ]);

    // Add permission info to each document
    const docsWithAccess = documents.map(doc => ({
      ...doc,
      id: doc._id,
      isOwner: doc.ownerId._id?.toString() === userId.toString(),
      access: doc.ownerId._id?.toString() === userId.toString() 
        ? 'owner' 
        : doc.acl.find(p => p.userId.toString() === userId.toString())?.access || 'viewer'
    }));

    res.json({
      documents: docsWithAccess,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ message: 'Failed to list documents', code: 'LIST_ERROR' });
  }
});

// GET /api/documents/:id - Get document details
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id)
      .populate('ownerId', 'email firstName lastName')
      .populate('acl.userId', 'email firstName lastName');

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canView(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      return;
    }

    const versions = await Version.find({ documentId: document._id })
      .populate('uploadedBy', 'email firstName lastName')
      .sort({ versionNumber: -1 });

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
        isOwner: isOwner(document, req.user!._id.toString()),
        canEdit: canEdit(document, req.user!._id.toString()),
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      },
      versions
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Failed to get document', code: 'GET_ERROR' });
  }
});

// PUT /api/documents/:id - Update document metadata
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canEdit(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Edit access denied', code: 'FORBIDDEN' });
      return;
    }

    const { title, description, tags } = req.body;

    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (tags) {
      let parsedTags: string[] = [];
      try {
        parsedTags = typeof tags === 'string' ? 
          (tags.startsWith('[') ? JSON.parse(tags) : tags.split(',').map((t: string) => t.trim())) 
          : tags;
      } catch {
        parsedTags = tags.split(',').map((t: string) => t.trim());
      }
      document.tags = parsedTags.filter(t => t.length > 0);
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
    res.status(500).json({ message: 'Failed to update document', code: 'UPDATE_ERROR' });
  }
});

// POST /api/documents/:id/version - Upload new version
router.post('/:id/version', requireAuth, upload.single('file'), handleMulterError, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canEdit(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Edit access denied', code: 'FORBIDDEN' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'File is required', code: 'NO_FILE' });
      return;
    }

    const { changeLog } = req.body;

    // Increment version
    document.currentVersionNumber += 1;
    document.mimeType = req.file.mimetype;
    document.size = req.file.size;
    document.originalFilename = req.file.originalname;

    await document.save();

    // Create new version record
    const version = new Version({
      documentId: document._id,
      versionNumber: document.currentVersionNumber,
      storageKey: req.file.filename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user!._id,
      changeLog: changeLog || `Version ${document.currentVersionNumber}`
    });

    await version.save();

    res.status(201).json({
      message: 'New version uploaded',
      version: {
        id: version._id,
        versionNumber: version.versionNumber,
        originalFilename: version.originalFilename,
        size: version.size,
        createdAt: version.createdAt
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(path.join(config.uploadDir, req.file.filename), () => {});
    }
    console.error('Version upload error:', error);
    res.status(500).json({ message: 'Version upload failed', code: 'VERSION_ERROR' });
  }
});

// GET /api/documents/:id/versions - List document versions
router.get('/:id/versions', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canView(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      return;
    }

    const versions = await Version.find({ documentId: document._id })
      .populate('uploadedBy', 'email firstName lastName')
      .sort({ versionNumber: -1 });

    res.json({ versions });
  } catch (error) {
    console.error('List versions error:', error);
    res.status(500).json({ message: 'Failed to list versions', code: 'VERSIONS_ERROR' });
  }
});

// GET /api/documents/:id/download - Download latest version
router.get('/:id/download', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!canView(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      return;
    }

    const latestVersion = await Version.findOne({ 
      documentId: document._id, 
      versionNumber: document.currentVersionNumber 
    });

    if (!latestVersion) {
      res.status(404).json({ message: 'File not found', code: 'FILE_NOT_FOUND' });
      return;
    }

    const filePath = path.join(config.uploadDir, latestVersion.storageKey);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found on disk', code: 'FILE_MISSING' });
      return;
    }

    res.setHeader('Content-Type', latestVersion.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(latestVersion.originalFilename)}"`);
    res.setHeader('Content-Length', latestVersion.size);

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Download failed', code: 'DOWNLOAD_ERROR' });
  }
});

// DELETE /api/documents/:id - Soft delete document (owner only)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    // Only owner or admin can delete
    if (!isOwner(document, req.user!._id.toString()) && req.user!.role !== 'admin') {
      res.status(403).json({ message: 'Only owner can delete', code: 'FORBIDDEN' });
      return;
    }

    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save();

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Delete failed', code: 'DELETE_ERROR' });
  }
});

// === PERMISSIONS ROUTES ===

// GET /api/documents/:id/permissions - Get document permissions
router.get('/:id/permissions', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id)
      .populate('acl.userId', 'email firstName lastName');

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!isOwner(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Only owner can view permissions', code: 'FORBIDDEN' });
      return;
    }

    res.json({
      ownerId: document.ownerId,
      acl: document.acl
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Failed to get permissions', code: 'PERMISSIONS_ERROR' });
  }
});

// POST /api/documents/:id/permissions - Add permission
router.post('/:id/permissions', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, access } = req.body;

    if (!userId || !access) {
      res.status(400).json({ message: 'userId and access required', code: 'MISSING_FIELDS' });
      return;
    }

    if (!['viewer', 'editor'].includes(access)) {
      res.status(400).json({ message: 'Access must be viewer or editor', code: 'INVALID_ACCESS' });
      return;
    }

    const document = await DocumentModel.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!isOwner(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Only owner can manage permissions', code: 'FORBIDDEN' });
      return;
    }

    // Can't add owner to ACL
    if (document.ownerId.toString() === userId) {
      res.status(400).json({ message: 'Cannot add owner to ACL', code: 'OWNER_ACL' });
      return;
    }

    // Check if user already in ACL
    const existingIndex = document.acl.findIndex(p => p.userId.toString() === userId);
    
    if (existingIndex >= 0) {
      // Update existing permission
      document.acl[existingIndex].access = access as AccessLevel;
    } else {
      // Add new permission
      document.acl.push({
        userId: new mongoose.Types.ObjectId(userId),
        access: access as AccessLevel
      });
    }

    await document.save();

    // Return updated ACL
    const updatedDoc = await DocumentModel.findById(req.params.id)
      .populate('acl.userId', 'email firstName lastName');

    res.json({
      message: 'Permission added',
      acl: updatedDoc?.acl
    });
  } catch (error) {
    console.error('Add permission error:', error);
    res.status(500).json({ message: 'Failed to add permission', code: 'PERMISSION_ERROR' });
  }
});

// DELETE /api/documents/:id/permissions/:userId - Remove permission
router.delete('/:id/permissions/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404).json({ message: 'Document not found', code: 'NOT_FOUND' });
      return;
    }

    if (!isOwner(document, req.user!._id.toString())) {
      res.status(403).json({ message: 'Only owner can manage permissions', code: 'FORBIDDEN' });
      return;
    }

    const originalLength = document.acl.length;
    document.acl = document.acl.filter(p => p.userId.toString() !== req.params.userId);

    if (document.acl.length === originalLength) {
      res.status(404).json({ message: 'Permission not found', code: 'PERMISSION_NOT_FOUND' });
      return;
    }

    await document.save();

    res.json({ message: 'Permission removed' });
  } catch (error) {
    console.error('Remove permission error:', error);
    res.status(500).json({ message: 'Failed to remove permission', code: 'PERMISSION_ERROR' });
  }
});

export default router;
