import knex from '../../db/connection';

export interface User {
  user_name: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  password: string;
  user_id?: string;
}

export function create(user: User): Promise<User> {
  return knex('users')
    .insert(user)
    .returning('*')
    .then((createdRecords) => createdRecords[0]);
}

export type WhereObj = { user_id: string } | { user_name: string };

export function read(whereObj: WhereObj) {
  return knex('users').select('*').where(whereObj).first();
}

export function update(updatedUser: User) {
  return knex('users')
    .where({ user_id: updatedUser.user_id })
    .update(updatedUser, '*');
}

export function destroy(user_id: string) {
  return knex('users').where({ user_id }).del();
}

export function list() {
  return knex('users').select('*');
}

export function updateLastLogin(user_id: string) {
  return knex('users').where('user_id', user_id).update({
    last_login: knex.fn.now(),
  });
}
