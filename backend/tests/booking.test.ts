import request from 'supertest';
import app from '../src/index';
import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

// Mock Prisma
jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

describe('Booking Endpoints', () => {
  let buyerToken: string;
  let agentToken: string;

  beforeAll(() => {
    buyerToken = jwt.sign(
      { userId: 'buyer-123', email: 'buyer@test.com', role: 'BUYER' },
      JWT_SECRET
    );
    agentToken = jwt.sign(
      { userId: 'agent-123', email: 'agent@test.com', role: 'AGENT' },
      JWT_SECRET
    );
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking request', async () => {
      const bookingData = {
        propertyId: 'prop-123',
        dateTime: '2026-04-15T14:30:00.000Z',
        notes: 'I would like to see the kitchen specifically.'
      };

      (prisma.property.findUnique as jest.Mock).mockResolvedValue({
        id: 'prop-123',
        agentId: 'agent-123',
        title: 'Luxury Apartment'
      });

      (prisma.booking.create as jest.Mock).mockResolvedValue({
        id: 'book-123',
        ...bookingData,
        userId: 'buyer-123',
        agentId: 'agent-123',
        status: 'PENDING'
      });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(bookingData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id', 'book-123');
      expect(res.body).toHaveProperty('status', 'PENDING');
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should fail if propertyId is missing', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ dateTime: '2026-04-15T14:30:00.000Z' });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/bookings', () => {
    it('should fetch user bookings', async () => {
      const mockBookings = [
        { id: '1', property: { title: 'Test Villa' }, status: 'PENDING' },
      ];
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('status', 'PENDING');
    });
  });

  describe('PATCH /api/bookings/:id/status', () => {
    it('should allow agent to confirm booking', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: 'book-123',
        agentId: 'agent-123',
        userId: 'buyer-123',
        property: { title: 'Luxury Apartment' }
      });

      (prisma.booking.update as jest.Mock).mockResolvedValue({
        id: 'book-123',
        status: 'CONFIRMED'
      });

      const res = await request(app)
        .patch('/api/bookings/book-123/status')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'CONFIRMED');
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should forbid non-assigned agents from confirming', async () => {
      const otherAgentToken = jwt.sign(
        { userId: 'agent-456', email: 'other@agent.com', role: 'AGENT' },
        JWT_SECRET
      );

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: 'book-123',
        agentId: 'agent-123',
        userId: 'buyer-123'
      });

      const res = await request(app)
        .patch('/api/bookings/book-123/status')
        .set('Authorization', `Bearer ${otherAgentToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.statusCode).toEqual(403);
    });
  });
});
