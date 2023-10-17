import knex from '../../db/connection';
import { getCache, setCache, clearCache } from '../../db/redis/redisCache';
import type { User } from '../../types/types';
import { HttpStatusCode } from '../../errors/httpStatusCode';
import { AppError } from '../../errors/AppError';

const USER_CACHE_KEY = '/users*';
const USER_ID_CACHE_KEY = (userId: string) => `/users/${userId}*`;

const USER_COLUMNS = [
  'user_id',
  'email',
  'role',
  'first_name',
  'last_name',
  'last_login',
  'created_at',
  'updated_at',
  'notes',
  'password',
];

export async function create(user: User): Promise<User> {
  try {
    const createdRecords = await knex('users').insert(user).returning('*');
    const createdUser = createdRecords[0];

    await setCache(USER_ID_CACHE_KEY(createdUser.user_id), createdUser);

    return createdRecords[0];
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to create user`,
      error
    );
  } finally {
    await clearCache(USER_CACHE_KEY);
  }
}

export type WhereObj = { user_id: string } | { email: string };

export async function read(
  redisKey: string,
  whereObj?: WhereObj
): Promise<User | undefined> {
  if (!whereObj) {
    throw new AppError(
      HttpStatusCode.BAD_REQUEST,
      'Invalid where object provided.'
    );
  }

  try {
    const cacheValue = await getCache(redisKey);

    if (cacheValue) {
      return cacheValue as User;
    }

    const result = await knex('users')
      .select(...USER_COLUMNS)
      .where(whereObj)
      .first();

    if (result) {
      await setCache(redisKey, result);
    }

    return result;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to read user`,
      error
    );
  }
}

export async function update(updatedUser: User): Promise<User> {
  try {
    const updatedRecords = await knex('users')
      .where({ user_id: updatedUser.user_id })
      .update(updatedUser, '*');
    const updated = updatedRecords[0];

    await setCache(USER_ID_CACHE_KEY(updated.user_id), updated);

    return updated;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to update user: ${updatedUser.user_id}`,
      error
    );
  } finally {
    await clearCache(USER_CACHE_KEY);
  }
}

export async function destroy(user_id: string): Promise<void> {
  try {
    await knex('users').where({ user_id }).del();
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to delete user: ${user_id}`,
      error
    );
  } finally {
    await clearCache(USER_CACHE_KEY);
  }
}

export async function list(redisKey: string): Promise<User[]> {
  try {
    const cacheValue = await getCache(redisKey);

    if (cacheValue) {
      return cacheValue as User[];
    }

    const result = await knex('users').select(...USER_COLUMNS);

    if (result && result.length > 0) {
      await setCache(redisKey, result);
    }

    return result;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to list users`,
      error
    );
  }
}

export async function updateLastLogin(user_id: string): Promise<void> {
  try {
    await knex('users').where('user_id', user_id).update({
      last_login: knex.fn.now(),
    });

    await clearCache(USER_ID_CACHE_KEY(user_id));
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to update last login for user: ${user_id}`,
      error
    );
  }
}
