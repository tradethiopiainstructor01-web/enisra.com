const { Client, Storage, InputFile } = require('node-appwrite');

const requiredKeys = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];

const missingKeys = requiredKeys.filter((key) => !process.env[key]);
const isAppwriteConfigured = missingKeys.length === 0;

let client = null;
let storage = null;

const createMissingConfigStorage = () => {
  const message = `Appwrite storage is unavailable because ${missingKeys.length === 0 ? 'configuration could not be loaded' : `the following env vars are missing: ${missingKeys.join(', ')}`}.`;
  const createRejector = () => Promise.reject(new Error(message));
  return {
    createFile: createRejector,
    deleteFile: createRejector,
    listFiles: createRejector,
    getFile: createRejector
  };
};

if (isAppwriteConfigured) {
  client = new Client();
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  storage = new Storage(client);
} else {
  console.warn('[Appwrite] missing configuration:', missingKeys.join(', ') || 'unknown');
  storage = createMissingConfigStorage();
}

module.exports = {
  client,
  storage,
  InputFile,
  isAppwriteConfigured: () => isAppwriteConfigured
};
