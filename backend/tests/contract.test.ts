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
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    contract: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    }
  },
}));

describe('Contract Endpoints', () => {
  let agentToken: string;
  let clientToken: string;

  beforeAll(() => {
    agentToken = jwt.sign(
      { userId: 'agent-123', email: 'agent@test.com', role: 'AGENT' },
      JWT_SECRET
    );
    clientToken = jwt.sign(
      { userId: 'client-456', email: 'client@test.com', role: 'BUYER' },
      JWT_SECRET
    );
  });

  describe('POST /api/contracts', () => {
    it('should allow agent to create a contract', async () => {
      const contractData = {
        propertyId: 'prop-123',
        clientId: 'client-456',
        type: 'RENTAL',
        startDate: '2026-04-01',
        endDate: '2027-04-01',
        amount: 2500
      };

      (prisma.property.findUnique as jest.Mock).mockResolvedValue({
        id: 'prop-123',
        agentId: 'agent-123',
        agent: { profile: { firstName: 'Agent', lastName: 'User' } }
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'client-456',
        email: 'client@test.com',
        profile: { firstName: 'Client', lastName: 'User' }
      });

      (prisma.contract.create as jest.Mock).mockResolvedValue({
        id: 'cont-123',
        ...contractData,
        status: 'DRAFT'
      });

      const res = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(contractData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id', 'cont-123');
      expect(res.body.status).toEqual('DRAFT');
    });
  });

  describe('POST /api/contracts/:id/sign', () => {
    it('should allow client to sign a contract', async () => {
      const mockContract = {
        id: 'cont-123',
        clientId: 'client-456',
        status: 'DRAFT',
        property: { agentId: 'agent-123', title: 'Test Property' },
        client: { profile: { firstName: 'Client' } }
      };

      (prisma.contract.findUnique as jest.Mock).mockResolvedValue(mockContract);
      (prisma.contract.update as jest.Mock).mockResolvedValue({
        ...mockContract,
        status: 'SIGNED'
      });

      const res = await request(app)
        .post('/api/contracts/cont-123/sign')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ signature: 'Client User' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.contract.status).toEqual('SIGNED');
    });

    it('should fail if signature is missing', async () => {
      const res = await request(app)
        .post('/api/contracts/cont-123/sign')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({});

      expect(res.statusCode).toEqual(400);
    });
  });
});
