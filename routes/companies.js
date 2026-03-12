const express = require('express');
const router = express.Router();
const {
  getCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../dist/controllers/companyController');
const { requireAdmin } = require('../dist/middleware/auth');

router.get('/', requireAdmin, getCompanies);
router.post('/', requireAdmin, createCompany);
router.get('/:id', requireAdmin, getCompanyById);
router.put('/:id', requireAdmin, updateCompany);
router.delete('/:id', requireAdmin, deleteCompany);

module.exports = router;

