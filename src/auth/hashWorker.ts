import { parentPort } from 'worker_threads';
import argon2 from 'argon2';
import { AppError } from '../errors/AppError';

// Interface for possible error type
interface ArgonError extends Error {
  code?: number;
}

async function hashPassword(password: string): Promise<string> {
  try {
    // Using argon2 to hash the password
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    // Asserting error as ArgonError type for better type safety
    const argonError = error as ArgonError;
    throw new AppError(argonError.code || 500, argonError.message);
  }
}

parentPort!.on('message', async (password: string) => {
  try {
    const hash = await hashPassword(password);
    parentPort!.postMessage({ hash });
  } catch (error) {
    // Checking if error is instance of Error before accessing message property
    if (error instanceof Error) {
      parentPort!.postMessage({
        error: error.message || 'Error hashing password',
      });
    } else {
      parentPort!.postMessage({
        error: 'An unknown error occurred while hashing the password.',
      });
    }
  }
});
