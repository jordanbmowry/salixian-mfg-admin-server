import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products_orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('product_id')
      .notNullable()
      .references('product_id')
      .inTable('products')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .uuid('order_id')
      .notNullable()
      .references('order_id')
      .inTable('orders')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('quantity').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_products_orders_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_products_orders_timestamp
    BEFORE UPDATE
    ON products_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_products_orders_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    'DROP TRIGGER IF EXISTS update_products_orders_timestamp ON products_orders;'
  );
  await knex.raw('DROP FUNCTION IF EXISTS update_products_orders_timestamp;');
  return knex.schema.dropTable('products_orders');
}
