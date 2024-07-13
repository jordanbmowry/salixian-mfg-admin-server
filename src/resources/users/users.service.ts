import knex from '../../db/connection';
import type { User } from '../../types/types';
import { HttpStatusCode } from '../../errors/httpStatusCode';
import { AppError } from '../../errors/AppError';

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
    return createdRecords[0];
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to create user`,
      error
    );
  }
}

export type WhereObj = { user_id: string } | { email: string };

export async function read(whereObj?: WhereObj): Promise<User | undefined> {
  if (!whereObj) {
    throw new AppError(
      HttpStatusCode.BAD_REQUEST,
      'Invalid where object provided.'
    );
  }

  try {
    const result = await knex('users')
      .select(...USER_COLUMNS)
      .where(whereObj)
      .first();

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
    return updatedRecords[0];
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to update user: ${updatedUser.user_id}`,
      error
    );
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
  }
}

export async function list(): Promise<User[]> {
  try {
    const columnsWithoutPassword = USER_COLUMNS.filter(
      (column) => column !== 'password'
    );

    const result = await knex('users').select(...columnsWithoutPassword);

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
  } catch (error) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      `Failed to update last login for user: ${user_id}`,
      error
    );
  }
}
