import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries in the 'users' table
  await knex('users').del();
  // change passwords to hashed password
  // Inserts seed entries
  await knex('users').insert([
    {
      email: 'email.faker@gmail.com',
      password: 'blah',
    },
    {
      email: 'faker@email.com',
      password: 'blah',
    },
  ]);
}
