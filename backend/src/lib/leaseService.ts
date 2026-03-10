import prisma from './prisma';
import { createNotification, NotificationType } from './notificationService';

/**
 * Checks for contracts that are about to expire and sends notifications.
 * Thresholds: 90, 60, 30 days.
 */
export const checkExpiringLeases = async () => {
  const today = new Date();
  
  // Define notification thresholds in days
  const thresholds = [90, 60, 30, 7];

  for (const days of thresholds) {
    const targetDateStart = new Date();
    targetDateStart.setDate(today.getDate() + days);
    targetDateStart.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date();
    targetDateEnd.setDate(today.getDate() + days);
    targetDateEnd.setHours(23, 59, 59, 999);

    // Find contracts expiring on this specific target day
    const expiringContracts = await prisma.contract.findMany({
      where: {
        type: 'RENTAL',
        status: 'ACTIVE',
        endDate: {
          gte: targetDateStart,
          lte: targetDateEnd,
        },
      },
      include: {
        property: true,
        client: true,
      },
    });

    for (const contract of expiringContracts) {
      // Notify Agent
      await createNotification({
        userId: contract.property.agentId,
        type: NotificationType.LEASE_EXPIRING,
        title: 'Lease Expiring Soon',
        message: `The lease for "${contract.property.title}" expires in ${days} days (${contract.endDate?.toLocaleDateString()}). Client: ${contract.client.email}`,
        link: `/dashboard/contracts/${contract.id}`,
      });

      // Notify Tenant
      await createNotification({
        userId: contract.clientId,
        type: NotificationType.LEASE_EXPIRING,
        title: 'Lease Expiration Notice',
        message: `Your lease for "${contract.property.title}" is set to expire in ${days} days on ${contract.endDate?.toLocaleDateString()}. Please contact your agent for renewal options.`,
        link: `/dashboard/contracts/${contract.id}`,
      });
    }
  }
};

/**
 * Automatically updates status of expired contracts
 */
export const updateExpiredContracts = async () => {
  const today = new Date();

  const result = await prisma.contract.updateMany({
    where: {
      type: 'RENTAL',
      status: 'ACTIVE',
      endDate: {
        lt: today,
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  if (result.count > 0) {
    console.log(`Updated ${result.count} expired contracts to EXPIRED status.`);
  }
};
