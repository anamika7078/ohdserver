import { Request, Response } from 'express';
import Company from '../models/Company';
import connectDB from '../lib/db';

export async function getCompanies(req: Request, res: Response) {
  try {
    await connectDB();

    const companies = await Company.find().sort({ createdAt: -1 });
    return res.json({ companies });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch companies' });
  }
}

export async function createCompany(req: Request, res: Response) {
  try {
    await connectDB();

    const { name, email, industry, employeeCount } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company with this email already exists' });
    }

    const company = await Company.create({
      name,
      email,
      industry,
      employeeCount: employeeCount || 0,
      status: 'active',
    });

    return res.status(201).json({ company });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create company' });
  }
}

export async function getCompanyById(req: Request, res: Response) {
  try {
    await connectDB();

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({ company });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch company' });
  }
}

export async function updateCompany(req: Request, res: Response) {
  try {
    await connectDB();

    const { name, email, industry, employeeCount, status } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check email uniqueness if email is being updated
    if (email && email !== company.email) {
      const existingCompany = await Company.findOne({ email });
      if (existingCompany) {
        return res.status(400).json({ error: 'Company with this email already exists' });
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, email, industry, employeeCount, status },
      { new: true, runValidators: true }
    );

    return res.json({ company: updatedCompany });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update company' });
  }
}

export async function deleteCompany(req: Request, res: Response) {
  try {
    await connectDB();

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await Company.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Company deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete company' });
  }
}
