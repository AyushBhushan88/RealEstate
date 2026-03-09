"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerStats = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getOwnerStats = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        // Get all properties owned by this user
        const properties = await prisma_1.default.property.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: {
                        inquiries: true,
                        contracts: true
                    }
                },
                contracts: {
                    where: {
                        status: 'ACTIVE'
                    },
                    select: {
                        amount: true,
                        type: true
                    }
                }
            }
        });
        const totalProperties = properties.length;
        const totalInquiries = properties.reduce((acc, prop) => acc + prop._count.inquiries, 0);
        const totalViews = properties.reduce((acc, prop) => acc + (prop.views || 0), 0);
        // Calculate estimated monthly revenue (from active rentals)
        const monthlyRevenue = properties.reduce((acc, prop) => {
            const activeRentals = prop.contracts.filter(c => c.type === 'RENTAL');
            const propMonthly = activeRentals.reduce((sum, c) => sum + Number(c.amount), 0);
            return acc + propMonthly;
        }, 0);
        // Get recent transactions for these properties
        const propertyIds = properties.map(p => p.id);
        const recentTransactions = await prisma_1.default.transaction.findMany({
            where: {
                contract: {
                    propertyId: { in: propertyIds }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                contract: {
                    include: {
                        property: { select: { title: true } }
                    }
                }
            }
        });
        res.json({
            summary: {
                totalProperties,
                totalInquiries,
                totalViews,
                monthlyRevenue
            },
            properties: properties.map(p => ({
                id: p.id,
                title: p.title,
                status: p.status,
                views: p.views,
                inquiryCount: p._count.inquiries,
                contractCount: p._count.contracts
            })),
            recentTransactions
        });
    }
    catch (error) {
        console.error('Owner stats error:', error);
        res.status(500).json({ error: 'Failed to fetch owner statistics' });
    }
};
exports.getOwnerStats = getOwnerStats;
//# sourceMappingURL=ownerController.js.map