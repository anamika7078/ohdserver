import { Request, Response } from 'express';
import connectDB from '../lib/db';
import { sendBulkEmails, generateSurveyEmail } from '../services/mailService';
import MailLog from '../models/MailLog';
import * as XLSX from 'xlsx';

export async function sendBulkMail(req: Request, res: Response) {
  try {
    await connectDB();

    const file = req.file;
    const { subject, companyId, surveyLink, companyName } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    if (!subject || !surveyLink) {
      return res.status(400).json({ error: 'Subject and survey link are required' });
    }

    // Extract emails from file
    const emails: string[] = [];
    const fileBuffer = file.buffer;
    const fileName = file.originalname.toLowerCase();

    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const text = fileBuffer.toString('utf-8');
      const lines = text.split('\n');

      // Assume first column contains emails, or look for email pattern
      for (const line of lines) {
        if (line.trim()) {
          const columns = line.split(',').map((col) => col.trim().replace(/^"|"$/g, ''));
          // Try to find email in columns
          for (const col of columns) {
            if (col.includes('@') && col.includes('.')) {
              emails.push(col.toLowerCase());
              break;
            }
          }
        }
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Find email column (assume first row is header)
      let emailColumnIndex = -1;
      if (data.length > 0) {
        const headerRow = data[0] as any[];
        emailColumnIndex = headerRow.findIndex((cell: any) =>
          cell && (cell.toString().toLowerCase().includes('email') || cell.toString().toLowerCase().includes('mail'))
        );
      }

      // Extract emails
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        if (emailColumnIndex >= 0 && row[emailColumnIndex]) {
          const email = row[emailColumnIndex].toString().trim().toLowerCase();
          if (email.includes('@') && email.includes('.')) {
            emails.push(email);
          }
        } else {
          // Try to find email in any column
          for (const cell of row) {
            if (cell && cell.toString().includes('@') && cell.toString().includes('.')) {
              emails.push(cell.toString().trim().toLowerCase());
              break;
            }
          }
        }
      }
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload CSV or Excel file.' });
    }

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No valid emails found in the file' });
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(emails)];

    // Generate email HTML
    const html = generateSurveyEmail(companyName || 'Your Organization', surveyLink);

    // Send bulk emails
    const result = await sendBulkEmails(uniqueEmails, subject, html, companyId || undefined);

    return res.json({
      message: 'Bulk email sending completed',
      total: uniqueEmails.length,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to send bulk emails' });
  }
}

export async function getMailLogs(req: Request, res: Response) {
  try {
    await connectDB();

    const { companyId, status, page = '1', limit = '50' } = req.query;

    const query: any = {};
    if (companyId) {
      query.companyId = companyId;
    }
    if (status) {
      query.status = status;
    }

    const logs = await MailLog.find(query)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await MailLog.countDocuments(query);

    return res.json({
      logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch mail logs' });
  }
}
