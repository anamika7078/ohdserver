import { Request, Response } from 'express';
import Section from '../models/Section';
import connectDB from '../lib/db';

export async function getSections(req: Request, res: Response) {
  try {
    await connectDB();

    const sections = await Section.find().sort({ pillar: 1, order: 1 });
    return res.json({ sections });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch sections' });
  }
}

export async function createSection(req: Request, res: Response) {
  try {
    await connectDB();

    const { name, description, pillar, order } = req.body;

    if (!name || pillar === undefined || order === undefined) {
      return res.status(400).json({ error: 'Name, pillar, and order are required' });
    }

    if (pillar < 1 || pillar > 5) {
      return res.status(400).json({ error: 'Pillar must be between 1 and 5' });
    }

    const section = await Section.create({
      name,
      description,
      pillar,
      order,
    });

    return res.status(201).json({ section });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create section' });
  }
}
