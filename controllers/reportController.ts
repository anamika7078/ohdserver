import { Request, Response } from 'express';
import connectDB from '../lib/db';
import { calculateQuestionStats, calculateSectionStats, calculateOverallStats } from '../utils/calculations';
import Section from '../models/Section';

export async function getCompanyReport(req: Request, res: Response) {
  try {
    await connectDB();

    const overallStats = await calculateOverallStats(req.params.companyId);
    const sections = await Section.find().sort({ order: 1 });
    const sectionStats = [];

    for (const section of sections) {
      const stats = await calculateSectionStats(section._id.toString(), req.params.companyId);
      sectionStats.push(stats);
    }

    return res.json({
      companyId: req.params.companyId,
      overallStats,
      sectionStats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate company report' });
  }
}

export async function getSectionReport(req: Request, res: Response) {
  try {
    await connectDB();

    const { companyId } = req.query;

    const sectionStats = await calculateSectionStats(req.params.sectionId, companyId as string | undefined);

    return res.json({
      sectionStats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate section report' });
  }
}

export async function getOverallReport(req: Request, res: Response) {
  try {
    await connectDB();

    const { companyId } = req.query;

    const overallStats = await calculateOverallStats(companyId as string | undefined);
    const sections = await Section.find().sort({ order: 1 });
    const sectionStats = [];

    for (const section of sections) {
      const stats = await calculateSectionStats(section._id.toString(), companyId as string | undefined);
      sectionStats.push(stats);
    }

    return res.json({
      overallStats,
      sectionStats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate overall report' });
  }
}
