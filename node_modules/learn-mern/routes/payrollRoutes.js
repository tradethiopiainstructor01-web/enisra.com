const express = require('express');

const router = express.Router();

// Placeholder until payroll endpoints are implemented.
router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Payroll routes are not implemented yet.'
  });
});

module.exports = router;
