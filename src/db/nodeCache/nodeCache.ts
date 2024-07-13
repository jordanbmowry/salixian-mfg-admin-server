import NodeCache from 'node-cache';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../errors/httpStatusCode';

const cache = new NodeCache({ stdTTL: 604800, checkperiod: 120 }); // 1 week in seconds

async function handleCacheAction<T>(
  action: () => T,
  actionName: string
): Promise<T> {
  try {
    return action();
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

export async function setCache(key: string, value: any, expiration?: number) {
  return handleCacheAction(() => {
    if (expiration !== undefined) {
      cache.set(key, value, expiration);
    } else {
      cache.set(key, value);
    }
    return true;
  }, 'set');
}

export async function getCache(key: string) {
  return handleCacheAction(() => {
    const result = cache.get(key);
    return result ? result : null;
  }, 'get');
}

export async function clearCache(
  patterns: string | string[],
  verb: string | null = null
) {
  const patternList: string[] = Array.isArray(patterns) ? patterns : [patterns];

  patternList.forEach((pattern) => {
    const fullPattern = verb ? `${verb}:${pattern}` : pattern;
    cache.keys().forEach((key) => {
      if (key.includes(fullPattern)) {
        cache.del(key);
      }
    });
  });
}
