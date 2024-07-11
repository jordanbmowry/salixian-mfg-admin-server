import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('orders').del();

  // Inserts seed entries
  const customers = await knex('customers').select('customer_id');

  await knex('orders').insert([
    {
      order_id: knex.raw('uuid_generate_v4()'),
      order_date: knex.fn.now(),
      order_description: 'Custom wooden stock',
      customer_cost: 200.0,
      input_expenses: 50.0,
      taxes_fees: 20.0,
      shipping_cost: 10.0,
      total_write_off: 0.0,
      profit: 120.0,
      notes: 'First order',
      order_status: 'pending',
      payment_status: 'not paid',
      customer_id: customers[0].customer_id,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      order_id: knex.raw('uuid_generate_v4()'),
      order_date: knex.fn.now(),
      order_description: 'Ready-to-ship handguard',
      customer_cost: 150.0,
      input_expenses: 30.0,
      taxes_fees: 15.0,
      shipping_cost: 5.0,
      total_write_off: 0.0,
      profit: 100.0,
      notes: 'Second order',
      order_status: 'in progress',
      payment_status: 'partially paid',
      customer_id: customers[1].customer_id,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
