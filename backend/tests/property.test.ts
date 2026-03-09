import request from 'supertest';
import app from '../src/index';
import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

// Mock Prisma
jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('Property Endpoints', () => {
  let agentToken: string;

  beforeAll(() => {
    agentToken = jwt.sign(
      { userId: 'agent-123', email: 'agent@test.com', role: 'AGENT' },
      JWT_SECRET
    );
  });

  describe('GET /api/properties', () => {
    it('should fetch active properties', async () => {
      const mockProperties = [
        { id: '1', title: 'Test Villa', status: 'ACTIVE', media: [] },
      ];
      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);

      const res = await request(app).get('/api/properties');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('title', 'Test Villa');
    });
  });

  describe('POST /api/properties', () => {
    it('should allow agent to create property', async () => {
      const propertyData = {
        title: 'New Luxury Villa',
        description: 'A beautiful luxury villa in the heart of the city.',
        price: 1500000,
        address: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
        type: 'HOUSE',
        listingType: 'SALE'
      };

      (prisma.property.create as jest.Mock).mockResolvedValue({
        id: 'prop-123',
        ...propertyData,
        agentId: 'agent-123'
      });

      const res = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(propertyData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id', 'prop-123');
    });

    it('should forbid non-agents from creating property', async () => {
      const buyerToken = jwt.sign(
        { userId: 'buyer-123', email: 'buyer@test.com', role: 'BUYER' },
        JWT_SECRET
      );

      const res = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({});

      expect(res.statusCode).toEqual(403);
    });
  });
});
