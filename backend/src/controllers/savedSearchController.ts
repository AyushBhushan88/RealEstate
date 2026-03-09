import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Save a search criteria.
 */
export const saveSearch = async (req: Request, res: Response) => {
  const { name, filters } = req.body;
  const userId = (req as any).user.userId;

  if (!name || !filters) {
    return res.status(400).json({ message: 'Name and filters are required' });
  }

  try {
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name,
        filters,
      },
    });

    return res.status(201).json(savedSearch);
  } catch (error) {
    console.error('Error saving search:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all saved searches for a user.
 */
export const getSavedSearches = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(savedSearches);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a saved search.
 */
export const deleteSavedSearch = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = (req as any).user.userId;

  try {
    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!savedSearch) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    if (savedSearch.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Saved search deleted' });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Toggle alerts for a saved search.
 */
export const toggleAlerts = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { hasAlerts } = req.body;
  const userId = (req as any).user.userId;

  try {
    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!savedSearch) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    if (savedSearch.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: { hasAlerts },
    });

    return res.status(200).json(updatedSearch);
  } catch (error) {
    console.error('Error toggling alerts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
