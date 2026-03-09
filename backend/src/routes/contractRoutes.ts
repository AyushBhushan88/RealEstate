import { Router } from 'express';
import { createContract, downloadContractPDF, getMyContracts, signContract } from '../controllers/contractController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getMyContracts);
router.post('/', authenticate, authorize(['AGENT', 'ADMIN']), createContract);
router.get('/:id/pdf', authenticate, downloadContractPDF);
router.post('/:id/sign', authenticate, signContract);

export default router;
