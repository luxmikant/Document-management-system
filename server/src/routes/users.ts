import { Router, Response } from 'express';
import { User } from '../models';
import { AuthRequest, requireAuth, requireRole } from '../middleware';

const router = Router();

// GET /api/users - List all users (admin only, for permission assignment)
router.get('/', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, 'email firstName lastName role createdAt').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Failed to list users', code: 'LIST_USERS_ERROR' });
  }
});

// GET /api/users/search - Search users by email (for permission assignment)
router.get('/search', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'Email query required', code: 'MISSING_QUERY' });
      return;
    }

    const users = await User.find(
      { email: { $regex: email, $options: 'i' } },
      'email firstName lastName'
    ).limit(10);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users', code: 'SEARCH_USERS_ERROR' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id, 'email firstName lastName role createdAt');
    
    if (!user) {
      res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user', code: 'GET_USER_ERROR' });
  }
});

export default router;
