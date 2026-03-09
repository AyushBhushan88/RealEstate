"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDocument = exports.getMyDocuments = exports.uploadVerificationDoc = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const notificationService_1 = require("../lib/notificationService");
const uploadVerificationDoc = async (req, res) => {
    try {
        const { type } = req.body;
        const file = req.file;
        const userId = req.user.userId;
        if (!file)
            return res.status(400).json({ error: 'No document file uploaded' });
        const profile = await prisma_1.default.profile.findUnique({
            where: { userId }
        });
        if (!profile)
            return res.status(404).json({ error: 'Profile not found' });
        const doc = await prisma_1.default.verificationDocument.create({
            data: {
                profileId: profile.id,
                type,
                url: file.path,
                status: 'PENDING'
            }
        });
        res.status(201).json(doc);
    }
    catch (error) {
        console.error('Verification upload error:', error);
        res.status(500).json({ error: 'Failed to upload verification document' });
    }
};
exports.uploadVerificationDoc = uploadVerificationDoc;
const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({
            where: { userId },
            include: { documents: true }
        });
        res.json(profile?.documents || []);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};
exports.getMyDocuments = getMyDocuments;
const verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body; // VERIFIED or REJECTED
        const doc = await prisma_1.default.verificationDocument.update({
            where: { id },
            data: { status, notes },
            include: { profile: true }
        });
        // If verified, check if all required docs are verified to mark profile as verified
        if (status === 'VERIFIED') {
            await prisma_1.default.profile.update({
                where: { id: doc.profileId },
                data: { isVerified: true }
            });
        }
        // Notify User
        await (0, notificationService_1.createNotification)({
            userId: doc.profile.userId,
            type: notificationService_1.NotificationType.SYSTEM_ALERT,
            title: `Verification ${status}`,
            message: status === 'VERIFIED'
                ? 'Your profile has been successfully verified.'
                : `Your verification document was rejected: ${notes}`,
            link: '/dashboard/settings'
        });
        res.json(doc);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update verification status' });
    }
};
exports.verifyDocument = verifyDocument;
//# sourceMappingURL=verificationController.js.map