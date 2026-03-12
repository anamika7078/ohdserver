const express = require('express');
const router = express.Router();
const { exportPDF, exportExcel } = require('../dist/controllers/exportController');
const { requireAdmin } = require('../dist/middleware/auth');

router.get('/companies/:companyId/pdf', requireAdmin, exportPDF);
router.get('/companies/:companyId/excel', requireAdmin, exportExcel);

module.exports = router;

