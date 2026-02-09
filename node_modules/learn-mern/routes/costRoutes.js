const express = require('express');

const router = express.Router();

// Placeholder until cost endpoints are implemented.
router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Cost routes are not implemented yet.'
  });
});

module.exports = router;
