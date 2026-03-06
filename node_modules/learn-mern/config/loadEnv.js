const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envCandidates = [
  path.join(__dirname, '..', '.env'),
  path.join(process.cwd(), '.env'),
];

envCandidates.forEach((envPath) => {
  if (!fs.existsSync(envPath)) {
    return;
  }

  dotenv.config({
    path: envPath,
    override: false,
  });
});
