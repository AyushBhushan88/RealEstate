"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.recordPropertyView = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createProperty = async (req, res) => {
    try {
        const { title, description, price, address, city, state, zipCode, country, type, listingType, bedrooms, bathrooms, squareFeet, lotSize, yearBuilt, ownerId } = req.body;
        // Basic validation
        if (!title || !description || !price || !address || !city || !zipCode || !type || !listingType) {
            return res.status(400).json({ error: 'Missing required fields: title, description, price, address, city, zipCode, type, and listingType are mandatory.' });
        }
        const agentId = req.user.userId;
        const property = await prisma_1.default.property.create({
            data: {
                title,
                description,
                price,
                address,
                city,
                state,
                zipCode,
                country: country || 'USA',
                type,
                listingType,
                bedrooms: bedrooms ? parseInt(bedrooms) : null,
                bathrooms: bathrooms ? parseFloat(bathrooms) : null,
                squareFeet: squareFeet ? parseInt(squareFeet) : null,
                lotSize: lotSize ? parseFloat(lotSize) : null,
                yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
                agentId,
                ownerId
            },
            include: {
                agent: {
                    select: {
                        email: true,
                        profile: true
                    }
                },
                media: true
            }
        });
        res.status(201).json(property);
    }
    catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Failed to create property' });
    }
};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    try {
        const { type, listingType, minPrice, maxPrice, city, bedrooms, bathrooms, minSqft } = req.query;
        const properties = await prisma_1.default.property.findMany({
            where: {
                status: 'ACTIVE',
                ...(type && { type: type }),
                ...(listingType && { listingType: listingType }),
                ...(city && { city: { contains: city, mode: 'insensitive' } }),
                price: {
                    ...(minPrice && { gte: parseFloat(minPrice) }),
                    ...(maxPrice && { lte: parseFloat(maxPrice) }),
                },
                ...(bedrooms && { bedrooms: { gte: parseInt(bedrooms) } }),
                ...(bathrooms && { bathrooms: { gte: parseFloat(bathrooms) } }),
                ...(minSqft && { squareFeet: { gte: parseInt(minSqft) } }),
            },
            include: {
                media: {
                    where: { isMain: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(properties);
    }
    catch (error) {
        console.error('Fetch properties error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
};
exports.getProperties = getProperties;
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await prisma_1.default.property.findUnique({
            where: { id },
            include: {
                agent: {
                    select: {
                        email: true,
                        profile: true
                    }
                },
                owner: {
                    select: {
                        email: true,
                        profile: true
                    }
                },
                media: true
            }
        });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        // Increment view count asynchronously
        prisma_1.default.property.update({
            where: { id },
            data: { views: { increment: 1 } }
        }).catch(err => console.error('Error incrementing property views:', err));
        res.json(property);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch property' });
    }
};
exports.getPropertyById = getPropertyById;
const recordPropertyView = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.property.update({
            where: { id },
            data: { views: { increment: 1 } }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to record view' });
    }
};
exports.recordPropertyView = recordPropertyView;
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const existingProperty = await prisma_1.default.property.findUnique({
            where: { id }
        });
        if (!existingProperty) {
            return res.status(404).json({ error: 'Property not found' });
        }
        // Only the listing agent or an admin can update the property
        if (existingProperty.agentId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized to update this property' });
        }
        const updatedProperty = await prisma_1.default.property.update({
            where: { id },
            data: req.body
        });
        res.json(updatedProperty);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update property' });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const existingProperty = await prisma_1.default.property.findUnique({
            where: { id }
        });
        if (!existingProperty) {
            return res.status(404).json({ error: 'Property not found' });
        }
        // Only the listing agent or an admin can delete the property
        if (existingProperty.agentId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized to delete this property' });
        }
        await prisma_1.default.property.delete({
            where: { id }
        });
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
};
exports.deleteProperty = deleteProperty;
//# sourceMappingURL=propertyController.js.map