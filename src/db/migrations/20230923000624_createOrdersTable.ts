import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create enums
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE order_status_enum AS ENUM ('pending', 'in progress', 'complete', 'canceled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE payment_status_enum AS ENUM ('not paid', 'partially paid', 'fully paid');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create the 'orders' table
  await knex.schema.createTable('orders', (table) => {
    table.uuid('order_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('order_date').notNullable().defaultTo(knex.fn.now());
    table.text('order_description');
    table.decimal('customer_cost', 14, 2).notNullable();
    table.decimal('input_expenses', 14, 2).notNullable();
    table.decimal('taxes_fees', 14, 2).notNullable();
    table.decimal('shipping_cost', 14, 2).notNullable();
    table.decimal('total_write_off', 14, 2).notNullable();
    table.decimal('profit', 14, 2).notNullable();
    table.text('notes');
    table
      .specificType('order_status', 'order_status_enum')
      .defaultTo('pending');
    table
      .specificType('payment_status', 'payment_status_enum')
      .defaultTo('not paid');
    table
      .uuid('customer_id')
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
  // Drop the trigger, the function, the 'orders' table, and the enums
  await knex.raw('DROP TRIGGER IF EXISTS update_order_timestamp ON orders;');
  await knex.raw('DROP FUNCTION IF EXISTS update_order_timestamp;');
  await knex.schema.dropTable('orders');
  await knex.raw('DROP TYPE IF EXISTS order_status_enum;');
  await knex.raw('DROP TYPE IF EXISTS payment_status_enum;');
}
