"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedia = exports.uploadPropertyMedia = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const uploadPropertyMedia = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        if (!propertyId) {
            return res.status(400).json({ error: 'Property ID is required' });
        }
        const property = await prisma_1.default.property.findUnique({
            where: { id: propertyId }
        });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        // Agent can only upload to their own property
        if (property.agentId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized to upload media to this property' });
        }
        const mediaData = files.map((file, index) => ({
            propertyId,
            url: file.path,
            isMain: index === 0 && property.mediaCount === 0, // Simplified logic for main image
            order: index,
            type: 'IMAGE'
        }));
        const createdMedia = await prisma_1.default.media.createMany({
            data: mediaData
        });
        res.status(201).json({
            message: 'Media uploaded successfully',
            count: files.length,
            media: mediaData
        });
    }
    catch (error) {
        console.error('Media upload error:', error);
        res.status(500).json({ error: 'Failed to upload media' });
    }
};
exports.uploadPropertyMedia = uploadPropertyMedia;
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const media = await prisma_1.default.media.findUnique({
            where: { id },
            include: { property: true }
        });
        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }
        if (media.property.agentId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized to delete this media' });
        }
        // Note: To fully remove from Cloudinary, we'd need the public_id
        // For now, we delete from database only.
        await prisma_1.default.media.delete({
            where: { id }
        });
        res.json({ message: 'Media deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete media' });
    }
};
exports.deleteMedia = deleteMedia;
//# sourceMappingURL=mediaController.js.map