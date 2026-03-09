import { Router } from 'express';
import { uploadVerificationDoc, getMyDocuments, verifyDocument } from '../controllers/verificationController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// User verification routes
router.post('/upload', authenticate, upload.single('document'), uploadVerificationDoc);
router.get('/my-docs', authenticate, getMyDocuments);

// Admin verification management
router.patch('/:id/verify', authenticate, authorize(['ADMIN']), verifyDocument);

export default router;
