import { Knex } from 'knex';
// @ts-ignore
import faker from 'faker';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('orders').del();

  const customers = await knex('customers').select('customer_id');

  const orderStatuses = ['pending', 'in progress', 'complete', 'canceled'];
  const paymentStatuses = ['not paid', 'partially paid', 'fully paid'];

  const orders = Array.from({ length: 100 }).map(() => ({
    order_date: faker.date.past(2),
    order_description: faker.commerce.productDescription(),
    customer_cost: faker.commerce.price(),
    input_expenses: faker.commerce.price(),
    taxes_fees: faker.commerce.price(),
    shipping_cost: faker.commerce.price(),
    total_write_off: faker.commerce.price(),
    profit: faker.commerce.price(),
    notes: faker.lorem.sentence(),
    order_status: faker.random.arrayElement(orderStatuses),
    payment_status: faker.random.arrayElement(paymentStatuses),
    customer_id: faker.random.arrayElement(customers).customer_id,
  }));

  // Inserts seed entries
  await knex('orders').insert(orders);
}
