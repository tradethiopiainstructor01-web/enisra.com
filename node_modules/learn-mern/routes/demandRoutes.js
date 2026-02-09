const express = require('express');

const router = express.Router();

// Placeholder until demand endpoints are implemented.
router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Demand routes are not implemented yet.'
  });
});

module.exports = router;
