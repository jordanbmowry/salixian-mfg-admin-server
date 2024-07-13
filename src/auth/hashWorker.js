const { parentPort } = require('worker_threads');
const argon2 = require('argon2');
const path = require('path');
const { register } = require('ts-node');

// Register TypeScript compiler
register({
  project: path.resolve(__dirname, '../../tsconfig.json'),
});

// Resolve the absolute path to the AppError module
const appErrorPath = path.resolve(__dirname, '../errors/AppError');

// Use require to import the TypeScript module
const { AppError } = require(appErrorPath);

async function hashPassword(password) {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    throw new AppError(error.code || 500, error.message);
  }
}

parentPort.on('message', async (password) => {
  try {
    const hash = await hashPassword(password);
    parentPort.postMessage({ hash });
  } catch (error) {
    parentPort.postMessage({
      error: error.message || 'Error hashing password',
    });
  }
});
