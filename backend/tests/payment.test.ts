import request from 'supertest';
import app from '../src/index';
import prisma from '../src/lib/prisma';
import stripe from '../src/lib/stripe';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

// Mock Prisma
jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    contract: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    }
  },
}));

// Mock Stripe
jest.mock('../src/lib/stripe', () => ({
  __esModule: true,
  default: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

describe('Payment Endpoints', () => {
  let userToken: string;

  beforeAll(() => {
    userToken = jwt.sign(
      { userId: 'user-123', email: 'user@test.com', role: 'BUYER' },
      JWT_SECRET
    );
  });

  describe('POST /api/payments/create-session', () => {
    it('should create a Stripe checkout session', async () => {
      const mockContract = {
        id: 'cont-123',
        amount: 2500,
        property: { title: 'Test Property' },
        client: { email: 'user@test.com' }
      };

      (prisma.contract.findUnique as jest.Mock).mockResolvedValue(mockContract);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        id: 'sess_123',
        url: 'https://checkout.stripe.com/test'
      });

      const res = await request(app)
        .post('/api/payments/create-session')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ contractId: 'cont-123', type: 'DEPOSIT' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', 'sess_123');
      expect(res.body).toHaveProperty('url');
    });

    it('should fail if contract not found', async () => {
      (prisma.contract.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/payments/create-session')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ contractId: 'invalid', type: 'DEPOSIT' });

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('GET /api/payments/my-transactions', () => {
    it('should fetch user transactions', async () => {
      const mockTransactions = [
        { id: 'trans-1', amount: 2500, status: 'COMPLETED', contract: { property: { title: 'Test' } } }
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const res = await request(app)
        .get('/api/payments/my-transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('id', 'trans-1');
    });
  });
});
