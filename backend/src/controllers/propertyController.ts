import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createProperty = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      price, 
      address, 
      city, 
      state, 
      zipCode, 
      country, 
      type, 
      listingType, 
      bedrooms, 
      bathrooms, 
      squareFeet, 
      lotSize, 
      yearBuilt,
      ownerId
    } = req.body;

    const agentId = (req as any).user.userId;

    const property = await prisma.property.create({
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
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { type, listingType, minPrice, maxPrice, city, bedrooms, bathrooms, minSqft } = req.query;

    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        ...(type && { type: type as any }),
        ...(listingType && { listingType: listingType as any }),
        ...(city && { city: { contains: city as string, mode: 'insensitive' } }),
        price: {
          ...(minPrice && { gte: parseFloat(minPrice as string) }),
          ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
        },
        ...(bedrooms && { bedrooms: { gte: parseInt(bedrooms as string) } }),
        ...(bathrooms && { bathrooms: { gte: parseFloat(bathrooms as string) } }),
        ...(minSqft && { squareFeet: { gte: parseInt(minSqft as string) } }),
      },
      include: {
        media: {
          where: { isMain: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(properties);
  } catch (error) {
    console.error('Fetch properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
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

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Only the listing agent or an admin can update the property
    if (existingProperty.agentId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this property' });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: req.body
    });

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Only the listing agent or an admin can delete the property
    if (existingProperty.agentId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this property' });
    }

    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
};
