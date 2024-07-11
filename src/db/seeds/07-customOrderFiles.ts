import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('custom_order_files').del();

  // Fetch the UUIDs of the inserted orders
  const orders = await knex('orders').select('order_id');

  // Inserts seed entries
  await knex('custom_order_files').insert([
    {
      file_id: knex.raw('uuid_generate_v4()'),
      order_id: orders[0].order_id,
      file_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      file_id: knex.raw('uuid_generate_v4()'),
      order_id: orders[1].order_id,
      file_url: 'https://images.unsplash.com/photo-1601004890668-72f6e8705e46',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
