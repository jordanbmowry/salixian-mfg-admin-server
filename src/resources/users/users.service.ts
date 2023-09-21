import knex from '../../db/connection';

export interface User {
  user_name: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  password: string;
}

function create(user: User): Promise<User> {
  return knex('users')
    .insert(user)
    .returning('*')
    .then((createdRecords) => createdRecords[0]);
}

export { create };
