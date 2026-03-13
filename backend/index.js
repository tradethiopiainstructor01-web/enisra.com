const app = require('./server.js');

// For local development
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 5000;
  const HOST = '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
} else {
  // Export the app when loaded as a module.
  module.exports = app;
}
