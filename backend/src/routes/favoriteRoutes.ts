import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All favorite routes require authentication
router.use(authenticate);

router.post('/toggle', toggleFavorite);
router.get('/', getFavorites);

export default router;
