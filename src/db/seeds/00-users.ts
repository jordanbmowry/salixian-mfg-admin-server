import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries in the 'users' table
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      user_name: 'jordan.mowry@gmail.com',
      password: '$2b$10$I0bsaqHMFWC0FkiifzVjIO5UXKFMgqGr1UrqQ8k7xQzQLtOpY/SHm',
    },
    {
      user_name: 'email@email.com',
      password: '$2b$10$I0bsaqHMFWC0FkiifzVjIO5UXKFMgqGr1UrqQ8k7xQzQLtOpY/SHm',
    },
  ]);
}
