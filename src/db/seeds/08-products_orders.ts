import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('products_orders').del();

  // Fetch the UUIDs of the inserted products and orders
  const products = await knex('products').select('product_id');
  const orders = await knex('orders').select('order_id');

  // Sample data assuming you have at least two products and two orders
  const firstProductId = products[0].product_id;
  const secondProductId = products[1].product_id;
  const firstOrderId = orders[0].order_id;
  const secondOrderId = orders[1].order_id;

  // Inserts seed entries
  await knex('products_orders').insert([
    {
      id: knex.raw('uuid_generate_v4()'),
      product_id: firstProductId,
      order_id: firstOrderId,
      quantity: 3,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      product_id: secondProductId,
      order_id: secondOrderId,
      quantity: 5,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      product_id: firstProductId,
      order_id: secondOrderId,
      quantity: 2,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      product_id: secondProductId,
      order_id: firstOrderId,
      quantity: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
