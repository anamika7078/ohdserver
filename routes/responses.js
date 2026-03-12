const express = require('express');
const router = express.Router();
const { submitResponse, getCompanyResponses } = require('../dist/controllers/responseController');
const { requireAdmin } = require('../dist/middleware/auth');

router.post('/', submitResponse);
router.get('/companies/:companyId', requireAdmin, getCompanyResponses);

module.exports = router;

