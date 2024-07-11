import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'orders' table
  await knex.schema.createTable('orders', (table) => {
    table.uuid('order_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('order_date').notNullable().defaultTo(knex.fn.now());
    table.text('order_description').notNullable();
    table.decimal('customer_cost', 14, 2).notNullable();
    table.decimal('input_expenses', 14, 2).defaultTo(0);
    table.decimal('taxes_fees', 14, 2).defaultTo(0);
    table.decimal('shipping_cost', 14, 2).defaultTo(0);
    table.decimal('total_write_off', 14, 2).defaultTo(0);
    table.decimal('profit', 14, 2).defaultTo(0);
    table.text('notes');
    table.string('order_status').notNullable().defaultTo('pending'); // Changed to string
    table.string('payment_status').notNullable().defaultTo('not paid'); // Changed to string
    table
      .uuid('customer_id')
      .notNullable()
      .references('customer_id')
      .inTable('customers')
      .onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable(); // Soft delete column
    // Indices
    table.index('order_date');
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_order_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_order_timestamp
    BEFORE UPDATE
    ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the trigger, the function, and the 'orders' table
  await knex.raw('DROP TRIGGER IF EXISTS update_order_timestamp ON orders;');
  await knex.raw('DROP FUNCTION IF EXISTS update_order_timestamp;');
  return knex.schema.dropTable('orders');
}
