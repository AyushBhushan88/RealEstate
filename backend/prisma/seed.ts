import { PrismaClient, UserRole, PropertyType, ListingType, ListingStatus, TransactionType, TransactionStatus, ContractStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Real Estate Management System ---');

  // Clean the database
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.media.deleteMany();
  await prisma.property.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('password123', salt);

  // 1. Create Users
  console.log('Creating users...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rems.com',
      password: commonPassword,
      role: 'ADMIN',
      profile: { create: { firstName: 'System', lastName: 'Admin' } }
    }
  });

  const agent = await prisma.user.create({
    data: {
      email: 'agent@rems.com',
      password: commonPassword,
      role: 'AGENT',
      profile: { create: { firstName: 'Sarah', lastName: 'Agent', phoneNumber: '555-0101' } }
    }
  });

  const owner = await prisma.user.create({
    data: {
      email: 'owner@rems.com',
      password: commonPassword,
      role: 'OWNER',
      profile: { create: { firstName: 'Robert', lastName: 'Owner', phoneNumber: '555-0202' } }
    }
  });

  const tenant = await prisma.user.create({
    data: {
      email: 'tenant@rems.com',
      password: commonPassword,
      role: 'TENANT',
      profile: { create: { firstName: 'James', lastName: 'Tenant', phoneNumber: '555-0303' } }
    }
  });

  const accManager = await prisma.user.create({
    data: {
      email: 'finance@rems.com',
      password: commonPassword,
      role: 'ACCOUNT_MANAGER',
      profile: { create: { firstName: 'Linda', lastName: 'Finance' } }
    }
  });

  // 2. Create Properties
  console.log('Creating properties...');

  const prop1 = await prisma.property.create({
    data: {
      title: 'Modern Downtown Apartment',
      description: 'Luxurious 2-bedroom apartment with city views and premium amenities.',
      price: 2500,
      address: '456 Skyline Ave',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
      type: 'APARTMENT',
      listingType: 'RENTAL',
      status: 'ACTIVE',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      yearBuilt: 2022,
      agentId: agent.id,
      ownerId: owner.id,
      views: 145,
      media: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', isMain: true },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', isMain: false }
        ]
      }
    }
  });

  const prop2 = await prisma.property.create({
    data: {
      title: 'Suburban Family Home',
      description: 'Spacious 4-bedroom house with a large backyard and modern kitchen.',
      price: 850000,
      address: '789 Oak Lane',
      city: 'Greenwich',
      state: 'CT',
      zipCode: '06830',
      type: 'HOUSE',
      listingType: 'SALE',
      status: 'ACTIVE',
      bedrooms: 4,
      bathrooms: 3.5,
      squareFeet: 3200,
      yearBuilt: 2015,
      agentId: agent.id,
      ownerId: owner.id,
      views: 89,
      media: {
        create: [
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', isMain: true }
        ]
      }
    }
  });

  // 3. Create Interactions
  console.log('Creating inquiries and contracts...');

  await prisma.inquiry.create({
    data: {
      propertyId: prop1.id,
      userId: tenant.id,
      name: 'James Tenant',
      email: 'tenant@rems.com',
      message: 'I am interested in viewing this apartment next Tuesday.',
      status: 'CONTACTED'
    }
  });

  const contract = await prisma.contract.create({
    data: {
      propertyId: prop1.id,
      clientId: tenant.id,
      type: 'RENTAL',
      status: 'ACTIVE',
      amount: 2500,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-04-01'),
      signedAt: new Date()
    }
  });

  // 4. Create Transactions (Simulation of Phase 3 Split)
  console.log('Creating transactions and commission splits...');

  const mainTx = await prisma.transaction.create({
    data: {
      contractId: contract.id,
      userId: tenant.id, // Payer
      amount: 2500,
      type: 'RENT',
      status: 'COMPLETED',
      stripeId: 'ch_fake_123',
      paymentMethod: 'card'
    }
  });

  // Commission split: 70% to Agent, 30% to Agency Fee
  await prisma.transaction.create({
    data: {
      contractId: contract.id,
      userId: tenant.id,
      recipientId: agent.id,
      amount: 1750, // 70% of 2500
      type: 'COMMISSION',
      status: 'COMPLETED',
      parentId: mainTx.id,
      metadata: { split: '70%', role: 'AGENT' }
    }
  });

  await prisma.transaction.create({
    data: {
      contractId: contract.id,
      userId: tenant.id,
      amount: 750, // 30% of 2500
      type: 'FEE',
      status: 'COMPLETED',
      parentId: mainTx.id,
      metadata: { split: '30%', role: 'AGENCY' }
    }
  });

  // 5. Create Audit Logs
  console.log('Logging system actions...');
  await prisma.auditLog.create({
    data: {
      userId: tenant.id,
      action: 'CONTRACT_SIGNED',
      entity: 'Contract',
      entityId: contract.id,
      details: { signature: 'James Tenant' }
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: tenant.id,
      action: 'PAYMENT_COMPLETED',
      entity: 'Transaction',
      entityId: mainTx.id,
      details: { amount: 2500, type: 'RENT' }
    }
  });

  console.log('--- Seed Completed Successfully! ---');
  console.log('Demo Users (Password: password123):');
  console.log('- Admin: admin@rems.com');
  console.log('- Agent: agent@rems.com');
  console.log('- Owner: owner@rems.com');
  console.log('- Tenant: tenant@rems.com');
  console.log('- Manager: finance@rems.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
