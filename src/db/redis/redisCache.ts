import { createClient } from 'redis';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../errors/httpStatusCode';

const { NODE_ENV = 'development', REDIS_URL = 'redis://127.0.0.1:6379' } =
  process.env;
const url = NODE_ENV === 'development' ? 'redis://127.0.0.1:6379' : REDIS_URL;

const client = createClient({
  url,
});

client.on('connect', () => {
  console.log('Redis client connected');
});
client.on('ready', () => {
  console.log('Redis client ready');
});
client.on('error', (err) => {
  console.error('Redis error:', err);
});
client.on('end', () => {
  console.warn('Redis client connection closed');
});
client.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
});

// expire in a week
export async function setCache(key: string, value: any, expiration = 604_800) {
  try {
    await client.setEx(key, expiration, JSON.stringify(value));
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to set cache: ${error.message}`
      );
    } else {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to set cache`
      );
    }
  }
}

export async function getCache(key: string) {
  try {
    const result = await client.get(key);
    // @ts-ignore
    return JSON.parse(result);
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to get cache: ${error.message}`
      );
    } else {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to get cache`
      );
    }
  }
}

export async function clearCache(pattern: string, verb: string | null = null) {
  try {
    let cursor: number | string = 0;
    const fullPattern = verb ? `${verb}:${pattern}` : `*:${pattern}`;
    const batchDeleteLimit = 100;

    do {
      const result: { cursor: number; keys: string[] } = await client.scan(
        cursor,
        {
          MATCH: fullPattern,
          COUNT: batchDeleteLimit,
        }
      );

      cursor = result.cursor;
      const fetchedKeys = result.keys;

      if (fetchedKeys.length > 0) {
        await client.del([...fetchedKeys]);
      }
    } while (cursor !== 0);
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to clear cache: ${error.message}`
      );
    } else {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to clear cache`
      );
    }
  }
}
