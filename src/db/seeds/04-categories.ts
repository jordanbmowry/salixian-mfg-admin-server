import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('categories').del();

  // Inserts seed entries
  await knex('categories').insert([
    {
      category_id: knex.raw('uuid_generate_v4()'),
      category_name: 'Butt Stock',
      category_description: 'High-quality butt stocks for various firearms',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      category_id: knex.raw('uuid_generate_v4()'),
      category_name: 'Handguard',
      category_description: 'Durable handguards for various firearms',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
