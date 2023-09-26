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
    parentPort!.postMessage({ hash });
  } catch (error) {
    parentPort!.postMessage({ error: 'Error hashing password' });
  }
});
