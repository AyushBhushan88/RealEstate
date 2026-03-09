"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTransactions = exports.handleWebhook = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("../lib/stripe"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const notificationService_1 = require("../lib/notificationService");
const auditService_1 = require("../lib/auditService");
const createCheckoutSession = async (req, res) => {
    try {
        const { contractId, type } = req.body;
        const userId = req.user.userId;
        const contract = await prisma_1.default.contract.findUnique({
            where: { id: contractId },
            include: { property: true, client: true }
        });
        if (!contract)
            return res.status(404).json({ error: 'Contract not found' });
        const session = await stripe_1.default.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${type} for ${contract.property.title}`,
                            description: `Contract ID: ${contract.id}`,
                        },
                        unit_amount: Math.round(Number(contract.amount) * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/dashboard/contracts?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/contracts?canceled=true`,
            customer_email: contract.client.email,
            metadata: {
                contractId,
                userId,
                type
            },
        });
        res.json({ id: session.id, url: session.url });
    }
    catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({ error: 'Failed to create payment session' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe_1.default.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Update contract and create transaction
        const { contractId, userId, type } = session.metadata;
        const transaction = await prisma_1.default.transaction.create({
            data: {
                contractId,
                userId,
                amount: session.amount_total / 100,
                type: type,
                status: 'COMPLETED',
                stripeId: session.id,
                paymentMethod: session.payment_method_types[0]
            },
            include: {
                contract: { include: { property: true } }
            }
        });
        // Create Commission Splits if applicable (70% Agent, 30% Agency/System)
        if (type === 'DEPOSIT' || type === 'RENT') {
            const totalAmount = session.amount_total / 100;
            const agentAmount = totalAmount * 0.7;
            const agencyAmount = totalAmount * 0.3;
            // Agent portion
            await prisma_1.default.transaction.create({
                data: {
                    contractId,
                    userId, // Payer remains same
                    recipientId: transaction.contract?.property.agentId,
                    amount: agentAmount,
                    type: 'COMMISSION',
                    status: 'COMPLETED',
                    parentId: transaction.id,
                    metadata: { split: '70%', role: 'AGENT' }
                }
            });
            // Agency portion (System fee)
            await prisma_1.default.transaction.create({
                data: {
                    contractId,
                    userId,
                    amount: agencyAmount,
                    type: 'FEE',
                    status: 'COMPLETED',
                    parentId: transaction.id,
                    metadata: { split: '30%', role: 'AGENCY' }
                }
            });
            // Activate contract
            await prisma_1.default.contract.update({
                where: { id: contractId },
                data: { status: 'ACTIVE' }
            });
        }
        // Audit Log for the main transaction
        await (0, auditService_1.createAuditLog)({
            userId,
            action: 'PAYMENT_COMPLETED',
            entity: 'Transaction',
            entityId: transaction.id,
            details: { contractId, type, amount: transaction.amount }
        });
        // Notify Agent
        if (transaction.contract) {
            await (0, notificationService_1.createNotification)({
                userId: transaction.contract.property.agentId,
                type: notificationService_1.NotificationType.PAYMENT_RECEIVED,
                title: 'Payment Received',
                message: `A payment of $${transaction.amount} was received for "${transaction.contract.property.title}".`,
                link: '/dashboard/transactions'
            });
            // Notify User
            await (0, notificationService_1.createNotification)({
                userId: transaction.userId,
                type: notificationService_1.NotificationType.PAYMENT_RECEIVED,
                title: 'Payment Successful',
                message: `Your payment of $${transaction.amount} for "${transaction.contract.property.title}" was processed successfully.`,
                link: '/dashboard/transactions'
            });
        }
    }
    res.json({ received: true });
};
exports.handleWebhook = handleWebhook;
const getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const transactions = await prisma_1.default.transaction.findMany({
            where: { userId },
            include: { contract: { include: { property: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
exports.getMyTransactions = getMyTransactions;
//# sourceMappingURL=paymentController.js.map