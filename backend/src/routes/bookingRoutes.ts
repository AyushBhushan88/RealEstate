import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { createBooking, getMyBookings, updateBookingStatus } from '../controllers/bookingController';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.patch('/:id/status', updateBookingStatus);

export default router;
