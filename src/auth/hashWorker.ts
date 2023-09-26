import { parentPort } from 'worker_threads';
import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError';

interface BcryptError extends Error {
  code?: number;
}

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    const bcryptError = error as BcryptError;
    throw new AppError(bcryptError.code || 500, bcryptError.message);
  }
}

parentPort!.on('message', async (password: string) => {
  try {
    const hash = await hashPassword(password);
    parentPort!.postMessage({ hash });
  } catch (error) {
    const bcryptError = error as BcryptError;
    parentPort!.postMessage({
      error: bcryptError.message || 'Error hashing password',
    });
  }
});
