import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ensure necessary extensions are enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS citext');

  // Create the 'customers' table
  await knex.schema.createTable('customers', (table) => {
    table
      .uuid('customer_id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.specificType('email', 'CITEXT').notNullable().unique();
    table.string('phone_number').notNullable().unique();
    table.text('shipping_address');
    table.string('shipping_city');
    table.string('shipping_state', 2); // 2 chars for state abbreviation
    table.string('shipping_zip', 9); // Up to 9 chars for ZIP+4 format
    table.text('billing_address');
    table.string('billing_city');
    table.string('billing_state', 2);
    table.string('billing_zip', 9);
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable(); // Soft delete column
    // Add indices
    table.index('email');
    table.index('phone_number');
  });

  // Add trigger to update 'updated_at' column on each update for customers
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_customer_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER update_customer_timestamp
    BEFORE UPDATE
    ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the trigger and the function for customers
  await knex.raw(
    'DROP TRIGGER IF EXISTS update_customer_timestamp ON customers;'
  );
  await knex.raw('DROP FUNCTION IF EXISTS update_customer_timestamp;');
  return knex.schema.dropTable('customers');
}
