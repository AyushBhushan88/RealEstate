"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInquiryStatus = exports.getAgentInquiries = exports.createInquiry = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const notificationService_1 = require("../lib/notificationService");
const createInquiry = async (req, res) => {
    try {
        const { propertyId, name, email, phone, message } = req.body;
        const userId = req.user?.userId; // Optional if logged in
        if (!propertyId || !name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const property = await prisma_1.default.property.findUnique({
            where: { id: propertyId }
        });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        const inquiry = await prisma_1.default.inquiry.create({
            data: {
                propertyId,
                userId: userId || null,
                name,
                email,
                phone,
                message,
            },
        });
        // Notify Agent
        await (0, notificationService_1.createNotification)({
            userId: property.agentId,
            type: notificationService_1.NotificationType.INQUIRY_NEW,
            title: 'New Inquiry Received',
            message: `You have a new inquiry from ${name} for "${property.title}".`,
            link: '/dashboard/messages'
        });
        res.status(201).json(inquiry);
    }
    catch (error) {
        console.error('Create inquiry error:', error);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
};
exports.createInquiry = createInquiry;
const getAgentInquiries = async (req, res) => {
    try {
        const agentId = req.user.userId;
        const inquiries = await prisma_1.default.inquiry.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};
exports.getAgentInquiries = getAgentInquiries;
const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const agentId = req.user.userId;
        const inquiry = await prisma_1.default.inquiry.findUnique({
            where: { id },
            include: { property: true }
        });
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        if (inquiry.property.agentId !== agentId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized to update this inquiry' });
        }
        const updatedInquiry = await prisma_1.default.inquiry.update({
            where: { id },
            data: { status }
        });
        res.json(updatedInquiry);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update inquiry status' });
    }
};
exports.updateInquiryStatus = updateInquiryStatus;
//# sourceMappingURL=inquiryController.js.map