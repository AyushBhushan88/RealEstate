import { Router } from 'express';
import { uploadPropertyMedia, deleteMedia } from '../controllers/mediaController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { uploadMedia } from '../middleware/uploadMiddleware';

const router = Router();

// Protected routes (Only Agents and Admins can manage property media)
router.post('/upload', authenticate, authorize(['AGENT', 'ADMIN']), uploadMedia, uploadPropertyMedia);
router.delete('/:id', authenticate, authorize(['AGENT', 'ADMIN']), deleteMedia);

export default router;
