const app = require('./server.js');

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Export the app when loaded as a module.
  module.exports = app;
}
