import { Router } from 'express';
import { 
  saveSearch, 
  getSavedSearches, 
  deleteSavedSearch, 
  toggleAlerts 
} from '../controllers/savedSearchController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All saved search routes require authentication
router.use(authenticate);

router.post('/', saveSearch);
router.get('/', getSavedSearches);
router.delete('/:id', deleteSavedSearch);
router.patch('/:id/alerts', toggleAlerts);

export default router;
