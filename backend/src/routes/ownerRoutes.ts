import { Router } from 'express';
import { getOwnerStats } from '../controllers/ownerController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Only Owners and Admins can access owner stats
router.get('/stats', authenticate, authorize(['OWNER', 'ADMIN']), getOwnerStats);

export default router;
