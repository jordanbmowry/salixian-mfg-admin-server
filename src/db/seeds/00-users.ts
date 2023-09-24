import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries in the 'users' table
  await knex('users').del();
  // change passwords to hashed password
  // Inserts seed entries
  await knex('users').insert([
    {
      email: 'jordan.mowry@gmail.com',
      password: '$2b$10$gMfdMgvy7kApEtsoq5BwgeCOkea1zwu5OPd8gwnUcP00G3AKjZwKC',
    },
    {
      email: 'email@email.com',
      password: '$2b$10$hmveaM5NijjO3S9RG1IFlOMGMIBUCg/lWgGvjAMP7gSsHM0jCclcq',
    },
  ]);
}
