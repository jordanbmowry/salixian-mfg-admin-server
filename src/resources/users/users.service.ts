import knex from '../../db/connection';
import { getCache, setCache, clearCache } from '../../db/redis/redisCache';
import type { User } from '../../types/types';

export async function create(user: User): Promise<User> {
  try {
    const createdRecords = await knex('users').insert(user).returning('*');
    return createdRecords[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    throw new Error('Failed to create user.');
  } finally {
    clearCache('/users*');
  }
}

export type WhereObj = { user_id: string } | { email: string };

export async function read(
  redisKey: string,
  whereObj?: WhereObj
): Promise<User | undefined> {
  if (!whereObj) {
    throw new Error('Invalid where object provided.');
  }

  try {
    const cacheValue = await getCache(redisKey);
    if (cacheValue) {
      return cacheValue;
    }

    const result = await knex('users')
      .select(
        'user_id',
        'email',
        'role',
        'first_name',
        'last_name',
        'last_login',
        'created_at',
        'updated_at',
        'notes',
        'password'
      )
      .where(whereObj)
      .first();

    await setCache(redisKey, result);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read user: ${error.message}`);
    }
    throw new Error('Failed to read user.');
  }
}

export async function update(updatedUser: User): Promise<User> {
  try {
    const updatedRecords = await knex('users')
      .where({ user_id: updatedUser.user_id })
      .update(updatedUser, '*');
    return updatedRecords[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    throw new Error('Failed to update user.');
  } finally {
    clearCache('/users*');
  }
}

export async function destroy(user_id: string): Promise<void> {
  try {
    await knex('users').where({ user_id }).del();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
    throw new Error('Failed to delete user.');
  } finally {
    clearCache('/users*');
  }
}

export async function list(redisKey: string): Promise<User[]> {
  try {
    const cacheValue = await getCache(redisKey);
    if (cacheValue) {
      return cacheValue;
    }

    const result = await knex('users').select(
      'user_id',
      'email',
      'role',
      'first_name',
      'last_name',
      'last_login',
      'created_at',
      'updated_at'
    );

    await setCache(redisKey, result);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
    throw new Error('Failed to list user.');
  }
}

export async function updateLastLogin(user_id: string): Promise<void> {
  try {
    await knex('users').where('user_id', user_id).update({
      last_login: knex.fn.now(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update last login for user: ${error.message}`);
    }
    throw new Error('Failed to update last login for user.');
  } finally {
    clearCache(`/users/${user_id}*`);
  }
}
