const express = require('express');
const router = express.Router();
const { getSections, createSection } = require('../dist/controllers/sectionController');
const { requireAdmin } = require('../dist/middleware/auth');

router.get('/', requireAdmin, getSections);
router.post('/', requireAdmin, createSection);

module.exports = router;

