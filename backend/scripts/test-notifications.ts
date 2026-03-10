import { PrismaClient } from '@prisma/client';
import { checkExpiringLeases } from '../src/lib/leaseService';

const prisma = new PrismaClient();

async function testNotifications() {
  console.log('--- Starting Notification Test ---');

  // 1. Get an agent and a tenant
  const agent = await prisma.user.findFirst({ where: { role: 'AGENT' } });
  const tenant = await prisma.user.findFirst({ where: { role: 'TENANT' } });
  const property = await prisma.property.findFirst();

  if (!agent || !tenant || !property) {
    console.error('Required test data (Agent, Tenant, or Property) missing.');
    return;
  }

  console.log(`Using Agent: ${agent.email}, Tenant: ${tenant.email}, Property: ${property.title}`);

  // 2. Create a contract expiring in exactly 30 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  
  const testContract = await prisma.contract.create({
    data: {
      propertyId: property.id,
      clientId: tenant.id,
      type: 'RENTAL',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: expiryDate,
      amount: 2000,
      commissionRate: 70,
      serviceFeeRate: 30
    }
  });

  console.log(`Created test contract ${testContract.id} expiring on ${expiryDate.toLocaleDateString()}`);

  // 3. Trigger the check
  console.log('Triggering lease expiry check...');
  await checkExpiringLeases();

  // 4. Verify notifications
  const agentNotifications = await prisma.notification.findMany({
    where: { userId: agent.id, type: 'LEASE_EXPIRING' },
    orderBy: { createdAt: 'desc' },
    take: 1
  });

  const tenantNotifications = await prisma.notification.findMany({
    where: { userId: tenant.id, type: 'LEASE_EXPIRING' },
    orderBy: { createdAt: 'desc' },
    take: 1
  });

  console.log('\n--- Results ---');
  if (agentNotifications.length > 0) {
    console.log('✅ Agent received notification:', agentNotifications[0].message);
  } else {
    console.log('❌ Agent notification NOT found.');
  }

  if (tenantNotifications.length > 0) {
    console.log('✅ Tenant received notification:', tenantNotifications[0].message);
  } else {
    console.log('❌ Tenant notification NOT found.');
  }

  // Cleanup (Optional)
  // await prisma.contract.delete({ where: { id: testContract.id } });
  
  console.log('--- Test Complete ---');
}

testNotifications()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
