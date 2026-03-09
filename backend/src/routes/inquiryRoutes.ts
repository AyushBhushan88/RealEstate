import { Router } from 'express';
import { createInquiry, getAgentInquiries, updateInquiryStatus } from '../controllers/inquiryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Optional auth for submitting an inquiry
router.post('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    authenticate(req, res, next);
  } else {
    next();
  }
}, createInquiry);

// Agent specific routes
router.get('/my-leads', authenticate, authorize(['AGENT', 'ADMIN']), getAgentInquiries);
router.patch('/:id/status', authenticate, authorize(['AGENT', 'ADMIN']), updateInquiryStatus);

export default router;
