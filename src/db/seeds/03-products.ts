import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('products').del();

  // Inserts seed entries
  await knex('products').insert([
    {
      product_id: knex.raw('uuid_generate_v4()'),
      name: 'Wooden Stock',
      description: 'High-quality wooden stock for AK',
      price: 120.0,
      stock_quantity: 10,
      category: 'Butt Stock',
      firearm_type: 'AK',
      is_custom: false,
      display: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      product_id: knex.raw('uuid_generate_v4()'),
      name: 'Handguard',
      description: 'Durable handguard for AK',
      price: 80.0,
      stock_quantity: 15,
      category: 'Handguard',
      firearm_type: 'AK',
      is_custom: false,
      display: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
