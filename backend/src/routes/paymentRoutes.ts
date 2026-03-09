import express, { Router } from 'express';
import { createCheckoutSession, handleWebhook, getMyTransactions } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Webhook must be BEFORE any json body parser in index.ts if using top-level
// But here we can use express.raw for this specific route
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.post('/create-session', authenticate, createCheckoutSession);
router.get('/my-transactions', authenticate, getMyTransactions);

export default router;
