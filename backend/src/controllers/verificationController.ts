import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createNotification, NotificationType } from '../lib/notificationService';

export const uploadVerificationDoc = async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const file = (req as any).file;
    const userId = (req as any).user.userId;

    if (!file) return res.status(400).json({ error: 'No document file uploaded' });

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const doc = await prisma.verificationDocument.create({
      data: {
        profileId: profile.id,
        type,
        url: file.path,
        status: 'PENDING'
      }
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Verification upload error:', error);
    res.status(500).json({ error: 'Failed to upload verification document' });
  }
};

export const getMyDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { documents: true }
    });
    res.json(profile?.documents || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status, notes } = req.body; // VERIFIED or REJECTED

    const doc = await prisma.verificationDocument.update({
      where: { id },
      data: { status, notes },
      include: { profile: true }
    });

    // If verified, check if all required docs are verified to mark profile as verified
    if (status === 'VERIFIED') {
      await prisma.profile.update({
        where: { id: doc.profileId },
        data: { isVerified: true }
      });
    }

    // Notify User
    await createNotification({
      userId: doc.profile.userId,
      type: NotificationType.SYSTEM_ALERT,
      title: `Verification ${status}`,
      message: status === 'VERIFIED' 
        ? 'Your profile has been successfully verified.' 
        : `Your verification document was rejected: ${notes}`,
      link: '/dashboard/settings'
    });

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification status' });
  }
};
