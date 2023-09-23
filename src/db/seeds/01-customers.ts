import { Knex } from 'knex';
// @ts-ignore
import faker from 'faker';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('customers').del();

  const customers = Array.from({ length: 50 }).map(() => ({
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    phone_number: faker.phone.phoneNumber(),
    shipping_address: '1234 Main St.',
    shipping_city: faker.address.city(),
    shipping_state: faker.address.stateAbbr(),
    shipping_zip: faker.address.zipCode('#####'),
    billing_address: '1234 Main St.',
    billing_city: faker.address.city(),
    billing_state: faker.address.stateAbbr(),
    billing_zip: faker.address.zipCode('#####'),
    notes: faker.lorem.sentence(),
  }));

  // Inserts seed entries
  await knex('customers').insert(customers);
}
