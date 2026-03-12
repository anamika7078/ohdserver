import { Request, Response } from 'express';
import EmployeeResponse from '../models/EmployeeResponse';
import Question from '../models/Question';
import Company from '../models/Company';
import connectDB from '../lib/db';

export async function submitResponse(req: Request, res: Response) {
  try {
    await connectDB();

    const { companyId, employeeEmail, employeeName, answers } = req.body;

    if (!companyId || !answers) {
      return res.status(400).json({ error: 'Company ID and answers are required' });
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify all 70 questions are answered
    if (!Array.isArray(answers) || answers.length !== 70) {
      return res.status(400).json({ error: 'All 70 questions must be answered' });
    }

    // Verify all questions exist and validate ratings
    const questionIds = answers.map((a: any) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length !== 70) {
      return res.status(400).json({ error: 'Invalid question IDs provided' });
    }

    // Validate ratings
    const validRatings = ['A', 'B', 'C', 'D', 'E'];
    for (const answer of answers) {
      if (!validRatings.includes(answer.rating)) {
        return res.status(400).json({ error: `Invalid rating: ${answer.rating}. Must be A, B, C, D, or E` });
      }
    }

    const response = await EmployeeResponse.create({
      companyId,
      employeeEmail: employeeEmail?.trim().toLowerCase() || undefined,
      employeeName,
      answers,
      submittedAt: new Date(),
    });

    return res.status(201).json({ response });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit response' });
  }
}

export async function getCompanyResponses(req: Request, res: Response) {
  try {
    await connectDB();

    const responses = await EmployeeResponse.find({ companyId: req.params.companyId })
      .populate('companyId', 'name')
      .sort({ submittedAt: -1 });

    return res.json({ responses });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch responses' });
  }
}
