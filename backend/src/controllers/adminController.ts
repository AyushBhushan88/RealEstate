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

    // --- Time Series Data (Last 6 Months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        parentId: null,
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { amount: true },
    });

    // Format monthly data for charting
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = monthlyRevenue.reduce((acc: any, curr) => {
      const month = months[new Date(curr.createdAt).getMonth()];
      acc[month] = (acc[month] || 0) + (curr._sum.amount || 0);
      return acc;
    }, {});

    const chartData = Object.keys(revenueByMonth).map(month => ({
      name: month,
      revenue: revenueByMonth[month]
    }));

    // --- Agent Performance ---
    const agentStats = await prisma.transaction.groupBy({
      by: ['recipientId'],
      where: {
        status: 'COMPLETED',
        type: 'COMMISSION'
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    const performance = await Promise.all(agentStats.map(async (stat) => {
      const agent = await prisma.user.findUnique({
        where: { id: stat.recipientId || '' },
        include: { profile: true }
      });
      return {
        name: agent?.profile?.firstName ? `${agent.profile.firstName} ${agent.profile.lastName}` : agent?.email,
        commissions: stat._sum.amount || 0,
        deals: stat._count.id
      };
    }));

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
      chartData,
      performance: performance.sort((a, b) => b.commissions - a.commissions).slice(0, 5),
      recentTransactions
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
};
