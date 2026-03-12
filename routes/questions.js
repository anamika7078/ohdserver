const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion } = require('../dist/controllers/questionController');
const { requireAdmin } = require('../dist/middleware/auth');

router.get('/', requireAdmin, getQuestions);
router.post('/', requireAdmin, createQuestion);

module.exports = router;

