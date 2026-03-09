import prisma from './prisma';

export enum NotificationType {
  INQUIRY_NEW = 'INQUIRY_NEW',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  BOOKING_NEW = 'BOOKING_NEW',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
}

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type as any,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
