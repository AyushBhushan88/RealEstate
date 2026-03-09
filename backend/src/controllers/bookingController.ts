import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createNotification, NotificationType } from '../lib/notificationService';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { propertyId, dateTime, notes } = req.body;
    const userId = (req as any).user.userId;

    if (!propertyId || !dateTime) {
      return res.status(400).json({ error: 'Property ID and Date/Time are required' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId as string },
      select: { agentId: true, title: true }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId: propertyId as string,
        userId,
        agentId: property.agentId,
        dateTime: new Date(dateTime),
        notes,
        status: 'PENDING'
      },
      include: {
        property: {
          select: { title: true, address: true }
        }
      }
    });

    // Notify Agent
    await createNotification({
      userId: property.agentId,
      type: NotificationType.BOOKING_NEW,
      title: 'New Viewing Request',
      message: `A new viewing has been requested for ${property.title}.`,
      link: `/dashboard/bookings`
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;

    let bookings;
    if (role === 'AGENT' || role === 'ADMIN') {
      bookings = await prisma.booking.findMany({
        where: { agentId: userId },
        include: {
          property: true,
          user: {
            select: {
              email: true,
              profile: true
            }
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          property: true,
          agent: {
            select: {
              email: true,
              profile: true
            }
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    }

    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;

    if (!['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { property: { select: { title: true } } }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only the agent assigned to the booking or an admin can update the status
    if (booking.agentId !== userId && role !== 'ADMIN' && booking.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this booking' });
    }

    // If user is cancelling, it's allowed. If agent is confirming/completing, it's allowed.
    if (status === 'CONFIRMED' && booking.agentId !== userId && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only agents can confirm bookings' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: id as string },
      data: { status },
    });

    // Notify User if status changed to CONFIRMED or CANCELLED
    if (status === 'CONFIRMED' || status === 'CANCELLED') {
      const recipientId = status === 'CANCELLED' && userId === booking.userId ? booking.agentId : booking.userId;
      
      // Use booking.property.title which was included in findUnique
      const propertyTitle = (booking as any).property?.title || 'Property';

      await createNotification({
        userId: recipientId,
        type: status === 'CONFIRMED' ? NotificationType.BOOKING_CONFIRMED : NotificationType.SYSTEM_ALERT,
        title: `Viewing ${status.toLowerCase()}`,
        message: `Your viewing for ${propertyTitle} has been ${status.toLowerCase()}.`,
        link: `/dashboard/bookings`
      });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};
