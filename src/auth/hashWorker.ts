import { parentPort } from 'worker_threads';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw error;
  }
}

parentPort!.on('message', async (password: string) => {
  try {
    const hash = await hashPassword(password);
    parentPort!.postMessage(hash);
  } catch (error) {
    // Handle error, you might want to send an error message back to the main thread.
    parentPort!.postMessage('Error hashing password');
  }
});
