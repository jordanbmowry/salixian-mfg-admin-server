import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('customers').del();

  // Inserts seed entries
  await knex('customers').insert([
    {
      customer_id: knex.raw('uuid_generate_v4()'),
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '1234567890',
      shipping_address: '123 Main St',
      shipping_city: 'Anytown',
      shipping_state: 'CA',
      shipping_zip: '12345',
      billing_address: '123 Main St',
      billing_city: 'Anytown',
      billing_state: 'CA',
      billing_zip: '12345',
      notes: 'First customer',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      customer_id: knex.raw('uuid_generate_v4()'),
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@example.com',
      phone_number: '0987654321',
      shipping_address: '456 Elm St',
      shipping_city: 'Othertown',
      shipping_state: 'NY',
      shipping_zip: '67890',
      billing_address: '456 Elm St',
      billing_city: 'Othertown',
      billing_state: 'NY',
      billing_zip: '67890',
      notes: 'Second customer',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
