import { Router } from 'express';
import { 
  createProperty, 
  getProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty,
  recordPropertyView
} from '../controllers/propertyController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/:id/view', recordPropertyView);

// Protected routes (Only Agents and Admins can create/manage properties)
router.post('/', authenticate, authorize(['AGENT', 'ADMIN']), createProperty);
router.patch('/:id', authenticate, authorize(['AGENT', 'ADMIN']), updateProperty);
router.delete('/:id', authenticate, authorize(['AGENT', 'ADMIN']), deleteProperty);

export default router;
