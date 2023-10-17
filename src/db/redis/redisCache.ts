// redisCache.ts
import { createClient } from 'redis';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../errors/httpStatusCode';

const REDIS_DEFAULT_URL = 'redis://127.0.0.1:6379';
const { NODE_ENV = 'development', REDIS_URL = REDIS_DEFAULT_URL } = process.env;
const url = NODE_ENV === 'development' ? REDIS_DEFAULT_URL : REDIS_URL;

const client = createClient({
  url,
});

client
  .on('connect', () => console.log('Redis client connected'))
  .on('ready', () => console.log('Redis client ready'))
  .on('error', (err) => console.error('Redis error:', err))
  .on('end', () => console.warn('Redis client connection closed'))
  .connect()
  .catch((err) => console.error('Failed to connect to Redis:', err));

const DEFAULT_EXPIRATION = 604_800; // 1 week in seconds
const BATCH_DELETE_LIMIT = 100;

async function handleRedisAction<T>(
  action: Promise<T>,
  actionName: string
): Promise<T> {
  try {
    return await action;
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        `Failed to ${actionName} cache: ${error.message}`
      );
    }
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to ${actionName} cache`
    );
  }
}

export async function setCache(
  key: string,
  value: any,
  expiration = DEFAULT_EXPIRATION
) {
  return handleRedisAction(
    client.setEx(key, expiration, JSON.stringify(value)),
    'set'
  );
}

export async function getCache(key: string) {
  const result = await handleRedisAction(client.get(key), 'get');
  return result ? JSON.parse(result) : null;
}

export async function clearCache(
  patterns: string | string[],
  verb: string | null = null
) {
  const patternList: string[] = Array.isArray(patterns) ? patterns : [patterns];

  for (const pattern of patternList) {
    const fullPattern = verb ? `${verb}:${pattern}` : `*:${pattern}`;

    let cursor: number | string = 0;
    do {
      const result: { cursor: number; keys: string[] } =
        await handleRedisAction(
          client.scan(cursor, {
            MATCH: fullPattern,
            COUNT: BATCH_DELETE_LIMIT,
          }),
          'scan'
        );

      cursor = result.cursor;
      if (result.keys.length > 0) {
        await handleRedisAction(client.del([...result.keys]), 'delete');
      }
    } while (cursor !== 0);
  }
}
