import { Router } from 'express';
import { getFinancialSummary } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Only Account Managers and Admins
router.get('/financials', authenticate, authorize(['ADMIN', 'ACCOUNT_MANAGER']), getFinancialSummary);

export default router;
