import { Request, Response } from 'express';
import Question from '../models/Question';
import Section from '../models/Section';
import connectDB from '../lib/db';

export async function getQuestions(req: Request, res: Response) {
  try {
    await connectDB();

    const { sectionId } = req.query;

    const query: any = {};
    if (sectionId) {
      query.sectionId = sectionId;
    }

    const questions = await Question.find(query).populate('sectionId', 'name pillar order').sort({ order: 1 });
    return res.json({ questions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch questions' });
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    await connectDB();

    const { sectionId, text, order } = req.body;

    if (!sectionId || !text || order === undefined) {
      return res.status(400).json({ error: 'Section ID, text, and order are required' });
    }

    // Verify section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const question = await Question.create({
      sectionId,
      text,
      order,
    });

    const populatedQuestion = await Question.findById(question._id).populate('sectionId', 'name');

    return res.status(201).json({ question: populatedQuestion });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create question' });
  }
}
