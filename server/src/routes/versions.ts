import { Router, Response } from 'express';
import { Version, DocumentModel } from '../models';
import { AuthRequest, requireAuth } from '../middleware';
import { downloadFromGridFS } from '../services';

const router = Router();

// Helper: Check if user can view document
const canViewDoc = async (documentId: string, userId: string): Promise<boolean> => {
  const doc = await DocumentModel.findById(documentId);
  if (!doc) return false;
  if (doc.ownerId.toString() === userId) return true;
  return doc.acl.some(p => p.userId.toString() === userId);
};

// GET /api/versions/:versionId - Get version details
router.get('/:versionId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const version = await Version.findById(req.params.versionId)
      .populate('uploadedBy', 'email firstName lastName');

    if (!version) {
      res.status(404).json({ message: 'Version not found', code: 'NOT_FOUND' });
      return;
    }

    if (!(await canViewDoc(version.documentId.toString(), req.user!._id.toString()))) {
      res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      return;
    }

    res.json({ version });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ message: 'Failed to get version', code: 'VERSION_ERROR' });
  }
});

// GET /api/versions/:versionId/download - Download specific version
router.get('/:versionId/download', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const version = await Version.findById(req.params.versionId);

    if (!version) {
      res.status(404).json({ message: 'Version not found', code: 'NOT_FOUND' });
      return;
    }

    if (!(await canViewDoc(version.documentId.toString(), req.user!._id.toString()))) {
      res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      return;
    }

    const { stream, file } = await downloadFromGridFS(version.gridfsFileId);

    res.setHeader('Content-Type', version.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(version.originalFilename)}"`);
    if (file.length) {
      res.setHeader('Content-Length', file.length);
    }

    stream.pipe(res);
  } catch (error) {
    console.error('Download version error:', error);
    res.status(500).json({ message: 'Download failed', code: 'DOWNLOAD_ERROR' });
  }
});

export default router;
