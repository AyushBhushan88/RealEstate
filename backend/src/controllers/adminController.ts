import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    // Only Account Managers and Admins can see this
    if ((req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'ACCOUNT_MANAGER') {
      return res.status(403).json({ error: 'Unauthorized access to financial reports' });
    }

    const totalVolume = await prisma.transaction.aggregate({
      where: { 
        status: 'COMPLETED',
        parentId: null // Only main transactions to avoid double counting
      },
      _sum: { amount: true }
    });

    const totalCommissions = await prisma.transaction.aggregate({
      where: { 
        status: 'COMPLETED',
        type: 'COMMISSION'
      },
      _sum: { amount: true }
    });

    const totalFees = await prisma.transaction.aggregate({
      where: { 
        status: 'COMPLETED',
        type: 'FEE'
      },
      _sum: { amount: true }
    });

    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { email: true, profile: true } },
        recipient: { select: { email: true, profile: true } },
        contract: { include: { property: { select: { title: true } } } }
      }
    });

    res.json({
      summary: {
        totalVolume: totalVolume._sum.amount || 0,
        totalCommissions: totalCommissions._sum.amount || 0,
        totalFees: totalFees._sum.amount || 0
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
};
