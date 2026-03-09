import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Toggle favorite status of a property for a user.
 */
export const toggleFavorite = async (req: Request, res: Response) => {
  const { propertyId } = req.body;
  const userId = (req as any).user.userId;

  if (!propertyId) {
    return res.status(400).json({ message: 'Property ID is required' });
  }

  try {
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if favorite exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      return res.status(200).json({ message: 'Property removed from favorites', isFavorited: false });
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId,
          propertyId,
        },
      });
      return res.status(201).json({ message: 'Property added to favorites', isFavorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all favorite properties for a user.
 */
export const getFavorites = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            media: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Extract property data
    const properties = favorites.map((f) => f.property);

    return res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
