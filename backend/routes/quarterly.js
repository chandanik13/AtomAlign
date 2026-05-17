const express = require('express');
const router = express.Router();

// Placeholder for quarterly routes (handled in goals)
router.get('/', (req, res) => res.json({ success: true, message: 'Quarterly route' }));

module.exports = router;
