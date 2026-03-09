import { Router } from 'express';
import { createContract, downloadContractPDF, getMyContracts } from '../controllers/contractController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getMyContracts);
router.post('/', authenticate, authorize(['AGENT', 'ADMIN']), createContract);
router.get('/:id/pdf', authenticate, downloadContractPDF);

export default router;
