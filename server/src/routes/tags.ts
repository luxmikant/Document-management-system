import { Router, Response } from 'express';
import { DocumentModel } from '../models';
import { AuthRequest, requireAuth } from '../middleware';

const router = Router();

// GET /api/tags - Get all unique tags (user's accessible documents)
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Aggregate unique tags from accessible documents
    const tags = await DocumentModel.aggregate([
      {
        $match: {
          isDeleted: false,
          $or: [
            { ownerId: userId },
            { 'acl.userId': userId }
          ]
        }
      },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      tags: tags.map(t => t._id)
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Failed to get tags', code: 'TAGS_ERROR' });
  }
});

export default router;
