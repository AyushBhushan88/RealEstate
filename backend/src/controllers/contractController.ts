import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generatePDF, getLeaseTemplate } from '../lib/pdfService';

export const createContract = async (req: Request, res: Response) => {
  try {
    const { propertyId, clientId, type, startDate, endDate, amount } = req.body;
    const agentId = (req as any).user.userId;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { agent: { include: { profile: true } } }
    });

    if (!property) return res.status(404).json({ error: 'Property not found' });

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { profile: true }
    });

    if (!client) return res.status(404).json({ error: 'Client not found' });

    const contract = await prisma.contract.create({
      data: {
        propertyId,
        clientId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount,
        status: 'DRAFT'
      },
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
};

export const downloadContractPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        property: true,
        client: { include: { profile: true } },
      }
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    // Fetch agent info (linked to property)
    const agent = await prisma.user.findUnique({
      where: { id: contract.property.agentId },
      include: { profile: true }
    });

    const html = getLeaseTemplate({
      propertyTitle: contract.property.title,
      address: contract.property.address,
      city: contract.property.city,
      agentName: `${agent?.profile?.firstName} ${agent?.profile?.lastName}`,
      clientName: `${contract.client.profile?.firstName} ${contract.client.profile?.lastName}`,
      amount: contract.amount,
      startDate: contract.startDate?.toLocaleDateString(),
      endDate: contract.endDate?.toLocaleDateString(),
      contractId: contract.id
    });

    const pdfBuffer = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

export const getMyContracts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;

    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { property: { agentId: userId } },
          { clientId: userId }
        ]
      },
      include: {
        property: { select: { title: true, address: true } },
        client: { select: { email: true, profile: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
};
