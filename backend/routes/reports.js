const express = require('express');
const router = express.Router();
const { getReport, getDeptSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('admin', 'manager'), getReport);
router.get('/departments', protect, roleCheck('admin', 'manager'), getDeptSummary);

module.exports = router;
