import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;
    const userId = (req as any).user?.userId; // Optional if logged in

    if (!propertyId || !name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        userId: userId || null,
        name,
        email,
        phone,
        message,
      },
    });

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
};

export const getAgentInquiries = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.userId;

    const inquiries = await prisma.inquiry.findMany({
      where: {
        property: {
          agentId: agentId
        }
      },
      include: {
        property: {
          select: {
            title: true,
            address: true
          }
        },
        user: {
          select: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const agentId = (req as any).user.userId;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    if (inquiry.property.agentId !== agentId && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this inquiry' });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status }
    });

    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
};
