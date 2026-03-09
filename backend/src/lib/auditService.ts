import prisma from './prisma';

export const createAuditLog = async (data: {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
}) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress
      }
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};
