"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signContract = exports.getMyContracts = exports.downloadContractPDF = exports.createContract = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const pdfService_1 = require("../lib/pdfService");
const notificationService_1 = require("../lib/notificationService");
const createContract = async (req, res) => {
    try {
        const { propertyId, clientId, type, startDate, endDate, amount } = req.body;
        const agentId = req.user.userId;
        const property = await prisma_1.default.property.findUnique({
            where: { id: propertyId },
            include: { agent: { include: { profile: true } } }
        });
        if (!property)
            return res.status(404).json({ error: 'Property not found' });
        const client = await prisma_1.default.user.findUnique({
            where: { id: clientId },
            include: { profile: true }
        });
        if (!client)
            return res.status(404).json({ error: 'Client not found' });
        const contract = await prisma_1.default.contract.create({
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
    }
    catch (error) {
        console.error('Create contract error:', error);
        res.status(500).json({ error: 'Failed to create contract' });
    }
};
exports.createContract = createContract;
const downloadContractPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const contract = await prisma_1.default.contract.findUnique({
            where: { id },
            include: {
                property: true,
                client: { include: { profile: true } },
            }
        });
        if (!contract)
            return res.status(404).json({ error: 'Contract not found' });
        // Fetch agent info (linked to property)
        const agent = await prisma_1.default.user.findUnique({
            where: { id: contract.property.agentId },
            include: { profile: true }
        });
        const html = (0, pdfService_1.getLeaseTemplate)({
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
        const pdfBuffer = await (0, pdfService_1.generatePDF)(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.id}.pdf`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
exports.downloadContractPDF = downloadContractPDF;
const getMyContracts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const contracts = await prisma_1.default.contract.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch contracts' });
    }
};
exports.getMyContracts = getMyContracts;
const signContract = async (req, res) => {
    try {
        const { id } = req.params;
        const { signature } = req.body; // Full legal name typed as signature
        const userId = req.user.userId;
        if (!signature) {
            return res.status(400).json({ error: 'Signature is required' });
        }
        const contract = await prisma_1.default.contract.findUnique({
            where: { id }
        });
        if (!contract)
            return res.status(404).json({ error: 'Contract not found' });
        if (contract.clientId !== userId) {
            return res.status(403).json({ error: 'Only the designated client can sign this contract' });
        }
        if (contract.status !== 'DRAFT' && contract.status !== 'PENDING_SIGNATURE') {
            return res.status(400).json({ error: 'Contract cannot be signed in its current status' });
        }
        const updatedContract = await prisma_1.default.contract.update({
            where: { id },
            data: {
                status: 'SIGNED',
                signedAt: new Date(),
                // In a real system, you would append the signature to the PDF and save to S3/Cloudinary
            },
            include: {
                property: true,
                client: { include: { profile: true } }
            }
        });
        // Notify Agent
        await (0, notificationService_1.createNotification)({
            userId: updatedContract.property.agentId,
            type: notificationService_1.NotificationType.CONTRACT_SIGNED,
            title: 'Contract Signed!',
            message: `${updatedContract.client.profile?.firstName} signed the contract for "${updatedContract.property.title}".`,
            link: '/dashboard/contracts'
        });
        res.json({ message: 'Contract signed successfully', contract: updatedContract });
    }
    catch (error) {
        console.error('Sign contract error:', error);
        res.status(500).json({ error: 'Failed to sign contract' });
    }
};
exports.signContract = signContract;
//# sourceMappingURL=contractController.js.map