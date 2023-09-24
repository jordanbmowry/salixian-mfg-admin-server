import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries in the 'users' table
  await knex('users').del();
  // change passwords to hashed password
  // Inserts seed entries
  await knex('users').insert([
    {
      user_name: 'jordan.mowry@gmail.com',
      password: 'ChangeThisValue',
    },
    {
      user_name: 'email@email.com',
      password: 'ChangeThisValue',
    },
  ]);
}
