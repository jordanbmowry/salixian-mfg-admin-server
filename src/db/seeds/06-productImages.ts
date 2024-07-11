import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('product_images').del();

  // Fetch the UUIDs of the inserted products
  const products = await knex('products').select('product_id');

  // Inserts seed entries
  await knex('product_images').insert([
    {
      image_id: knex.raw('uuid_generate_v4()'),
      product_id: products[0].product_id,
      image_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      image_id: knex.raw('uuid_generate_v4()'),
      product_id: products[1].product_id,
      image_url: 'https://images.unsplash.com/photo-1601004890668-72f6e8705e46',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
